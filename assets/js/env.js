/* ==========================================================================
   Aria — Environment configuration
   --------------------------------------------------------------------------
   This file is the ONLY place that holds environment values. It is loaded
   before every other script.

   Deliberately NOT in here:
     · administrator credentials  — the admin account is created inside the
       application itself (see auth.js) and is never read from the environment
     · any panel access flag      — panels are decided by the user's role only

   Deliberately IN here:
     · Gemini API key             — paste it ONCE below, every assistant uses it
     · Google sign-in configuration

   Google sign-in (real, direct)
   -----------------------------
   1. Google Cloud project -> APIs & Services -> Credentials
   2. Create an "OAuth client ID" of type "Web application"
   3. Add your site origin to "Authorised JavaScript origins",
      e.g. http://localhost:8080 or https://your-site.example.com
   4. Paste the Client ID into GOOGLE_CLIENT_ID below.
   The Client SECRET is NOT used and must never be put in this file: this
   sign-in runs in the browser, and anything here is readable by visitors.
   Serve the site over http://localhost or https (not file://).
   ========================================================================== */

window.ARIA_ENV = {
  /* ---- Gemini (Google AI Studio) --------------------------------------- */
  /* Paste your key between the quotes, save the file, reload the site.
     That is the only place the key is ever entered — there is no key box
     anywhere in the UI. With a key: every assistant "thinks" with Gemini,
     in any language, and builds its own follow-up questions.
     Without a key: the built-in Local AI answers (English / Hindi / Hinglish). */
  GEMINI_API_KEY: "",
  GEMINI_MODEL: "gemini-2.0-flash",

  /* ---- Google Identity Services ---------------------------------------- */
  GOOGLE_CLIENT_ID: "474680058761-rjc6spud8dpk4rrnvfdscm8rjlmc6uhg.apps.googleusercontent.com",

  /* Optional: restrict sign-in to these email domains.
     Leave the array empty to accept any Google account. */
  GOOGLE_ALLOWED_DOMAINS: [],

  /* Optional: when true, a brand-new Google account lands in the staff /
     management approval queue instead of being active immediately. */
  GOOGLE_REQUIRE_APPROVAL: false,

  /* ---- Branding -------------------------------------------------------- */
  INSTITUTION: "Northfield Institute of Technology",
  SUPPORT_EMAIL: "support@northfield.edu"
};
