/* ==========================================================================
   Aria — Login page controller
   --------------------------------------------------------------------------
   · email + password sign-in
   · Google sign-in (real Google Identity Services when a client ID is set,
     otherwise a "not set up yet" message)
   · help panel (no self-service account creation)
   No role listings, no demo credentials, no onboarding form.
   ========================================================================== */

(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const ENV = window.ARIA_ENV || {};

  /* ------------------------------------------------------------ branding */
  if (ENV.INSTITUTION) {
    const el = $("#instName");
    if (el) el.textContent = ENV.INSTITUTION;
  }
  if (ENV.SUPPORT_EMAIL) {
    const el = $("#helpEmail");
    if (el) el.textContent = ENV.SUPPORT_EMAIL;
  }

  /* -------------------------------------------------------------- panels */
  const PANELS = {
    signin: $("#panelSignin"),
    help: $("#panelHelp")
  };

  function showPanel(name) {
    Object.keys(PANELS).forEach((k) => PANELS[k].classList.toggle("active", k === name));
    clearAlerts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $("#toHelp").addEventListener("click", () => showPanel("help"));
  $("#toSignin2").addEventListener("click", () => showPanel("signin"));

  /* -------------------------------------------------------------- alerts */
  function clearAlerts() {
    $$(".alert").forEach((a) => {
      a.className = "alert";
      a.textContent = "";
    });
  }

  function alertIn(id, msg, kind) {
    const box = $(id);
    if (!box) return;
    box.textContent = msg;
    box.className = "alert show" + (kind ? " " + kind : "");
  }

  /* -------------------------------------------------------------- sign in */
  $("#signinForm").addEventListener("submit", (e) => {
    e.preventDefault();
    clearAlerts();

    const email = $("#email").value.trim();
    const password = $("#password").value;

    if (!email || !password) {
      alertIn("#authAlert", "Enter both your email address and password.");
      return;
    }

    const btn = $("#signinBtn");
    btn.disabled = true;
    btn.textContent = "Checking…";

    const res = Auth.login(email, password);

    if (!res.ok) {
      btn.disabled = false;
      btn.textContent = "Sign in to my panel";
      alertIn("#authAlert", res.error);
      return;
    }

    alertIn("#authAlert", "Signed in as " + res.user.name + ". Opening your panel…", "ok");
    const next = new URLSearchParams(location.search).get("next") || "dashboard.html";
    setTimeout(() => (window.location.href = next), 500);
  });

  /* ---------------------------------------------------------------- google */
  function finishGoogle(profile) {
    const res = Auth.googleSignIn(profile);
    if (!res.ok) return res;
    const next = new URLSearchParams(location.search).get("next") || "dashboard.html";
    alertIn("#authAlert", "Signed in as " + res.user.name + ". Opening your panel…", "ok");
    setTimeout(() => (window.location.href = next), 400);
    return res;
  }

  const googleHandlers = {
    onProfile: finishGoogle,
    onError: (msg) => alertIn("#authAlert", msg)
  };

  $("#googleBtn").addEventListener("click", () => {
    clearAlerts();
    GoogleFlow.start(googleHandlers);
  });

  /* ---------------------------------------------------------------- boot */
  const comingBack = GoogleFlow.returning();
  if (comingBack) GoogleFlow.resume(googleHandlers);

  const existing = Auth.currentUser();
  if (existing && !comingBack) {
    alertIn(
      "#authAlert",
      "You are already signed in as " + existing.name + ". Signing in again will switch accounts.",
      "info"
    );
    $("#email").value = existing.email;
  }

})();
