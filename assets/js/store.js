/* ==========================================================================
   Aria — Shared store
   --------------------------------------------------------------------------
   Announcements and course materials are created at runtime (a lecturer
   cancels a class, publishes a handout). This module persists those records
   in localStorage and merges them into the ANNOUNCEMENTS / MATERIALS arrays
   from portal-data.js, so every page that loads it sees the same data.

   Announcement scoping
   --------------------
   · A notice with a `course` is a CLASS NOTICE. It is visible to
       - students enrolled in that course,
       - the lecturer who posted it (and only that lecturer),
       - admin and management (who oversee every notice).
     Other lecturers and staff never see it.
   · A notice without a `course` is a broadcast and follows `audience`.

   Same front-end-only caveat as auth.js: localStorage is not access control.
   ========================================================================== */

const Store = (() => {
  const ANN_KEY = "aria_ann_v1";
  const READ_KEY = "aria_ann_read_v1";
  const MAT_KEY = "aria_mat_v1";
  const FILE_KEY = "aria_files_v1";
  const MAX_FILE_BYTES = 900 * 1024;

  const KINDS = {
    cancelled: { label: "Class cancelled", tone: "r" },
    rescheduled: { label: "Rescheduled", tone: "a" },
    extra: { label: "Extra class", tone: "c" },
    info: { label: "Notice", tone: "v" }
  };

  function jget(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function jset(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  const stamp = (a) => a.ts || Date.parse(a.date) || 0;

  /* ----------------------------------------------------------- hydration */
  function hydrate() {
    /* Re-run safely: drop anything we added before, then add the stored set. */
    for (let i = ANNOUNCEMENTS.length - 1; i >= 0; i--) if (ANNOUNCEMENTS[i].stored) ANNOUNCEMENTS.splice(i, 1);
    for (let i = MATERIALS.length - 1; i >= 0; i--) if (MATERIALS[i].stored) MATERIALS.splice(i, 1);
    jget(ANN_KEY, []).forEach((a) => ANNOUNCEMENTS.unshift(Object.assign({}, a, { stored: true })));
    jget(MAT_KEY, []).forEach((m) => MATERIALS.push(Object.assign({}, m, { stored: true })));
  }

  /* -------------------------------------------------------- announcements */
  function canSee(a, user) {
    if (!user) return false;
    /* Admin and management oversee every notice; an author always sees their own. */
    if (user.role === "admin" || user.role === "management") return true;
    if (a.authorEmail && a.authorEmail.toLowerCase() === user.email.toLowerCase()) return true;
    if (a.course) {
      if (user.role === "lecturer") return !!a.authorEmail && a.authorEmail.toLowerCase() === user.email.toLowerCase();
      if (user.role === "student") return (user.courses || []).includes(a.course);
      return false;
    }
    return (a.audience || []).includes(user.role);
  }

  function visibleTo(user) {
    return ANNOUNCEMENTS.filter((a) => canSee(a, user)).sort(
      (x, y) => (y.pinned ? 1 : 0) - (x.pinned ? 1 : 0) || stamp(y) - stamp(x)
    );
  }

  function readIds(userId) {
    const all = jget(READ_KEY, {});
    return Array.isArray(all[userId]) ? all[userId] : [];
  }

  function unreadFor(user) {
    const seen = new Set(readIds(user.id));
    return visibleTo(user).filter((a) => !seen.has(a.id));
  }

  function markRead(user, ids) {
    const all = jget(READ_KEY, {});
    const set = new Set(all[user.id] || []);
    ids.forEach((id) => set.add(id));
    all[user.id] = Array.from(set).slice(-200);
    jset(READ_KEY, all);
  }

  /**
   * Post a notice. A lecturer may only post a class notice for a course they
   * teach; the author is always taken from the signed-in user, never the form.
   */
  function postAnnouncement(user, input) {
    const title = String(input.title || "").trim();
    const body = String(input.body || "").trim();
    if (title.length < 3) return { ok: false, error: "Add a short headline." };
    if (body.length < 3) return { ok: false, error: "Add a message." };

    let course = input.course || null;
    let audience = input.audience || ["student"];

    if (user.role === "lecturer") {
      if (!course || !(user.courses || []).includes(course)) {
        return { ok: false, error: "Choose one of the courses you teach." };
      }
      audience = ["student"];
    } else if (course && !COURSES.some((c) => c.code === course)) {
      return { ok: false, error: "Unknown course." };
    }

    const kind = KINDS[input.kind] ? input.kind : "info";
    const now = new Date();
    const record = {
      id: "N" + now.getTime().toString(36),
      title,
      body,
      author: user.name,
      authorEmail: user.email,
      role: user.role,
      date: now.toISOString().slice(0, 10),
      ts: now.getTime(),
      audience,
      pinned: !!input.pinned,
      course,
      kind: course ? kind : undefined
    };

    const stored = jget(ANN_KEY, []);
    stored.unshift(record);
    if (!jset(ANN_KEY, stored.slice(0, 80))) return { ok: false, error: "Browser storage is full." };
    hydrate();
    return { ok: true, announcement: record };
  }

  function retractAnnouncement(user, id) {
    const stored = jget(ANN_KEY, []);
    const target = stored.find((a) => a.id === id);
    if (!target) return { ok: false, error: "Only notices posted from this portal can be withdrawn." };
    const mine = target.authorEmail && target.authorEmail.toLowerCase() === user.email.toLowerCase();
    if (!mine && user.role !== "admin" && user.role !== "management") {
      return { ok: false, error: "You can only withdraw your own notices." };
    }
    jset(ANN_KEY, stored.filter((a) => a.id !== id));
    hydrate();
    return { ok: true };
  }

  /* ------------------------------------------------------------ materials */
  function fmtBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1048576) return Math.round(n / 1024) + " KB";
    return (n / 1048576).toFixed(1) + " MB";
  }

  function addMaterial(user, input, file) {
    if (file && file.size > MAX_FILE_BYTES) {
      return { ok: false, error: "That file is " + fmtBytes(file.size) + ". Demo storage accepts files up to " + fmtBytes(MAX_FILE_BYTES) + "." };
    }
    const mats = jget(MAT_KEY, []);
    const id = "U" + Date.now().toString(36).toUpperCase();
    const title = String(input.title || "").trim();
    const record = {
      id,
      course: input.course,
      title,
      type: input.type || "PDF",
      uploadedBy: user.name,
      week: parseInt(input.week, 10) || 1,
      size: file ? fmtBytes(file.size) : "—",
      tags: title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2).slice(0, 6),
      hasFile: !!file,
      fileName: file ? file.name : null
    };
    if (file) {
      const files = jget(FILE_KEY, {});
      files[id] = { name: file.name, mime: file.mime || "application/octet-stream", data: file.data };
      if (!jset(FILE_KEY, files)) return { ok: false, error: "Browser storage is full. Remove an old upload first." };
    }
    mats.push(record);
    if (!jset(MAT_KEY, mats)) return { ok: false, error: "Browser storage is full." };
    hydrate();
    return { ok: true, material: record };
  }

  /** The real uploaded file for a material, or null when only metadata exists. */
  function fileFor(materialId) {
    const f = jget(FILE_KEY, {})[materialId];
    return f || null;
  }

  hydrate();

  return {
    KINDS,
    MAX_FILE_BYTES,
    canSee,
    visibleTo,
    unreadFor,
    markRead,
    postAnnouncement,
    retractAnnouncement,
    addMaterial,
    fileFor,
    hydrate,
    fmtBytes
  };
})();
