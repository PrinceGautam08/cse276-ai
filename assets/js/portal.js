/* ==========================================================================
   Aria — Portal controller
   Role router, five dashboards, and the role-aware AI agent.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------- helpers */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    lifebuoy: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M14.83 9.17l3.53-3.53M9.17 14.83l-4.24 4.24"/>',
    chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>',
    spark: '<path d="M12 3v3M12 18v3M4.2 7.5 6.8 9M17.2 15l2.6 1.5M4.2 16.5 6.8 15M17.2 9l2.6-1.5"/><circle cx="12" cy="12" r="3.4"/>',
    solver: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 7.5h8M8 12h2M14 12h2M8 16h2M14 16h2"/>'
  };

  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.grid) + "</svg>";
  }

  const toMin = (t) => {
    const p = String(t).split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  };
  const fmtTime = (t) => {
    const p = String(t).split(":");
    let h = parseInt(p[0], 10);
    const m = p[1];
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + m + " " + ap;
  };

  /* --------------------------------------------------------------- state */
  const user = Auth.requireSession();
  if (!user) return;

  const role = user.role;
  const meta = ROLE_META[role];
  const perms = PERMISSIONS[role] || [];
  const NOW = new Date();
  const TODAY = NOW.getDay();
  const NOW_MIN = NOW.getHours() * 60 + NOW.getMinutes();

  /* Credentials shown after an admin/management issues a login. */
  let lastIssued = null;

  /* Per-user conversation, persisted in localStorage. */
  let chatLog = [];

  /* Avatar markup: uploaded photo when present, initials otherwise. */
  function avatarHTML(u, size) {
    const cls = "av " + (size || "av-md");
    if (u && u.avatar) return '<div class="' + cls + '"><img src="' + esc(u.avatar) + '" alt="" /></div>';
    return '<div class="' + cls + '">' + esc(Auth.initials((u && u.name) || "?")) + "</div>";
  }

  const courseOf = (code) => COURSES.find((c) => c.code === code) || null;

  function firstName(name) {
    const parts = String(name).split(" ").filter((p) => !/^(dr|prof|mr|ms|mrs|professor|doctor)\.?$/i.test(p));
    return parts[0] || name;
  }

  function myCodes() {
    if (role === "lecturer" || role === "student") return (user.courses || []).slice();
    return COURSES.map((c) => c.code);
  }

  function slotsFor(codes) {
    return TIMETABLE.filter((t) => codes.includes(t.course))
      .slice()
      .sort((a, b) => a.day - b.day || toMin(a.start) - toMin(b.start));
  }

  function nextSlot(codes) {
    const slots = slotsFor(codes);
    if (!slots.length) return null;
    const today = slots.filter((s) => s.day === TODAY && toMin(s.start) > NOW_MIN);
    if (today.length) return Object.assign({}, today[0], { when: "Today", rel: 0 });
    for (let d = 1; d <= 7; d++) {
      const idx = (TODAY + d) % 7;
      const day = slots.filter((s) => s.day === idx);
      if (day.length) {
        return Object.assign({}, day[0], {
          when: d === 1 ? "Tomorrow" : DAY_NAMES[idx],
          rel: d
        });
      }
    }
    return Object.assign({}, slots[0], { when: DAY_NAMES[slots[0].day], rel: 7 });
  }

  function directions(room) {
    const parts = String(room).split("·").map((s) => s.trim());
    const block = parts[0] || "the main building";
    const rest = parts.slice(1).join(", ") || "the main hall";
    return "Walk to " + block + " through the central quadrangle, then go to " + rest + ". Allow about 5 minutes from the main entrance.";
  }

  function weekHours(codes) {
    const slots = slotsFor(codes);
    const mins = slots.reduce((a, s) => a + (toMin(s.end) - toMin(s.start)), 0);
    return Math.round((mins / 60) * 10) / 10;
  }

  function rosterFor(codes) {
    return STUDENT_ROSTER.filter((s) => s.courses.some((c) => codes.includes(c)));
  }

  function materialsFor(codes) {
    return MATERIALS.filter((m) => codes.includes(m.course));
  }

  function stat(label, value, note) {
    return '<div class="stat"><b>' + esc(value) + "</b><span>" + esc(label) + "</span>" +
      (note ? "<small>" + esc(note) + "</small>" : "") + "</div>";
  }

  function panel(title, sub, body, flush) {
    return '<section class="panel"><div class="panel-head"><h3>' + esc(title) + "</h3>" +
      (sub ? '<span class="ph-sub">' + esc(sub) + "</span>" : "") +
      '</div><div class="panel-body' + (flush ? " flush" : "") + '">' + body + "</div></section>";
  }

  function canRetract(a) {
    if (!a.stored) return false;
    if (role === "admin" || role === "management") return true;
    return !!a.authorEmail && a.authorEmail.toLowerCase() === user.email.toLowerCase();
  }

  function announceList(list) {
    if (!list.length) return '<div class="empty">No announcements for you right now.</div>';
    return list
      .slice()
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.ts || Date.parse(b.date)) - (a.ts || Date.parse(a.date)))
      .map((a) => {
        const k = a.kind && Store.KINDS[a.kind];
        return '<article class="announce' + (a.pinned ? " pinned" : "") + (a.kind === "cancelled" ? " is-cancel" : "") + '">' +
          "<h4>" + esc(a.title) +
          (a.pinned ? ' <span class="tag a">Pinned</span>' : "") +
          (k ? ' <span class="tag ' + k.tone + '">' + esc(k.label) + "</span>" : "") +
          (a.course ? ' <span class="tag v">' + esc(a.course) + "</span>" : "") + "</h4>" +
          "<p>" + esc(a.body) + "</p>" +
          '<div class="an-meta">' + esc(a.author) + " · " + esc(a.date) + " · " + esc(a.role) +
          (canRetract(a) ? ' · <button type="button" class="linkish" data-retract="' + esc(a.id) + '">Withdraw</button>' : "") +
          "</div></article>";
      })
      .join("");
  }

  function visibleAnnouncements() {
    return Store.visibleTo(user);
  }

  function ttGrid(codes, compact) {
    const slots = slotsFor(codes);
    let html = '<div class="tt-grid">';
    for (let d = 1; d <= 5; d++) {
      const day = slots.filter((s) => s.day === d);
      html += '<div class="tt-day"><h4>' + DAY_SHORT[d] + "</h4>";
      if (!day.length) {
        html += '<div class="tt-empty">No classes</div>';
      } else {
        day.forEach((s) => {
          const c = courseOf(s.course);
          const cls = s.type.toLowerCase() + (d === TODAY ? " today" : "");
          html += '<div class="tt-slot ' + cls + '">' +
            '<div class="tt-time">' + fmtTime(s.start) + " – " + fmtTime(s.end) + "</div>" +
            "<b>" + esc(s.course) + (c ? " · " + esc(c.title.split(" ").slice(0, 2).join(" ")) : "") + "</b>" +
            "<span>" + esc(s.room) + "</span>" +
            "<span>" + esc(s.type) + " · " + esc(c ? c.instructor : "") + "</span>" +
            "</div>";
        });
      }
      html += "</div>";
    }
    html += "</div>";
    if (compact) return html;
    return html;
  }

  function nextClassCard(codes) {
    const n = nextSlot(codes);
    if (!n) return panel("Next class", "", '<div class="empty">No classes are scheduled for your courses.</div>');
    const c = courseOf(n.course);
    return '<section class="panel"><div class="panel-head"><h3>Your next class</h3><span class="ph-sub">' + esc(n.when) + " · " + esc(fmtTime(n.start)) + "</span></div>" +
      '<div class="panel-body">' +
      '<div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">' +
      '<div style="flex:1;min-width:240px">' +
      '<div style="font-size:1.2rem;font-weight:700;letter-spacing:-.02em;margin-bottom:4px">' + esc(n.course) + " — " + esc(c ? c.title : "") + "</div>" +
      '<div style="color:var(--text-2);font-size:.85rem;margin-bottom:12px">' + esc(n.type) + " · " + esc(n.room) + " · " + esc(fmtTime(n.start)) + "–" + esc(fmtTime(n.end)) + "</div>" +
      '<div style="font-size:.82rem;color:var(--text-2);line-height:1.65"><b style="color:var(--text)">How to get there:</b> ' + esc(directions(n.room)) + "</div>" +
      '<div style="font-size:.82rem;color:var(--text-2);line-height:1.65;margin-top:8px"><b style="color:var(--text)">What to bring:</b> ' +
      (n.type === "Lab" ? "laptop, lab notebook and your student card for door access." : "notebook, the week's reading and your student card.") + "</div>" +
      "</div>" +
      '<div style="min-width:180px">' +
      '<div class="tag c" style="margin-bottom:8px">' + esc(c ? c.instructor : "") + "</div>" +
      '<div class="tag" style="margin-bottom:8px">' + esc(c ? c.credits + " credits" : "") + "</div>" +
      '<div class="tag g">Weeks ' + esc(n.weeks) + "</div>" +
      "</div></div></div></section>";
  }

  /* ------------------------------------------------------------ nav build */
  function buildNav() {
    const nav = $("#sideNav");
    nav.innerHTML = perms
      .filter((k) => k !== "ai" && k !== "solver")
      .map((k) => {
        const item = NAV_ITEMS[k];
        return '<button class="snav" type="button" data-nav="' + k + '">' + icon(item.icon) + esc(item.label) + "</button>";
      })
      .join("") +
      '<div class="snav-sep">Assistants</div>' +
      '<button class="snav snav-ai" type="button" data-nav="ai">' + icon("spark") + "Ask with AI</button>" +
      (perms.includes("solver")
        ? '<a class="snav" href="solver.html">' + icon("solver") + 'AI Solver<span class="snav-ext" aria-hidden="true">↗</span></a>'
        : "");

    $$("[data-nav]", nav).forEach((b) => {
      b.addEventListener("click", () => {
        if (b.dataset.nav === "ai") {
          openAI();
          return;
        }
        render(b.dataset.nav, { skeleton: true });
        if (window.innerWidth <= 1080) $("#side").classList.remove("open");
      });
    });
  }

  /* ================================ PAGES ================================ */

  /* ------------------------------------------------------------ overview */
  function pageOverview() {
    const codes = myCodes();
    const n = nextSlot(codes);

    if (role === "admin" || role === "management") {
      const users = Auth.allUsers();
      const open = STAFF_TASKS.filter((t) => t.status !== "Resolved").length;
      const high = STAFF_TASKS.filter((t) => t.priority === "High" && t.status !== "Resolved").length;
      const avgAtt = Math.round(STUDENT_ROSTER.reduce((a, s) => a + s.attendance, 0) / STUDENT_ROSTER.length);

      return '<div class="page-head"><h2>' + (role === "admin" ? "Institution control centre" : "Operations overview") + "</h2>" +
        "<p>" + esc(meta.blurb) + "</p></div>" +
        '<div class="stat-grid">' +
        stat("Accounts", users.length, users.filter((u) => u.role === "lecturer").length + " lecturers") +
        stat("Students", STUDENT_ROSTER.length, "across 4 programmes") +
        stat("Open tickets", open, high + " high priority") +
        stat("Avg attendance", avgAtt + "%", "institution-wide") +
        "</div>" +
        panel("Programmes", "4 active", '<div class="table-wrap"><table class="dt"><thead><tr><th>Programme</th><th>Department</th><th>Years</th><th>Core courses</th></tr></thead><tbody>' +
          Object.values(PROGRAMMES).map((p) => "<tr><td><b>" + esc(p.short) + "</b></td><td>" + esc(p.department) + "</td><td>" + p.years + "</td><td>" + p.coreCourses.map((c) => '<span class="tag v">' + esc(c) + "</span>").join(" ") + "</td></tr>").join("") +
          "</tbody></table></div>", true) +
        panel("Support queue", open + " open", '<div class="table-wrap"><table class="dt"><thead><tr><th>Ticket</th><th>Category</th><th>Priority</th><th>Status</th></tr></thead><tbody>' +
          STAFF_TASKS.filter((t) => t.status !== "Resolved").map((t) => "<tr><td><b>" + esc(t.title) + "</b></td><td>" + esc(t.category) + "</td><td>" + prioTag(t.priority) + "</td><td>" + statusTag(t.status) + "</td></tr>").join("") +
          "</tbody></table></div>", true) +
        panel("Latest announcements", "", announceList(visibleAnnouncements()));
    }

    if (role === "lecturer") {
      const roster = rosterFor(codes);
      const mats = materialsFor(codes);
      return '<div class="page-head"><h2>Good day, ' + esc(firstName(user.name)) + "</h2>" +
        "<p>Your teaching scope, timetable and class rosters — everything Aria knows about your week.</p></div>" +
        '<div class="stat-grid">' +
        stat("Courses taught", codes.length, codes.join(", ")) +
        stat("Contact hours", weekHours(codes) + "h", "per week") +
        stat("Students", roster.length, "across your courses") +
        stat("Materials", mats.length, "published to your courses") +
        "</div>" +
        nextClassCard(codes) +
        panel("Your week", "Monday to Friday", ttGrid(codes)) +
        panel("Announcements for teaching staff", "", announceList(visibleAnnouncements()));
    }

    if (role === "staff") {
      const open = STAFF_TASKS.filter((t) => t.status !== "Resolved");
      return '<div class="page-head"><h2>Campus operations</h2><p>' + esc(meta.blurb) + "</p></div>" +
        '<div class="stat-grid">' +
        stat("Open tickets", open.length, "awaiting action") +
        stat("High priority", open.filter((t) => t.priority === "High").length, "respond within 4h") +
        stat("Resolved", STAFF_TASKS.filter((t) => t.status === "Resolved").length, "this week") +
        stat("Rooms monitored", new Set(TIMETABLE.map((t) => t.room)).size, "across 5 blocks") +
        "</div>" +
        panel("Support queue", "Sorted by priority", '<div class="table-wrap"><table class="dt"><thead><tr><th>Ticket</th><th>Category</th><th>Raised by</th><th>Priority</th><th>Status</th></tr></thead><tbody>' +
          STAFF_TASKS.map((t) => "<tr><td><b>" + esc(t.title) + "</b><br /><span class='mono'>" + esc(t.id) + " · SLA " + esc(t.sla) + "</span></td><td>" + esc(t.category) + "</td><td>" + esc(t.raisedBy) + "</td><td>" + prioTag(t.priority) + "</td><td>" + statusTag(t.status) + "</td></tr>").join("") +
          "</tbody></table></div>", true) +
        panel("Announcements", "", announceList(visibleAnnouncements()));
    }

    /* student */
    const st = STUDENT_ROSTER.find((s) => s.email === user.email) || STUDENT_ROSTER[0];
    const credits = codes.reduce((a, c) => a + (courseOf(c) ? courseOf(c).credits : 0), 0);
    return '<div class="page-head"><h2>Hello, ' + esc(firstName(user.name)) + "</h2>" +
      "<p>Your timetable, courses and materials for Spring 2025. Ask Aria if anything is unclear.</p></div>" +
      '<div class="stat-grid">' +
      stat("Enrolled courses", codes.length, codes.join(", ")) +
      stat("Credits", credits, "this semester") +
      stat("Attendance", st.attendance + "%", st.attendance < 75 ? "below the 75% threshold" : "in good standing") +
      stat("GPA", st.gpa.toFixed(1), "out of 10") +
      "</div>" +
      nextClassCard(codes) +
      panel("This week", "", ttGrid(codes)) +
      panel("Announcements", "", announceList(visibleAnnouncements()));
  }

  /* --------------------------------------------------------------- users */
  function pageUsers() {
    const users = Auth.allUsers();
    const canDelete = role === "admin";
    const pending = users.filter((u) => u.verified === false);
    const assignable = ["lecturer", "staff", "student"];

    const credBlock = lastIssued
      ? '<div class="cred" style="margin-bottom:22px">' +
        '<div class="cred-head">✓ Login issued — share these once</div>' +
        '<div class="cred-row"><span>Name</span><span>' + esc(lastIssued.name) + "</span></div>" +
        '<div class="cred-row"><span>Email</span><span>' + esc(lastIssued.email) + "</span></div>" +
        '<div class="cred-row"><span>Password</span><span>' + esc(lastIssued.password) + "</span></div>" +
        '<div class="cred-row"><span>Role</span><span>' + esc(lastIssued.roleLabel) + "</span></div>" +
        '<div class="cred-row"><span>Programme</span><span>' + esc(lastIssued.programme) + "</span></div>" +
        '<div class="cred-row"><span>Courses</span><span>' + esc(lastIssued.courses.join(", ") || "—") + "</span></div>" +
        "</div>"
      : "";

    const pendingBlock = pending.length
      ? panel("Awaiting approval", pending.length + " self-registered", '<div class="table-wrap"><table class="dt"><thead><tr><th>Name</th><th>Email</th><th>Source</th><th>Requested</th><th></th></tr></thead><tbody>' +
          pending.map((u) => "<tr><td><b>" + esc(u.name) + "</b></td><td class='mono'>" + esc(u.email) + "</td><td>" + esc(u.source || "password") +
            "</td><td class='mono'>" + esc(u.createdAt) + "</td><td><button class=\"mini-btn\" data-approve=\"" + esc(u.id) + "\">Approve</button></td></tr>").join("") +
          "</tbody></table></div>")
      : "";

    return '<div class="page-head"><h2>Users &amp; access</h2><p>' +
      "Issue logins for lecturers, staff and students, change a role, or approve a Google sign-up. Every action is written to the audit log." +
      "</p></div>" +
      '<div class="stat-grid">' +
      stat("Total accounts", users.length) +
      stat("Lecturers", users.filter((u) => u.role === "lecturer").length) +
      stat("Students", users.filter((u) => u.role === "student").length) +
      stat("Pending", pending.length) +
      "</div>" +
      (credBlock ? panel("Credentials", "Generated, not chosen", credBlock) : "") +
      pendingBlock +
      panel("Issue a login", "Email and password are generated automatically", '<form id="issueForm" class="form-grid">' +
        '<div class="field"><label>Full name</label><input name="name" required placeholder="e.g. Dr. Priya Deshmukh" /></div>' +
        '<div class="field"><label>Role to grant</label><select name="role">' + assignable.map((r) => '<option value="' + r + '">' + ROLE_META[r].label + "</option>").join("") + "</select></div>" +
        '<div class="field"><label>Programme</label><select name="programme"><option value="">— none —</option>' +
          Object.values(PROGRAMMES).map((p) => '<option value="' + p.code + '">' + esc(p.name) + "</option>").join("") + "</select></div>" +
        '<div class="field"><label>Courses (optional)</label><select name="courses" multiple size="4" style="height:auto;padding:8px">' +
          COURSES.map((c) => '<option value="' + c.code + '">' + c.code + " — " + esc(c.title) + "</option>").join("") + "</select></div>" +
        '<div class="full"><button class="auth-submit" type="submit" style="width:auto;padding:11px 22px">Generate credentials</button></div>' +
        '<p class="field-hint full">Leave courses empty to grant the programme\'s core set. Students need a programme to receive a course list.</p>' +
        "</form>") +
      panel("All accounts", users.length + " records", '<div class="table-wrap"><table class="dt"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Scope</th><th>Status</th><th></th></tr></thead><tbody>' +
        users.map((u) => "<tr><td><b>" + esc(u.name) + "</b></td><td class='mono'>" + esc(u.email) + "</td><td>" +
          (u.builtIn
            ? '<span class="tag v">' + esc(ROLE_META[u.role].label) + "</span>"
            : '<select class="mini-btn" data-role-for="' + esc(u.id) + '">' + assignable.map((r) => '<option value="' + r + '"' + (u.role === r ? " selected" : "") + ">" + ROLE_META[r].label + "</option>").join("") + "</select>") +
          "</td><td>" + esc(u.courses && u.courses.length ? u.courses.join(", ") : u.programme || "Institution-wide") +
          "</td><td>" + (u.verified === false ? '<span class="tag a">Pending</span>' : u.source === "google" ? '<span class="tag c">Google</span>' : '<span class="tag g">Active</span>') +
          "</td><td>" +
          (canDelete && !u.builtIn ? '<button class="mini-btn danger" data-del="' + esc(u.id) + '">Remove</button>' : '<span class="tag">Protected</span>') +
          "</td></tr>").join("") +
        "</tbody></table></div>", true);
  }

  /* -------------------------------------------------------------- courses */
  function pageCourses() {
    const codes = myCodes();
    const list = COURSES.filter((c) => codes.includes(c.code));
    return '<div class="page-head"><h2>Course catalogue</h2><p>' +
      (role === "admin" || role === "management" ? "Every course in the institution, with instructor, schedule and enrolment." : "The courses attached to your account.") +
      "</p></div>" +
      '<div class="card-grid">' + list.map((c) =>
        '<article class="mini-card"><div class="mc-top"><span class="tag v">' + esc(c.code) + '</span><span class="tag">' + esc(c.level) + "</span></div>" +
        "<h4>" + esc(c.title) + "</h4><p>" + esc(c.description) + "</p>" +
        '<div class="mc-meta"><span>' + esc(c.instructor) + "</span><span>" + esc(c.schedule) + "</span><span>" + esc(c.room) + "</span></div>" +
        '<div class="mc-meta"><span class="tag c">' + c.credits + " credits</span><span class='tag g'>" + c.seats + " seats</span></div>" +
        "</article>").join("") + "</div>";
  }

  /* ------------------------------------------------------------ timetable */
  function pageTimetable() {
    return '<div class="page-head"><h2>Master timetable</h2><p>All scheduled sessions across every programme. Today is ' + DAY_NAMES[TODAY] + ".</p></div>" +
      panel("Weekly grid", TIMETABLE.length + " sessions", ttGrid(COURSES.map((c) => c.code))) +
      panel("Session register", "Room allocation", '<div class="table-wrap"><table class="dt"><thead><tr><th>ID</th><th>Course</th><th>Day</th><th>Time</th><th>Room</th><th>Type</th><th>Programme</th></tr></thead><tbody>' +
        TIMETABLE.map((t) => "<tr><td class='mono'>" + esc(t.id) + "</td><td><b>" + esc(t.course) + "</b></td><td>" + DAY_NAMES[t.day] + "</td><td class='mono'>" + fmtTime(t.start) + "–" + fmtTime(t.end) + "</td><td>" + esc(t.room) + "</td><td>" + esc(t.type) + "</td><td>" + esc(t.programme) + "</td></tr>").join("") +
        "</tbody></table></div>", true);
  }

  /* ------------------------------------------------------------ materials */
  function pageMaterials() {
    const codes = myCodes();
    const list = materialsFor(codes);
    const canUpload = role === "lecturer" || role === "admin" || role === "management";
    const uploadForm = canUpload
      ? panel("Publish a material", "Visible immediately to enrolled students",
          '<form id="matForm" class="form-grid">' +
          '<div class="field"><label>Title</label><input name="title" required placeholder="e.g. Week 7 — Dynamic Programming" /></div>' +
          '<div class="field"><label>Type</label><select name="type"><option>PDF</option><option>Slides</option><option>Worksheet</option><option>Archive</option><option>Video</option></select></div>' +
          '<div class="field"><label>Course</label><select name="course">' + codes.map((c) => '<option value="' + c + '">' + c + "</option>").join("") + "</select></div>" +
          '<div class="field"><label>Week</label><input name="week" type="number" min="1" max="14" value="7" /></div>' +
          '<div class="field full"><label>File (optional · up to ' + Store.fmtBytes(Store.MAX_FILE_BYTES) + ')</label><input name="file" type="file" />' +
          '<p class="field-hint">Attach the real file and the AI Solver hands it to students as-is. Without a file, it builds a study handout from the title.</p></div>' +
          '<div class="full"><button class="auth-submit" type="submit" style="width:auto;padding:11px 22px">Publish material</button></div></form>')
      : "";

    return '<div class="page-head"><h2>Course materials</h2><p>' +
      (role === "student" ? "Everything your lecturers have published to your enrolled courses." : "Published handouts, slides and worksheets across your scope.") +
      "</p></div>" + uploadForm +
      panel("Library", list.length + " files", '<div class="table-wrap"><table class="dt"><thead><tr><th>Title</th><th>Course</th><th>Uploaded by</th><th>Week</th><th>Type</th><th>Size</th><th>File</th></tr></thead><tbody>' +
        list.map((m) => "<tr><td><b>" + esc(m.title) + "</b><br /><span class='mono'>" + esc(m.id) + "</span></td><td><span class='tag v'>" + esc(m.course) + "</span></td><td>" + esc(m.uploadedBy) + "</td><td class='mono'>W" + m.week + "</td><td>" + esc(m.type) + "</td><td class='mono'>" + esc(m.size) + "</td><td>" +
          (m.hasFile ? '<button type="button" class="linkish" data-dl="' + esc(m.id) + '">Download</button>' : '<span class="mono">—</span>') + "</td></tr>").join("") +
        "</tbody></table></div>", true);
  }

  /* ----------------------------------------------------------- attendance */
  function pageAttendance() {
    const codes = myCodes();
    if (role === "lecturer") {
      const roster = rosterFor(codes);
      return '<div class="page-head"><h2>Attendance</h2><p>Weekly registers close Friday at 17:00. Marking a student present updates their record immediately.</p></div>' +
        panel("Class roster", roster.length + " students", '<div class="table-wrap"><table class="dt"><thead><tr><th>Student</th><th>ID</th><th>Courses</th><th>Attendance</th><th></th></tr></thead><tbody>' +
          roster.map((s) => "<tr><td><b>" + esc(s.name) + "</b></td><td class='mono'>" + esc(s.id) + "</td><td>" + s.courses.filter((c) => codes.includes(c)).map((c) => '<span class="tag v">' + c + "</span>").join(" ") + "</td><td style='min-width:150px'><div class='bar'><i style='width:" + s.attendance + "%'></i></div><span class='mono'>" + s.attendance + "%</span></td><td><button class='mini-btn' data-present='" + esc(s.id) + "'>Mark present</button></td></tr>").join("") +
          "</tbody></table></div>", true);
    }

    if (role === "staff") {
      return '<div class="page-head"><h2>Attendance operations</h2><p>Aggregate attendance health by programme. Anything under 75% is escalated to the Academic Office.</p></div>' +
        '<div class="stat-grid">' +
        stat("Students tracked", STUDENT_ROSTER.length) +
        stat("Below 75%", STUDENT_ROSTER.filter((s) => s.attendance < 75).length, "require escalation") +
        stat("Average", Math.round(STUDENT_ROSTER.reduce((a, s) => a + s.attendance, 0) / STUDENT_ROSTER.length) + "%") +
        stat("Registers open", 5, "one per teaching day") +
        "</div>" +
        panel("Programme health", "", Object.values(PROGRAMMES).map((p) => {
          const rows = STUDENT_ROSTER.filter((s) => s.programme === p.code);
          const avg = rows.length ? Math.round(rows.reduce((a, s) => a + s.attendance, 0) / rows.length) : 0;
          return '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:5px"><b>' + esc(p.short) + "</b><span class='mono'>" + avg + "% · " + rows.length + " students</span></div><div class='bar'><i style='width:" + avg + "%'></i></div></div>";
        }).join(""));
    }

    return '<div class="page-head"><h2>Attendance</h2><p>Course-level attendance health across the institution.</p></div>' +
      '<div class="stat-grid">' +
      stat("Average", Math.round(STUDENT_ROSTER.reduce((a, s) => a + s.attendance, 0) / STUDENT_ROSTER.length) + "%") +
      stat("At risk", STUDENT_ROSTER.filter((s) => s.attendance < 75).length, "under 75%") +
      stat("Perfect", STUDENT_ROSTER.filter((s) => s.attendance >= 95).length, "95% or above") +
      stat("Registers", 5, "weekly cycles") +
      "</div>" +
      panel("By course", "", COURSES.map((c) => {
        const rows = STUDENT_ROSTER.filter((s) => s.courses.includes(c.code));
        const avg = rows.length ? Math.round(rows.reduce((a, s) => a + s.attendance, 0) / rows.length) : 0;
        return '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:5px"><b>' + esc(c.code) + " — " + esc(c.title) + "</b><span class='mono'>" + avg + "%</span></div><div class='bar'><i style='width:" + avg + "%'></i></div></div>";
      }).join("")) +
      panel("At-risk students", "", '<div class="table-wrap"><table class="dt"><thead><tr><th>Student</th><th>Programme</th><th>Attendance</th><th>Courses</th></tr></thead><tbody>' +
        STUDENT_ROSTER.filter((s) => s.attendance < 75).map((s) => "<tr><td><b>" + esc(s.name) + "</b></td><td>" + esc(s.programme) + "</td><td><span class='tag r'>" + s.attendance + "%</span></td><td>" + s.courses.join(", ") + "</td></tr>").join("") +
        "</tbody></table></div>", true);
  }

  /* -------------------------------------------------------- announcements */
  function pageAnnouncements() {
    let form = "";
    if (role === "lecturer") {
      const mine = (user.courses || []);
      form = panel("Notify your class", "Only students enrolled in the course — and you — will see it",
        '<form id="classForm" class="form-grid">' +
        '<div class="field"><label>Course</label><select name="course">' + mine.map((c) => '<option value="' + esc(c) + '">' + esc(c) + (courseOf(c) ? " — " + esc(courseOf(c).title) : "") + "</option>").join("") + "</select></div>" +
        '<div class="field"><label>What is happening?</label><select name="kind">' +
        Object.keys(Store.KINDS).map((k) => '<option value="' + k + '">' + esc(Store.KINDS[k].label) + "</option>").join("") + "</select></div>" +
        '<div class="field full"><label>Which session?</label><input name="session" placeholder="e.g. Thu 20 Nov, 10:00 lecture" /></div>' +
        '<div class="field full"><label>Message</label><textarea name="body" rows="3" required placeholder="Tell students what to do instead — e.g. read chapter 4, new date, new room."></textarea></div>' +
        '<div class="full"><button class="auth-submit" type="submit" style="width:auto;padding:11px 22px">Send to class</button></div></form>');
    } else if (role === "admin" || role === "management" || role === "staff") {
      form = panel("Publish an announcement", "Appears in the panels of the selected audience",
        '<form id="annForm" class="form-grid">' +
        '<div class="field full"><label>Title</label><input name="title" required placeholder="Short headline" /></div>' +
        '<div class="field full"><label>Message</label><textarea name="body" rows="3" required placeholder="What changed, and what should people do?"></textarea></div>' +
        '<div class="field"><label>Audience</label><select name="audience"><option value="student">Students</option><option value="lecturer">Lecturers</option><option value="staff">Staff</option><option value="all">Everyone</option></select></div>' +
        '<div class="field"><label>Pin to top</label><select name="pinned"><option value="no">No</option><option value="yes">Yes</option></select></div>' +
        '<div class="full"><button class="auth-submit" type="submit" style="width:auto;padding:11px 22px">Publish</button></div></form>');
    }
    const vis = visibleAnnouncements();
    return '<div class="page-head"><h2>Announcements</h2><p>' +
      (role === "student" ? "Notices from the institution and from your own lecturers. The bell at the top shows anything new." :
       role === "lecturer" ? "Notices addressed to teaching staff, plus the class notices you have sent." : "Notices addressed to your role.") +
      "</p></div>" + form +
      panel("Noticeboard", vis.length + " notices", announceList(vis));
  }

  /* ----------------------------------------------------------- workflows */
  function pageWorkflows() {
    return '<div class="page-head"><h2>Support queue</h2><p>Every raised issue, its owner and its service-level target. Changing a status writes to the audit log.</p></div>' +
      '<div class="stat-grid">' +
      stat("Open", STAFF_TASKS.filter((t) => t.status === "Open").length) +
      stat("In progress", STAFF_TASKS.filter((t) => t.status === "In progress").length) +
      stat("Resolved", STAFF_TASKS.filter((t) => t.status === "Resolved").length) +
      stat("High priority", STAFF_TASKS.filter((t) => t.priority === "High").length) +
      "</div>" +
      panel("All tickets", STAFF_TASKS.length + " records", '<div class="table-wrap"><table class="dt"><thead><tr><th>Ticket</th><th>Category</th><th>Raised by</th><th>Opened</th><th>SLA</th><th>Priority</th><th>Status</th></tr></thead><tbody>' +
        STAFF_TASKS.map((t) => "<tr><td><b>" + esc(t.title) + "</b><br /><span class='mono'>" + esc(t.id) + "</span></td><td>" + esc(t.category) + "</td><td>" + esc(t.raisedBy) + "</td><td class='mono'>" + esc(t.opened) + "</td><td class='mono'>" + esc(t.sla) + "</td><td>" + prioTag(t.priority) + "</td><td>" +
          '<select class="mini-btn" data-status-for="' + esc(t.id) + '">' + ["Open", "In progress", "Resolved"].map((s) => '<option' + (t.status === s ? " selected" : "") + ">" + s + "</option>").join("") + "</select></td></tr>").join("") +
        "</tbody></table></div>", true);
  }

  /* ------------------------------------------------------------- reports */
  function pageReports() {
    const enroll = COURSES.map((c) => ({ code: c.code, n: STUDENT_ROSTER.filter((s) => s.courses.includes(c.code)).length }));
    const max = Math.max.apply(null, enroll.map((e) => e.n).concat([1]));
    const cats = {};
    STAFF_TASKS.forEach((t) => (cats[t.category] = (cats[t.category] || 0) + 1));
    return '<div class="page-head"><h2>Reports</h2><p>Live operational figures derived from the course catalogue, roster and support queue.</p></div>' +
      '<div class="stat-grid">' +
      stat("Enrolments", STUDENT_ROSTER.reduce((a, s) => a + s.courses.length, 0), "course registrations") +
      stat("Avg class size", Math.round(STUDENT_ROSTER.reduce((a, s) => a + s.courses.length, 0) / COURSES.length), "per course") +
      stat("Tickets closed", STAFF_TASKS.filter((t) => t.status === "Resolved").length + "/" + STAFF_TASKS.length) +
      stat("Materials", MATERIALS.length, "published files") +
      "</div>" +
      panel("Enrolment by course", "", enroll.map((e) =>
        '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:5px"><b>' + esc(e.code) + "</b><span class='mono'>" + e.n + " students</span></div><div class='bar'><i style='width:" + Math.round((e.n / max) * 100) + "%'></i></div></div>").join("")) +
      panel("Tickets by category", "", Object.keys(cats).map((k) =>
        '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:5px"><b>' + esc(k) + "</b><span class='mono'>" + cats[k] + "</span></div><div class='bar'><i style='width:" + Math.round((cats[k] / STAFF_TASKS.length) * 100) + "%'></i></div></div>").join(""));
  }

  /* --------------------------------------------------------------- audit */
  function pageAudit() {
    const entries = Auth.auditEntries();
    return '<div class="page-head"><h2>Audit log</h2><p>Administrator-only. Every sign-in, role change, provisioning event and content action is recorded here.</p></div>' +
      panel("Activity trail", entries.length + " entries", '<div class="table-wrap"><table class="dt"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>IP</th></tr></thead><tbody>' +
        entries.map((e) => "<tr><td class='mono'>" + esc(e.at) + "</td><td class='mono'>" + esc(e.actor) + "</td><td><b>" + esc(e.action) + "</b></td><td>" + esc(e.target) + "</td><td class='mono'>" + esc(e.ip) + "</td></tr>").join("") +
        "</tbody></table></div>", true);
  }

  /* ------------------------------------------------------------ settings */
  function pageSettings() {
    const online = typeof AriaAI !== "undefined" && AriaAI.hasKey();
    return '<div class="page-head"><h2>System settings</h2><p>Administrator-only. The Gemini key lives in <span class="mono">assets/js/env.js</span> — it is never typed into the site.</p></div>' +
      panel("Assistant engine", "Applies to every panel", '<div class="form-grid">' +
        '<div class="field full"><label>Engine in use</label><p style="font-size:.9rem;color:var(--text-1)">' +
        (online
          ? '<span class="tag g">Gemini</span> &nbsp;A key is set in env.js. Every assistant thinks with Gemini, in any language, and falls back to the offline engine if a call fails.'
          : '<span class="tag a">Local AI</span> &nbsp;No key in env.js, so the offline engine answers (English, Hindi and Hinglish).') +
        '</p><p class="field-hint">To switch engines, edit <span class="mono">GEMINI_API_KEY</span> in env.js and reload. Leave it empty for Local AI.</p></div>' +
        "</div>") +
      panel("Demo data", "Destructive", '<p style="font-size:.82rem;color:var(--text-2);margin-bottom:12px">Reset every account, role change and audit entry back to the seeded demo state. You will be signed out.</p><button class="mini-btn danger" id="resetDemo" type="button">Reset demo data</button>') +
      panel("Security notice", "", '<p style="font-size:.82rem;color:var(--text-2);line-height:1.7">This build is a front-end demonstration. Accounts, sessions and the audit log are stored in <span class="mono">localStorage</span>, and passwords are protected only by a non-cryptographic digest. Because the site has no backend, a key in env.js is readable by anyone who can open the site — use a restricted key, or move the Gemini call behind a server before a public launch.</p>');
  }

  /* ------------------------------------------------------------ schedule */
  function pageSchedule() {
    const codes = myCodes();
    return '<div class="page-head"><h2>My timetable</h2><p>' +
      (role === "lecturer" ? "Every session you teach this week, with room directions." : "Every session you attend this week, with room directions.") +
      "</p></div>" +
      nextClassCard(codes) +
      panel("Weekly grid", weekHours(codes) + " contact hours", ttGrid(codes)) +
      panel("Session list", slotsFor(codes).length + " sessions", '<div class="table-wrap"><table class="dt"><thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Type</th><th>Room</th><th>Weeks</th></tr></thead><tbody>' +
        slotsFor(codes).map((s) => "<tr><td><b>" + DAY_NAMES[s.day] + "</b></td><td class='mono'>" + fmtTime(s.start) + "–" + fmtTime(s.end) + "</td><td>" + esc(s.course) + " — " + esc(courseOf(s.course) ? courseOf(s.course).title : "") + "</td><td>" + esc(s.type) + "</td><td>" + esc(s.room) + "</td><td class='mono'>" + esc(s.weeks) + "</td></tr>").join("") +
        "</tbody></table></div>", true);
  }

  /* ----------------------------------------------------------- my-courses */
  function pageMyCourses() {
    const codes = myCodes();
    return '<div class="page-head"><h2>' + (role === "lecturer" ? "Courses you teach" : "Your enrolled courses") + "</h2><p>" +
      codes.length + " courses · " + codes.reduce((a, c) => a + (courseOf(c) ? courseOf(c).credits : 0), 0) + " credits total.</p></div>" +
      '<div class="card-grid">' + codes.map((code) => {
        const c = courseOf(code);
        if (!c) return "";
        const mats = MATERIALS.filter((m) => m.course === code).length;
        return '<article class="mini-card"><div class="mc-top"><span class="tag v">' + esc(c.code) + '</span><span class="tag c">' + c.credits + " cr</span></div>" +
          "<h4>" + esc(c.title) + "</h4><p>" + esc(c.description) + "</p>" +
          '<div class="mc-meta"><span>' + esc(c.instructor) + "</span><span>" + esc(c.schedule) + "</span></div>" +
          '<div class="mc-meta"><span class="tag">' + mats + " materials</span><span class='tag g'>" + esc(c.room) + "</span></div></article>";
      }).join("") + "</div>";
  }

  /* ------------------------------------------------------------ students */
  function pageStudents() {
    const codes = myCodes();
    const roster = rosterFor(codes);
    return '<div class="page-head"><h2>My students</h2><p>' + roster.length + " students are enrolled across " + codes.join(", ") + ".</p></div>" +
      '<div class="stat-grid">' +
      stat("Students", roster.length) +
      stat("At risk", roster.filter((s) => s.attendance < 75).length, "below 75%") +
      stat("Average GPA", (roster.reduce((a, s) => a + s.gpa, 0) / (roster.length || 1)).toFixed(1)) +
      stat("Programmes", new Set(roster.map((s) => s.programme)).size) +
      "</div>" +
      panel("Roster", "", '<div class="table-wrap"><table class="dt"><thead><tr><th>Student</th><th>ID</th><th>Programme</th><th>Courses</th><th>Attendance</th><th>GPA</th></tr></thead><tbody>' +
        roster.map((s) => "<tr><td><b>" + esc(s.name) + "</b><br /><span class='mono'>" + esc(s.email) + "</span></td><td class='mono'>" + esc(s.id) + "</td><td>" + esc(s.programme) + "</td><td>" + s.courses.map((c) => '<span class="tag v">' + c + "</span>").join(" ") + "</td><td><span class='tag " + (s.attendance < 75 ? "r" : "g") + "'>" + s.attendance + "%</span></td><td class='mono'>" + s.gpa.toFixed(1) + "</td></tr>").join("") +
        "</tbody></table></div>", true);
  }

  /* ----------------------------------------------------------- facilities */
  function pageFacilities() {
    const rooms = Array.from(new Set(TIMETABLE.map((t) => t.room)));
    return '<div class="page-head"><h2>Facilities & rooms</h2><p>Room readiness across the teaching estate, with the sessions booked into each space.</p></div>' +
      '<div class="card-grid">' + rooms.map((r) => {
        const sessions = TIMETABLE.filter((t) => t.room === r);
        const broken = STAFF_TASKS.find((t) => t.title.includes(r.split("·")[1] ? r.split("·")[1].trim() : "@@") && t.status !== "Resolved");
        return '<article class="mini-card"><div class="mc-top"><span class="tag c">' + esc(r.split("·")[0].trim()) + '</span><span class="tag ' + (broken ? "r" : "g") + '">' + (broken ? "Issue open" : "Ready") + "</span></div>" +
          "<h4>" + esc(r) + "</h4><p>" + sessions.length + " sessions booked this week.</p>" +
          '<div class="mc-meta">' + sessions.map((s) => "<span>" + DAY_SHORT[s.day] + " " + fmtTime(s.start) + "</span>").join("") + "</div></article>";
      }).join("") + "</div>";
  }

  /* --------------------------------------------------------------- grades */
  function pageGrades() {
    const codes = myCodes();
    const st = STUDENT_ROSTER.find((s) => s.email === user.email) || STUDENT_ROSTER[0];
    return '<div class="page-head"><h2>Grades</h2><p>Continuous assessment breakdown for Spring 2025. Final grades are confirmed by the examination board.</p></div>' +
      '<div class="stat-grid">' +
      stat("GPA", st.gpa.toFixed(1), "out of 10") +
      stat("Courses", codes.length) +
      stat("Credits", codes.reduce((a, c) => a + (courseOf(c) ? courseOf(c).credits : 0), 0)) +
      stat("Attendance", st.attendance + "%", st.attendance < 75 ? "at risk" : "good standing") +
      "</div>" +
      panel("Assessment breakdown", "", '<div class="table-wrap"><table class="dt"><thead><tr><th>Course</th><th>Component</th><th>Weight</th><th>Score</th></tr></thead><tbody>' +
        codes.map((code) => {
          const c = courseOf(code);
          if (!c) return "";
          return c.assessment.map((a, i) => {
            const score = Math.min(100, Math.round(st.gpa * 9 + ((code.charCodeAt(3) * (i + 3)) % 11)));
            return "<tr><td><b>" + esc(c.code) + "</b></td><td>" + esc(a.name || a) + "</td><td class='mono'>" + esc(a.weight) + "%</td><td><span class='tag " + (score >= 75 ? "g" : score >= 60 ? "a" : "r") + "'>" + score + "%</span></td></tr>";
          }).join("");
        }).join("") +
        "</tbody></table></div>", true);
  }

  /* ------------------------------------------------------------------ ai */
  function pageAI() {
    return '<div class="page-head"><h2>Ask with AI</h2><p>Aria is grounded in this panel\'s data — your timetable, your courses, the material library and the support queue. It names its sources and refuses when the answer is not in the knowledge base.</p></div>' +
      panel("What Aria can do for you", "Role: " + meta.label,
        '<div class="card-grid">' +
        '<article class="mini-card"><h4>Read your timetable</h4><p>“When is my next class and which room?” — Aria resolves the day, the time and gives walking directions.</p></article>' +
        '<article class="mini-card"><h4>Find a missing file</h4><p>“I do not have the graph traversal slides” — Aria names the lecturer who uploaded it and the course it belongs to.</p></article>' +
        '<article class="mini-card"><h4>Explain a rule</h4><p>“What happens if I miss three classes?” — Aria quotes the attendance rule and the escalation path.</p></article>' +
        '<article class="mini-card"><h4>Route a problem</h4><p>“The projector is broken” — Aria tells you who owns that ticket and what the SLA is.</p></article>' +
        "</div>") +
      '<div style="text-align:center;margin-top:8px"><button class="tb-btn accent" id="openAiPage" type="button">Open the assistant</button></div>';
  }

  function prioTag(p) {
    const cls = p === "High" ? "r" : p === "Medium" ? "a" : "g";
    return '<span class="tag ' + cls + '">' + esc(p) + "</span>";
  }
  function statusTag(s) {
    const cls = s === "Resolved" ? "g" : s === "In progress" ? "c" : "a";
    return '<span class="tag ' + cls + '">' + esc(s) + "</span>";
  }

  /* ------------------------------------------------------------- router */
  const PAGES = {
    overview: pageOverview,
    users: pageUsers,
    courses: pageCourses,
    timetable: pageTimetable,
    materials: pageMaterials,
    attendance: pageAttendance,
    announcements: pageAnnouncements,
    workflows: pageWorkflows,
    reports: pageReports,
    audit: pageAudit,
    settings: pageSettings,
    schedule: pageSchedule,
    "my-courses": pageMyCourses,
    students: pageStudents,
    facilities: pageFacilities,
    grades: pageGrades,
    ai: pageAI
  };

  let active = "overview";
  let renderToken = 0;

  function skeletonHTML() {
    const panelSk = '<section class="panel"><div class="panel-head"><i class="skel" style="width:150px;height:13px"></i></div><div class="panel-body">' +
      '<i class="skel" style="width:92%;height:13px;margin-bottom:12px"></i><i class="skel" style="width:78%;height:13px;margin-bottom:12px"></i><i class="skel" style="width:64%;height:13px"></i></div></section>';
    return '<div class="page-head"><i class="skel" style="width:min(260px,70%);height:28px"></i><i class="skel" style="width:min(460px,90%);height:13px;margin-top:12px"></i></div>' +
      '<div class="stat-grid">' + [1, 2, 3, 4].map(() => '<div class="stat"><i class="skel" style="width:44%;height:26px"></i><i class="skel" style="width:72%;height:10px;margin-top:12px"></i></div>').join("") + "</div>" +
      panelSk + panelSk;
  }

  /* opts.skeleton shows a short loading state (navigation); in-page actions re-render instantly. */
  function render(key, opts) {
    if (!perms.includes(key) && key !== "ai") key = "overview";
    active = key;
    const fn = PAGES[key] || pageOverview;
    const view = $("#view");
    const tok = ++renderToken;

    $("#pageTitle").textContent = NAV_ITEMS[key] ? NAV_ITEMS[key].label : "Dashboard";
    $("#pageSub").textContent = meta.label + " panel · " + user.name;
    $$("[data-nav]").forEach((b) => b.classList.toggle("active", b.dataset.nav === key));

    const paint = () => {
      if (tok !== renderToken) return;
      view.innerHTML = fn();
      view.removeAttribute("aria-busy");
      view.classList.remove("view-in");
      void view.offsetWidth;
      view.classList.add("view-in");
      wirePage();
    };

    if (opts && opts.skeleton) {
      view.setAttribute("aria-busy", "true");
      view.innerHTML = skeletonHTML();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(paint, 420);
    } else {
      paint();
    }
  }

  /* --------------------------------------------------- page interactions */
  function wirePage() {
    const view = $("#view");

    const issueForm = $("#issueForm", view);
    if (issueForm) {
      issueForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(issueForm);
        const courses = Array.from(issueForm.querySelector("[name=courses]").selectedOptions).map((o) => o.value);
        const res = Auth.issueCredentials({
          name: fd.get("name"),
          role: fd.get("role"),
          programme: fd.get("programme"),
          courses
        });
        if (!res.ok) {
          alert(res.error);
          return;
        }
        lastIssued = res.credentials;
        render("users");
      });
    }

    $$("[data-approve]", view).forEach((b) => {
      b.addEventListener("click", () => {
        const res = Auth.approveUser(b.dataset.approve);
        if (!res.ok) alert(res.error);
        render("users");
      });
    });

    $$("[data-del]", view).forEach((b) => {
      b.addEventListener("click", () => {
        if (!confirm("Remove this account? This cannot be undone.")) return;
        const res = Auth.removeUser(b.dataset.del);
        if (!res.ok) alert(res.error);
        render("users");
      });
    });

    $$("[data-role-for]", view).forEach((sel) => {
      sel.addEventListener("change", () => {
        const res = Auth.changeRole(sel.dataset.roleFor, sel.value);
        if (!res.ok) alert(res.error);
        render("users");
      });
    });

    $$("[data-present]", view).forEach((b) => {
      b.addEventListener("click", () => {
        const s = STUDENT_ROSTER.find((x) => x.id === b.dataset.present);
        if (s) s.attendance = Math.min(100, s.attendance + 1);
        render("attendance");
      });
    });

    $$("[data-status-for]", view).forEach((sel) => {
      sel.addEventListener("change", () => {
        const t = STAFF_TASKS.find((x) => x.id === sel.dataset.statusFor);
        if (t) t.status = sel.value;
        Auth.log("Updated ticket", sel.dataset.statusFor + " → " + sel.value);
        render("workflows");
      });
    });

    const matForm = $("#matForm", view);
    if (matForm) {
      matForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(matForm);
        const f = fd.get("file");
        const finish = (fileInfo) => {
          const res = Store.addMaterial(user, {
            title: fd.get("title"), type: fd.get("type"), course: fd.get("course"), week: fd.get("week")
          }, fileInfo);
          if (!res.ok) { UI.toast(res.error, "err", 4800); return; }
          Auth.log("Published material", res.material.id + " — " + fd.get("title"));
          UI.toast("Published “" + res.material.title + "”" + (fileInfo ? " with its file." : "."), "ok");
          render("materials");
        };
        if (f && f.size) {
          if (f.size > Store.MAX_FILE_BYTES) { UI.toast("That file is " + Store.fmtBytes(f.size) + ". The limit is " + Store.fmtBytes(Store.MAX_FILE_BYTES) + ".", "err", 4800); return; }
          const r = new FileReader();
          r.onload = () => finish({ name: f.name, size: f.size, mime: f.type, data: r.result });
          r.onerror = () => UI.toast("That file could not be read.", "err");
          r.readAsDataURL(f);
        } else {
          finish(null);
        }
      });
    }

    $$("[data-dl]", view).forEach((b) => {
      b.addEventListener("click", () => {
        const f = Store.fileFor(b.dataset.dl);
        if (!f) { UI.toast("No file is stored for this material.", "err"); return; }
        const a = document.createElement("a");
        a.href = f.data;
        a.download = f.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    });

    const annForm = $("#annForm", view);
    if (annForm) {
      annForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(annForm);
        const aud = fd.get("audience");
        const res = Store.postAnnouncement(user, {
          title: fd.get("title"),
          body: fd.get("body"),
          audience: aud === "all" ? ["admin", "management", "lecturer", "staff", "student"] : [aud],
          pinned: fd.get("pinned") === "yes"
        });
        if (!res.ok) { UI.toast(res.error, "err"); return; }
        Auth.log("Published announcement", fd.get("title"));
        UI.toast("Announcement published.", "ok");
        bell.refresh();
        render("announcements");
      });
    }

    const classForm = $("#classForm", view);
    if (classForm) {
      classForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(classForm);
        const kind = fd.get("kind");
        const session = String(fd.get("session") || "").trim();
        const res = Store.postAnnouncement(user, {
          course: fd.get("course"),
          kind,
          title: fd.get("course") + " — " + Store.KINDS[kind].label + (session ? " · " + session : ""),
          body: fd.get("body")
        });
        if (!res.ok) { UI.toast(res.error, "err"); return; }
        Auth.log("Class notice", fd.get("course") + " — " + Store.KINDS[kind].label);
        UI.toast("Sent to students of " + fd.get("course") + ". Other lecturers cannot see it.", "ok", 4200);
        bell.refresh();
        render("announcements");
      });
    }

    $$("[data-retract]", view).forEach((b) => {
      b.addEventListener("click", () => {
        if (!confirm("Withdraw this notice? Students will no longer see it.")) return;
        const res = Store.retractAnnouncement(user, b.dataset.retract);
        if (!res.ok) { UI.toast(res.error, "err"); return; }
        UI.toast("Notice withdrawn.", "info");
        bell.refresh();
        render(active);
      });
    });

    const reset = $("#resetDemo", view);
    if (reset) {
      reset.addEventListener("click", () => {
        if (!confirm("Reset all demo data and sign out?")) return;
        Auth.resetDemo();
        window.location.href = "login.html";
      });
    }

    const openBtn = $("#openAiPage", view);
    if (openBtn) openBtn.addEventListener("click", openAI);
  }

  /* ============================== AI AGENT ============================== */

  const aiBody = $("#aiBody");
  const aiSugg = $("#aiSugg");
  const aiInput = $("#aiInput");
  const aiSend = $("#aiSend");

  const SUGGESTIONS = {
    admin: ["How many accounts are there?", "Show the audit trail", "Which tickets are high priority?"],
    management: ["Which students are below 75% attendance?", "Summarise the support queue", "How many lecturers are provisioned?"],
    lecturer: ["When is my next class?", "Where is my Thursday lab?", "Which of my students are at risk?"],
    staff: ["What is the highest priority ticket?", "Which rooms have an open issue?", "What is the SLA for IT tickets?"],
    student: ["When is my next class?", "I do not have the search algorithms slides", "What is the attendance rule?", "Where is my CS-330 lecture?"]
  };

  function openAI() {
    $("#aiDrawer").classList.add("open");
    if (!aiBody.dataset.init) {
      aiBody.dataset.init = "1";
      setSuggestions(SUGGESTIONS[role] || []);

      /* Replay this user's saved conversation, or greet on first visit. */
      chatLog = Auth.chatHistory(user.id);
      if (chatLog.length) {
        chatLog.forEach((m) => aiPush(m.who, m.text, m.meta, true));
      } else {
        aiPush("bot",
          "Hello " + firstName(user.name) + ". I am Aria, running in your " + meta.label + " panel. " +
          "I can see " + (role === "lecturer" || role === "student" ? "your timetable and your " + myCodes().length + " courses" : "the institution-wide timetable, roster and support queue") +
          ". Ask me about a class, a missing file, a rule, or a problem you need routed. You can write in English, Hindi or Hinglish.");
      }
    }
    setTimeout(() => aiInput.focus(), 320);
  }

  function closeAI() {
    $("#aiDrawer").classList.remove("open");
  }

  /* Minimal markdown: **bold**, `code`, line breaks. Everything is escaped first. */
  function mdLite(t) {
    return esc(String(t))
      .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,]|$)/g, "$1<i>$2</i>")
      .replace(/\n/g, "<br>");
  }

  function setSuggestions(list) {
    const items = (list && list.length ? list : SUGGESTIONS[role] || []).slice(0, 4);
    aiSugg.innerHTML = items.map((q) => '<button type="button">' + esc(q) + "</button>").join("");
    $$("button", aiSugg).forEach((b) => b.addEventListener("click", () => aiAsk(b.textContent)));
  }

  function aiPush(who, text, meta2, silent) {
    const el = document.createElement("div");
    el.className = "pmsg " + who;
    let inner = '<div class="bubble">' + mdLite(text) + "</div>";
    if (meta2 && meta2.sources && meta2.sources.length) {
      inner += '<div class="src">' + meta2.sources.map((s) => "<span>" + esc(s) + "</span>").join("") + "</div>";
    }
    if (meta2 && typeof meta2.confidence === "number") {
      inner += '<div class="conf">grounded confidence ' + Math.round(meta2.confidence * 100) + "%</div>";
    }
    el.innerHTML = inner;
    aiBody.appendChild(el);
    aiBody.scrollTop = aiBody.scrollHeight;

    if (!silent) {
      chatLog.push({ who, text, meta: meta2 || null, at: Date.now() });
      Auth.saveChat(user.id, chatLog);
    }
    return el;
  }

  function aiTyping() {
    const el = document.createElement("div");
    el.className = "pmsg bot";
    el.innerHTML = '<div class="bubble typing"><i></i><i></i><i></i></div>';
    aiBody.appendChild(el);
    aiBody.scrollTop = aiBody.scrollHeight;
    return el;
  }

  /* ---- material matching ---- */
  const STOP = new Set("a an the is are was were do does did i my me you your we our it its of to in on at for with and or but if then this that these those have has had not no dont don't cant can't what which who when where why how please help need want there here about from get got give show find tell".split(/\s+/));

  function tokens(s) {
    return String(s)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP.has(t));
  }

  function matchMaterial(q) {
    const qt = tokens(q);
    if (!qt.length) return null;
    let best = null;
    let bestScore = 0;
    MATERIALS.forEach((m) => {
      const hay = tokens(m.title + " " + m.tags.join(" ") + " " + m.course + " " + m.type);
      let score = 0;
      qt.forEach((t) => {
        if (hay.includes(t)) score += 1;
        else if (hay.some((h) => h.indexOf(t) === 0 || t.indexOf(h) === 0)) score += 0.6;
      });
      if (score > bestScore) {
        bestScore = score;
        best = m;
      }
    });
    return bestScore >= 1.2 ? best : null;
  }

  /* ---------------------------------------------------------------------
     Routing runs on an English rendering of the question (AriaAI.toEnglish
     turns Hindi / Hinglish into English keywords), so one set of patterns
     serves every language. Replies are written in the user's language.
     --------------------------------------------------------------------- */
  const MISSING_RE = /(don'?t have|do not have|didn'?t get|did not get|not get|missing|not uploaded|can'?t find|cannot find|not showing|not there|where (is|are|can i find)|need (the|a|an)?|looking for|i lost|not (have|received?)|show (me )?(the )?(file|slides|notes))/i;
  const ANN_RE = /(announce|noticeboard|notice board|\bnotices?\b|any news|(class|lecture|lab|tutorial).*(cancel|not happening|reschedul|called off)|(cancel|reschedul).*(class|lecture|lab|tutorial))/i;
  const POLICY_RE = /\b(rules?|polic\w+|attendance|penalt\w+|extension|appeal|plagiar\w*|exam|late|marks|grade|assessment|credits?|syllabus|prerequisites?)\b/i;
  const TT_WORDS = /\b(class(es)?|lectures?|labs?|timetable|schedule|sessions?|tutorials?)\b/i;
  const TT_ASK = /\b(today|tomorrow|next|which|what|when|where|my|how many|list|show|tell|monday|tuesday|wednesday|thursday|friday|saturday|sunday|room)\b/i;
  const DAY_WORDS = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const DAY_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
  const TYPE_HI = { Lecture: "लेक्चर", Lab: "लैब", Tutorial: "ट्यूटोरियल" };

  const L3 = (lang, en, hi, hl) => (lang === "hi" ? hi : lang === "hinglish" ? hl : en);
  const dayLabel = (idx, lang) => (lang === "hi" ? DAY_HI[idx] : DAY_NAMES[idx]);
  /* "Today / Tomorrow / Thursday" in the user's language. */
  function whenLabel(n, lang) {
    if (lang === "hi") return n.rel === 0 ? "आज" : n.rel === 1 ? "कल" : DAY_HI[n.day];
    if (lang === "hinglish") return n.rel === 0 ? "Aaj" : n.rel === 1 ? "Kal" : DAY_NAMES[n.day];
    return n.when;
  }

  function isTimetableQuestion(qe) {
    return TT_WORDS.test(qe) && TT_ASK.test(qe) && !POLICY_RE.test(qe);
  }

  function targetDay(qe) {
    const s = qe.toLowerCase();
    if (/\bday after tomorrow\b/.test(s)) return { idx: (TODAY + 2) % 7, rel: "dat" };
    if (/\btomorrow\b/.test(s)) return { idx: (TODAY + 1) % 7, rel: "tomorrow" };
    if (/\btoday\b/.test(s)) return { idx: TODAY, rel: "today" };
    for (const k in DAY_WORDS) if (new RegExp("\\b" + k + "\\b").test(s)) return { idx: DAY_WORDS[k], rel: "day" };
    return null;
  }

  function resourceReply(m, lang) {
    const c = courseOf(m.course);
    return {
      text: L3(lang,
        "That file is **" + m.title + "** (" + m.type + ", " + m.size + ").\n\n" +
        "It belongs to **" + c.code + " — " + c.title + "**, and it was uploaded by **" + m.uploadedBy + "** in week " + m.week + ".\n\n" +
        "Open Course Materials and filter to " + c.code + " — it is listed as " + m.id + ". If it still does not appear for you, email " +
        m.uploadedBy + " at " + c.email + " and quote " + m.id + " so they can check the release settings.",
        "वह फ़ाइल **" + m.title + "** (" + m.type + ", " + m.size + ") है।\n\n" +
        "यह **" + c.code + " — " + c.title + "** की है और **" + m.uploadedBy + "** ने week " + m.week + " में अपलोड की थी।\n\n" +
        "Course Materials खोलकर " + c.code + " फ़िल्टर करें — यह " + m.id + " के नाम से दिखेगी। फिर भी न दिखे तो " +
        m.uploadedBy + " को " + c.email + " पर ईमेल करें और " + m.id + " लिख दें, ताकि वे release settings देख सकें।",
        "Woh file **" + m.title + "** (" + m.type + ", " + m.size + ") hai.\n\n" +
        "Yeh **" + c.code + " — " + c.title + "** ki hai aur **" + m.uploadedBy + "** ne week " + m.week + " mein upload ki thi.\n\n" +
        "Course Materials kholkar " + c.code + " filter karein — yeh " + m.id + " ke naam se dikhegi. Phir bhi na dikhe toh " +
        m.uploadedBy + " ko " + c.email + " par email karein aur " + m.id + " likh dein."),
      sources: [m.id, c.code],
      confidence: 0.94
    };
  }

  function noSessions(lang) {
    return {
      text: L3(lang,
        "I cannot see any scheduled sessions on your account. If that looks wrong, ask the Academic Office to check your course registration.",
        "आपके अकाउंट में मुझे कोई निर्धारित क्लास नहीं दिख रही। अगर यह गलत लगे तो Academic Office से कोर्स रजिस्ट्रेशन चेक करवाएँ।",
        "Aapke account mein mujhe koi scheduled class nahi dikh rahi. Agar yeh galat lage toh Academic Office se course registration check karwayein."),
      sources: [],
      confidence: 0.4
    };
  }

  function sessionLine(s, lang) {
    const c = courseOf(s.course) || { title: s.course };
    return "• " + fmtTime(s.start) + "–" + fmtTime(s.end) + " — **" + s.course + " " + c.title + "** · " +
      L3(lang, "Room", "कमरा", "Room") + ": " + s.room + " · " + (lang === "hi" ? (TYPE_HI[s.type] || s.type) : s.type);
  }

  /* "Which classes do I have today / tomorrow / on Thursday?" */
  function dayReply(target, lang) {
    const codes = myCodes();
    const list = slotsFor(codes).filter((s) => s.day === target.idx);
    const name = dayLabel(target.idx, lang);
    const label = target.rel === "today" ? L3(lang, "Today", "आज", "Aaj") + " (" + name + ")"
      : target.rel === "tomorrow" ? L3(lang, "Tomorrow", "कल", "Kal") + " (" + name + ")"
      : name;

    if (!list.length) {
      const n = nextSlot(codes);
      const tail = n
        ? L3(lang,
            "\n\nYour next class is **" + n.course + "** on " + n.when + " at " + fmtTime(n.start) + " in " + n.room + ".",
            "\n\nआपकी अगली क्लास **" + n.course + "** है — " + whenLabel(n, lang) + " " + fmtTime(n.start) + ", कमरा: " + n.room + "।",
            "\n\nAapki agli class **" + n.course + "** hai — " + whenLabel(n, lang) + " " + fmtTime(n.start) + ", Room: " + n.room + ".")
        : "";
      return {
        text: L3(lang, "You have no classes on **" + label + "**.", "**" + label + "** आपकी कोई क्लास नहीं है।", "**" + label + "** ko aapki koi class nahi hai.") + tail,
        sources: ["timetable"],
        confidence: 0.9
      };
    }

    const past = target.rel === "today" ? list.filter((s) => toMin(s.end) <= NOW_MIN).length : 0;
    const note = past
      ? L3(lang, "\n\n" + past + " of these already finished.", "\n\nइनमें से " + past + " क्लास हो चुकी हैं।", "\n\nInmein se " + past + " class ho chuki hain.")
      : "";
    return {
      text: L3(lang,
        "**" + label + "** you have **" + list.length + (list.length === 1 ? " class" : " classes") + "**:\n" + list.map((s) => sessionLine(s, lang)).join("\n"),
        "**" + label + "** आपकी **" + list.length + " क्लास** " + (list.length === 1 ? "है" : "हैं") + ":\n" + list.map((s) => sessionLine(s, lang)).join("\n"),
        "**" + label + "** aapki **" + list.length + " class** " + (list.length === 1 ? "hai" : "hain") + ":\n" + list.map((s) => sessionLine(s, lang)).join("\n")) + note,
      sources: list.map((s) => s.id || s.course),
      confidence: 0.93
    };
  }

  /* "Which class is on right now?" — current session, or the next one with its start time. */
  function nowReply(lang) {
    const codes = myCodes();
    const today = slotsFor(codes).filter((s) => s.day === TODAY).sort((a, b) => toMin(a.start) - toMin(b.start));
    const cur = today.find((s) => toMin(s.start) <= NOW_MIN && NOW_MIN < toMin(s.end));
    if (cur) {
      const c = courseOf(cur.course) || { title: "" };
      const left = toMin(cur.end) - NOW_MIN;
      return {
        text: L3(lang,
          "Right now **" + cur.course + " — " + c.title + "** is live (" + fmtTime(cur.start) + "–" + fmtTime(cur.end) + ").\n\n• Where: " + cur.room + "\n• Type: " + cur.type + "\n• Ends in " + left + " min.",
          "अभी **" + cur.course + " — " + c.title + "** की क्लास चल रही है (" + fmtTime(cur.start) + "–" + fmtTime(cur.end) + ")।\n\n• कहाँ: " + cur.room + "\n• प्रकार: " + (TYPE_HI[cur.type] || cur.type) + "\n• " + left + " मिनट में खत्म होगी।",
          "Abhi **" + cur.course + " — " + c.title + "** ki class live hai (" + fmtTime(cur.start) + "–" + fmtTime(cur.end) + ").\n\n• Kahan: " + cur.room + "\n• Type: " + cur.type + "\n• " + left + " minute mein khatam hogi."),
        sources: [cur.course, "timetable"], confidence: 0.95
      };
    }
    const later = today.find((s) => toMin(s.start) > NOW_MIN);
    if (later) {
      const c = courseOf(later.course) || { title: "" };
      const inMin = toMin(later.start) - NOW_MIN;
      return {
        text: L3(lang,
          "No class is running right now. Next today: **" + later.course + " — " + c.title + "** goes live at **" + fmtTime(later.start) + "** (in " + inMin + " min), " + later.room + ".",
          "अभी कोई क्लास नहीं चल रही। आज की अगली क्लास **" + later.course + " — " + c.title + "** **" + fmtTime(later.start) + "** पर लाइव होगी (" + inMin + " मिनट बाद), कमरा: " + later.room + "।",
          "Abhi koi class nahi chal rahi. Aaj ki agli class **" + later.course + " — " + c.title + "** **" + fmtTime(later.start) + "** par live hogi (" + inMin + " minute baad), Room: " + later.room + "."),
        sources: [later.course, "timetable"], confidence: 0.93
      };
    }
    const n = nextSlot(codes);
    if (!n) return noSessions(lang);
    const c = courseOf(n.course) || { title: "" };
    return {
      text: L3(lang,
        "No more classes today. Your next class is **" + n.course + " — " + c.title + "**, " + n.when + " at **" + fmtTime(n.start) + "** in " + n.room + ".",
        "आज अब कोई क्लास नहीं है। अगली क्लास **" + n.course + " — " + c.title + "** है — " + whenLabel(n, "hi") + " **" + fmtTime(n.start) + "** पर, कमरा: " + n.room + "।",
        "Aaj ab koi class nahi hai. Agli class **" + n.course + " — " + c.title + "** hai — " + whenLabel(n, "hinglish") + " **" + fmtTime(n.start) + "** par, Room: " + n.room + "."),
      sources: [n.course, "timetable"], confidence: 0.92
    };
  }

  function timetableReply(q, qe, lang) {
    const codes = myCodes();
    const slots = slotsFor(codes);
    const n = nextSlot(codes);
    if (!n) return noSessions(lang);
    if (/\b(now|current|currently|ongoing|running|live|right now)\b/i.test(qe) && !/\bnext\b/i.test(qe) && !targetDay(qe)) return nowReply(lang);

    if (/how many/i.test(qe)) {
      const byDay = [1, 2, 3, 4, 5].map((d) => DAY_SHORT[d] + ": " + slots.filter((s) => s.day === d).length).join(", ");
      return {
        text: L3(lang,
          "You have **" + slots.length + " sessions** this week, totalling " + weekHours(codes) + " contact hours.\n\nBreakdown — " + byDay + ".\n\nYour next one is " + n.course + " on " + n.when + " at " + fmtTime(n.start) + " in " + n.room + ".",
          "इस हफ़्ते आपके **" + slots.length + " सेशन** हैं, कुल " + weekHours(codes) + " घंटे।\n\nदिनवार — " + byDay + "।\n\nअगली क्लास " + n.course + " है — " + whenLabel(n, "hi") + " " + fmtTime(n.start) + ", कमरा: " + n.room + "।",
          "Is hafte aapke **" + slots.length + " sessions** hain, kul " + weekHours(codes) + " ghante.\n\nDin-wise — " + byDay + ".\n\nAgli class " + n.course + " hai — " + whenLabel(n, "hinglish") + " " + fmtTime(n.start) + ", Room: " + n.room + "."),
        sources: ["timetable"],
        confidence: 0.9
      };
    }

    const target = targetDay(qe);
    if (target) return dayReply(target, lang);
    /* "my classes", "which classes" with no day and no "next": show today. */
    if (!/\bnext\b/i.test(qe) && /\b(classes|timetable|schedule|list|show)\b/i.test(qe)) return dayReply({ idx: TODAY, rel: "today" }, lang);

    const c = courseOf(n.course);
    return {
      text: L3(lang,
        "Your next class is **" + n.course + " — " + c.title + "**.\n\n" +
        "• When: " + n.when + ", " + fmtTime(n.start) + "–" + fmtTime(n.end) + "\n" +
        "• Where: " + n.room + "\n" +
        "• Type: " + n.type + " · taught by " + c.instructor + "\n\n" +
        "How to get there: " + directions(n.room) + "\n\n" +
        "Bring " + (n.type === "Lab" ? "your laptop, lab notebook and student card for door access." : "a notebook, the week's reading and your student card."),
        "आपकी अगली क्लास **" + n.course + " — " + c.title + "** है।\n\n" +
        "• कब: " + whenLabel(n, "hi") + ", " + fmtTime(n.start) + "–" + fmtTime(n.end) + "\n" +
        "• कहाँ: " + n.room + "\n" +
        "• प्रकार: " + (TYPE_HI[n.type] || n.type) + " · शिक्षक: " + c.instructor + "\n\n" +
        "कैसे पहुँचें: " + directions(n.room) + "\n\n" +
        (n.type === "Lab" ? "लैपटॉप, लैब नोटबुक और स्टूडेंट कार्ड साथ रखें।" : "नोटबुक, इस हफ़्ते की रीडिंग और स्टूडेंट कार्ड साथ रखें।"),
        "Aapki agli class **" + n.course + " — " + c.title + "** hai.\n\n" +
        "• Kab: " + whenLabel(n, lang) + ", " + fmtTime(n.start) + "–" + fmtTime(n.end) + "\n" +
        "• Kahan: " + n.room + "\n" +
        "• Type: " + n.type + " · Teacher: " + c.instructor + "\n\n" +
        "Kaise pahunchein: " + directions(n.room) + "\n\n" +
        (n.type === "Lab" ? "Laptop, lab notebook aur student card saath rakhein." : "Notebook, is hafte ki reading aur student card saath rakhein.")),
      sources: [n.course, n.id].filter(Boolean),
      confidence: 0.93
    };
  }

  function announcementReply(lang) {
    const list = Store.visibleTo(user).slice(0, 4);
    if (!list.length) {
      return { text: L3(lang, "There are no announcements for you right now.", "अभी आपके लिए कोई घोषणा नहीं है।", "Abhi aapke liye koi announcement nahi hai."), sources: [], confidence: 0.9 };
    }
    return {
      text: L3(lang, "Latest announcements for you:", "आपके लिए ताज़ा घोषणाएँ:", "Aapke liye latest announcements:") + "\n" +
        list.map((a) => "\u2022 " + a.title + " (" + a.author + ", " + a.date + ")\n  " + a.body).join("\n"),
      sources: list.map((a) => a.id),
      confidence: 0.92
    };
  }

  /* Everything Gemini needs to answer panel questions in any language. */
  function panelContext() {
    const codes = myCodes();
    const n = nextSlot(codes);
    const week = slotsFor(codes).map((s) => {
      const c = courseOf(s.course) || {};
      return DAY_NAMES[s.day] + " " + s.start + "-" + s.end + " | " + s.course + " " + (c.title || "") + " | " + s.type + " | " + s.room + " | " + (c.instructor || "");
    });
    const files = materialsFor(codes).map((m) => m.id + " | " + m.course + " | " + m.title + " | " + m.type + " | uploaded by " + m.uploadedBy + " | week " + m.week);
    const notices = Store.visibleTo(user).slice(0, 6).map((a) => a.title + " (" + a.date + "): " + a.body);
    return [
      "Today is " + DAY_NAMES[TODAY] + ", local time " + String(NOW.getHours()).padStart(2, "0") + ":" + String(NOW.getMinutes()).padStart(2, "0") + ".",
      "Role: " + meta.label + " | User: " + user.name + " | Courses in scope: " + (codes.join(", ") || "none"),
      n ? "Next session: " + n.course + " " + n.when + " " + fmtTime(n.start) + " in " + n.room : "No upcoming session.",
      "WEEKLY TIMETABLE (day time | course | type | room | lecturer):\n" + (week.join("\n") || "none"),
      "COURSE FILES (id | course | title | type | uploader | week):\n" + (files.join("\n") || "none"),
      "ANNOUNCEMENTS VISIBLE TO THIS USER:\n" + (notices.join("\n") || "none"),
      "Questions about 'today', 'tomorrow' or a weekday must be answered from the timetable above. For a missing file, name the file, course, lecturer and file id."
    ].join("\n");
  }

  /* Follow-up questions Aria builds herself after a schedule / file / notice answer. */
  function contextFollowUps(kind, lang) {
    const sets = {
      tt: [
        L3(lang, "Which classes do I have tomorrow?", "कल मेरी कौन सी क्लासेस हैं?", "Kal meri kaun si classes hain?"),
        L3(lang, "How many classes do I have this week?", "इस हफ़्ते मेरी कितनी क्लास हैं?", "Is hafte meri kitni classes hain?"),
        L3(lang, "Are there any announcements for me?", "क्या मेरे लिए कोई घोषणा है?", "Kya mere liye koi announcement hai?")
      ],
      file: [
        L3(lang, "When is my next class?", "मेरी अगली क्लास कब है?", "Meri agli class kab hai?"),
        L3(lang, "What is the attendance rule?", "उपस्थिति का नियम क्या है?", "Attendance ka rule kya hai?")
      ],
      ann: [
        L3(lang, "When is my next class?", "मेरी अगली क्लास कब है?", "Meri agli class kab hai?"),
        L3(lang, "Which classes do I have today?", "आज मेरी कौन सी क्लासेस हैं?", "Aaj meri kaun si classes hain?")
      ]
    };
    const rnd = typeof Assistant !== "undefined" ? Assistant.starterQuestions(1, lang === "hinglish" ? "hinglish" : lang) : [];
    return (sets[kind] || []).concat(rnd).slice(0, 4);
  }

  /* Offline reasoning: routes the question to the right data, in the user's language. */
  async function offlineReply(q, lang) {
    const qe = AriaAI.toEnglish(q);
    const m = matchMaterial(qe);
    if (m && MISSING_RE.test(qe)) return Object.assign(resourceReply(m, lang), { followUps: contextFollowUps("file", lang) });
    if (ANN_RE.test(qe)) return Object.assign(announcementReply(lang), { followUps: contextFollowUps("ann", lang) });
    if (isTimetableQuestion(qe)) return Object.assign(timetableReply(q, qe, lang), { followUps: contextFollowUps("tt", lang) });

    if (typeof Assistant === "undefined") {
      return { text: "The local engine is not loaded on this page.", sources: [], confidence: 0 };
    }
    const res = await Assistant.local.answer(q);
    const srcs = (res.sources || []).map((id) => {
      const doc = typeof KB !== "undefined" ? KB.find((k) => k.id === id) : null;
      return doc ? doc.title : id;
    });
    return { text: res.text, sources: srcs, confidence: res.confidence, followUps: res.followUps };
  }

  async function aiAsk(question) {
    const q = String(question || "").trim();
    if (!q || aiSend.disabled) return;
    aiPush("user", q);
    aiInput.value = "";
    aiSend.disabled = true;
    const typing = aiTyping();
    const lang = AriaAI.detectLang(q);

    await new Promise((r) => setTimeout(r, 300));

    let reply = null;
    try {
      /* With a Gemini key the model reasons over the panel's real data in any
         language. If it fails, the offline router below answers instead. */
      if (typeof Assistant !== "undefined" && Assistant.online()) {
        const res = await Assistant.ask(q, panelContext());
        if (res.engine === "gemini") {
          reply = { text: res.text, sources: res.sources, confidence: res.confidence, followUps: res.followUps };
        }
      }
      if (!reply) reply = await offlineReply(q, lang);
    } catch (err) {
      reply = { text: L3(lang,
        "I could not reach the reasoning engine. Try rephrasing, or ask a human contact.",
        "मैं अभी जवाब नहीं दे पाई। कृपया दोबारा पूछें, या किसी से सीधे संपर्क करें।",
        "Main abhi jawab nahi de payi. Kripya dobara poochiye, ya kisi se seedha sampark karein."), sources: [], confidence: 0 };
    }

    /* Add a role-specific next step when confidence is low. */
    if (reply.confidence < 0.45) {
      const owner = role === "student" ? "your lecturer or the Academic Office" : role === "lecturer" ? "the Academic Office" : "the Administrator";
      const ownerHi = role === "student" ? "अपने शिक्षक या Academic Office" : role === "lecturer" ? "Academic Office" : "Administrator";
      reply.text += "\n\n" + L3(lang,
        "I am not confident enough to answer that from my knowledge base. The right next step is to contact " + owner + ".",
        "इसका जवाब मैं अपने knowledge base से पक्का नहीं दे सकती। सही अगला कदम है " + ownerHi + " से संपर्क करना।",
        "Iska jawab main apne knowledge base se pakka nahi de sakti. Sahi agla kadam hai " + ownerHi + " se sampark karna.");
    }

    typing.remove();
    aiPush("bot", reply.text, reply);
    setSuggestions(reply.followUps && reply.followUps.length ? reply.followUps : null);
    aiSend.disabled = false;
    aiInput.focus();
  }

  aiSend.addEventListener("click", () => aiAsk(aiInput.value));
  aiInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      aiAsk(aiInput.value);
    }
  });
  $("#aiFab").addEventListener("click", openAI);
  $("#aiClose").addEventListener("click", closeAI);
  $("#aiReset").addEventListener("click", () => {
    if (!confirm("Start a new conversation? Your saved history for this panel will be cleared.")) return;
    Auth.clearChat(user.id);
    chatLog = [];
    aiBody.innerHTML = "";
    aiBody.dataset.init = "";
    openAI();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAI();
  });

  /* ----------------------------------------------------------------- boot */
  $("#sideRoleName").textContent = meta.label + " panel";
  $("#sideRoleTier").textContent = meta.tier;
  $("#userName").textContent = user.name;
  $("#userEmail").textContent = user.email;
  $("#userAvatar").innerHTML = user.avatar
    ? '<img src="' + esc(user.avatar) + '" alt="" />'
    : esc(Auth.initials(user.name));
  const badge = $("#roleBadge");
  badge.textContent = meta.label;
  badge.className = "badge-role " + role;
  $("#aiScope").textContent = meta.label + " scope · " + myCodes().length + " courses in view";

  $("#logoutBtn").addEventListener("click", () => {
    Auth.logout();
    window.location.href = "login.html";
  });

  $("#sideToggle").addEventListener("click", () => $("#side").classList.toggle("open"));

  /* ------------------------------------------------------------ profile */
  const pfSheet = $("#profileSheet");
  const pfAvatar = $("#pfAvatar");
  const avatarInput = $("#avatarInput");
  let pendingAvatar = null;

  function paintPfAvatar(u) {
    pfAvatar.innerHTML = u.avatar ? '<img src="' + esc(u.avatar) + '" alt="" />' : esc(Auth.initials(u.name));
  }

  function openProfile() {
    const me = Auth.currentUser();
    pendingAvatar = null;
    $("#pfName").value = me.name;
    $("#pfEmail").textContent = me.email;
    $("#pfRole").textContent = ROLE_META[me.role].label;
    $("#pfSince").textContent = me.createdAt || "—";
    $("#pfAlert").className = "alert";
    paintPfAvatar(me);
    pfSheet.classList.add("open");
  }

  function closeProfile() {
    pfSheet.classList.remove("open");
  }

  $("#profileBtn").addEventListener("click", openProfile);
  $("#pfCancel").addEventListener("click", closeProfile);
  pfSheet.addEventListener("click", (e) => {
    if (e.target === pfSheet) closeProfile();
  });

  $("#pfUpload").addEventListener("click", () => avatarInput.click());
  $("#pfRemove").addEventListener("click", () => {
    pendingAvatar = "";
    paintPfAvatar({ name: $("#pfName").value || user.name, avatar: null });
  });

  /* Downscale to 256px square so the stored data URL stays small. */
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files && avatarInput.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      $("#pfAlert").className = "alert show";
      $("#pfAlert").textContent = "Pick an image file (JPG, PNG or WebP).";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const S = 256;
        const c = document.createElement("canvas");
        c.width = S;
        c.height = S;
        const ctx = c.getContext("2d");
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, S, S);
        pendingAvatar = c.toDataURL("image/jpeg", 0.82);
        paintPfAvatar({ name: $("#pfName").value || user.name, avatar: pendingAvatar });
        $("#pfAlert").className = "alert";
      };
      img.onerror = () => {
        $("#pfAlert").className = "alert show";
        $("#pfAlert").textContent = "That image could not be read.";
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    avatarInput.value = "";
  });

  $("#pfSave").addEventListener("click", () => {
    const patch = { name: $("#pfName").value.trim() };
    if (pendingAvatar !== null) patch.avatar = pendingAvatar;

    const res = Auth.updateProfile(user.id, patch);
    if (!res.ok) {
      $("#pfAlert").className = "alert show";
      $("#pfAlert").textContent = res.error;
      return;
    }
    user.name = res.user.name;
    user.avatar = res.user.avatar;
    $("#userName").textContent = user.name;
    $("#userAvatar").innerHTML = user.avatar
      ? '<img src="' + esc(user.avatar) + '" alt="" />'
      : esc(Auth.initials(user.name));
    closeProfile();
    render(active);
  });

  buildNav();

  const bell = UI.mountBell($("#bellMount"), user, {
    viewAllLabel: perms.includes("announcements") ? "Open noticeboard" : "Go to overview",
    onViewAll: () => render(perms.includes("announcements") ? "announcements" : "overview", { skeleton: true })
  });

  render("overview", { skeleton: true });

  /* Expose a small surface for debugging / verification. */
  window.__AriaPortal = { render, aiAsk, user, role };
})();
