/* =========================================================================
   AI-BASED SMART CLASSROOM ASSISTANT
   Knowledge Layer  —  courses · rules · workflows · agent model · paradigms
   ========================================================================= */

const CLASSROOM = {
  institution: "Northfield Institute of Technology",
  department: "Department of Computer Science & Engineering",
  semester: "Spring 2025",
  assistantName: "Aria",
  assistantRole: "Smart Classroom Assistant",
  supportEmail: "classroom-support@northfield.edu",
  helpdeskHours: "Mon–Fri, 09:00–17:00",
  tutoringCenter: "Block C, Room 214",
};

/* ------------------------------------------------------------------ */
/* 1. COURSES                                                          */
/* ------------------------------------------------------------------ */
const COURSES = [
  {
    code: "CS-301",
    title: "Artificial Intelligence",
    instructor: "Dr. Meera Raman",
    email: "m.raman@northfield.edu",
    credits: 4,
    level: "Core",
    schedule: "Mon & Wed, 10:00–11:30",
    room: "Block A · Lecture Hall 2",
    seats: 62,
    color: "#7c5cff",
    description:
      "A rigorous introduction to the design of rational agents. The course moves from problem formulation and search to probabilistic reasoning, learning, and the evaluation of modern AI paradigms including large language models.",
    prerequisites: ["CS-210 Data Structures", "MATH-204 Discrete Mathematics"],
    topics: [
      "Intelligent agents & rationality",
      "Uninformed and informed search",
      "Adversarial search and games",
      "Constraint satisfaction",
      "Propositional & first-order logic",
      "Probability and Bayesian networks",
      "Machine learning fundamentals",
      "Large language models & retrieval",
    ],
    assessment: [
      { name: "Assignments (4)", weight: 20 },
      { name: "Midterm exam", weight: 25 },
      { name: "Project (agent build)", weight: 25 },
      { name: "Final exam", weight: 30 },
    ],
    resources: [
      "Russell & Norvig — Artificial Intelligence: A Modern Approach (4e)",
      "Weekly lab notebooks on the course portal",
      "Office hours: Tue 14:00–16:00, Block A-311",
    ],
  },
  {
    code: "CS-330",
    title: "Machine Learning",
    instructor: "Prof. Daniel Okafor",
    email: "d.okafor@northfield.edu",
    credits: 4,
    level: "Core",
    schedule: "Tue & Thu, 09:00–10:30",
    room: "Block B · Lab 105",
    seats: 48,
    color: "#22d3ee",
    description:
      "Covers supervised and unsupervised learning with an emphasis on model evaluation, regularisation, and the practical workflow from data cleaning to deployment.",
    prerequisites: ["CS-210 Data Structures", "STAT-201 Probability & Statistics"],
    topics: [
      "Bias–variance and generalisation",
      "Linear and logistic regression",
      "Decision trees and ensembles",
      "Support vector machines",
      "Clustering and dimensionality reduction",
      "Neural networks",
      "Model evaluation and cross-validation",
      "Responsible ML and fairness",
    ],
    assessment: [
      { name: "Labs (6)", weight: 25 },
      { name: "Midterm exam", weight: 20 },
      { name: "Kaggle-style project", weight: 25 },
      { name: "Final exam", weight: 30 },
    ],
    resources: [
      "Géron — Hands-On Machine Learning (3e)",
      "Scikit-learn documentation",
      "Office hours: Thu 15:00–17:00, Block B-208",
    ],
  },
  {
    code: "CS-210",
    title: "Data Structures & Algorithms",
    instructor: "Dr. Aisha Karim",
    email: "a.karim@northfield.edu",
    credits: 4,
    level: "Core",
    schedule: "Mon, Wed & Fri, 08:30–09:45",
    room: "Block A · Lecture Hall 1",
    seats: 90,
    color: "#f59e0b",
    description:
      "The engineering backbone of the programme: complexity analysis, linear and non-linear structures, sorting, graph algorithms, and the discipline of writing provably efficient code.",
    prerequisites: ["CS-101 Programming Fundamentals"],
    topics: [
      "Asymptotic analysis",
      "Arrays, lists, stacks, queues",
      "Trees, heaps, hash tables",
      "Graphs and traversal",
      "Sorting and searching",
      "Dynamic programming",
      "Greedy algorithms",
    ],
    assessment: [
      { name: "Weekly problem sets", weight: 20 },
      { name: "Two lab exams", weight: 20 },
      { name: "Midterm exam", weight: 25 },
      { name: "Final exam", weight: 35 },
    ],
    resources: [
      "Cormen et al. — Introduction to Algorithms (4e)",
      "Autograder on the course portal",
      "Office hours: Fri 13:00–15:00, Block A-305",
    ],
  },
  {
    code: "CS-410",
    title: "Software Engineering",
    instructor: "Prof. Lena Fischer",
    email: "l.fischer@northfield.edu",
    credits: 3,
    level: "Core",
    schedule: "Tue & Thu, 11:00–12:15",
    room: "Block C · Studio 3",
    seats: 55,
    color: "#34d399",
    description:
      "A team-based studio course on building maintainable software: requirements, architecture, testing, version control, code review, and delivery under real constraints.",
    prerequisites: ["CS-210 Data Structures"],
    topics: [
      "Requirements engineering",
      "Architecture and design patterns",
      "Testing and CI/CD",
      "Version control workflows",
      "Code review and refactoring",
      "Agile delivery",
      "Technical documentation",
    ],
    assessment: [
      { name: "Sprint deliverables", weight: 40 },
      { name: "Code review participation", weight: 10 },
      { name: "Architecture report", weight: 20 },
      { name: "Final demo & defence", weight: 30 },
    ],
    resources: [
      "Martin — Clean Architecture",
      "Team Git repositories",
      "Studio hours: Wed 14:00–17:00, Block C-Studio 3",
    ],
  },
  {
    code: "MATH-204",
    title: "Discrete Mathematics",
    instructor: "Dr. Ravi Menon",
    email: "r.menon@northfield.edu",
    credits: 3,
    level: "Foundation",
    schedule: "Mon & Wed, 13:00–14:15",
    room: "Block D · Room 12",
    seats: 75,
    color: "#f472b6",
    description:
      "The mathematical grammar of computer science: logic, proof technique, sets, relations, combinatorics, graph theory and elementary number theory.",
    prerequisites: ["MATH-101 Calculus I"],
    topics: [
      "Propositional and predicate logic",
      "Proof techniques",
      "Sets, relations, functions",
      "Combinatorics",
      "Graph theory",
      "Number theory and modular arithmetic",
    ],
    assessment: [
      { name: "Fortnightly quizzes", weight: 20 },
      { name: "Problem sets", weight: 20 },
      { name: "Midterm exam", weight: 25 },
      { name: "Final exam", weight: 35 },
    ],
    resources: [
      "Rosen — Discrete Mathematics and Its Applications (8e)",
      "Proof-writing workshop notes",
      "Office hours: Thu 10:00–12:00, Block D-208",
    ],
  },
  {
    code: "ENG-101",
    title: "Technical Communication",
    instructor: "Ms. Clara Bennett",
    email: "c.bennett@northfield.edu",
    credits: 2,
    level: "Foundation",
    schedule: "Fri, 11:00–12:30",
    room: "Block E · Seminar 4",
    seats: 40,
    color: "#a78bfa",
    description:
      "Writing and speaking for technical audiences: reports, documentation, presentations, and the ethics of clear communication.",
    prerequisites: [],
    topics: [
      "Audience analysis",
      "Technical reports",
      "API and user documentation",
      "Presentation design",
      "Citation and academic integrity",
    ],
    assessment: [
      { name: "Writing portfolio", weight: 40 },
      { name: "Group presentation", weight: 25 },
      { name: "Final report", weight: 35 },
    ],
    resources: [
      "Purdue OWL writing guides",
      "Presentation lab bookings",
      "Office hours: Fri 13:00–14:00, Block E-110",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 2. CLASSROOM RULES                                                  */
/* ------------------------------------------------------------------ */
const RULE_CATEGORIES = [
  { id: "all", label: "All rules" },
  { id: "attendance", label: "Attendance" },
  { id: "conduct", label: "Conduct" },
  { id: "integrity", label: "Academic integrity" },
  { id: "devices", label: "Devices & tools" },
  { id: "deadlines", label: "Deadlines" },
  { id: "safety", label: "Safety & wellbeing" },
];

const RULES = [
  {
    id: "R1",
    cat: "attendance",
    title: "75% attendance threshold",
    text:
      "Students must attend at least 75% of scheduled sessions in each course to be eligible for the final examination. Attendance is recorded in the first ten minutes of class.",
    severity: "high",
    why: "Attendance is the strongest single predictor of pass rates in this department.",
  },
  {
    id: "R2",
    cat: "attendance",
    title: "Late arrival and early departure",
    text:
      "Arrivals more than ten minutes late are marked as late but not absent. Leaving before the session ends without prior notice is recorded as a partial absence.",
    severity: "medium",
    why: "Preserves continuity for lab work and in-class assessments.",
  },
  {
    id: "R3",
    cat: "attendance",
    title: "Absence documentation",
    text:
      "Absences for medical or compassionate reasons must be documented through the student portal within five working days. Approved absences do not count against the threshold.",
    severity: "high",
    why: "Protects students with legitimate circumstances while keeping records auditable.",
  },
  {
    id: "R4",
    cat: "conduct",
    title: "Respectful participation",
    text:
      "Harassment, discriminatory language, intimidation, and personal attacks are prohibited in class, in labs, and in all course channels. Disagree with ideas, never with people.",
    severity: "critical",
    why: "A classroom is a learning environment first; psychological safety is a precondition for it.",
  },
  {
    id: "R5",
    cat: "conduct",
    title: "One conversation at a time",
    text:
      "Side conversations, interrupting peers, and speaking over the instructor disrupt the room. Raise a hand or use the digital queue in the classroom assistant.",
    severity: "low",
    why: "Keeps the cognitive load of the room on the material, not on noise.",
  },
  {
    id: "R6",
    cat: "integrity",
    title: "Individual work is individual",
    text:
      "Unless an assessment is explicitly marked as group work, all submitted code and writing must be produced independently. Discussing concepts is allowed; sharing solutions is not.",
    severity: "critical",
    why: "The learning objective is the skill, not the artifact.",
  },
  {
    id: "R7",
    cat: "integrity",
    title: "Disclose all AI assistance",
    text:
      "Generative AI tools may be used for brainstorming, explanation, and editing. Any AI-generated content that appears in a submission must be disclosed in a short statement describing the tool and the extent of use.",
    severity: "high",
    why: "Transparency preserves trust and lets instructors assess your actual understanding.",
  },
  {
    id: "R8",
    cat: "integrity",
    title: "Cite every source",
    text:
      "All external code, data, images, and text must be cited in the required format. Uncited reuse is treated as plagiarism regardless of intent.",
    severity: "high",
    why: "Attribution is a professional obligation, not a formality.",
  },
  {
    id: "R9",
    cat: "devices",
    title: "Devices in service of learning",
    text:
      "Laptops and tablets are permitted for note-taking and lab work. Phones must be silent and out of sight during lectures and assessments unless explicitly required.",
    severity: "low",
    why: "Devices help when they are the tool, and hurt when they are the distraction.",
  },
  {
    id: "R10",
    cat: "devices",
    title: "Recording requires consent",
    text:
      "Audio, video, or screen recording of a session requires the instructor's prior written consent and must not be redistributed.",
    severity: "high",
    why: "Protects the privacy of everyone in the room, including students who ask questions.",
  },
  {
    id: "R11",
    cat: "deadlines",
    title: "Late submission penalty",
    text:
      "Submissions lose 10% of the available marks per calendar day late, up to three days. After 72 hours the submission is not accepted unless an extension was approved.",
    severity: "high",
    why: "A predictable penalty is fairer than an unpredictable one.",
  },
  {
    id: "R12",
    cat: "deadlines",
    title: "Extension requests",
    text:
      "Request an extension at least 48 hours before the deadline through the student portal. Requests are reviewed within one working day by the course instructor.",
    severity: "medium",
    why: "Early requests can almost always be accommodated; last-minute ones often cannot.",
  },
  {
    id: "R13",
    cat: "deadlines",
    title: "Grade review window",
    text:
      "Grade queries must be raised within seven days of marks being published. After that window, marks are considered final except in cases of clerical error.",
    severity: "medium",
    why: "Keeps records stable while still giving students a fair chance to question results.",
  },
  {
    id: "R14",
    cat: "safety",
    title: "Lab safety and equipment care",
    text:
      "Food and drink are prohibited near lab hardware. Report damaged equipment immediately; do not attempt repairs yourself.",
    severity: "medium",
    why: "Equipment failures cost lab time for everyone in the cohort.",
  },
  {
    id: "R15",
    cat: "safety",
    title: "Wellbeing and support",
    text:
      "If you are struggling, contact the course instructor or the student support office early. Academic difficulty is a support issue before it is a disciplinary one.",
    severity: "medium",
    why: "Students who ask for help early recover far more often than those who wait.",
  },
];

/* ------------------------------------------------------------------ */
/* 3. LEARNING & SUPPORT WORKFLOWS                                     */
/* ------------------------------------------------------------------ */
const WORKFLOWS = [
  {
    id: "W1",
    type: "learning",
    title: "Resolve a conceptual doubt",
    summary:
      "The fastest path from 'I don't understand this' to a working mental model, using the assistant first and a human second.",
    sla: "Same day",
    owner: "Student → Assistant → Instructor",
    steps: [
      "Ask the classroom assistant to explain the concept at three levels: definition, worked example, and common misconception.",
      "Attempt one practice problem without notes to locate the precise gap.",
      "If the gap persists, post the specific question (not the whole topic) in the course channel.",
      "Book a 15-minute slot in the instructor's office hours if the answer is still unclear.",
      "Write a three-sentence summary in your own words — this is the real test of understanding.",
    ],
    tags: ["doubt", "concept", "explain", "office hours", "understanding"],
  },
  {
    id: "W2",
    type: "learning",
    title: "Prepare for an exam in 7 days",
    summary:
      "A spaced, retrieval-first revision plan that avoids the rereading trap.",
    sla: "7-day plan",
    owner: "Student",
    steps: [
      "Day 1 — Build a topic map from the syllabus and mark each topic red, amber, or green.",
      "Day 2–3 — Convert every red topic into questions, not notes.",
      "Day 4 — Do one full past paper under timed conditions, closed book.",
      "Day 5 — Mark it honestly; every lost mark becomes a flashcard.",
      "Day 6 — Re-test only the flashcards you got wrong, then explain two topics aloud.",
      "Day 7 — Light review, sleep eight hours, no new material.",
    ],
    tags: ["exam", "revision", "study plan", "past paper", "flashcards"],
  },
  {
    id: "W3",
    type: "learning",
    title: "Submit an assignment correctly",
    summary:
      "The checklist that prevents the most common avoidable mark losses.",
    sla: "Before deadline",
    owner: "Student",
    steps: [
      "Re-read the rubric and map each criterion to a section of your submission.",
      "Run the code from a clean environment; confirm it executes without manual fixes.",
      "Check the file naming convention and the required format (PDF vs source archive).",
      "Write the AI-use disclosure statement if any generative tool was used.",
      "Upload at least 24 hours early and verify the receipt on the portal.",
    ],
    tags: ["assignment", "submit", "rubric", "deadline", "upload"],
  },
  {
    id: "W4",
    type: "support",
    title: "Request a deadline extension",
    summary:
      "How to ask well, and what evidence makes an approval likely.",
    sla: "1 working day",
    owner: "Student → Instructor",
    steps: [
      "Submit the request at least 48 hours before the deadline via the student portal.",
      "State the course code, assessment name, and the requested new date.",
      "Attach supporting evidence (medical note, employer letter) if available.",
      "Propose a realistic recovery plan — what you will deliver and when.",
      "Await the decision; do not stop working while the request is pending.",
    ],
    tags: ["extension", "late", "deadline", "request", "evidence"],
  },
  {
    id: "W5",
    type: "support",
    title: "Appeal or query a grade",
    summary:
      "A calm, evidence-based route to a grade review.",
    sla: "7-day window",
    owner: "Student → Instructor → Registry",
    steps: [
      "Wait for the marked rubric to be released and read the feedback carefully.",
      "Identify the specific criterion you believe was misapplied — not the overall mark.",
      "Email the instructor within seven days with the assessment, criterion, and your reasoning.",
      "If unresolved, escalate to the module coordinator with the email thread attached.",
      "Registry handles clerical errors separately and at any time.",
    ],
    tags: ["grade", "appeal", "marks", "review", "feedback"],
  },
  {
    id: "W6",
    type: "support",
    title: "Get lab and software access",
    summary:
      "From 'I cannot run the code' to a working environment.",
    sla: "Same day",
    owner: "Student → Lab technician",
    steps: [
      "Check the setup guide on the course portal first — 80% of issues are covered there.",
      "Verify your account has the correct course role and repository permissions.",
      "Raise a helpdesk ticket with the exact error message and your OS version.",
      "Use the walk-in lab clinic (Block C, Room 214) for hardware issues.",
      "Escalate to the lab technician if the ticket is unresolved after one working day.",
    ],
    tags: ["lab", "access", "software", "install", "environment", "helpdesk"],
  },
  {
    id: "W7",
    type: "learning",
    title: "Form a project team",
    summary:
      "Team formation that reduces the chance of a painful semester.",
    sla: "Week 2",
    owner: "Student → Instructor",
    steps: [
      "Review the project brief and identify the skills the team actually needs.",
      "Form teams of the specified size; register the team on the portal by week two.",
      "Agree a written team charter: roles, meeting cadence, and conflict protocol.",
      "Set up the shared repository and give every member commit access.",
      "Book a ten-minute check-in with the instructor to validate scope.",
    ],
    tags: ["project", "team", "group", "charter", "repository"],
  },
  {
    id: "W8",
    type: "support",
    title: "Access tutoring and wellbeing support",
    summary:
      "Free, confidential help that most students underuse.",
    sla: "48 hours",
    owner: "Student → Support office",
    steps: [
      "Book a peer tutoring slot at the tutoring centre (Block C, Room 214).",
      "For wellbeing concerns, contact the student support office directly — no referral needed.",
      "For disability accommodations, register with accessibility services at the start of term.",
      "Follow up after two sessions; if it is not helping, ask to change tutor.",
      "Tell your instructor early if circumstances are affecting your work.",
    ],
    tags: ["tutoring", "wellbeing", "support", "counselling", "accommodation"],
  },
];

/* ------------------------------------------------------------------ */
/* 4. RATIONAL AGENT MODEL                                             */
/* ------------------------------------------------------------------ */
const AGENT_MODEL = {
  name: "Aria — Rational Classroom Agent",
  definition:
    "A rational agent is one that acts so as to maximise its expected performance measure, given the percept sequence and whatever built-in knowledge it has. Aria is designed as a goal-based, utility-aware, learning agent.",
  peas: {
    performance: [
      "Answer accuracy against the official course and rule documents",
      "Response latency (target under 1.5 s for cached answers)",
      "Student resolution rate without human escalation",
      "Groundedness — every factual claim traceable to a source",
      "Fairness across student groups and question types",
    ],
    environment: [
      "Course catalogue, rulebook, workflow documents",
      "Student questions in natural language",
      "Instructor announcements and deadline changes",
      "Learning-management-system state",
    ],
    actuators: [
      "Render an answer with citations",
      "Recommend a workflow and its steps",
      "Link to a form, portal, or office-hours slot",
      "Escalate to a human with a summary",
      "Refuse and redirect when the request is out of scope",
    ],
    sensors: [
      "Chat input (text)",
      "Selected course and role context",
      "Search queries over the knowledge base",
      "Feedback signals (helpful / not helpful)",
    ],
  },
  environmentProperties: [
    { name: "Partially observable", value: true, note: "The agent never sees the student's full academic record or intent." },
    { name: "Stochastic", value: true, note: "Natural language and student behaviour are not deterministic." },
    { name: "Sequential", value: true, note: "Earlier answers shape later questions in a session." },
    { name: "Dynamic", value: true, note: "Deadlines and announcements change while the agent is running." },
    { name: "Continuous", value: false, note: "The action space is discrete: answer, recommend, escalate, refuse." },
    { name: "Multi-agent", value: true, note: "Students, instructors, and support staff all act in the same environment." },
  ],
  architecture: [
    { layer: "Perception", detail: "Normalises the query: lowercasing, tokenisation, intent classification, course-code extraction." },
    { layer: "Belief state", detail: "Retrieves the top-k knowledge chunks and holds the conversation context." },
    { layer: "Deliberation", detail: "Scores candidate answers on relevance, grounding, and policy compliance." },
    { layer: "Decision", detail: "Selects an action: answer, recommend workflow, escalate, or refuse." },
    { layer: "Actuation", detail: "Renders the response with citations and suggested next actions." },
    { layer: "Learning", detail: "Logs feedback and failed retrievals to improve the knowledge base over time." },
  ],
  loop: [
    "PERCEIVE  →  read query, course context, and session history",
    "RETRIEVE  →  rank knowledge chunks by similarity to the query",
    "REASON    →  check policy: is this in scope, safe, and grounded?",
    "DECIDE    →  choose answer / workflow / escalate / refuse",
    "ACT       →  respond with citations and next steps",
    "LEARN     →  record feedback, update retrieval weights",
  ],
  performanceMeasure:
    "U = 0.40·accuracy + 0.25·groundedness + 0.20·resolution − 0.10·latency − 0.05·escalation",
};

/* ------------------------------------------------------------------ */
/* 5. MODERN AI PARADIGMS — EVALUATION                                 */
/* ------------------------------------------------------------------ */
const PARADIGMS = [
  {
    name: "Rule-based expert system",
    era: "1970s–",
    idea: "Encode human expertise as if–then rules over a curated knowledge base.",
    strengths: ["Fully explainable", "Deterministic and auditable", "No training data required", "Cheap to run"],
    weaknesses: ["Brittle outside known cases", "Manual maintenance burden", "No language understanding"],
    fit: 78,
    verdict: "Use it for the rules and workflow layer — policy must be predictable.",
  },
  {
    name: "Classical machine learning",
    era: "1990s–",
    idea: "Learn a mapping from features to labels using statistical models.",
    strengths: ["Strong on structured data", "Fast inference", "Well-understood evaluation"],
    weaknesses: ["Feature engineering heavy", "Weak on free text", "Needs labelled data"],
    fit: 55,
    verdict: "Useful for intent classification and routing, not for answering.",
  },
  {
    name: "Deep learning",
    era: "2010s–",
    idea: "Multi-layer neural networks learn representations directly from raw data.",
    strengths: ["Excellent pattern recognition", "Scales with data", "Strong speech and vision"],
    weaknesses: ["Opaque", "Data and compute hungry", "Hallucinates confidently"],
    fit: 62,
    verdict: "Overkill for a knowledge-retrieval assistant; valuable if adding speech.",
  },
  {
    name: "Large language models",
    era: "2020s–",
    idea: "Transformer models pretrained on vast text, aligned to follow instructions.",
    strengths: ["Natural dialogue", "Handles paraphrase and ambiguity", "Zero-shot generalisation"],
    weaknesses: ["Hallucination risk", "Cost and latency", "Knowledge cut-off", "Prompt injection"],
    fit: 88,
    verdict: "Best conversational layer — but only when grounded by retrieval.",
  },
  {
    name: "Retrieval-augmented generation",
    era: "2020s–",
    idea: "Retrieve authoritative passages first, then generate an answer conditioned on them.",
    strengths: ["Grounded answers", "Updatable without retraining", "Citable sources", "Reduces hallucination"],
    weaknesses: ["Retrieval quality is the ceiling", "Chunking is fiddly", "Still needs a generator"],
    fit: 95,
    verdict: "The correct architecture for this project. Grounding is non-negotiable for policy answers.",
  },
  {
    name: "Multi-agent systems",
    era: "1990s– / 2020s revival",
    idea: "Specialised agents coordinate — a router, a retriever, a policy checker, a writer.",
    strengths: ["Separation of concerns", "Easier to test each role", "Scales to complex workflows"],
    weaknesses: ["Coordination overhead", "Harder debugging", "Latency compounds"],
    fit: 74,
    verdict: "Adopt a light version: router + retriever + policy checker.",
  },
  {
    name: "Reinforcement learning",
    era: "1990s–",
    idea: "An agent learns a policy by maximising reward through interaction.",
    strengths: ["Learns sequential strategy", "Adapts to feedback", "Strong in games and control"],
    weaknesses: ["Sample inefficient", "Reward hacking", "Unsafe to train live on students"],
    fit: 30,
    verdict: "Not appropriate here — you cannot A/B test policy on real students.",
  },
  {
    name: "Knowledge graphs",
    era: "2000s–",
    idea: "Represent entities and relations explicitly so the system can traverse facts.",
    strengths: ["Precise relational queries", "Explainable paths", "Great for prerequisites"],
    weaknesses: ["Expensive to build", "Schema rigidity", "Poor at free text"],
    fit: 68,
    verdict: "Worth adding for prerequisite chains and course relationships.",
  },
  {
    name: "Hybrid neuro-symbolic",
    era: "Emerging",
    idea: "Combine neural language understanding with symbolic rules and retrieval.",
    strengths: ["Best of both", "Explainable and fluent", "Policy-safe"],
    weaknesses: ["Complex to build", "Multiple failure modes"],
    fit: 92,
    verdict: "This is what the shipped system actually is: local rules + retrieval + optional LLM.",
  },
];

/* ------------------------------------------------------------------ */
/* 6. ASSISTANT KNOWLEDGE BASE                                         */
/* ------------------------------------------------------------------ */
const KB = [
  {
    id: "kb-what",
    title: "What is the Smart Classroom Assistant?",
    tags: ["what", "about", "assistant", "aria", "help", "purpose"],
    text:
      "Aria is the AI-Based Smart Classroom Assistant for the Department of Computer Science & Engineering. It answers questions about courses, classroom rules, and learning or support workflows, and it always cites the source it used. It runs in two modes: a fully offline Local AI engine that needs no key, and an optional Gemini mode for richer conversation.",
  },
  {
    id: "kb-modes",
    title: "Local AI vs Gemini mode",
    tags: ["local", "gemini", "api", "key", "mode", "offline", "online"],
    text:
      "Local AI mode runs entirely in your browser. It uses intent detection plus TF-IDF retrieval over the built-in knowledge base, so it works offline, costs nothing, and never sends data anywhere. Gemini mode turns on by itself when the administrator has set the Gemini key in env.js; it calls Google's model with the knowledge base as context and handles paraphrase and follow-up questions better, but it needs an internet connection. If a Gemini call fails, the assistant automatically falls back to Local AI.",
  },
  {
    id: "kb-key",
    title: "Where is the Gemini API key set?",
    tags: ["key", "security", "privacy", "store", "localstorage", "safe"],
    text:
      "The Gemini API key is set once by the administrator in the env.js file. Users are never asked for a key and nothing is stored in the browser. With no key, Aria answers with the built-in Local AI.",
  },
  {
    id: "kb-rules",
    title: "Where can I find the classroom rules?",
    tags: ["rules", "policy", "classroom", "conduct", "find"],
    text:
      "Open the Classroom Rules section. There are fifteen rules across six categories: attendance, conduct, academic integrity, devices and tools, deadlines, and safety and wellbeing. Each rule shows its severity, the exact policy text, and the reason behind it. You can filter by category or search by keyword.",
  },
  {
    id: "kb-attendance",
    title: "Attendance requirement",
    tags: ["attendance", "absent", "75", "threshold", "eligibility", "exam"],
    text:
      "Rule R1: you must attend at least 75% of scheduled sessions in each course to be eligible for the final examination. Attendance is recorded in the first ten minutes. Approved documented absences (Rule R3) do not count against the threshold. Arriving more than ten minutes late is marked late, not absent (Rule R2).",
  },
  {
    id: "kb-ai-policy",
    title: "Can I use AI tools for my assignments?",
    tags: ["ai", "chatgpt", "gemini", "generative", "policy", "assignment", "disclose", "plagiarism"],
    text:
      "Rule R7: generative AI may be used for brainstorming, explanation, and editing. Any AI-generated content that appears in a submission must be disclosed in a short statement naming the tool and the extent of use. Rule R6 still applies: unless an assessment is marked as group work, the submitted work must be your own. Uncited reuse of external material is plagiarism under Rule R8.",
  },
  {
    id: "kb-late",
    title: "Late submission penalty",
    tags: ["late", "penalty", "deadline", "marks", "submission", "10%"],
    text:
      "Rule R11: submissions lose 10% of the available marks per calendar day late, up to three days. After 72 hours the submission is not accepted unless an extension was approved. To request an extension, see Rule R12 and workflow W4 — submit at least 48 hours before the deadline through the student portal.",
  },
  {
    id: "kb-extension",
    title: "How to request an extension",
    tags: ["extension", "request", "deadline", "more time", "evidence"],
    text:
      "Workflow W4: submit the request at least 48 hours before the deadline through the student portal. Include the course code, the assessment name, the requested new date, and supporting evidence such as a medical note or employer letter. Propose a realistic recovery plan. Decisions are returned within one working day, and you should keep working while the request is pending.",
  },
  {
    id: "kb-grade",
    title: "How to query or appeal a grade",
    tags: ["grade", "appeal", "marks", "review", "query", "dispute"],
    text:
      "Workflow W5: read the marked rubric first, then identify the specific criterion you believe was misapplied rather than the overall mark. Email the instructor within seven days of marks being published (Rule R13). If unresolved, escalate to the module coordinator with the thread attached. Registry handles clerical errors separately at any time.",
  },
  {
    id: "kb-study",
    title: "How to prepare for an exam",
    tags: ["exam", "study", "revise", "revision", "prepare", "plan", "past paper"],
    text:
      "Workflow W2 gives a seven-day retrieval-first plan. Day 1: build a topic map and rate each topic red, amber, or green. Days 2–3: turn red topics into questions, not notes. Day 4: a full past paper, timed and closed book. Day 5: mark it honestly and turn every lost mark into a flashcard. Day 6: re-test only the wrong cards and explain two topics aloud. Day 7: light review and eight hours of sleep.",
  },
  {
    id: "kb-doubt",
    title: "I don't understand a concept",
    tags: ["doubt", "confused", "understand", "concept", "explain", "stuck", "help"],
    text:
      "Workflow W1: ask the assistant to explain the concept at three levels — definition, worked example, and common misconception. Then attempt one practice problem without notes to locate the precise gap. If it persists, post the specific question in the course channel, and book a fifteen-minute office-hours slot if still unclear. Finish by writing a three-sentence summary in your own words.",
  },
  {
    id: "kb-lab",
    title: "Lab and software access problems",
    tags: ["lab", "access", "software", "install", "environment", "error", "helpdesk", "ticket"],
    text:
      "Workflow W6: check the setup guide on the course portal first, since most issues are covered there. Verify your account has the correct course role and repository permissions. Raise a helpdesk ticket with the exact error message and your operating system version. The walk-in lab clinic is in Block C, Room 214. Escalate to the lab technician if unresolved after one working day.",
  },
  {
    id: "kb-team",
    title: "Forming a project team",
    tags: ["project", "team", "group", "partner", "form", "charter"],
    text:
      "Workflow W7: review the brief and identify the skills the team needs, form teams of the specified size, and register the team on the portal by week two. Agree a written charter covering roles, meeting cadence, and a conflict protocol. Set up the shared repository with commit access for everyone, and book a ten-minute scope check-in with the instructor.",
  },
  {
    id: "kb-support",
    title: "Tutoring and wellbeing support",
    tags: ["tutoring", "wellbeing", "counselling", "mental", "health", "support", "stress", "anxiety"],
    text:
      "Workflow W8: peer tutoring is free and bookable at the tutoring centre in Block C, Room 214. For wellbeing concerns, contact the student support office directly — no referral is needed, and it is confidential. For disability accommodations, register with accessibility services at the start of term. Tell your instructor early if circumstances are affecting your work (Rule R15).",
  },
  {
    id: "kb-courses",
    title: "Which courses are offered this semester?",
    tags: ["courses", "subjects", "modules", "offer", "list", "semester", "catalogue"],
    text:
      "Six courses are offered this semester: CS-301 Artificial Intelligence (Dr. Meera Raman), CS-330 Machine Learning (Prof. Daniel Okafor), CS-210 Data Structures & Algorithms (Dr. Aisha Karim), CS-410 Software Engineering (Prof. Lena Fischer), MATH-204 Discrete Mathematics (Dr. Ravi Menon), and ENG-101 Technical Communication (Ms. Clara Bennett). Open the Courses section for schedules, rooms, assessment weights, and prerequisites.",
  },
  {
    id: "kb-cs301",
    title: "CS-301 Artificial Intelligence",
    tags: ["cs-301", "cs301", "artificial intelligence", "ai course", "raman"],
    text:
      "CS-301 Artificial Intelligence is a four-credit core course taught by Dr. Meera Raman, Monday and Wednesday 10:00–11:30 in Block A Lecture Hall 2. Prerequisites are CS-210 and MATH-204. Assessment: four assignments (20%), midterm (25%), agent project (25%), final exam (30%). Office hours are Tuesday 14:00–16:00 in Block A-311.",
  },
  {
    id: "kb-cs330",
    title: "CS-330 Machine Learning",
    tags: ["cs-330", "cs330", "machine learning", "ml course", "okafor"],
    text:
      "CS-330 Machine Learning is a four-credit core course taught by Prof. Daniel Okafor, Tuesday and Thursday 09:00–10:30 in Block B Lab 105. Prerequisites are CS-210 and STAT-201. Assessment: six labs (25%), midterm (20%), project (25%), final exam (30%). Office hours are Thursday 15:00–17:00 in Block B-208.",
  },
  {
    id: "kb-cs210",
    title: "CS-210 Data Structures & Algorithms",
    tags: ["cs-210", "cs210", "data structures", "algorithms", "karim"],
    text:
      "CS-210 Data Structures & Algorithms is a four-credit core course taught by Dr. Aisha Karim, Monday, Wednesday and Friday 08:30–09:45 in Block A Lecture Hall 1. Prerequisite is CS-101. Assessment: weekly problem sets (20%), two lab exams (20%), midterm (25%), final exam (35%). Office hours are Friday 13:00–15:00 in Block A-305.",
  },
  {
    id: "kb-cs410",
    title: "CS-410 Software Engineering",
    tags: ["cs-410", "cs410", "software engineering", "fischer", "sprint"],
    text:
      "CS-410 Software Engineering is a three-credit core studio course taught by Prof. Lena Fischer, Tuesday and Thursday 11:00–12:15 in Block C Studio 3. Prerequisite is CS-210. Assessment: sprint deliverables (40%), code review participation (10%), architecture report (20%), final demo and defence (30%). Studio hours are Wednesday 14:00–17:00.",
  },
  {
    id: "kb-math204",
    title: "MATH-204 Discrete Mathematics",
    tags: ["math-204", "math204", "discrete", "mathematics", "menon", "proof"],
    text:
      "MATH-204 Discrete Mathematics is a three-credit foundation course taught by Dr. Ravi Menon, Monday and Wednesday 13:00–14:15 in Block D Room 12. Prerequisite is MATH-101. Assessment: fortnightly quizzes (20%), problem sets (20%), midterm (25%), final exam (35%). Office hours are Thursday 10:00–12:00 in Block D-208.",
  },
  {
    id: "kb-eng101",
    title: "ENG-101 Technical Communication",
    tags: ["eng-101", "eng101", "communication", "writing", "bennett", "report"],
    text:
      "ENG-101 Technical Communication is a two-credit foundation course taught by Ms. Clara Bennett, Friday 11:00–12:30 in Block E Seminar 4. There are no prerequisites. Assessment: writing portfolio (40%), group presentation (25%), final report (35%). Office hours are Friday 13:00–14:00 in Block E-110.",
  },
  {
    id: "kb-agent",
    title: "What is the rational agent model?",
    tags: ["agent", "rational", "peas", "model", "architecture", "design"],
    text:
      "Aria is specified with PEAS — performance measure, environment, actuators, and sensors. Its environment is partially observable, stochastic, sequential, dynamic, and multi-agent. The architecture has six layers: perception, belief state, deliberation, decision, actuation, and learning. Its utility function is U = 0.40·accuracy + 0.25·groundedness + 0.20·resolution − 0.10·latency − 0.05·escalation. The full model is in the Rational Agent section.",
  },
  {
    id: "kb-paradigms",
    title: "Which AI paradigms were evaluated?",
    tags: ["paradigm", "evaluate", "compare", "rag", "llm", "deep learning", "symbolic"],
    text:
      "Nine paradigms were scored against this project's needs: rule-based expert systems (78), classical ML (55), deep learning (62), large language models (88), retrieval-augmented generation (95), multi-agent systems (74), reinforcement learning (30), knowledge graphs (68), and hybrid neuro-symbolic (92). RAG scores highest because classroom policy answers must be grounded and citable. The shipped system is hybrid: local rules plus retrieval, with an optional LLM.",
  },
  {
    id: "kb-contact",
    title: "How do I contact support?",
    tags: ["contact", "email", "support", "helpdesk", "hours", "who"],
    text:
      "Classroom support is available at classroom-support@northfield.edu, Monday to Friday 09:00–17:00. The tutoring centre and walk-in lab clinic are in Block C, Room 214. For course-specific questions, contact the instructor directly during their office hours — every course card lists the exact slot and room.",
  },
  {
    id: "kb-outofscope",
    title: "Out-of-scope requests",
    tags: ["medical", "legal", "personal", "advice", "out of scope"],
    text:
      "Aria answers questions about courses, classroom rules, and learning or support workflows. It does not give medical, legal, or financial advice, and it cannot change grades, approve extensions, or access personal records. For those matters it will direct you to the correct human office.",
  },
];
