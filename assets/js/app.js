/* =========================================================================
   APP — rendering, interaction, chat wiring
   ========================================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ------------------------------- helpers -------------------------------- */
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Minimal, safe markdown renderer for assistant output. */
function renderMarkdown(text) {
  const lines = escapeHTML(text).split("\n");
  let html = "";
  let inList = false;

  const inline = (s) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]{3,60})\]/g, '<span class="src-chip">$1</span>');

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inList) { html += "</ul>"; inList = false; }
      continue;
    }
    if (/^[-•]\s+/.test(line)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inline(line.replace(/^[-•]\s+/, ""))}</li>`;
    } else if (/^\d+\.\s+/.test(line)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`;
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<p>${inline(line)}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}

const ICONS = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 16-8-6 16-2.5-6.5L4 12z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

/* ------------------------------- nav ------------------------------------ */
function initNav() {
  const nav = $(".nav");
  const toggle = $(".nav-toggle");
  const links = $(".nav-links");

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle?.addEventListener("click", () => links.classList.toggle("open"));
  $$(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );

  const sections = $$("section[id]");
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        $$(".nav-links a").forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));
}

/* ----------------------------- reveal ----------------------------------- */
function initReveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => obs.observe(el));
  /* Fail-safe: anything at or above the viewport (a hash jump, a fast scroll) is shown at once,
     so a section can never stay invisible and look like an empty gap. */
  const flush = () => $$(".reveal:not(.in)").forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight * 1.05) el.classList.add("in");
  });
  window.addEventListener("scroll", flush, { passive: true });
  window.addEventListener("hashchange", () => setTimeout(flush, 60));
  setTimeout(flush, 400);
}

/* ------------------------ Aria as a side popup --------------------------- */
function initAriaDrawer() {
  const panel = $("#chatPanel");
  if (!panel) return;
  const drawer = document.createElement("div");
  drawer.className = "aria-drawer"; drawer.id = "ariaDrawer"; drawer.setAttribute("aria-hidden", "true");
  const back = document.createElement("div"); back.className = "aria-backdrop";
  document.body.appendChild(back); document.body.appendChild(drawer); drawer.appendChild(panel);
  const shell = $(".assistant-shell"); if (shell) shell.classList.add("solo");
  const open = () => { drawer.classList.add("open"); back.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); setTimeout(() => { const i = $("#chatInput"); if (i) i.focus(); }, 250); };
  const close = () => { drawer.classList.remove("open"); back.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href="#assistant"]');
    if (a) { e.preventDefault(); open(); }
  });
  back.addEventListener("click", close);
  const x = $("#ariaClose"); if (x) x.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  window.AriaDrawer = { open, close };
}

/* ----------------------------- courses ---------------------------------- */
function renderCourses() {
  const grid = $("#courseGrid");
  grid.innerHTML = COURSES.map(
    (c) => `
    <article class="card course-card reveal" data-code="${c.code}" tabindex="0" role="button" aria-label="Open ${c.code} ${c.title}">
      <div class="cc-accent" style="background:linear-gradient(90deg,${c.color},transparent)"></div>
      <div class="cc-top">
        <div class="cc-code-row">
          <span class="cc-code" style="color:${c.color}">${c.code}</span>
          <span class="cc-level">${c.level}</span>
        </div>
        <h3 class="cc-title">${c.title}</h3>
        <div class="cc-instructor">${ICONS.user}<span>${c.instructor}</span></div>
      </div>
      <div class="cc-body">
        <div class="cc-meta">
          <div class="cc-meta-row">${ICONS.clock}<span>${c.schedule}</span></div>
          <div class="cc-meta-row">${ICONS.pin}<span>${c.room}</span></div>
        </div>
        <p class="cc-desc">${c.description}</p>
        <div class="cc-foot">
          <span class="cc-credits">${c.credits} credits · ${c.seats} seats</span>
          <span class="cc-open">View details ${ICONS.arrow}</span>
        </div>
      </div>
    </article>`
  ).join("");

  $$(".course-card", grid).forEach((card) => {
    const open = () => openCourseModal(card.dataset.code);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
}

function openCourseModal(code) {
  const c = COURSES.find((x) => x.code === code);
  if (!c) return;
  const backdrop = $("#courseModal");
  $("#modalContent").innerHTML = `
    <div class="modal-head">
      <span class="cc-code" style="color:${c.color};display:inline-block">${c.code}</span>
      <h3>${c.title}</h3>
      <p class="modal-sub">${c.instructor} · ${c.email}</p>
      <button class="modal-close" aria-label="Close">✕</button>
    </div>
    <div class="modal-body">
      <p style="color:var(--text-2);font-size:14px;line-height:1.7">${c.description}</p>

      <div class="detail-block">
        <h4>Logistics</h4>
        <div class="chip-row">
          <span class="chip">${c.schedule}</span>
          <span class="chip">${c.room}</span>
          <span class="chip">${c.credits} credits</span>
          <span class="chip">${c.level}</span>
          <span class="chip">${c.seats} seats</span>
        </div>
      </div>

      <div class="detail-block">
        <h4>Assessment breakdown</h4>
        <div class="bar-list">
          ${c.assessment.map((a) => `
            <div class="bar-item">
              <span class="bl-name">${a.name}</span>
              <span class="bl-val">${a.weight}%</span>
              <div class="bar-track"><div class="bar-fill" style="width:${a.weight * 2.6}%;max-width:100%;background:linear-gradient(90deg,${c.color},#22d3ee)"></div></div>
            </div>`).join("")}
        </div>
      </div>

      <div class="detail-block">
        <h4>Topics covered</h4>
        <div class="chip-row">${c.topics.map((t) => `<span class="chip">${t}</span>`).join("")}</div>
      </div>

      <div class="detail-block">
        <h4>Prerequisites</h4>
        <div class="chip-row">
          ${c.prerequisites.length ? c.prerequisites.map((p) => `<span class="chip">${p}</span>`).join("") : '<span class="chip">None</span>'}
        </div>
      </div>

      <div class="detail-block">
        <h4>Resources</h4>
        <ul style="list-style:none;display:grid;gap:8px">
          ${c.resources.map((r) => `<li style="font-size:13.5px;color:var(--text-2);padding-left:16px;position:relative"><span style="position:absolute;left:0;top:8px;width:5px;height:5px;border-radius:50%;background:${c.color}"></span>${r}</li>`).join("")}
        </ul>
      </div>

      <div class="detail-block">
        <button class="btn btn-primary btn-sm" data-ask="${c.code}">Ask Aria about ${c.code} ${ICONS.arrow}</button>
      </div>
    </div>`;

  backdrop.classList.add("open");
  document.body.style.overflow = "hidden";
  $("#modalContent .modal-close").addEventListener("click", closeModal);
  $("#modalContent [data-ask]")?.addEventListener("click", () => {
    closeModal();
    askFromOutside(`Tell me about ${c.code} ${c.title}`);
  });
}

function closeModal() {
  $("#courseModal").classList.remove("open");
  document.body.style.overflow = "";
}

/* ------------------------------ rules ----------------------------------- */
function renderRuleFilters() {
  const wrap = $("#ruleFilters");
  wrap.innerHTML = RULE_CATEGORIES.map(
    (c) => `<button class="filter-chip${c.id === "all" ? " active" : ""}" data-cat="${c.id}">${c.label}</button>`
  ).join("");
  $$(".filter-chip", wrap).forEach((chip) =>
    chip.addEventListener("click", () => {
      $$(".filter-chip", wrap).forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      filterRules();
    })
  );
}

function filterRules() {
  const cat = $(".filter-chip.active", $("#ruleFilters"))?.dataset.cat || "all";
  const q = ($("#ruleSearch").value || "").toLowerCase().trim();
  const list = RULES.filter((r) => {
    const catOk = cat === "all" || r.cat === cat;
    const qOk = !q || `${r.id} ${r.title} ${r.text} ${r.why} ${r.cat}`.toLowerCase().includes(q);
    return catOk && qOk;
  });

  const grid = $("#rulesGrid");
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state">No rules match that filter or search. Try a different keyword.</div>`;
    return;
  }
  grid.innerHTML = list.map(
    (r) => `
    <article class="card rule-card reveal in">
      <div class="rule-top">
        <div>
          <div class="rule-id">${r.id} · ${r.cat}</div>
          <h3 class="rule-title">${r.title}</h3>
        </div>
        <span class="sev sev-${r.severity}">${r.severity}</span>
      </div>
      <p class="rule-text">${r.text}</p>
      <div class="rule-why"><b>Why:</b> ${r.why}</div>
    </article>`
  ).join("");
}

/* ---------------------------- workflows --------------------------------- */
function renderWorkflowFilters() {
  const wrap = $("#wfFilters");
  const opts = [
    { id: "all", label: "All workflows" },
    { id: "learning", label: "Learning" },
    { id: "support", label: "Support" },
  ];
  wrap.innerHTML = opts.map((o) => `<button class="filter-chip${o.id === "all" ? " active" : ""}" data-type="${o.id}">${o.label}</button>`).join("");
  $$(".filter-chip", wrap).forEach((chip) =>
    chip.addEventListener("click", () => {
      $$(".filter-chip", wrap).forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      filterWorkflows();
    })
  );
}

function filterWorkflows() {
  const type = $(".filter-chip.active", $("#wfFilters"))?.dataset.type || "all";
  const q = ($("#wfSearch").value || "").toLowerCase().trim();
  const list = WORKFLOWS.filter((w) => {
    const typeOk = type === "all" || w.type === type;
    const qOk = !q || `${w.title} ${w.summary} ${w.tags.join(" ")} ${w.steps.join(" ")}`.toLowerCase().includes(q);
    return typeOk && qOk;
  });

  const grid = $("#wfGrid");
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state">No workflow matches that search. Try “extension”, “exam”, “lab”, or “grade”.</div>`;
    return;
  }
  grid.innerHTML = list.map(
    (w) => `
    <article class="card wf-card reveal in">
      <div class="wf-head">
        <span class="wf-type ${w.type}">${w.type}</span>
        <span class="wf-sla">SLA · ${w.sla}</span>
      </div>
      <h3 class="wf-title">${w.title}</h3>
      <p class="wf-summary">${w.summary}</p>
      <ol class="wf-steps">${w.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      <div class="wf-foot">
        <span class="wf-owner">${w.owner}</span>
        <button class="wf-ask" data-q="${escapeHTML(w.title)}">Ask Aria ${ICONS.arrow}</button>
      </div>
    </article>`
  ).join("");

  $$(".wf-ask", grid).forEach((b) =>
    b.addEventListener("click", () => askFromOutside(`Walk me through: ${b.dataset.q}`))
  );
}

/* ------------------------------ agent ----------------------------------- */
function renderAgent() {
  const letters = [
    { k: "P", title: "Performance measure", items: AGENT_MODEL.peas.performance },
    { k: "E", title: "Environment", items: AGENT_MODEL.peas.environment },
    { k: "A", title: "Actuators", items: AGENT_MODEL.peas.actuators },
    { k: "S", title: "Sensors", items: AGENT_MODEL.peas.sensors },
  ];
  $("#peasGrid").innerHTML = letters.map(
    (l) => `
    <div class="card peas-card reveal">
      <div class="peas-letter">${l.k}</div>
      <h3>${l.title}</h3>
      <ul>${l.items.map((i) => `<li>${i}</li>`).join("")}</ul>
    </div>`
  ).join("");

  $("#envTable").innerHTML = AGENT_MODEL.environmentProperties.map(
    (p) => `
    <tr>
      <td>${p.name}</td>
      <td><span class="env-flag ${p.value ? "env-yes" : "env-no"}">${p.value ? "YES" : "NO"}</span></td>
      <td>${p.note}</td>
    </tr>`
  ).join("");

  $("#archList").innerHTML = AGENT_MODEL.architecture.map(
    (a, i) => `
    <div class="arch-item">
      <span class="arch-num">0${i + 1}</span>
      <div><b>${a.layer}</b><span>${a.detail}</span></div>
    </div>`
  ).join("");

  const loopEl = $("#loopSteps");
  loopEl.innerHTML = AGENT_MODEL.loop.map((step, i) => {
    const [name, desc] = step.split("→").map((s) => s.trim());
    return `<div class="loop-step" data-i="${i}">${name}<small>${desc}</small></div>`;
  }).join("");

  $("#formula").textContent = AGENT_MODEL.performanceMeasure;
  $("#agentDef").textContent = AGENT_MODEL.definition;
}

function startAgentLoop() {
  const steps = $$(".loop-step");
  if (!steps.length) return;
  let i = 0;
  let timer = null;
  const tick = () => {
    steps.forEach((s) => s.classList.remove("active"));
    steps[i % steps.length].classList.add("active");
    i++;
  };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !timer) { tick(); timer = setInterval(tick, 1100); }
      else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
    });
  }, { threshold: 0.3 });
  obs.observe($("#loopSteps"));
}

/* ---------------------------- paradigms --------------------------------- */
function scoreColor(v) {
  if (v >= 90) return "linear-gradient(90deg,#34d399,#22d3ee)";
  if (v >= 75) return "linear-gradient(90deg,#7c5cff,#22d3ee)";
  if (v >= 60) return "linear-gradient(90deg,#f59e0b,#f472b6)";
  return "linear-gradient(90deg,#fb7185,#f59e0b)";
}

function renderParadigms() {
  const sorted = [...PARADIGMS].sort((a, b) => b.fit - a.fit);
  $("#paradigmList").innerHTML = sorted.map(
    (p) => `
    <article class="card para-card reveal">
      <div class="para-main">
        <h3>${p.name} <span class="para-era">${p.era}</span></h3>
        <p class="para-idea">${p.idea}</p>
        <div class="para-tags">
          ${p.strengths.slice(0, 3).map((s) => `<span class="ptag pro">+ ${s}</span>`).join("")}
          ${p.weaknesses.slice(0, 2).map((w) => `<span class="ptag con">− ${w}</span>`).join("")}
        </div>
      </div>
      <div class="para-score">
        <div class="ps-num" style="color:${p.fit >= 90 ? "#34d399" : p.fit >= 75 ? "#a78bfa" : p.fit >= 60 ? "#fbbf24" : "#fb7185"}">${p.fit}</div>
        <div class="ps-label">fit score / 100</div>
        <div class="ps-track"><div class="ps-fill" style="width:${p.fit}%;background:${scoreColor(p.fit)}"></div></div>
        <p class="para-verdict">${p.verdict}</p>
      </div>
    </article>`
  ).join("");
}

/* ------------------------------- chat ----------------------------------- */
const chatState = { busy: false };

function addMessage(role, html, sources = [], note = "") {
  const body = $("#chatBody");
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.innerHTML = `
    <div class="msg-avatar">${role === "bot" ? "A" : "You"}</div>
    <div class="msg-bubble">
      ${html}
      ${note ? `<p style="font-size:11.5px;color:var(--amber);margin-top:8px">⚠ ${escapeHTML(note)}</p>` : ""}
      ${sources.length ? `<div class="msg-sources"><span class="src-label">Sources</span>${sources.map((s) => `<span class="src-chip">${escapeHTML(s)}</span>`).join("")}</div>` : ""}
    </div>`;
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
}

function addTyping() {
  const body = $("#chatBody");
  const el = document.createElement("div");
  el.className = "msg bot";
  el.id = "typingMsg";
  el.innerHTML = `<div class="msg-avatar">A</div><div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
}

function removeTyping() {
  $("#typingMsg")?.remove();
}

async function sendMessage(text) {
  const value = (text ?? $("#chatInput").value).trim();
  if (!value || chatState.busy) return;

  $("#chatInput").value = "";
  autoGrow($("#chatInput"));
  addMessage("user", `<p>${escapeHTML(value)}</p>`);
  chatState.busy = true;
  $("#sendBtn").disabled = true;
  addTyping();

  const started = performance.now();
  try {
    const res = await Assistant.ask(value);
    const elapsed = Math.round(performance.now() - started);
    await new Promise((r) => setTimeout(r, Math.max(0, 380 - elapsed)));
    removeTyping();
    addMessage("bot", renderMarkdown(res.text), res.sources || [], res.note || "");
    updateEngineBadge(res.engine);
    setFollowUps(res.followUps);
  } catch (err) {
    removeTyping();
    addMessage("bot", `<p>Something went wrong while answering. Please try again.</p>`, [], err.message);
  } finally {
    chatState.busy = false;
    $("#sendBtn").disabled = false;
    $("#chatInput").focus();
  }
}

function askFromOutside(question) {
  /* Every "Ask Aria" button opens the side popup and sends the question there. */
  if (window.AriaDrawer) window.AriaDrawer.open();
  setTimeout(() => sendMessage(question), 320);
}

function updateEngineBadge(engine) {
  const badge = $("#modeBadge");
  if (!badge) return;
  const isGemini = engine === "gemini";
  badge.className = `mode-badge ${isGemini ? "mode-gemini" : "mode-local"}`;
  badge.textContent = isGemini ? "GEMINI" : "LOCAL AI";
}

function autoGrow(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function initChat() {
  const input = $("#chatInput");
  const sendBtn = $("#sendBtn");

  sendBtn.addEventListener("click", () => sendMessage());
  input.addEventListener("input", () => autoGrow(input));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  $$(".sugg").forEach((b) => b.addEventListener("click", () => sendMessage(b.textContent)));

  /* The engine is decided by env.js: a Gemini key means Gemini, no key means Local AI. */
  updateEngineBadge(Assistant.online() ? "gemini" : "local");
  setFollowUps(Assistant.starterQuestions(4, "en"));
}

/* Questions the assistant builds by itself — random at first, then follow-ups to each answer. */
function setFollowUps(list) {
  const box = $(".chat-suggest");
  if (!box || !list || !list.length) return;
  box.innerHTML = list.slice(0, 4).map((q) => `<button class="sugg" type="button">${escapeHTML(q)}</button>`).join("");
  $$(".sugg", box).forEach((b) => b.addEventListener("click", () => sendMessage(b.textContent)));
}

/* ------------------------------- boot ----------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderCourses();
  renderRuleFilters();
  filterRules();
  renderWorkflowFilters();
  filterWorkflows();
  renderAgent();
  renderParadigms();
  initNav();
  initChat();
  initAriaDrawer();
  initReveal();
  startAgentLoop();

  $("#ruleSearch").addEventListener("input", filterRules);
  $("#wfSearch").addEventListener("input", filterWorkflows);

  $("#courseModal").addEventListener("click", (e) => {
    if (e.target.id === "courseModal") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  $$("[data-hero-ask]").forEach((b) =>
    b.addEventListener("click", () => askFromOutside(b.dataset.heroAsk))
  );
});
