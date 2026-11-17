/* ==========================================================================
   Aria — Google sign-in (shared by login.html and solver.html)
   --------------------------------------------------------------------------
   Sign-in is handled by server.js (Client ID + Secret live in .env there).
   start()  sends the browser to /auth/google and Google brings it back here.
   resume() runs on page load: if we just came back from Google it fetches the
            verified profile from /auth/me and hands it to the page.
   ========================================================================== */

const GoogleFlow = (() => {
  const params = () => new URLSearchParams(location.search);

  function cleanUrl() {
    const p = params();
    ["g", "gerr"].forEach((k) => p.delete(k));
    const q = p.toString();
    history.replaceState(null, "", location.pathname + (q ? "?" + q : ""));
  }

  /** true when this page load is the return trip from Google. */
  function returning() {
    const p = params();
    return p.has("g") || p.has("gerr");
  }

  function start(handlers) {
    if (location.protocol === "file:") {
      handlers.onError("Google sign-in needs the site to run through server.js (node server.js), not by opening the file directly.");
      return;
    }
    const p = params();
    ["g", "gerr"].forEach((k) => p.delete(k));
    const q = p.toString();
    location.href = "/auth/google?ret=" + encodeURIComponent(location.pathname + (q ? "?" + q : ""));
  }

  async function resume(handlers) {
    const p = params();
    const err = p.get("gerr");
    const tok = p.get("g");
    cleanUrl();
    if (err) return handlers.onError(err);
    if (!tok) return;
    try {
      const r = await fetch("/auth/me?t=" + encodeURIComponent(tok), { cache: "no-store" });
      if (!r.ok) return handlers.onError("Google sign-in did not complete. Try again.");
      const prof = await r.json();
      const res = handlers.onProfile({ name: prof.name, email: prof.email, picture: prof.picture });
      if (res && res.ok === false) handlers.onError(res.error);
    } catch (e) {
      handlers.onError("Could not read your Google profile. Try again.");
    }
  }

  return { start, resume, returning };
})();
