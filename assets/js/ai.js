/* ==========================================================================
   Aria — shared AI core
   --------------------------------------------------------------------------
   · Reads the Gemini key from window.ARIA_ENV (assets/js/env.js). No page
     ever asks the user for a key and nothing is stored in localStorage.
   · Language helpers so the offline Local AI also understands Hindi
     (Devanagari) and Hinglish (Hindi typed in English letters).
   ========================================================================== */

const AriaAI = (() => {
  const ENV = window.ARIA_ENV || {};
  const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

  const key = () => String(ENV.GEMINI_API_KEY || "").trim();
  const model = () => String(ENV.GEMINI_MODEL || "gemini-2.0-flash").trim();
  const hasKey = () => key().length > 0;

  /* One shared request path for every assistant on the site. */
  async function generate(opts) {
    if (!hasKey()) throw new Error("No Gemini key set in env.js");
    const body = {
      contents: opts.contents,
      generationConfig: {
        temperature: opts.temperature == null ? 0.35 : opts.temperature,
        maxOutputTokens: opts.maxTokens || 1100,
        topP: 0.9
      }
    };
    if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };

    const res = await fetch(ENDPOINT + "/" + model() + ":generateContent?key=" + encodeURIComponent(key()), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* ignore */ }
    if (!res.ok) throw new Error((data && data.error && data.error.message) || "HTTP " + res.status);
    if (data && data.promptFeedback && data.promptFeedback.blockReason) {
      throw new Error("The request was blocked (" + data.promptFeedback.blockReason + ").");
    }
    const parts = (((data && data.candidates) || [])[0] || {}).content;
    const text = parts && parts.parts ? parts.parts.map((p) => p.text || "").join("").trim() : "";
    if (!text) throw new Error("Gemini returned an empty answer.");
    return text;
  }

  /* ------------------------------------------------------------ language */
  const DEVANAGARI = /[\u0900-\u097F]/;
  const OTHER_SCRIPT = /[\u0600-\u06FF\u0980-\u0DFF\u0E00-\u0E7F\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\u0400-\u04FF]/;

  /* Hindi written in English letters. Matching 2+ of these = Hinglish. */
  const HINGLISH_WORDS = new Set((
    "aaj kal kab kaun kon kya kaise kaisa kahan kahaan kyun kyu kitna kitne kitni mera meri mere mujhe mujhko " +
    "hai hain hoga hogi hoon nahi nahin nhi haan han ji bata batao batana bataiye dikhao dikha " +
    "chahiye milega milegi padhata padhati padhate chahta chahti karo karna kar sakta sakti sakte wala wali wale ke ki ka ko se mein me par pe aur " +
    "lekin isme isko usko tumhara aapka aapki apna apni samay kitne baje agle agli agla pichle class classes " +
    "padhai padhna sir mam madam jaldi abhi pehle baad ab bhi toh to na"
  ).split(" "));

  function detectLang(text) {
    const t = String(text || "");
    if (DEVANAGARI.test(t)) return "hi";
    if (OTHER_SCRIPT.test(t)) return "other";
    const words = t.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    let hits = 0;
    words.forEach((w) => { if (HINGLISH_WORDS.has(w) && w.length > 2) hits++; });
    const strong = words.filter((w) => ["kaun", "kya", "kaise", "kab", "kahan", "mera", "meri", "mujhe", "batao", "bata", "hai", "hain", "aaj", "kal", "nahi", "chahiye", "kitna"].includes(w)).length;
    if (strong >= 1 && hits >= 2) return "hinglish";
    if (hits >= 3) return "hinglish";
    return "en";
  }

  /* Hindi / Hinglish word -> English retrieval keyword ("" = filler, drop it). */
  const LEX = {
    /* time */
    "आज": "today", "aaj": "today", "कल": "tomorrow", "kal": "tomorrow", "परसों": "day after tomorrow",
    "अगली": "next", "अगला": "next", "अगले": "next", "agli": "next", "agla": "next", "agle": "next", "अब": "now", "abhi": "now", "अभी": "now",
    "समय": "time", "samay": "time", "टाइम": "time", "baje": "time", "बजे": "time",
    /* classes & schedule */
    "क्लास": "class", "क्लासेस": "classes", "क्लासें": "classes", "क्लासे": "classes", "कक्षा": "class", "कक्षाएं": "classes", "कक्षाएँ": "classes", "कक्षाओं": "classes",
    "लेक्चर": "lecture", "व्याख्यान": "lecture", "लैब": "lab", "प्रैक्टिकल": "lab", "ट्यूटोरियल": "tutorial",
    "टाइमटेबल": "timetable", "टाइम-टेबल": "timetable", "समयसारणी": "timetable", "समय-सारणी": "timetable", "शेड्यूल": "schedule", "तालिका": "timetable",
    "कमरा": "room", "रूम": "room", "कक्ष": "room", "कहाँ": "where", "कहां": "where", "kahan": "where", "kahaan": "where",
    "कौन": "which", "kaun": "which", "कौनसी": "which", "कौनसा": "which", "kon": "which", "कब": "when", "kab": "when", "क्या": "what", "kya": "what",
    "कैसे": "how", "kaise": "how", "क्यों": "why", "kyun": "why", "कितने": "how many", "कितनी": "how many", "कितना": "how many", "kitne": "how many", "kitni": "how many", "kitna": "how many",
    "मेरी": "my", "मेरा": "my", "मेरे": "my", "meri": "my", "mera": "my", "mere": "my", "मुझे": "me", "mujhe": "me",
    /* people & courses */
    "शिक्षक": "lecturer", "अध्यापक": "lecturer", "टीचर": "lecturer", "प्रोफेसर": "professor", "प्रोफ़ेसर": "professor", "लेक्चरर": "lecturer", "सर": "lecturer", "sir": "lecturer", "mam": "lecturer", "madam": "lecturer", "teacher": "lecturer",
    "कोर्स": "course", "पाठ्यक्रम": "course", "विषय": "course", "सिलेबस": "syllabus", "पाठ्यचर्या": "syllabus", "क्रेडिट": "credit", "क्रेडिट्स": "credits",
    /* files & notices */
    "स्लाइड": "slides", "स्लाइड्स": "slides", "नोट्स": "notes", "फाइल": "file", "फ़ाइल": "file", "पीडीएफ": "pdf", "सामग्री": "materials", "मैटेरियल": "material",
    "घोषणा": "announcement", "घोषणाएं": "announcements", "घोषणाएँ": "announcements", "सूचना": "announcement", "सूचनाएं": "announcements", "सूचनाएँ": "announcements", "नोटिस": "notice", "खबर": "news",
    "रद्द": "cancelled", "कैंसिल": "cancelled", "postpone": "reschedule", "स्थगित": "reschedule",
    /* rules & policies */
    "नियम": "rules", "niyam": "rules", "पॉलिसी": "policy", "नीति": "policy", "उपस्थिति": "attendance", "हाजिरी": "attendance", "हाज़िरी": "attendance", "अटेंडेंस": "attendance", "अनुपस्थिति": "absence", "छुट्टी": "leave",
    "परीक्षा": "exam", "एग्जाम": "exam", "इम्तिहान": "exam", "तैयारी": "prepare", "तैयार": "prepare", "पढ़ाई": "study", "padhai": "study", "पढ़ना": "study",
    "अंक": "marks", "नंबर": "marks", "ग्रेड": "grade", "परिणाम": "result", "रिजल्ट": "result", "अपील": "appeal",
    "विस्तार": "extension", "एक्सटेंशन": "extension", "देरी": "late", "लेट": "late", "जुर्माना": "penalty", "दंड": "penalty", "असाइनमेंट": "assignment", "गृहकार्य": "assignment", "प्रोजेक्ट": "project",
    "नकल": "plagiarism", "चैटजीपीटी": "chatgpt", "एआई": "ai", "एआइ": "ai", "जेमिनी": "gemini",
    "मदद": "help", "सहायता": "help", "madad": "help", "समस्या": "problem", "दिक्कत": "problem", "परेशानी": "problem", "सपोर्ट": "support", "संपर्क": "contact", "ईमेल": "email",
    "ट्यूशन": "tutoring", "काउंसलिंग": "counselling", "तनाव": "stress", "चिंता": "anxiety",
    "समूह": "group", "टीम": "team", "साथी": "partner",
    /* weekdays */
    "सोमवार": "monday", "somvar": "monday", "मंगलवार": "tuesday", "mangalvar": "tuesday", "बुधवार": "wednesday", "budhvar": "wednesday", "बुद्धवार": "wednesday",
    "गुरुवार": "thursday", "गुरूवार": "thursday", "guruvar": "thursday", "veervar": "thursday", "वीरवार": "thursday", "शुक्रवार": "friday", "shukravar": "friday",
    "शनिवार": "saturday", "shanivar": "saturday", "रविवार": "sunday", "ravivar": "sunday", "इतवार": "sunday", "itvar": "sunday",
    /* verbs / glue we keep as intent words */
    "बताओ": "tell", "बताइए": "tell", "बताएं": "tell", "बताना": "tell", "batao": "tell", "bata": "tell", "batana": "tell", "bataiye": "tell", "दिखाओ": "show", "dikhao": "show", "dikha": "show",
    "चाहिए": "need", "चलेगी": "now", "चलेगा": "now", "चल": "now", "चलती": "now", "लाइव": "live", "live": "live", "chalegi": "now", "chalega": "now", "chal": "now", "रही": "", "raha": "", "rahi": "", "padhata": "lecturer", "padhati": "lecturer", "padhate": "lecturer", "पढ़ाता": "lecturer", "पढ़ाते": "lecturer", "पढ़ाती": "lecturer", "chahiye": "need", "नहीं": "not", "nahi": "not", "nahin": "not", "nhi": "not", "मिल": "get", "milega": "get", "मिलेगा": "get",
    "है": "", "हैं": "", "hai": "", "hain": "", "ho": "", "tha": "", "thi": "", "hoga": "", "hogi": "", "सी": "", "si": "", "का": "", "की": "", "के": "", "को": "", "से": "", "में": "", "me": "", "mein": "", "पर": "", "par": "", "और": "and", "aur": "and", "या": "or", "ya": "or",
    "ka": "", "ki": "", "ke": "", "ko": "", "se": "", "ye": "", "yeh": "", "यह": "", "ये": "", "वो": "", "wo": "", "toh": "", "to": "", "भी": "", "bhi": "", "ना": "", "na": "", "ji": "", "जी": "", "कृपया": "", "please": ""
  };

  /* Turn a Hindi / Hinglish question into English keywords for retrieval and routing. */
  function toEnglish(text) {
    const lang = detectLang(text);
    if (lang !== "hi" && lang !== "hinglish") return String(text || "");
    return String(text || "")
      .split(/[\s,.?!।;:()"'“”‘’]+/)
      .filter(Boolean)
      .map((w) => {
        const k = w.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(LEX, k)) return LEX[k];
        return w; /* keep codes (CS-301), English words, numbers */
      })
      .filter((w) => w !== "")
      .join(" ");
  }

  return { hasKey, generate, detectLang, toEnglish, model };
})();
