# DVT Assistant — Demo

مساعد معرفي (RAG) بيجاوب على أسئلة عن DVT من مصادر Mayo Clinic, CDC, NHS بس.

## هيكل المشروع

```
dvt-rag-demo/
├── app.py              → السيرفر: تحميل PDFs + تنظيف + تقطيع + embeddings + ChromaDB + Gemini
├── requirements.txt    → المكتبات المطلوبة
├── .env.example        → مثال لملف المفتاح السري
├── data/                → ضعي هنا الـ 4 PDFs بتاعتك (نفس الأسماء المذكورة تحت)
├── templates/
│   └── index.html      → صفحة الواجهة (الشكل الظاهري)
└── static/
    ├── style.css        → التصميم (ألوان، خطوط، الحركة)
    └── script.js        → إرسال السؤال للسيرفر وعرض الرد
```

## الملفات المطلوب وضعها في مجلد data/

ضعي الـ 4 ملفات دي بنفس الاسم بالظبط:

- `DVT_Symptoms_and_causes.pdf`
- `DVT_Diagnosis_and_treatment.pdf`
- `CDC_About_VTE_DVT.pdf`
- `NHS_DVT.pdf`

## خطوات التشغيل

### 1. تثبيت المكتبات

```bash
pip install -r requirements.txt
```

### 2. ضبط مفتاح Gemini

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="مفتاحك_هنا"
```

**Mac / Linux:**
```bash
export GEMINI_API_KEY="مفتاحك_هنا"
```

### 3. تشغيل السيرفر

```bash
python app.py
```

أول تشغيل هياخد شوية وقت (بيحمّل موديل الـ embedding ويبني قاعدة البيانات).
هتشوفي في الـ terminal:

```
قاعدة المعرفة جاهزة (44 chunk).
 * Running on http://127.0.0.1:5000
```

### 4. افتحي المتصفح

```
http://127.0.0.1:5000
```

## ملاحظات

- كل مرة تشغّلي `app.py` بيعيد بناء قاعدة البيانات من الـ PDFs من الصفر (مناسب للديمو، مش محتاجة تعملي حاجة يدوي).
- لو غيّرتي في الـ PDFs أو الإعدادات، اقفلي السيرفر (Ctrl+C) وشغّليه تاني.
- للنشر على الإنترنت (رابط يشتغل لأي حد)، هتحتاجي استضافة زي Render أو Railway — قوليلي لو عايزة تعملي كده وهساعدك.
