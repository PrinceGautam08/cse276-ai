/* ==========================================================================
   Aria — Shared UI: toasts, announcement bell, avatars
   Depends on: store.js. Loaded on the dashboard and the Solver page.
   ========================================================================== */

const UI = (() => {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  /* --------------------------------------------------------------- toast */
  let stack = null;
  function toast(message, kind, ms) {
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("role", "status");
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }
    const t = document.createElement("div");
    t.className = "toast " + (kind || "info");
    t.textContent = message;
    stack.appendChild(t);
    requestAnimationFrame(() => t.classList.add("in"));
    setTimeout(() => {
      t.classList.remove("in");
      setTimeout(() => t.remove(), 260);
    }, ms || 3200);
  }

  /* ------------------------------------------------------------- avatars */
  const TONES = ["#e9a85b", "#8fb4d9", "#b9d98f", "#d98fb4", "#a78bfa", "#6ee7b7"];
  function toneFor(seed) {
    let h = 0;
    for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return TONES[h % TONES.length];
  }

  /** Photo when the person uploaded one, a generated portrait tile otherwise. */
  function portrait(person, cls) {
    const name = (person && person.name) || "?";
    const ini = Auth.initials(name);
    if (person && person.avatar) {
      return '<span class="portrait ' + (cls || "") + '"><img src="' + esc(person.avatar) + '" alt="' + esc(name) + '" /></span>';
    }
    const c = toneFor(name);
    return '<span class="portrait ' + (cls || "") + '" style="--tone:' + c + '" role="img" aria-label="' + esc(name) + '">' +
      "<i>" + esc(ini) + "</i></span>";
  }

  function ago(ts) {
    const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return "just now";
    if (s < 3600) return Math.round(s / 60) + " min ago";
    if (s < 86400) return Math.round(s / 3600) + " h ago";
    if (s < 86400 * 14) return Math.round(s / 86400) + " d ago";
    return new Date(ts).toISOString().slice(0, 10);
  }

  /* ---------------------------------------------------------------- bell */
  const BELL_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>';

  /**
   * Mount the announcement bell for a signed-in user.
   * opts.onViewAll — called by the "Open noticeboard" footer button.
   */
  function mountBell(host, user, opts) {
    opts = opts || {};
    host.innerHTML =
      '<div class="bell">' +
      '<button type="button" class="bell-btn" aria-label="Announcements" aria-haspopup="dialog" aria-expanded="false">' + BELL_SVG +
      '<span class="bell-badge" hidden>0</span></button>' +
      '<div class="bell-pop" role="dialog" aria-label="Announcements">' +
      '<div class="bell-head"><b>Announcements</b><button type="button" class="linkish bell-mark">Mark all read</button></div>' +
      '<div class="bell-list"></div>' +
      '<div class="bell-foot"><button type="button" class="linkish bell-all">' + esc(opts.viewAllLabel || "Open noticeboard") + "</button></div>" +
      "</div></div>";

    const root = host.querySelector(".bell");
    const btn = host.querySelector(".bell-btn");
    const badge = host.querySelector(".bell-badge");
    const list = host.querySelector(".bell-list");
    let open = false;
    let lastCount = -1;

    function count() {
      const n = Store.unreadFor(user).length;
      badge.hidden = n === 0;
      badge.textContent = n > 9 ? "9+" : String(n);
      btn.classList.toggle("ring", n > 0);
      btn.setAttribute("aria-label", n ? "Announcements, " + n + " unread" : "Announcements");
      if (n > lastCount && lastCount !== -1) {
        btn.classList.remove("shake");
        void btn.offsetWidth;
        btn.classList.add("shake");
      }
      lastCount = n;
    }

    function skeleton() {
      list.innerHTML = [1, 2, 3]
        .map(() => '<div class="bell-item skel-row"><i class="skel" style="width:38%;height:10px"></i><i class="skel" style="width:88%;height:13px"></i><i class="skel" style="width:62%;height:10px"></i></div>')
        .join("");
    }

    function paint() {
      const unread = new Set(Store.unreadFor(user).map((a) => a.id));
      const items = Store.visibleTo(user).slice().sort((a, b) => (b.ts || Date.parse(b.date)) - (a.ts || Date.parse(a.date))).slice(0, 10);
      if (!items.length) {
        list.innerHTML = '<div class="bell-empty">You are all caught up.<span>New notices about your classes appear here.</span></div>';
        return;
      }
      list.innerHTML = items
        .map((a) => {
          const k = a.kind && Store.KINDS[a.kind];
          return '<button type="button" class="bell-item' + (unread.has(a.id) ? " unread" : "") + '" data-id="' + esc(a.id) + '">' +
            '<div class="bi-top">' +
            (k ? '<span class="tag ' + k.tone + '">' + esc(k.label) + "</span>" : "") +
            (a.course ? '<span class="tag v">' + esc(a.course) + "</span>" : "") +
            '<span class="bi-time">' + esc(ago(a.ts || Date.parse(a.date))) + "</span></div>" +
            "<b>" + esc(a.title) + "</b>" +
            "<p>" + esc(a.body) + "</p>" +
            '<div class="bi-by">' + esc(a.author) + "</div></button>";
        })
        .join("");
    }

    function show() {
      open = true;
      root.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      skeleton();
      setTimeout(() => {
        if (!open) return;
        paint();
      }, 320);
    }

    function hide() {
      if (!open) return;
      open = false;
      root.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      open ? hide() : show();
    });

    host.querySelector(".bell-mark").addEventListener("click", () => {
      Store.markRead(user, Store.visibleTo(user).map((a) => a.id));
      count();
      paint();
    });

    host.querySelector(".bell-all").addEventListener("click", () => {
      hide();
      if (opts.onViewAll) opts.onViewAll();
    });

    list.addEventListener("click", (e) => {
      const it = e.target.closest(".bell-item[data-id]");
      if (!it) return;
      Store.markRead(user, [it.dataset.id]);
      it.classList.remove("unread");
      count();
    });

    document.addEventListener("click", (e) => {
      if (open && !root.contains(e.target)) hide();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide();
    });

    /* A lecturer posting in another tab updates this bell live. */
    window.addEventListener("storage", (e) => {
      if (e.key === "aria_ann_v1" || e.key === "aria_ann_read_v1") {
        Store.hydrate();
        count();
        if (open) paint();
      }
    });
    window.addEventListener("focus", () => {
      Store.hydrate();
      count();
    });

    count();
    return { refresh: () => { Store.hydrate(); count(); if (open) paint(); } };
  }

  return { esc, toast, portrait, ago, mountBell, toneFor };
})();
