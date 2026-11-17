/* =========================================================================
   ASSISTANT ENGINE
   Two interchangeable reasoning backends:
     1. LocalEngine   — offline, zero-dependency TF-IDF retrieval + intent rules
     2. GeminiEngine  — Google Gemini, key read from env.js (never typed into the UI)
   The facade uses Gemini automatically when ARIA_ENV.GEMINI_API_KEY is set,
   and falls back to the Local engine when it is empty or the call fails.
   Both understand English, Hindi (Devanagari) and Hinglish.
   ========================================================================= */

/* ---------------------------- text utilities ---------------------------- */
const STOPWORDS = new Set(
  ("a an and are as at be been being but by can could did do does doing for from had has have " +
   "having he her here hers him his how i if in into is it its itself just me more most my no nor " +
   "not of off on once only or other our out over own same she should so some such than that the " +
   "their them then there these they this those through to too under until up very was we were " +
   "what when where which while who whom why will with would you your yours please tell want need " +
   "know give show about get got any also may might must shall").split(" ")
);

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Very light stemmer — enough to unify plurals and common suffixes. */
function stem(t) {
  if (t.length <= 3) return t;
  if (t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.endsWith("sses")) return t.slice(0, -2);
  if (t.endsWith("ing") && t.length > 5) return t.slice(0, -3);
  if (t.endsWith("ed") && t.length > 4) return t.slice(0, -2);
  /* "classes", "boxes", "watches" lose -es; "rules", "dates", "policies" only lose -s */
  if (/(ches|shes|xes|zes|sses)$/.test(t)) return t.slice(0, -2);
  if (t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

function normalizeCourseCode(text) {
  const m = String(text).toUpperCase().match(/\b([A-Z]{2,4})[\s-]?(\d{3})\b/);
  return m ? `${m[1]}-${m[2]}` : null;
}

/* ------------------------------ Local engine ---------------------------- */
class LocalEngine {
  constructor(kb) {
    this.kb = kb;
    this.docs = kb.map((entry) => {
      const titleTokens = tokenize(entry.title).map(stem);
      const tagTokens = tokenize((entry.tags || []).join(" ")).map(stem);
      const bodyTokens = tokenize(entry.text).map(stem);
      const bag = {};
      const add = (toks, w) => toks.forEach((t) => (bag[t] = (bag[t] || 0) + w));
      add(titleTokens, 3.2);
      add(tagTokens, 2.4);
      add(bodyTokens, 1);
      return { entry, bag, length: Object.values(bag).reduce((a, b) => a + b, 0) };
    });
    this._buildIdf();
    this.lastTopic = null;
  }

  _buildIdf() {
    const df = {};
    this.docs.forEach((d) => Object.keys(d.bag).forEach((t) => (df[t] = (df[t] || 0) + 1)));
    const N = this.docs.length;
    this.idf = {};
    Object.keys(df).forEach((t) => (this.idf[t] = Math.log((N + 1) / (df[t] + 0.5)) + 1));
  }

  _vector(bag) {
    const v = {};
    Object.entries(bag).forEach(([t, tf]) => {
      v[t] = (1 + Math.log(tf)) * (this.idf[t] || 1.6);
    });
    return v;
  }

  static _cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (const k in a) { na += a[k] * a[k]; if (b[k]) dot += a[k] * b[k]; }
    for (const k in b) nb += b[k] * b[k];
    if (!na || !nb) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  retrieve(rawQuery, k = 3) {
    const query = AriaAI.toEnglish(rawQuery);
    const qTokens = tokenize(query).map(stem);
    if (!qTokens.length) return [];
    const bag = {};
    qTokens.forEach((t) => (bag[t] = (bag[t] || 0) + 1));
    const qv = this._vector(bag);
    const boosts = LocalEngine._boosts(query);

    const scored = this.docs.map((d) => {
      let score = LocalEngine._cosine(qv, this._vector(d.bag));
      // exact tag hits are a strong signal
      const tags = (d.entry.tags || []).map((t) => stem(t.toLowerCase()));
      qTokens.forEach((t) => { if (tags.includes(t)) score += 0.11; });
      // domain keyword boost — keeps routing precise on short queries
      if (boosts[d.entry.id]) score += boosts[d.entry.id];
      // course-code exact match
      const code = normalizeCourseCode(query);
      if (code && (d.entry.tags || []).some((t) => t.replace("-", "") === code.replace("-", ""))) score += 0.35;
      return { entry: d.entry, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, k);
  }

  /** Domain keywords that should route a short query to the right document. */
  static _boosts(query) {
    const s = String(query).toLowerCase();
    const map = [
      [/\b(attendance|absent|absence|miss(ed)? class)\b|75\s?%/, "kb-attendance"],
      [/\b(chatgpt|generative|ai tool|ai use|plagiar|disclos)\b/, "kb-ai-policy"],
      [/\b(late|penalt|overdue)\b/, "kb-late"],
      [/\b(extension|more time|extra time)\b/, "kb-extension"],
      [/\b(appeal|grade|mark|result|dispute)\b/, "kb-grade"],
      [/\b(exam|revise|revision|study plan|past paper|flashcard)\b/, "kb-study"],
      [/\b(lab|software|install|environment|setup|ticket|helpdesk)\b/, "kb-lab"],
      [/\b(team|group|partner|charter)\b/, "kb-team"],
      [/\b(tutor|wellbeing|counsel|stress|anxiety|mental|accommodation)\b/, "kb-support"],
      [/\b(contact|email|who do i ask|support office|hours)\b/, "kb-contact"],
      [/\b(paradigm|rag|llm|retrieval|deep learning|symbolic)\b/, "kb-paradigms"],
      [/\b(peas|rational|agent model|architecture|utility)\b/, "kb-agent"],
      [/\b(doubt|confused|stuck|don't understand|do not understand)\b/, "kb-doubt"],
    ];
    const out = {};
    map.forEach(([re, id]) => { if (re.test(s)) out[id] = (out[id] || 0) + 0.28; });
    return out;
  }

  /* ---- intent layer ---- */
  detectIntent(q) {
    const s = AriaAI.toEnglish(q).toLowerCase().trim();
    const raw = String(q).trim();
    if (/^(hi|hey|hello|yo|good (morning|afternoon|evening)|salam|namaste|namaskar|pranam)\b/i.test(raw) || /^(नमस्ते|नमस्कार|हेलो|हैलो|हाय|प्रणाम)/.test(raw)) return "greeting";
    if (/^(thanks|thank you|thx|ty|cheers|great|awesome|perfect|shukriya|dhanyavad|dhanyawad)\b/i.test(raw) || /^(धन्यवाद|शुक्रिया|थैंक)/.test(raw)) return "thanks";
    if (/\b(who are you|your name)\b/.test(s) || /(तुम कौन|आप कौन|तुम्हारा नाम|आपका नाम|तुम क्या कर|आप क्या कर)/.test(raw) || /\b(tum kaun|aap kaun|tumhara naam|aapka naam)\b/i.test(raw)) return "meta";
    if (/^(bye|goodbye|see you|alvida)\b/i.test(raw) || /^(अलविदा|बाय)/.test(raw)) return "bye";
    return "question";
  }

  /* ---- course-specific structured answers ---- */
  courseAnswer(rawQ) {
    const q = AriaAI.toEnglish(rawQ);
    const code = normalizeCourseCode(q);
    if (!code) return null;
    const c = COURSES.find((x) => x.code === code);
    if (!c) return null;
    const s = q.toLowerCase();

    const head = `**${c.code} — ${c.title}** is taught by ${c.instructor}.`;
    const parts = [];

    if (/\b(who|teacher|instructor|professor|lecturer)\b/.test(s))
      parts.push(`You can reach them at **${c.email}**. Office hours are listed on the course card.`);
    if (/\b(when|time|schedule|day|room|where|class|classes|meet|meets)\b/.test(s))
      parts.push(`It meets **${c.schedule}** in **${c.room}**.`);
    if (/\b(assess\w*|grade|marks|weight\w*|exam|split)\b/.test(s)) {
      const rows = c.assessment.map((a) => `- ${a.name} — **${a.weight}%**`).join("\n");
      parts.push(`The assessment breakdown is:\n${rows}\n\nThese weights sum to 100%.`);
    }
    if (/\b(prereq\w*|requirements?|before|need to take)\b/.test(s)) {
      const p = c.prerequisites.length ? c.prerequisites.join(", ") : "none";
      parts.push(`Prerequisites: **${p}**.`);
    }
    if (/\b(credits?|how many)\b/.test(s))
      parts.push(`It is worth **${c.credits} credits** at ${c.level.toLowerCase()} level.`);
    if (/\b(topics?|syllabus|cover\w*|learn\w*|content)\b/.test(s))
      parts.push(`The syllabus covers:\n${c.topics.map((t) => `- ${t}`).join("\n")}`);

    if (!parts.length) parts.push(`${c.description} It meets ${c.schedule} in ${c.room} and is worth ${c.credits} credits.`);

    return { text: `${head}\n\n${parts.join("\n\n")}`, sources: [c.code] };
  }

  /* ---- language-aware canned replies ---- */
  static T(lang, en, hi, hl) {
    return lang === "hi" ? hi : lang === "hinglish" ? hl : en;
  }

  /** Follow-up questions the assistant builds by itself from what it just retrieved. */
  followUps(query, lang, n = 3) {
    const L = lang || AriaAI.detectLang(query);
    const hits = this.retrieve(query, n + 2);
    const usable = hits.filter((h) => h.score >= 0.085);
    let pool = usable.slice(1, n + 1).map((h) => h.entry.title);
    if (pool.length < n) pool = pool.concat(this.randomTitles(n - pool.length, pool));
    return pool.slice(0, n).map((t) => LocalEngine.T(L,
      `Tell me about: ${t}`,
      `“${t}” के बारे में बताओ`,
      `“${t}” ke baare mein batao`));
  }

  randomTitles(n, exclude = []) {
    const titles = this.kb.map((e) => e.title).filter((t) => !exclude.includes(t));
    for (let i = titles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [titles[i], titles[j]] = [titles[j], titles[i]];
    }
    return titles.slice(0, n);
  }

  /** Random questions about the whole site — used for the starter chips. */
  randomQuestions(n = 4, lang = "en") {
    return this.randomTitles(n).map((t) => LocalEngine.T(lang,
      `Tell me about: ${t}`, `“${t}” के बारे में बताओ`, `“${t}” ke baare mein batao`));
  }

  /** Main entry point. Returns { text, sources[], confidence, followUps[] } */
  answer(query) {
    const lang = AriaAI.detectLang(query);
    const T = (en, hi, hl) => LocalEngine.T(lang, en, hi, hl);
    const intent = this.detectIntent(query);
    const done = (o) => ({ followUps: this.followUps(query, lang), lang, ...o });

    if (intent === "greeting")
      return done({ text: T(
        `Hello! Ask me about your classes, the classroom rules, or any course.`,
        `नमस्ते! अपनी क्लासें, क्लासरूम के नियम या कोई भी कोर्स — जो पूछना हो पूछिए।`,
        `Namaste! Apni classes, classroom ke rules ya koi bhi course — jo poochna ho poochiye.`), sources: [], confidence: 1, followUps: this.randomQuestions(3, lang) });
    if (intent === "thanks")
      return done({ text: T(
        `You're welcome. If anything else comes up — a deadline, a rule, or a concept you're stuck on — just ask.`,
        `आपका स्वागत है! कोई और सवाल हो — डेडलाइन, नियम या कोई कॉन्सेप्ट — तो बेझिझक पूछिए।`,
        `Aapka swagat hai! Koi aur sawaal ho — deadline, rule ya koi concept — toh bejhijhak poochiye.`), sources: [], confidence: 1, followUps: this.randomQuestions(3, lang) });
    if (intent === "bye")
      return done({ text: T(
        `Good luck with your studies. I'll be here when you need me.`,
        `पढ़ाई के लिए शुभकामनाएँ! जब भी ज़रूरत हो, मैं यहीं हूँ।`,
        `Padhai ke liye shubhkamnayein! Jab bhi zaroorat ho, main yahin hoon.`), sources: [], confidence: 1, followUps: [] });
    if (intent === "meta")
      return done({ text: T(
        `I'm **Aria**. Ask me a question about the courses, rules or workflows and I'll answer it.`,
        `मैं **Aria** हूँ। कोर्स, नियम या वर्कफ़्लो के बारे में कोई भी सवाल पूछिए, मैं जवाब दूँगी।`,
        `Main **Aria** hoon. Courses, rules ya workflows ke baare mein koi bhi sawaal poochiye, main jawab dungi.`), sources: [], confidence: 1, followUps: this.randomQuestions(3, lang) });

    // structured course lookup first
    const structured = this.courseAnswer(query);
    if (structured) {
      const prefix = T("", "कोर्स की जानकारी (अंग्रेज़ी में):\n\n", "Course ki jaankari (English mein):\n\n");
      return done({ ...structured, text: prefix + structured.text, confidence: 0.95 });
    }

    const hits = this.retrieve(query, 3);
    const top = hits[0];

    if (!top || top.score < 0.085) {
      return {
        lang,
        text: T(
          `I don't have a grounded answer for that in the classroom knowledge base, and I'd rather say so than guess.\n\nI can help with:\n- Course details — codes, instructors, schedules, assessment weights\n- Classroom rules — attendance, integrity, deadlines, devices, conduct\n- Workflows — extensions, grade appeals, exam prep, lab access, tutoring\n\nFor anything outside that scope, contact **${CLASSROOM.supportEmail}** (${CLASSROOM.helpdeskHours}).`,
          `इस सवाल का पक्का जवाब मेरे knowledge base में नहीं मिला, और मैं अंदाज़ा लगाकर नहीं बताना चाहती।\n\nमैं इनमें मदद कर सकती हूँ:\n- कोर्स — कोड, शिक्षक, शेड्यूल, मार्किंग\n- नियम — उपस्थिति, ईमानदारी, डेडलाइन, डिवाइस, आचरण\n- वर्कफ़्लो — एक्सटेंशन, ग्रेड अपील, परीक्षा की तैयारी, लैब, ट्यूटरिंग\n\nइसके अलावा के लिए संपर्क करें: **${CLASSROOM.supportEmail}** (${CLASSROOM.helpdeskHours})।`,
          `Is sawaal ka pakka jawab mere knowledge base mein nahi mila, aur main andaaza lagakar nahi batana chahti.\n\nMain in mein madad kar sakti hoon:\n- Courses — code, teacher, schedule, marking\n- Rules — attendance, integrity, deadline, devices, conduct\n- Workflows — extension, grade appeal, exam prep, lab, tutoring\n\nIske alawa ke liye sampark karein: **${CLASSROOM.supportEmail}** (${CLASSROOM.helpdeskHours}).`),
        sources: [],
        confidence: 0.2,
        followUps: this.randomQuestions(3, lang),
      };
    }

    const strong = top.score >= 0.22;
    const chosen = strong ? [top] : hits.filter((h) => h.score > top.score * 0.72).slice(0, 2);

    let text = chosen.map((h) => h.entry.text).join("\n\n");
    if (!strong && chosen.length > 1) {
      text = `${T("Here's what the knowledge base says on that:", "इस बारे में knowledge base में यह लिखा है:", "Is baare mein knowledge base mein yeh likha hai:")}\n\n${text}`;
    } else if (lang !== "en") {
      text = `${T("", "नॉलेज बेस से (अंग्रेज़ी में):", "Knowledge base se (English mein):")}\n\n${text}`;
    }

    this.lastTopic = top.entry.id;
    return done({
      text,
      sources: chosen.map((h) => h.entry.title),
      confidence: Math.min(0.99, 0.45 + top.score),
      score: top.score,
    });
  }
}

/* ------------------------------ Gemini engine --------------------------- */
class GeminiEngine {
  constructor(kb) {
    this.kb = kb;
    this.history = []; // [{role, parts}] — short rolling memory for follow-up questions
  }

  _systemPrompt(context, extra) {
    const courseLines = COURSES.map(
      (c) => `${c.code} | ${c.title} | ${c.instructor} | ${c.schedule} | ${c.room} | ${c.credits} credits | prereq: ${c.prerequisites.join(", ") || "none"} | assessment: ${c.assessment.map((a) => `${a.name} ${a.weight}%`).join(", ")} | office: ${c.resources[c.resources.length - 1]}`
    ).join("\n");

    return `You are Aria, the AI-Based Smart Classroom Assistant for the ${CLASSROOM.department} at ${CLASSROOM.institution}.

HOW TO BEHAVE:
1. LANGUAGE: reply in the same language and script the user wrote in. Hindi (Devanagari) gets Hindi, Hinglish gets Hinglish, any other language gets that language. Keep course codes, room names and file names as they are.
2. THINK before answering. Work out what the person really wants (a schedule, a rule, a file, a policy), combine the pieces of CONTEXT that apply, and give a direct answer first.
3. Questions about the website, the courses, the classroom rules, the workflows, the portal and how the assistant works are all in scope. Answer them from CONTEXT. If CONTEXT truly does not contain a fact, say so plainly and point to ${CLASSROOM.supportEmail} — never invent a rule, deadline, room or policy.
4. Cite the source title in square brackets after a claim, e.g. [Attendance requirement].
5. Be concise and warm. Short paragraphs or tight bullets. Bold dates, percentages and room numbers.
6. You cannot change grades, approve extensions or open personal records. Send those requests to the right human office.
7. Refuse medical, legal and financial advice and redirect to student support.
8. If asked about AI use in coursework, cite Rule R7 (disclosure) and Rule R6 (individual work).
9. LAST LINE of every answer, on its own: FOLLOWUPS: <question 1> | <question 2> | <question 3> — three short, useful questions the user might ask next, written in the user's language. Nothing after that line.

COURSE CATALOGUE (authoritative):
${courseLines}
${extra ? `\nABOUT THIS USER AND THEIR PANEL (authoritative):\n${extra}\n` : ""}
CONTEXT:
${context}`;
  }

  static splitFollowUps(raw) {
    const m = String(raw).match(/\n?\s*\**FOLLOW-?UPS?\**\s*:\s*([\s\S]+)$/i);
    if (!m) return { text: String(raw).trim(), followUps: [] };
    const followUps = m[1].split("|").map((x) => x.replace(/^[\s\-•*\d.)]+/, "").trim()).filter(Boolean).slice(0, 3);
    return { text: String(raw).slice(0, m.index).trim(), followUps };
  }

  async ask(question, extra) {
    const local = new LocalEngine(this.kb);
    const hits = local.retrieve(question, 4);
    // The whole knowledge base is small, so Gemini sees all of it and can reason across documents.
    const context = this.kb.map((e) => `### ${e.title}\n${e.text}`).join("\n\n");

    const contents = this.history.concat([{ role: "user", parts: [{ text: question }] }]).slice(-12);
    const raw = await AriaAI.generate({
      system: this._systemPrompt(context, extra),
      contents,
      temperature: 0.35,
      maxTokens: 1100,
    });

    const { text, followUps } = GeminiEngine.splitFollowUps(raw);
    this.history.push({ role: "user", parts: [{ text: question }] }, { role: "model", parts: [{ text }] });
    this.history = this.history.slice(-12);

    const cited = hits.filter((h) => h.score >= 0.085).map((h) => h.entry.title).slice(0, 4);
    return { text, sources: cited, confidence: 0.9, followUps };
  }
}

/* ------------------------------ Facade ---------------------------------- */
const Assistant = {
  local: new LocalEngine(KB),
  gemini: new GeminiEngine(KB),

  /** True when env.js holds a Gemini key. */
  online() { return AriaAI.hasKey(); },

  /** `extra` = optional panel context (role, timetable, files) handed to Gemini. */
  async ask(question, extra) {
    if (AriaAI.hasKey()) {
      try {
        const out = await this.gemini.ask(question, extra);
        return { ...out, engine: "gemini" };
      } catch (err) {
        const fallback = this.local.answer(question);
        return {
          ...fallback,
          engine: "local",
          note: `Gemini could not answer (${err.message}). This answer came from the offline engine.`,
        };
      }
    }
    const out = this.local.answer(question);
    return { ...out, engine: "local" };
  },

  starterQuestions(n = 4, lang = "en") { return this.local.randomQuestions(n, lang); },
};
