/* Study Assistant: answers general questions (Python, maths, anything) through Gemini.
   The key comes from env.js (ARIA_ENV.GEMINI_API_KEY) — there is no key box here.
   Without a key it falls back to Aria's offline engine for classroom questions. */
(function () {
  var HIST = 'aria_sa_hist';
  var SYS = 'You are Study Assistant, a patient tutor for students. Answer any question on any subject (programming, maths, science, writing, careers). ' +
    'Give a direct answer first, then a short step-by-step explanation. For code, use fenced code blocks and say how to run it. ' +
    'If the user writes in Hindi or Hinglish, reply in the same language. If you are unsure, say so and point to a reliable reference instead of guessing.';
  var hist = []; try { hist = JSON.parse(localStorage.getItem(HIST) || '[]'); } catch (e) {}
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function md(t) {
    t = esc(t).replace(/```(\w*)\n?([\s\S]*?)```/g, function (_, l, c) { return '<pre><code>' + c.replace(/\n$/, '') + '</code></pre>'; });
    t = t.replace(/\n*(<\/?pre>)\n*/g, '$1');
    return t.replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
  }

  /* ---- floating books ---- */
  function books() {
    var L = document.createElement('div'); L.className = 'books'; L.setAttribute('aria-hidden', 'true');
    var cols = ['#e9a85b', '#c97b4a', '#8fb4d9', '#b9d98f', '#d98fb4', '#f6d9a0'];
    for (var i = 0; i < 14; i++) {
      var b = document.createElement('div'); b.className = 'book';
      var c = cols[i % cols.length], s = 0.7 + Math.random() * 0.9;
      b.style.cssText = 'left:' + (Math.random() * 96) + '%;--top:' + (Math.random() * 85) + '%;--r0:' + (Math.random() * 60 - 30) + 'deg;--r1:' + (Math.random() * 120 - 60) + 'deg;' +
        'animation-duration:' + (26 + Math.random() * 30) + 's;animation-delay:-' + (Math.random() * 40) + 's;width:' + (34 * s) + 'px;height:' + (46 * s) + 'px';
      b.innerHTML = '<svg viewBox="0 0 34 46"><rect x="3" y="2" width="28" height="42" rx="3" fill="' + c + '"/><rect x="3" y="2" width="6" height="42" rx="2" fill="rgba(0,0,0,.25)"/><rect x="13" y="12" width="14" height="3" rx="1.5" fill="rgba(255,255,255,.55)"/><rect x="13" y="19" width="10" height="3" rx="1.5" fill="rgba(255,255,255,.4)"/></svg>';
      L.appendChild(b);
    }
    document.body.insertBefore(L, document.body.firstChild);
  }

  /* ---- assistant panel ---- */
  var panel, log, ta, send;
  function add(role, text) {
    var d = document.createElement('div'); d.className = 'sa-msg ' + (role === 'user' ? 'me' : 'ai');
    if (role === 'user') d.textContent = text; else d.innerHTML = md(text);
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function save() { try { localStorage.setItem(HIST, JSON.stringify(hist.slice(-30))); } catch (e) {} }
  function ask(q) {
    if (!q.trim()) return;
    add('user', q);
    if (!AriaAI.hasKey()) {
      /* No Gemini key in env.js: answer classroom questions offline, be honest about the rest. */
      var r = Assistant.local.answer(q);
      var t = r.text;
      if (r.confidence < 0.45 || (typeof r.score === 'number' && r.score < 0.2)) {
        t = AriaAI.detectLang(q) === 'hi'
          ? 'यह सवाल क्लासरूम से बाहर का लगता है। इसका जवाब देने के लिए एडमिन को env.js में Gemini key डालनी होगी। क्लासरूम, कोर्स या नियमों के बारे में मैं अभी जवाब दे सकती हूँ।'
          : 'That looks like a general question. To answer it the administrator needs to add the Gemini key in env.js. I can still answer anything about courses, classroom rules and workflows right now.';
      }
      add('model', t); return;
    }
    hist.push({ role: 'user', parts: [{ text: q }] });
    var wait = add('model', 'Thinking…'); send.disabled = true;
    AriaAI.generate({ system: SYS, contents: hist.slice(-16), temperature: 0.4, maxTokens: 1400 })
      .then(function (t) { wait.innerHTML = md(t); hist.push({ role: 'model', parts: [{ text: t }] }); save(); })
      .catch(function (e) { hist.pop(); wait.innerHTML = md('Could not reach Gemini: ' + e.message + '\nCheck your connection and the key in env.js, then send again.'); })
      .then(function () { send.disabled = false; log.scrollTop = log.scrollHeight; });
  }
  function build() {
    var fab = document.createElement('button'); fab.className = 'sa-fab'; fab.type = 'button'; fab.textContent = 'Talk with AI';
    panel = document.createElement('div'); panel.className = 'sa-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Study Assistant');
    panel.innerHTML = '<div class="sa-head"><div><b>Study Assistant</b><span>Ask any question. Python, maths, anything.</span></div><div class="sp"></div><button type="button" id="saNew">New chat</button><button type="button" id="saX" aria-label="Close">Close</button></div>' +
      '<div class="sa-log" id="saLog"></div>' +
      '<form class="sa-form" id="saForm"><textarea id="saTa" rows="1" placeholder="Type your question…"></textarea><button type="submit" id="saSend">Send</button></form>';
    document.body.appendChild(fab); document.body.appendChild(panel);
    log = panel.querySelector('#saLog'); ta = panel.querySelector('#saTa'); send = panel.querySelector('#saSend');
    add('model', 'Hi, I am Study Assistant. Ask me anything: a Python error, a maths problem, an exam topic. I will solve it step by step.');
    hist.slice(-6).forEach(function (m) { add(m.role, m.parts[0].text); });
    /* The AI Assistant lives on its own page (solver.html); this button just takes you there. */
    function open(q) { location.href = 'solver.html' + (q ? '?q=' + encodeURIComponent(q) : ''); }
    fab.onclick = function () { open(); }; panel.querySelector('#saX').onclick = function () { panel.classList.remove('open'); fab.style.display = ''; };
    panel.querySelector('#saNew').onclick = function () { hist = []; save(); log.innerHTML = ''; add('model', 'New chat started. What would you like to solve?'); };
    panel.querySelector('#saForm').onsubmit = function (e) { e.preventDefault(); var q = ta.value; ta.value = ''; ask(q); };
    ta.onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); panel.querySelector('#saForm').requestSubmit(); } };
    window.AriaHelper = { open: open, ask: function (q) { open(q); } };
    var c = document.getElementById('composerGo');
    if (c) {
      var cta = document.getElementById('composerText');
      c.onclick = function () { var q = cta.value; cta.value = ''; window.AriaHelper.ask(q || 'Explain recursion in Python with a simple example.'); };
      document.querySelectorAll('.chips button').forEach(function (b) { b.onclick = function () { window.AriaHelper.ask(b.textContent); }; });
    }
  }
  document.addEventListener('DOMContentLoaded', function () { books(); build(); });
})();
