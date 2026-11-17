# Aria — AI-Based Smart Classroom Assistant

A complete, self-contained web application that acts as a classroom assistant for a Computer Science department. It represents course information and classroom rules, searches learning and support workflows, models a rational agent, evaluates modern AI paradigms, and answers student questions with cited sources.

The site runs with **zero backend and zero build step**. Open `index.html` and it works.

---

## 1. What the site contains

| Section | Purpose |
|---|---|
| **Home** | Overview, live statistics, entry points into every module |
| **Courses** | Six fully modelled courses with instructor, schedule, room, prerequisites, topics, assessment weights and resources. Each card opens a detail modal. |
| **Classroom Rules** | Fifteen rules across six categories, each with severity, exact policy text and a rationale. Filter by category, search full text. |
| **Workflows** | Eight learning and support workflows with owner, SLA and numbered steps. Filter by learning/support, search by keyword, or hand any workflow to the assistant. |
| **Rational Agent** | PEAS specification, environment properties, six-layer architecture, an animated perceive→act decision loop, and the utility function. |
| **AI Paradigms** | Nine modern paradigms scored 0–100 for fit against this specific problem, each with strengths, weaknesses and a verdict. |
| **Assistant** | A working chat assistant with two interchangeable engines and a settings panel. |

---

## 2. The two AI engines

### Local AI (default — no key required)

Runs entirely in the browser. It is a genuine retrieval system, not a canned script:

1. **Tokenisation and stemming** over the query and every knowledge-base document.
2. **TF-IDF vectors** built at load time, with title tokens weighted ×3.2 and tags ×2.4.
3. **Cosine similarity** ranking, plus exact tag-hit bonuses and a domain keyword router.
4. **Intent detection** for greetings, thanks, meta questions and farewells.
5. **Structured lookups** for course codes — `CS-301`, `cs301`, `CS 301` all resolve to the same record, and multi-part questions ("when is CS-301 and who teaches it") are answered in parts.
6. **Grounded refusal** — if the best match falls below threshold, the assistant says it does not know and points to a human instead of guessing.

No network requests. No data leaves the page.

### Gemini (optional — key goes in `env.js`, once)

Open `assets/js/env.js`, paste your Google AI Studio key, save, reload:

```js
GEMINI_API_KEY: "AIza...your key...",
GEMINI_MODEL: "gemini-2.0-flash",
```

That is the only place the key is entered. There is no key box anywhere on the site and nothing is
stored in `localStorage`. With a key present, every assistant (public chat, Ask with AI drawer, Study
Assistant, AI Solver) switches to Gemini automatically:

1. It reads the whole knowledge base plus, in the dashboard, the user's real timetable, files and notices.
2. It **thinks** about the question and answers in the language it was asked in (Hindi, Hinglish, English, anything).
3. It builds its own **follow-up questions** after each answer and shows them as tappable chips.
4. If a call fails, it **falls back to Local AI** and says so.

Security: this is a static site, so a key in `env.js` can be read by anyone who can open the site. Use a
key restricted to your domain in Google AI Studio, or put the call behind a small server before launch.

### Languages without a key

Local AI also understands **Hindi (Devanagari) and Hinglish**. `ai.js` translates Hindi keywords to
English before retrieval and routing, and the dashboard assistant replies in the user's language, e.g.
"आज मेरी क्लासेस कौन सी हैं" or "kal kaun si class hai" list that day's real timetable. Policy answers
from the knowledge base are shown in their original English with a Hindi lead-in.

---

## 3. Running it

Any static server works:

```bash
cd /workspace
python3 -m http.server 8000
# open http://localhost:8000
```

Or simply open `index.html` directly in a browser — the Local AI engine works from `file://` because there are no module imports or fetches on the default path.

---

## 4. Project structure

```
index.html                 Markup for all seven sections
login.html                 Single sign-in, Google, help
dashboard.html             Role-aware workspace shell
assets/css/styles.css      Design system, layout, responsive rules
assets/css/advanced.css    Atmospheric layer: aurora, grain, glass, motion
assets/css/portal.css      Auth + dashboard design system
assets/js/data.js          Knowledge layer: courses, rules, workflows, agent model, paradigms, KB
assets/js/assistant.js     LocalEngine (TF-IDF + intents), GeminiEngine, Assistant facade
assets/js/app.js           Rendering, filters, search, modal, agent loop, chat wiring
assets/js/env.js           Gemini key, Google client config, branding
assets/js/ai.js            Shared Gemini caller + Hindi/Hinglish language layer
assets/js/auth.js          Built-in admin, role issuing, Google, sessions, chat history
assets/js/login.js         Login page controller
assets/js/portal-data.js   Programmes, timetable, materials, roster, permissions
assets/js/portal.js        Role router, five dashboards, profile sheet, AI agent
assets/img/hero.webp|jpg   Hero illustration
```

---

## 5. Extending the knowledge base

Everything the assistant knows lives in `assets/js/data.js`.

To add a course, append an object to `COURSES` with `code`, `title`, `instructor`, `email`, `credits`, `level`, `schedule`, `room`, `seats`, `color`, `description`, `prerequisites`, `topics`, `assessment` and `resources`. The card, the modal and the assistant's structured course lookup all pick it up automatically.

To add a rule, append to `RULES` with `id`, `cat` (must match a `RULE_CATEGORIES` id), `title`, `text`, `severity` and `why`.

To add a workflow, append to `WORKFLOWS` with `id`, `type` (`learning` or `support`), `title`, `summary`, `sla`, `owner`, `steps` and `tags`.

To teach the assistant a new fact, append to `KB` with `id`, `title`, `tags` and `text`. The TF-IDF index rebuilds on page load, so no other change is needed. Tags are the strongest routing signal — include the words a student would actually type.

---

## 6. Design notes

The interface is a dark, high-contrast system built on a violet→cyan gradient with glass surfaces, designed to keep long policy text readable. Every section uses the same card, chip and typography scale so the site reads as one product rather than seven pages. Animations are limited to entrance reveals, a floating hero card, and the agent decision loop, and all of them respect `prefers-reduced-motion`.

Accessibility: semantic landmarks, keyboard-operable course cards, visible focus states, `aria-label` on icon-only buttons, and colour contrast checked against the dark surfaces.

---

## 7. Evaluation summary

The paradigms section is the argument for the architecture actually shipped. Retrieval-augmented generation scores highest (95) because classroom policy answers must be grounded and citable. Large language models score 88 — excellent conversation, but unreliable alone. Rule-based systems score 78: narrow, but perfectly suited to policy. Reinforcement learning scores 30 and is explicitly rejected, because you cannot A/B test disciplinary policy on real students.

The shipped system is therefore hybrid: deterministic rules and retrieval for correctness, with an optional LLM for fluency.

---

## Role-based portal (login + five panels)

The working application lives behind `login.html` and `dashboard.html`. The dashboard and sign-in pages
no longer carry a "Public site" link.

### Signing in

The login page shows **one sign-in form and nothing else** — no role chips, no panel list, no
onboarding tab. Access is issued, not self-assigned.

| Who | How they get in |
| --- | --- |
| **Administrator** | Built-in account created by the application itself (see below) |
| **Management** | Seeded account, or issued by the administrator |
| **Lecturer** | Credentials issued by management or administration |
| **Staff** | Credentials issued by management, or a Google account |
| **Student** | Credentials issued by management/staff, or a Google account (there is no self-service "create account") |

**Built-in administrator.** The app creates its own admin on first load, so the site works with no
environment file at all:

```
admin@northfield.edu  /  Admin@2025
```

This account is flagged `builtIn: true`. It cannot be deleted, cannot be demoted, and is never
rendered anywhere on the public login page. The administrator can do everything management can,
plus the audit trail, system settings and account deletion.

**Google sign-in.** Students and staff can use **Login with Google** / **Continue with Google**.
Managers and administrators use their issued credentials. Google and Gemini are configured through
`assets/js/env.js` — the only thing that belongs in environment config:

```js
window.ARIA_ENV = {
  GEMINI_API_KEY: "",          // paste your Gemini key here
  GOOGLE_CLIENT_ID: "",        // paste your OAuth client ID here
  GOOGLE_ALLOWED_DOMAINS: [],  // optional: restrict to e.g. ["northfield.edu"]
  GOOGLE_REQUIRE_APPROVAL: false,
  INSTITUTION: "Northfield Institute of Technology",
  SUPPORT_EMAIL: "support@northfield.edu"
};
```

Google sign-in is real and direct: the button opens Google's account chooser. With `GOOGLE_CLIENT_ID` empty
the button shows "not set up yet" — there is no fake/offline identity form. Run the site on
`http://localhost` or https (Google refuses `file://`). The client secret is not needed and must not be put in `env.js`. No admin credentials, panel flags or
secrets are ever read from environment config.

### Issuing a role

Management and administration open **User Management** and use **Issue a login**:

1. Enter the person's full name.
2. Choose the role to grant — **Lecturer**, **Staff** or **Student**. Admin cannot be granted here.
3. Pick a programme; the programme supplies the department and default core course set.
4. Optionally narrow the course list.

The app generates the email (`firstname.lastname@northfield.edu`, with `.2` / `.3` on collision) and
a deterministic password (`Aria-XXXX-XXXX`). Both are shown once in a "share these once" block. The
same form also lets management change an existing role, approve pending Google sign-ups, and remove
accounts. Every action is written to the audit log.

### The five panels

| Panel | Tier | Sees |
| --- | --- | --- |
| **Admin** | Admin tier | Everything Management sees, plus **Audit Log** and **System Settings** |
| **Management** | Admin tier | Users, course catalogue, master timetable, materials, attendance, announcements, support queue, reports |
| **Lecturer** | Teaching | Own timetable with room directions, own courses, class rosters, attendance registers, material uploads |
| **Staff** | Operations | Support queue with SLAs, facilities and room readiness, attendance operations |
| **Student** | Learner | Personal timetable, enrolled courses, published materials, grades |

### Profile and photos

Every signed-in user can open the profile sheet from the sidebar and:

- change their display name;
- upload a portrait — it is centre-cropped to 256×256 and stored as a compressed JPEG data URL on
  the account, so the same photo appears in the sidebar, the roster and the audit log;
- remove the photo and fall back to generated initials.

This keeps imagery consistent across the site instead of mixing unrelated stock portraits.

### The AI agent — signed-in only

The assistant is deliberately gated. On the public site the chat is blurred behind a **Sign in to
talk to Aria** card; inside the dashboard it opens as the **Ask Aria** drawer. The reason is
continuity: every conversation is stored per user in `aria_chat_v1`, capped at 120 messages, and
replayed when that user returns. A **⟳** button starts a fresh conversation without touching the
rest of the account.

The agent is grounded in the panel's own data and works in four stages:

1. **Resource attribution.** "I don't have the search algorithms slides" → matches the material,
   names the file, the course code and title, the lecturer who uploaded it, their email and the
   material ID.
2. **Timetable guidance.** "When is my next class", "where is my Thursday lab" → resolved against
   the live timetable with walking directions.
3. **Knowledge-base reasoning.** Everything else falls through to the local TF-IDF engine in
   `assistant.js`, returning a cited answer with a confidence score.
4. **Grounded refusal.** Below 0.45 confidence Aria refuses and names the right human owner.

### Files for the portal

```
login.html               Single sign-in, Google, help
dashboard.html           Panel shell (sidebar, topbar, profile sheet, AI drawer)
assets/css/advanced.css  Atmospheric layer: aurora, grain, glass, motion
assets/css/portal.css    Auth + dashboard design system
assets/js/env.js         Gemini key, Google client config, branding
assets/js/portal-data.js Programmes, timetable, materials, roster, permissions
assets/js/auth.js        Built-in admin, role issuing, Google, sessions, chat history
assets/js/login.js       Login page controller
assets/js/portal.js      Role router, five dashboards, profile, AI agent
```

### Security note

This is a front-end demonstration. Accounts, sessions and the audit log live in `localStorage`, and
passwords are protected only by a non-cryptographic digest. It is designed to demonstrate
role-based flows and provisioning logic — not to hold real credentials.


---

## AI Solver, announcement bell and class notices

### Two assistants, two places

| | Where | What it does |
| --- | --- | --- |
| **Ask with AI** | Dashboard sidebar → opens the side drawer | Aria: timetable, missing files, rules, announcements. Grounded in the panel's data. |
| **AI Solver** | Dashboard sidebar → `solver.html` (own page) | Solves questions only. **Google sign-in required.** |

The floating "Talk with AI" study helper is not loaded on the dashboard, so the restricted
Solver is the only open-ended assistant inside the portal.

### Solver rules

* Google sign-in only (`session.via === "google"`). A password session is sent back to the Google gate.
* Google sign-in is refused for the admin, management and lecturer accounts — those use issued credentials.
* Answers: academic questions (Gemini, key from `env.js`), arithmetic (local
  calculator), lecturer **names**, and files a lecturer uploaded to a course the student is enrolled in.
* Refuses guidance/advice and anything about administrators, staff, accounts, passwords, grades, attendance,
  fees or other people's records. Three refusals within ten minutes pause the input for five minutes.
* Files: if the lecturer attached a real file when publishing the material, the student gets that file.
  Otherwise the Solver builds a study handout (HTML) from the material's title, course topics and tags.
* Below the chat, **Your classes** shows each course, the lecturer's photo and the next session. The photo is
  the one the lecturer uploaded in their profile; without one, a generated portrait is shown.

The topic filter is a client-side regex plus the model's system prompt. It is a courtesy, not enforcement.

### Announcement bell and class notices

* The bell appears in the dashboard top bar and on the Solver page once signed in, with an unread count.
* A lecturer posts a **class notice** (cancelled, rescheduled, extra class, general) from
  Announcements → *Notify your class*. It is stored with the course code and the lecturer's email and is
  visible only to students enrolled in that course, that lecturer, and admin/management. Other lecturers and
  staff never see it. A lecturer can withdraw their own notice.
* New code: `store.js` (scoped announcements, persisted materials and files), `ui.js` (toast, bell, portraits),
  `google.js` (shared Google flow), `solver.js`, `solver.css`.
