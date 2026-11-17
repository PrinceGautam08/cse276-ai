/* ==========================================================================
   Aria — Authentication, Role Issuing & Session
   --------------------------------------------------------------------------
   NOTE ON SECURITY: this is a front-end demonstration build. Accounts,
   passwords and sessions live in localStorage. There is no server, no
   transport security and no password hashing beyond a non-cryptographic
   digest used to make the demo credentials look realistic. Do not reuse a
   real password here.

   ADMIN ACCOUNT
   -------------
   The administrator account is created by the application itself, not read
   from any environment file. It is seeded on first run and marked
   `builtIn: true`, which makes it impossible to delete or demote from the
   UI. Its credentials are never rendered anywhere on the public login page.
   ========================================================================== */

const Auth = (() => {
  const USERS_KEY = "aria_users_v1";
  const SESSION_KEY = "aria_session_v1";
  const LOG_KEY = "aria_portal_log_v1";
  const CHAT_KEY = "aria_chat_v1";

  /* Built-in administrator — created by the app, never from env. */
  const BUILT_IN_ADMIN = {
    id: "U-ADM-01",
    name: "Dr. Helena Ward",
    email: "admin@northfield.edu",
    password: "Admin@2025",
    role: "admin",
    programme: null,
    courses: [],
    title: "Registrar & System Owner",
    department: "Administration",
    createdAt: "2024-08-01",
    builtIn: true
  };

  /* ---------------------------------------------------------------- digest */
  function digest(str) {
    let h = 5381;
    const s = "aria::" + str;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    let h2 = 52711;
    for (let i = s.length - 1; i >= 0; i--) h2 = ((h2 << 5) + h2 + s.charCodeAt(i) * (i + 7)) >>> 0;
    return (h.toString(36) + h2.toString(36)).slice(0, 10);
  }

  function hashPassword(pw) {
    return digest("pw:" + pw);
  }

  /* ------------------------------------------------------------- utilities */
  function slugName(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/\b(dr|prof|mr|ms|mrs|professor|doctor)\.?\s+/g, "")
      .replace(/[^a-z\s]/g, "")
      .trim()
      .replace(/\s+/g, ".");
  }

  function titleCase(s) {
    return String(s || "").replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
  }

  function initials(name) {
    const parts = String(name || "")
      .replace(/\b(dr|prof|mr|ms|mrs)\.?\s+/gi, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "?";
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  }

  function readUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function writeUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  /* ------------------------------------------------------------ seed users */
  function seedUsers() {
    const base = [
      BUILT_IN_ADMIN,
      {
        id: "U-MGT-01",
        name: "Marcus Bell",
        email: "management@northfield.edu",
        password: "Manage@2025",
        role: "management",
        programme: null,
        courses: [],
        title: "Academic Operations Manager",
        department: "Academic Office",
        createdAt: "2024-08-01",
        builtIn: true
      },
      {
        id: "U-STF-01",
        name: "Nadia Osei",
        email: "staff@northfield.edu",
        password: "Staff@2025",
        role: "staff",
        programme: null,
        courses: [],
        title: "Facilities & IT Coordinator",
        department: "Campus Operations",
        createdAt: "2024-08-12"
      },
      {
        id: "U-STU-01",
        name: "Ananya Sharma",
        email: "student@northfield.edu",
        password: "Student@2025",
        role: "student",
        programme: "BTECH-CSE",
        courses: ["CS-301", "CS-330", "MATH-204"],
        title: "Year 3 · B.Tech CSE",
        department: "Computer Science & Engineering",
        studentId: "STU-1001",
        createdAt: "2023-07-28"
      }
    ];

    const lecturers = COURSES.map((c, i) => {
      const prog = PROGRAMMES["BTECH-CSE"];
      return {
        id: "U-LEC-0" + (i + 1),
        name: c.instructor,
        email: slugName(c.instructor) + "@" + prog.emailDomain,
        password: "Lecturer@2025",
        role: "lecturer",
        programme: "BTECH-CSE",
        courses: [c.code],
        title: "Lecturer · " + c.code,
        department: prog.department,
        createdAt: "2024-08-05",
        provisioned: true
      };
    });

    const users = base.concat(lecturers).map((u) => {
      const copy = Object.assign({}, u);
      copy.passwordHash = hashPassword(copy.password);
      delete copy.password;
      return copy;
    });

    writeUsers(users);
    return users;
  }

  function ensureSeed() {
    const existing = readUsers();
    if (!existing) return seedUsers();

    /* Guarantee the built-in admin survives a partial reset. */
    if (!existing.some((u) => u.role === "admin")) {
      const restored = Object.assign({}, BUILT_IN_ADMIN);
      restored.passwordHash = hashPassword(restored.password);
      delete restored.password;
      existing.unshift(restored);
      writeUsers(existing);
    }
    return existing;
  }

  /* -------------------------------------------------------------- accounts */
  function allUsers() {
    return ensureSeed();
  }

  function findByEmail(email) {
    const e = String(email || "").trim().toLowerCase();
    return allUsers().find((u) => u.email.toLowerCase() === e) || null;
  }

  function publicUser(u) {
    if (!u) return null;
    const copy = Object.assign({}, u);
    delete copy.passwordHash;
    delete copy.password;
    copy.initials = initials(copy.name);
    return copy;
  }

  /* ------------------------------------------------------ credential issue */
  /**
   * Issue a login for any role. Used by admin and management to grant
   * lecturer / staff / student access. The email and password are generated
   * from the person's identity and role, then shown once.
   */
  function issueCredentials(input) {
    const name = String(input.name || "").trim();
    const role = String(input.role || "").trim();
    const programmeCode = String(input.programme || "").trim();

    if (name.length < 3) return { ok: false, error: "Enter the person's full name (at least 3 characters)." };
    if (!PERMISSIONS[role]) return { ok: false, error: "Choose a valid role." };
    if (role === "admin") return { ok: false, error: "Administrator access cannot be issued from this panel." };

    const users = allUsers();
    const local = slugName(name);
    if (!local) return { ok: false, error: "That name cannot be turned into an email address." };

    const programme = PROGRAMMES[programmeCode] || null;
    const domain = (programme && programme.emailDomain) || "northfield.edu";

    let email = local + "@" + domain;
    let n = 2;
    while (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      email = local + "." + n + "@" + domain;
      n++;
    }

    let courses = [];
    if (role === "lecturer") {
      courses = (input.courses || []).filter((c) => COURSES.some((x) => x.code === c));
      if (!courses.length && programme) courses = programme.coreCourses.slice();
      if (!courses.length) return { ok: false, error: "Select at least one course for this lecturer." };
    }
    if (role === "student") {
      courses = (input.courses || []).filter((c) => COURSES.some((x) => x.code === c));
      if (!courses.length && programme) courses = programme.coreCourses.slice();
    }

    const seed = email + "|" + role + "|" + (programmeCode || "-") + "|" + courses.slice().sort().join(",");
    const d = digest(seed);
    const password = "Aria-" + d.slice(0, 4).toUpperCase() + "-" + d.slice(4, 8);

    const user = {
      id: "U-" + String(Date.now()).slice(-6),
      name: titleCase(name),
      email,
      role,
      programme: programmeCode || null,
      courses,
      title: ROLE_META[role].label + (programme ? " · " + programme.short : ""),
      department: (programme && programme.department) || "—",
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString().slice(0, 10),
      issuedBy: (session() && session().email) || "system",
      provisioned: true
    };

    users.push(user);
    writeUsers(users);
    log("Issued " + role + " login", name + " → " + email);

    return {
      ok: true,
      user: publicUser(user),
      credentials: {
        name: user.name,
        email,
        password,
        role,
        roleLabel: ROLE_META[role].label,
        programme: programme ? programme.name : "—",
        courses
      }
    };
  }

  /* Backwards-compatible alias used by older code paths. */
  function provisionLecturer(input) {
    return issueCredentials(Object.assign({}, input, { role: "lecturer" }));
  }

  /* --------------------------------------------------------- google sign in */
  /**
   * Complete a Google sign-in. Creates the account on first sight, then
   * signs the user in. New accounts are students by default — staff and
   * management can promote them from the Users panel.
   */
  function googleSignIn(profile) {
    const email = String((profile && profile.email) || "").trim().toLowerCase();
    const name = String((profile && profile.name) || "").trim() || email.split("@")[0];
    if (!email || email.indexOf("@") < 1) return { ok: false, error: "Google did not return a usable email address." };

    const allowed = (window.ARIA_ENV && window.ARIA_ENV.GOOGLE_ALLOWED_DOMAINS) || [];
    if (allowed.length) {
      const domain = email.split("@")[1];
      if (allowed.indexOf(domain) === -1) {
        return { ok: false, error: "This Google account is not on the allowed campus domains (" + allowed.join(", ") + ")." };
      }
    }

    const users = allUsers();
    let user = users.find((u) => u.email.toLowerCase() === email);
    let isNew = false;

    /* Admin, management and lecturer logins are issued credentials. Letting a
       typed-in Google address open them would be an impersonation hole. */
    if (user && ["admin", "management", "lecturer"].includes(user.role)) {
      return { ok: false, error: "This is an issued " + ROLE_META[user.role].label.toLowerCase() + " account. Sign in with your email and password instead." };
    }

    if (!user) {
      const requireApproval = !!(window.ARIA_ENV && window.ARIA_ENV.GOOGLE_REQUIRE_APPROVAL);
      user = {
        id: "U-G-" + String(Date.now()).slice(-6),
        name: titleCase(name),
        email,
        role: "student",
        programme: null,
        courses: [],
        title: "Student · Google account",
        department: "—",
        passwordHash: null,
        source: "google",
        avatar: (profile && profile.picture) || null,
        verified: !requireApproval,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      users.push(user);
      writeUsers(users);
      log("Google sign-up", email);
      isNew = true;
    } else if (profile && profile.picture && !user.avatar) {
      user.avatar = profile.picture;
      writeUsers(users);
    }

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ userId: user.id, email: user.email, role: user.role, name: user.name, via: "google", at: Date.now() })
    );
    log("Signed in with Google", email);

    return { ok: true, user: publicUser(user), isNew, needsApproval: user.verified === false };
  }

  /* ------------------------------------------------------------- sign in */
  function login(email, password) {
    const user = findByEmail(email);
    if (!user) return { ok: false, error: "No account found for that email address." };
    if (!user.passwordHash) {
      return { ok: false, error: "This account signs in with Google. Use the Google button instead." };
    }
    if (user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: "Incorrect password. Check the credentials issued to you." };
    }
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ userId: user.id, email: user.email, role: user.role, name: user.name, via: "password", at: Date.now() })
    );
    log("Signed in", user.email);
    return { ok: true, user: publicUser(user) };
  }

  function logout() {
    const s = session();
    if (s) log("Signed out", s.email);
    localStorage.removeItem(SESSION_KEY);
  }

  function session() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function currentUser() {
    const s = session();
    if (!s) return null;
    return publicUser(findByEmail(s.email));
  }

  function requireSession() {
    const u = currentUser();
    if (!u) {
      window.location.replace("login.html?next=dashboard.html");
      return null;
    }
    return u;
  }

  /* ---------------------------------------------------------- user admin */
  function addUser(payload) {
    return issueCredentials(payload);
  }

  function removeUser(id) {
    const users = allUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return { ok: false, error: "User not found." };
    if (target.builtIn) return { ok: false, error: "This is a built-in account and cannot be removed." };
    if (target.role === "admin" && users.filter((u) => u.role === "admin").length <= 1) {
      return { ok: false, error: "You cannot remove the last administrator account." };
    }
    writeUsers(users.filter((u) => u.id !== id));
    log("Removed user", target.email);
    return { ok: true };
  }

  function changeRole(id, role) {
    if (!PERMISSIONS[role]) return { ok: false, error: "Unknown role." };
    if (role === "admin") return { ok: false, error: "Administrator access cannot be granted from this panel." };
    const users = allUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return { ok: false, error: "User not found." };
    if (target.builtIn) return { ok: false, error: "This is a built-in account; its role is fixed." };
    const before = target.role;
    target.role = role;
    target.title = ROLE_META[role].label;
    writeUsers(users);
    log("Changed role", target.email + ": " + before + " → " + role);
    return { ok: true };
  }

  function approveUser(id) {
    const users = allUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return { ok: false, error: "User not found." };
    target.verified = true;
    writeUsers(users);
    log("Approved account", target.email);
    return { ok: true };
  }

  /* ------------------------------------------------------------- profile */
  function updateProfile(id, patch) {
    const users = allUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return { ok: false, error: "User not found." };
    if (patch.name && String(patch.name).trim().length >= 2) target.name = String(patch.name).trim();
    if (typeof patch.avatar === "string") {
      if (patch.avatar.length > 800000) return { ok: false, error: "That image is too large. Pick one under 600 KB." };
      target.avatar = patch.avatar;
    }
    if (patch.title) target.title = patch.title;
    writeUsers(users);

    const s = session();
    if (s && s.userId === id) {
      s.name = target.name;
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }
    return { ok: true, user: publicUser(target) };
  }

  /* A Google student with no programme yet can pick one; it sets their course set. */
  function assignProgramme(id, programmeCode) {
    const prog = PROGRAMMES[programmeCode];
    if (!prog) return { ok: false, error: "Unknown programme." };
    const users = allUsers();
    const target = users.find((u) => u.id === id);
    if (!target || target.role !== "student") return { ok: false, error: "Only student accounts can pick a programme." };
    if (target.programme) return { ok: false, error: "A programme is already set. Ask the academic office to change it." };
    target.programme = programmeCode;
    target.courses = prog.coreCourses.slice();
    target.department = prog.department;
    target.title = "Student · " + prog.short;
    writeUsers(users);
    log("Programme chosen", target.email + " → " + programmeCode);
    return { ok: true, user: publicUser(target) };
  }

  /* ------------------------------------------------------- chat history */
  function readChats() {
    try {
      return JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function chatHistory(userId) {
    const all = readChats();
    return Array.isArray(all[userId]) ? all[userId] : [];
  }

  function saveChat(userId, messages) {
    const all = readChats();
    all[userId] = (messages || []).slice(-120);
    localStorage.setItem(CHAT_KEY, JSON.stringify(all));
  }

  function clearChat(userId) {
    const all = readChats();
    delete all[userId];
    localStorage.setItem(CHAT_KEY, JSON.stringify(all));
  }

  /* ------------------------------------------------------------ audit log */
  function log(action, target) {
    let entries = [];
    try {
      entries = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
    } catch (e) {
      entries = [];
    }
    const s = session();
    entries.unshift({
      id: "X" + Date.now().toString(36),
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
      actor: s ? s.email : "system",
      action,
      target,
      ip: "10.4.2." + (10 + Math.floor(Math.random() * 40))
    });
    localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(0, 60)));
  }

  function auditEntries() {
    let live = [];
    try {
      live = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
    } catch (e) {
      live = [];
    }
    return live.concat(AUDIT_LOG);
  }

  function resetDemo() {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LOG_KEY);
    localStorage.removeItem(CHAT_KEY);
    seedUsers();
  }

  /* ------------------------------------------------------------- exports */
  return {
    allUsers,
    findByEmail,
    issueCredentials,
    provisionLecturer,
    googleSignIn,
    login,
    logout,
    session,
    currentUser,
    requireSession,
    addUser,
    removeUser,
    changeRole,
    approveUser,
    updateProfile,
    assignProgramme,
    chatHistory,
    saveChat,
    clearChat,
    auditEntries,
    log,
    resetDemo,
    hashPassword,
    initials
  };
})();
