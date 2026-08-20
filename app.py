"""
app.py
------
سيرفر Flask بيشغل نفس منطق الـ RAG بتاع النوتبوك، وبيديك API
عشان الفرونت (HTML/CSS/JS) يقدر يبعت سؤال ويستقبل إجابة + مصادر.

تشغيل:
    pip install -r requirements.txt
    export GEMINI_API_KEY="ضعي المفتاح هنا"   (أو حطيه في ملف .env)
    python app.py

بعد كده افتحي المتصفح على: http://127.0.0.1:5000
"""

import os
import re
import json

import pdfplumber
import chromadb
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# يقرأ ملف .env تلقائيًا (لو موجود) ويحط القيم اللي فيه كـ environment variables
load_dotenv()

# ============================================================
# 1. CONFIG
# ============================================================

DATA_DIR = "./data"
CHROMA_DIR = "./chroma_db"
EMBEDDING_MODEL_NAME = "multi-qa-mpnet-base-dot-v1"  # أفضل موديل من التقييم
CHUNK_SIZE = 500
CHUNK_OVERLAP = 80
TOP_K = 3
OUT_OF_SCOPE_THRESHOLD = 0.6

SOURCES = [
    {
        "filename": "DVT_Symptoms_and_causes.pdf",
        "source_name": "Mayo Clinic",
        "title": "About Venous Thromboembolism (Blood Clots)",
        "url": "https://www.mayoclinic.org/diseases-conditions/deep-vein-thrombosis/symptoms-causes/syc-20352557",
    },
    {
        "filename": "DVT_Diagnosis_and_treatment.pdf",
        "source_name": "Mayo Clinic",
        "title": "About Venous Thromboembolism (Blood Clots)",
        "url": "https://www.mayoclinic.org/diseases-conditions/deep-vein-thrombosis/diagnosis-treatment/drc-20352563",
    },
    {
        "filename": "CDC_About_VTE_DVT.pdf",
        "source_name": "CDC",
        "title": "About Venous Thromboembolism (Blood Clots)",
        "url": "https://www.cdc.gov/blood-clots/about/index.html",
    },
    {
        "filename": "NHS_DVT.pdf",
        "source_name": "NHS",
        "title": "DVT (deep vein thrombosis)",
        "url": "https://www.nhs.uk/conditions/deep-vein-thrombosis-dvt/",
    },
]

# ============================================================
# 2. GEMINI SETUP
# ============================================================

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY مش موجود. حطيه كـ environment variable قبل التشغيل، "
        "أو في ملف .env (شوفي .env.example)."
    )

genai.configure(api_key=GEMINI_API_KEY)

gemini_model = genai.GenerativeModel(
    model_name="gemini-3.6-flash",
    system_instruction=(
        "You are a medical information assistant specialized ONLY in "
        "deep vein thrombosis (DVT) and blood clots, based on trusted "
        "sources: Mayo Clinic, CDC, and NHS.\n\n"
        "LANGUAGE RULE (very important): Always respond in the SAME language "
        "as the user's question, regardless of the language of the provided "
        "context (which is always in English). If the question is in Arabic, "
        "answer fully in Arabic. If the question is in English, answer in "
        "English. Never mix languages mid-answer.\n\n"
        "RULES:\n"
        "1. Answer ONLY using the provided context below. Never use outside knowledge.\n"
        "2. If the context does not contain enough information to answer the "
        "question, do NOT attempt to answer it. Instead, politely decline (in "
        "the same language as the question) and briefly explain that this "
        "falls outside the scope of the DVT knowledge base, and suggest the "
        "user consult a doctor. Keep the decline short, warm, and professional.\n"
        "3. Never guess, speculate, or fabricate information not present in the context.\n"
        "4. Always cite the source name after each claim, e.g. (Mayo Clinic).\n"
        "5. This is general health information, not a diagnosis or medical advice; "
        "always recommend the user consult a doctor for personal medical decisions."
    ),
)

# ============================================================
# 3. PDF LOADING + CLEANING
# ============================================================


# (load_pdf_text القديمة اتستبدلت بـ load_pdf_pages فوق، اللي بترجع كل صفحة لوحدها
#  عشان نقدر نحسب رقم الصفحة والسطر لكل chunk)


def load_pdf_pages(filepath: str):
    """يرجع نص كل صفحة لوحده (خام، من غير تنظيف) عشان نلاقي فيها رقم الصفحة والسطر بعدين."""
    pages = []
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text() or "")
    return pages


def find_page_and_line(chunk_text: str, raw_pages: list):
    """بيدور على أول 35 حرف من الـ chunk جوه صفحات الـ PDF الخام، ويرجع رقم الصفحة والسطر."""
    snippet = chunk_text[:35].strip()
    if not snippet:
        return 1, 1

    for page_num, page_text in enumerate(raw_pages, start=1):
        if snippet in page_text:
            lines = page_text.split("\n")
            for line_num, line in enumerate(lines, start=1):
                if snippet[:15] in line:
                    return page_num, line_num
            return page_num, 1

    return 1, 1


def clean_text(raw_text: str) -> str:
    text = raw_text
    text = re.sub(r"\b\d+\s+of\s+\d+\b", " ", text)
    text = re.sub(r"[•◦▪‣]", "-", text)
    text = re.sub(r"\(cid:\d+\)", "-", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = "\n".join(line.strip() for line in text.split("\n"))
    text = re.sub(r"[^\x20-\x7E\n]", "", text)
    return text.strip()


def detect_language(text: str) -> str:
    return "ar" if re.search(r"[\u0600-\u06FF]", text) else "en"


# ============================================================
# 4. BUILD KNOWLEDGE BASE (يشتغل مرة واحدة لما السيرفر يبدأ)
# ============================================================


def build_knowledge_base():
    print("جاري تحميل الـ PDFs وبناء قاعدة المعرفة...")

    raw_source_texts = {}
    raw_source_pages = {}  # يخزن صفحات كل PDF خام عشان نحسب منها رقم الصفحة/السطر
    for source in SOURCES:
        filepath = os.path.join(DATA_DIR, source["filename"])
        if not os.path.exists(filepath):
            print(f"[تحذير] الملف غير موجود: {filepath}")
            continue
        pages = load_pdf_pages(filepath)
        raw_source_pages[source["filename"]] = pages
        raw_source_texts[source["filename"]] = clean_text("\n".join(pages))

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    all_chunks = []
    chunk_id = 0
    for source in SOURCES:
        text = raw_source_texts.get(source["filename"])
        if not text:
            continue
        pages = raw_source_pages.get(source["filename"], [])
        for chunk in splitter.split_text(text):
            page_num, line_num = find_page_and_line(chunk, pages)
            all_chunks.append(
                {
                    "id": f"chunk_{chunk_id:04d}",
                    "text": chunk,
                    "source_name": source["source_name"],
                    "title": source["title"],
                    "url": source["url"],
                    "page": page_num,
                    "line": line_num,
                }
            )
            chunk_id += 1

    print(f"تم إنشاء {len(all_chunks)} chunk.")

    print(f"جاري تحميل موديل الـ embedding: {EMBEDDING_MODEL_NAME} ...")
    embed_model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    client = chromadb.PersistentClient(path=CHROMA_DIR)
    collection_name = "dvt_demo"
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass
    collection = client.create_collection(
        name=collection_name, metadata={"hnsw:space": "cosine"}
    )

    texts = [c["text"] for c in all_chunks]
    ids = [c["id"] for c in all_chunks]
    metadatas = [
        {
            "source_name": c["source_name"],
            "title": c["title"],
            "url": c["url"],
            "page": c["page"],
            "line": c["line"],
        }
        for c in all_chunks
    ]

    if texts:
        embeddings = embed_model.encode(texts, show_progress_bar=True).tolist()
        collection.add(ids=ids, embeddings=embeddings, documents=texts, metadatas=metadatas)

    print(f"قاعدة المعرفة جاهزة ({collection.count()} chunk).")
    return embed_model, collection


EMBED_MODEL, COLLECTION = build_knowledge_base()

# ============================================================
# 5. RETRIEVAL + GENERATION
# ============================================================


def retrieve(query: str, k: int = TOP_K):
    query_embedding = EMBED_MODEL.encode([query]).tolist()
    results = COLLECTION.query(query_embeddings=query_embedding, n_results=k)

    hits = []
    if results and results["documents"]:
        for doc, meta, dist in zip(
            results["documents"][0], results["metadatas"][0], results["distances"][0]
        ):
            hits.append(
                {
                    "text": doc,
                    "source_name": meta.get("source_name"),
                    "title": meta.get("title"),
                    "url": meta.get("url"),
                    "page": meta.get("page", 1),
                    "line": meta.get("line", 1),
                    "distance": dist,
                }
            )
    return hits


def is_out_of_scope(hits, threshold=OUT_OF_SCOPE_THRESHOLD):
    if not hits:
        return True
    return hits[0].get("distance", 1.0) > threshold


def translate_to_english_for_search(question: str) -> str:
    """
    موديلات الـ embedding عندنا مدربة على الإنجليزي بس، فلو السؤال عربي
    المسافة (distance) بتطلع بعيدة غلط وبيتصنف "خارج النطاق" وهو مش كده.
    الحل: نترجم السؤال لإنجليزي *للبحث بس* (مش للإجابة)، والإجابة النهائية
    هتفضل بنفس لغة السؤال الأصلي زي ما هي.
    """
    try:
        translator = genai.GenerativeModel(model_name="gemini-3.6-flash")
        response = translator.generate_content(
            f"Translate the following medical question to English. "
            f"Reply with ONLY the translated question, nothing else, "
            f"no quotes, no explanation:\n\n{question}",
            generation_config=genai.types.GenerationConfig(temperature=0),
        )
        translated = response.text.strip()
        return translated if translated else question
    except Exception:
        # لو الترجمة فشلت لأي سبب، نكمل بالسؤال الأصلي بدل ما نوقف كل حاجة
        return question


def build_context(hits):
    blocks = []
    for i, h in enumerate(hits, 1):
        blocks.append(f"[{i}] Source: {h['source_name']} ({h['url']})\n{h['text']}")
    return "\n\n".join(blocks)


def generate_answer(question: str, hits):
    lang = detect_language(question)

    if is_out_of_scope(hits):
        if lang == "ar":
            return (
                "عذرًا، سؤالك ده خارج نطاق قاعدة المعرفة الحالية، اللي بتغطي "
                "معلومات عن جلطات الأوردة العميقة (DVT) من مصادر Mayo Clinic "
                "وCDC وNHS فقط.\n\nلو محتاجة معلومة عن موضوع تاني، أنصحك "
                "تستشيري طبيب مختص."
            )
        return (
            "Sorry, this question falls outside the scope of the current "
            "knowledge base, which covers information about deep vein "
            "thrombosis (DVT) from Mayo Clinic, CDC, and NHS sources only.\n\n"
            "For questions on other topics, please consult a qualified doctor "
            "or a relevant specialized source."
        )

    context = build_context(hits)
    prompt = f"""Context:
{context}

Question: {question}

Answer clearly and concisely, citing sources."""

    response = gemini_model.generate_content(
        prompt, generation_config=genai.types.GenerationConfig(temperature=0.2)
    )
    return response.text


def rag_answer(question: str, k: int = TOP_K):
    lang = detect_language(question)

    # نبحث بنسخة إنجليزية من السؤال (لو كان عربي) عشان الـ embedding models
    # عندنا مدربة إنجليزي بس، لكن الإجابة النهائية هتفضل بلغة السؤال الأصلي
    search_query = translate_to_english_for_search(question) if lang == "ar" else question

    hits = retrieve(search_query, k=k)
    answer = generate_answer(question, hits)
    return {
        "answer": answer,
        "out_of_scope": is_out_of_scope(hits),
        "sources": [
            {
                "source_name": h["source_name"],
                "url": h["url"],
                "page": h.get("page", 1),
                "line": h.get("line", 1),
                "distance": round(h["distance"], 4),
            }
            for h in hits
        ],
    }


# ============================================================
# 6. FLASK APP + ROUTES
# ============================================================

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.get_json(force=True)
    question = (data.get("question") or "").strip()

    if not question:
        return jsonify({"error": "من فضلك اكتبي سؤال."}), 400

    try:
        result = rag_answer(question)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)