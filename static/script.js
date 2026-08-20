const conversation = document.getElementById("conversation");
const composer = document.getElementById("composer");
const input = document.getElementById("questionInput");
const sendBtn = document.getElementById("sendBtn");
const intro = document.getElementById("intro");
const hero = document.getElementById("hero");
const heroSearchForm = document.getElementById("heroSearchForm");
const heroSearchInput = document.getElementById("heroSearchInput");
const footerDisclaimer = document.getElementById("footerDisclaimer");
const topNav = document.getElementById("topNav");

composer.classList.add("hidden");
footerDisclaimer.style.display = "none";

heroSearchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = heroSearchInput.value.trim();
  if (!q) return;
  input.value = q;
  heroSearchInput.value = "";
  composer.dispatchEvent(new Event("submit"));
});

topNav.querySelectorAll(".topnav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    if (link.dataset.nav === "home") {
      resetToHome();
    }
  });
});

function resetToHome() {
  conversation.innerHTML = "";
  intro.style.display = "";
  hero.style.display = "";
  composer.classList.add("hidden");
  footerDisclaimer.style.display = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const SUGGESTED_QUESTIONS = [
  {
    q: "What are the symptoms of DVT?",
    icon: `<svg width="22" height="22" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.875 20.3994C5.875 14.1374 5.875 11.0064 6.61431 9.95307C7.3536 8.89974 10.2975 7.89203 16.1854 5.87657L17.3072 5.4926C20.3765 4.44199 21.911 3.91669 23.5 3.91669C25.089 3.91669 26.6235 4.44199 29.6928 5.4926L30.8146 5.87657C36.7025 7.89203 39.6465 8.89974 40.3857 9.95307C41.125 11.0064 41.125 14.1374 41.125 20.3994C41.125 21.3451 41.125 22.3708 41.125 23.4832C41.125 34.5243 32.8236 39.8825 27.6152 42.1577C26.2025 42.7747 25.4961 43.0834 23.5 43.0834C21.5039 43.0834 20.7975 42.7747 19.3847 42.1577C14.1763 39.8825 5.875 34.5243 5.875 23.4832C5.875 22.3708 5.875 21.3451 5.875 20.3994Z" stroke="#1F2B63" stroke-width="1.5"/>
      <path d="M23.5 21.5417C25.6632 21.5417 27.4167 19.7882 27.4167 17.625C27.4167 15.4619 25.6632 13.7084 23.5 13.7084C21.3369 13.7084 19.5834 15.4619 19.5834 17.625C19.5834 19.7882 21.3369 21.5417 23.5 21.5417Z" stroke="#1F2B63" stroke-width="1.5"/>
      <path d="M31.3333 29.375C31.3333 31.5382 31.3333 33.2917 23.5 33.2917C15.6666 33.2917 15.6666 31.5382 15.6666 29.375C15.6666 27.2119 19.1737 25.4584 23.5 25.4584C27.8261 25.4584 31.3333 27.2119 31.3333 29.375Z" stroke="#1F2B63" stroke-width="1.5"/>
    </svg>`,
  },
  {
    q: "What causes DVT?",
    icon: `<svg width="22" height="22" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.5 43.0834C34.3158 43.0834 43.0833 34.3159 43.0833 23.5C43.0833 12.6841 34.3158 3.91669 23.5 3.91669C12.6841 3.91669 3.91663 12.6841 3.91663 23.5C3.91663 34.3159 12.6841 43.0834 23.5 43.0834Z" stroke="#1F2B63" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17.625 17.625C17.625 10.7708 28.3958 10.7708 28.3958 17.625C28.3958 22.5208 23.5 21.5417 23.5 27.4167M23.5 35.2696L23.5196 35.248" stroke="#1F2B63" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    q: "How is DVT diagnosed?",
    icon: `<svg width="20" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.6042 35.8333C17.3792 35.8333 14.6319 34.6986 12.3625 32.4292C10.0931 30.1597 8.95833 27.4125 8.95833 24.1875V23.1573C6.39028 22.7392 4.25521 21.537 2.55313 19.5507C0.851042 17.5643 0 15.228 0 12.5417V1.79167H5.375V0H8.95833V7.16667H5.375V5.375H3.58333V12.5417C3.58333 14.5125 4.28507 16.1997 5.68854 17.6031C7.09201 19.0066 8.77917 19.7083 10.75 19.7083C12.7208 19.7083 14.408 19.0066 15.8115 17.6031C17.2149 16.1997 17.9167 14.5125 17.9167 12.5417V5.375H16.125V7.16667H12.5417V0H16.125V1.79167H21.5V12.5417C21.5 15.2292 20.649 17.5661 18.9469 19.5525C17.2448 21.5388 15.1097 22.7404 12.5417 23.1573V24.1875C12.5417 26.4271 13.3258 28.331 14.8941 29.8993C16.4624 31.4676 18.3658 32.2512 20.6042 32.25C22.8426 32.2488 24.7465 31.4653 26.316 29.8993C27.8855 28.3334 28.6691 26.4295 28.6667 24.1875V21.1865C27.6215 20.8281 26.7633 20.1861 26.092 19.2604C25.4208 18.3347 25.0845 17.2896 25.0833 16.125C25.0833 14.6319 25.6059 13.3628 26.651 12.3177C27.6962 11.2726 28.9653 10.75 30.4583 10.75C31.9514 10.75 33.2205 11.2726 34.2656 12.3177C35.3108 13.3628 35.8333 14.6319 35.8333 16.125C35.8333 17.2896 35.4977 18.3347 34.8264 19.2604C34.1551 20.1861 33.2963 20.8281 32.25 21.1865V24.1875C32.25 27.4125 31.1153 30.1597 28.8458 32.4292C26.5764 34.6986 23.8292 35.8333 20.6042 35.8333Z" fill="#1F2B63"/>
    </svg>`,
  },
  {
    q: "How can DVT be prevented?",
    icon: `<svg width="22" height="19" viewBox="0 0 43 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M43 17.2727C43 26.8591 33.8267 35.8236 21.5 38C9.17333 35.8236 0 26.8591 0 17.2727V6.90909L21.5 0L43 6.90909V17.2727ZM21.5 34.5455C30.4583 32.8182 38.2222 25.1145 38.2222 17.6527V9.15455L21.5 3.76545L4.77778 9.15455V17.6527C4.77778 25.1145 12.5417 32.8182 21.5 34.5455ZM16.7222 27.6364L7.16667 20.7273L10.535 18.2918L16.7222 22.7482L32.465 11.3655L35.8333 13.8182" fill="#1F2B63"/>
    </svg>`,
  },
];

const ARROW_ICON = `<svg class="oos-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#1F2B63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const EXTERNAL_ICON = `<svg width="13" height="13" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17.1193 10.01V18.7351C17.1193 19.2861 16.9004 19.8145 16.5108 20.204C16.1212 20.5936 15.5929 20.8125 15.0419 20.8125H2.57744C2.30463 20.8125 2.03448 20.7588 1.78244 20.6544C1.53039 20.55 1.30137 20.397 1.10846 20.2041C0.915547 20.0112 0.762523 19.7822 0.658124 19.5301C0.553724 19.2781 0.499994 19.0079 0.5 18.7351V6.27061C0.499981 5.99779 0.553702 5.72764 0.658097 5.47558C0.762491 5.22352 0.915513 4.9945 1.10843 4.80159C1.30134 4.60868 1.53036 4.45566 1.78242 4.35126C2.03447 4.24687 2.30462 4.19314 2.57744 4.19316H11.3025M14.3494 0.5H20.8125V6.96309M20.8125 0.5L8.70312 12.6094" stroke="#1F2B63" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = chip.dataset.q;
    composer.dispatchEvent(new Event("submit"));
  });
});

composer.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = input.value.trim();
  if (!question) return;

  hero.style.display = "none";
  intro.style.display = "none";
  composer.classList.remove("hidden");
  footerDisclaimer.style.display = "";

  addQuestionBubble(question);
  input.value = "";
  setLoading(true);

  const loadingTurn = addLoadingBubble();

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    loadingTurn.remove();

    if (!res.ok) {
      addPlainAnswer("error: " + (data.error || "not defined"));
      return;
    }

    if (data.out_of_scope) {
      addOutOfScopeBlock();
    } else {
      addAnswerBlock(data.answer, data.sources || []);
    }
  } catch (err) {
    loadingTurn.remove();
    addPlainAnswer("failed");
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  sendBtn.disabled = isLoading;
}

function nowTime() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function addQuestionBubble(text) {
  const turn = document.createElement("div");
  turn.className = "turn";
  turn.innerHTML = `
    <div class="q-block">
      <div class="q-bubble"></div>
      <div class="q-time">${nowTime()}</div>
    </div>
  `;
  turn.querySelector(".q-bubble").textContent = text;
  conversation.appendChild(turn);
  scrollToBottom();
  return turn;
}

function addLoadingBubble() {
  const turn = document.createElement("div");
  turn.className = "turn";
  turn.innerHTML = `
    <div class="a-card loading">
      <span class="pulse-dots"><span></span><span></span><span></span></span>
      Searching trusted sources…
    </div>
  `;
  conversation.appendChild(turn);
  scrollToBottom();
  return turn;
}

function addPlainAnswer(text) {
  const turn = document.createElement("div");
  turn.className = "turn";
  const card = document.createElement("div");
  card.className = "a-card";
  card.textContent = text;
  turn.appendChild(card);
  conversation.appendChild(turn);
  scrollToBottom();
}

function formatAnswerHTML(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let html = "";
  let inList = false;

  lines.forEach((line) => {
    const isBullet = /^[-*•]\s+/.test(line);
    const content = escapeHTML(line.replace(/^[-*•]\s+/, ""));

    if (isBullet) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${content}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<p>${escapeHTML(line)}</p>`;
    }
  });
  if (inList) html += "</ul>";
  return html;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function addAnswerBlock(answerText, sources) {
  const turn = document.createElement("div");
  turn.className = "turn";

  const card = document.createElement("div");
  card.className = "a-card";
  card.innerHTML = formatAnswerHTML(answerText);
  turn.appendChild(card);

  const seen = new Set();
  const uniqueSources = (sources || []).filter((s) => {
    if (seen.has(s.source_name)) return false;
    seen.add(s.source_name);
    return true;
  });

  if (uniqueSources.length) {
    const block = document.createElement("div");
    block.className = "sources-block";

    const label = document.createElement("p");
    label.className = "sources-label";
    label.textContent = "Sources";
    block.appendChild(label);

    const row = document.createElement("div");
    row.className = "sources-row";

    uniqueSources.forEach((s) => {
      const card = document.createElement("div");
      card.className = "source-card";
      const pageLabel = s.page ? `Page ${s.page}` : "";
      const lineLabel = s.line ? `Line ${s.line}` : "";
      card.innerHTML = `
        <div class="source-top">
          <span class="source-name">${escapeHTML(s.source_name)}</span>
          <span class="source-page">${escapeHTML(pageLabel)}</span>
        </div>
        <div class="source-bottom">
          <span class="source-desc">${escapeHTML(lineLabel)}</span>
          <a class="view-source" href="${s.url}" target="_blank" rel="noopener">
            view source ${EXTERNAL_ICON}
          </a>
        </div>
      `;
      row.appendChild(card);
    });

    block.appendChild(row);
    turn.appendChild(block);
  }

  conversation.appendChild(turn);
  scrollToBottom();
}

function addOutOfScopeBlock() {
  const turn = document.createElement("div");
  turn.className = "turn";

  const panel = document.createElement("div");
  panel.className = "oos-panel";

  const suggestionsHTML = SUGGESTED_QUESTIONS.map(
    (s) => `
    <button class="oos-suggestion" data-q="${escapeHTML(s.q)}">
      <span class="oos-icon-sm">${s.icon}</span>
      <span>${escapeHTML(s.q)}</span>
      ${ARROW_ICON}
    </button>
  `
  ).join("");

  panel.innerHTML = `
    <svg class="oos-icon" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M42 12C24.3 12 10 23.4 10 37.5C10 44.6 13.7 51 19.6 55.5L16 70L31.5 62.3C34.8 63.1 38.3 63.5 42 63.5C59.7 63.5 74 52.1 74 38C74 23.9 59.7 12 42 12Z" fill="#9AA7C7"/>
      <rect x="26" y="34" width="32" height="4" rx="2" fill="white"/>
      <rect x="26" y="44" width="20" height="4" rx="2" fill="white"/>
      <line x1="14" y1="10" x2="74" y2="70" stroke="#9AA7C7" stroke-width="5" stroke-linecap="round"/>
    </svg>
    <p class="oos-title">This question is outside the scope<br>of DVT Care.</p>
    <p class="oos-sub">This assistant provides information about deep vein thrombosis and blood clots only.</p>
    <p class="oos-suggest-label">You may find these questions helpful:</p>
    <div class="oos-suggestions">${suggestionsHTML}</div>
  `;

  panel.querySelectorAll(".oos-suggestion").forEach((btn) => {
    btn.addEventListener("click", () => {
      input.value = btn.dataset.q;
      composer.dispatchEvent(new Event("submit"));
    });
  });

  turn.appendChild(panel);
  conversation.appendChild(turn);
  scrollToBottom();
}

function scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}
