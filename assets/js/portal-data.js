/* ==========================================================================
   Aria — Portal Data Layer
   Academic programmes, timetable, materials, announcements, staff queues,
   student roster, role permissions and navigation definitions.
   All UI text is English.
   ========================================================================== */

/* ---------------------------------------------------------------- programmes */
const PROGRAMMES = {
  "BTECH-CSE": {
    code: "BTECH-CSE",
    name: "B.Tech — Computer Science & Engineering",
    short: "B.Tech CSE",
    years: 4,
    department: "Computer Science & Engineering",
    emailDomain: "northfield.edu",
    coreCourses: ["CS-301", "CS-330", "CS-210", "MATH-204", "ENG-101"]
  },
  "BSC-CS": {
    code: "BSC-CS",
    name: "B.Sc. — Computer Science",
    short: "B.Sc. CS",
    years: 3,
    department: "Computer Science",
    emailDomain: "northfield.edu",
    coreCourses: ["CS-210", "CS-301", "MATH-204", "ENG-101"]
  },
  "BSC-DS": {
    code: "BSC-DS",
    name: "B.Sc. — Data Science",
    short: "B.Sc. Data Science",
    years: 3,
    department: "Data Science",
    emailDomain: "northfield.edu",
    coreCourses: ["CS-330", "CS-410", "MATH-204", "ENG-101"]
  },
  "MTECH-CSE": {
    code: "MTECH-CSE",
    name: "M.Tech — Computer Science & Engineering",
    short: "M.Tech CSE",
    years: 2,
    department: "Computer Science & Engineering",
    emailDomain: "northfield.edu",
    coreCourses: ["CS-410", "CS-330"]
  }
};

/* ----------------------------------------------------------------- timetable */
/* day: 1 = Monday … 5 = Friday. Times are 24h "HH:MM". */
const TIMETABLE = [
  { id: "T01", course: "CS-210", day: 1, start: "08:30", end: "09:45", room: "Block A · Lecture Hall 1", type: "Lecture", programme: "BTECH-CSE", weeks: "1-14" },
  { id: "T02", course: "CS-301", day: 1, start: "10:00", end: "11:30", room: "Block A · Lecture Hall 2", type: "Lecture", programme: "BTECH-CSE", weeks: "1-14" },
  { id: "T03", course: "MATH-204", day: 1, start: "13:00", end: "14:15", room: "Block D · Room 12", type: "Lecture", programme: "BTECH-CSE", weeks: "1-14" },
  { id: "T04", course: "CS-330", day: 1, start: "15:00", end: "16:30", room: "Block B · Lab 105", type: "Lab", programme: "BSC-DS", weeks: "1-14" },

  { id: "T05", course: "CS-330", day: 2, start: "09:00", end: "10:30", room: "Block B · Lab 105", type: "Lecture", programme: "BSC-DS", weeks: "1-14" },
  { id: "T06", course: "CS-410", day: 2, start: "11:00", end: "12:15", room: "Block C · Studio 3", type: "Lecture", programme: "MTECH-CSE", weeks: "1-14" },
  { id: "T07", course: "CS-210", day: 2, start: "14:00", end: "15:30", room: "Block B · Lab 204", type: "Lab", programme: "BSC-CS", weeks: "1-14" },

  { id: "T08", course: "CS-210", day: 3, start: "08:30", end: "09:45", room: "Block A · Lecture Hall 1", type: "Lecture", programme: "BTECH-CSE", weeks: "1-14" },
  { id: "T09", course: "CS-301", day: 3, start: "10:00", end: "11:30", room: "Block A · Lecture Hall 2", type: "Lecture", programme: "BTECH-CSE", weeks: "1-14" },
  { id: "T10", course: "MATH-204", day: 3, start: "13:00", end: "14:15", room: "Block D · Room 12", type: "Lecture", programme: "BSC-CS", weeks: "1-14" },
  { id: "T11", course: "CS-301", day: 3, start: "15:30", end: "16:30", room: "Block A · Lecture Hall 2", type: "Tutorial", programme: "BTECH-CSE", weeks: "3-14" },

  { id: "T12", course: "CS-330", day: 4, start: "09:00", end: "10:30", room: "Block B · Lab 105", type: "Lecture", programme: "BTECH-CSE", weeks: "1-14" },
  { id: "T13", course: "CS-410", day: 4, start: "11:00", end: "12:15", room: "Block C · Studio 3", type: "Lecture", programme: "MTECH-CSE", weeks: "1-14" },
  { id: "T14", course: "CS-410", day: 4, start: "14:00", end: "15:30", room: "Block C · Studio 3", type: "Lab", programme: "MTECH-CSE", weeks: "2-14" },
  { id: "T15", course: "CS-330", day: 4, start: "15:30", end: "16:30", room: "Block B · Lab 105", type: "Tutorial", programme: "BSC-DS", weeks: "4-14" },

  { id: "T16", course: "CS-210", day: 5, start: "08:30", end: "09:45", room: "Block A · Lecture Hall 1", type: "Lecture", programme: "BTECH-CSE", weeks: "1-14" },
  { id: "T17", course: "ENG-101", day: 5, start: "11:00", end: "12:30", room: "Block E · Seminar 4", type: "Lecture", programme: "BTECH-CSE", weeks: "1-12" },
  { id: "T18", course: "MATH-204", day: 5, start: "13:00", end: "14:00", room: "Block D · Room 12", type: "Tutorial", programme: "BTECH-CSE", weeks: "2-14" },
  { id: "T19", course: "ENG-101", day: 5, start: "15:00", end: "16:00", room: "Block E · Seminar 4", type: "Tutorial", programme: "BSC-CS", weeks: "1-12" }
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ----------------------------------------------------------------- materials */
/* uploadedBy must match the instructor name in COURSES. */
const MATERIALS = [
  { id: "M01", course: "CS-301", title: "Week 1 — Course Outline & Assessment Plan", type: "PDF", uploadedBy: "Dr. Meera Raman", week: 1, size: "412 KB", tags: ["outline", "syllabus", "assessment"] },
  { id: "M02", course: "CS-301", title: "Week 3 — Search Algorithms & Heuristics", type: "Slides", uploadedBy: "Dr. Meera Raman", week: 3, size: "2.1 MB", tags: ["search", "heuristics", "bfs", "dfs", "slides"] },
  { id: "M03", course: "CS-301", title: "Lab 4 — A* Pathfinding Worksheet", type: "Worksheet", uploadedBy: "Dr. Meera Raman", week: 4, size: "640 KB", tags: ["astar", "pathfinding", "lab", "worksheet"] },
  { id: "M04", course: "CS-330", title: "Week 2 — Supervised Learning Notes", type: "PDF", uploadedBy: "Prof. Daniel Okafor", week: 2, size: "980 KB", tags: ["supervised", "learning", "regression", "notes"] },
  { id: "M05", course: "CS-330", title: "Week 5 — Model Evaluation & Cross-Validation", type: "Slides", uploadedBy: "Prof. Daniel Okafor", week: 5, size: "3.4 MB", tags: ["evaluation", "cross-validation", "metrics", "slides"] },
  { id: "M06", course: "CS-210", title: "Week 1 — Complexity Analysis Primer", type: "PDF", uploadedBy: "Dr. Aisha Karim", week: 1, size: "1.2 MB", tags: ["complexity", "big-o", "primer"] },
  { id: "M07", course: "CS-210", title: "Lab 2 — Linked Lists & Stacks Exercises", type: "Worksheet", uploadedBy: "Dr. Aisha Karim", week: 2, size: "520 KB", tags: ["linked list", "stack", "lab", "exercises"] },
  { id: "M08", course: "CS-210", title: "Week 6 — Graph Algorithms Starter Kit", type: "Archive", uploadedBy: "Dr. Aisha Karim", week: 6, size: "5.8 MB", tags: ["graph", "dijkstra", "kit", "code"] },
  { id: "M09", course: "CS-410", title: "Week 2 — Requirements Engineering Slides", type: "Slides", uploadedBy: "Prof. Lena Fischer", week: 2, size: "4.6 MB", tags: ["requirements", "engineering", "slides"] },
  { id: "M10", course: "CS-410", title: "Assignment 1 — Architecture Review Brief", type: "PDF", uploadedBy: "Prof. Lena Fischer", week: 4, size: "310 KB", tags: ["assignment", "architecture", "review", "brief"] },
  { id: "M11", course: "MATH-204", title: "Week 1 — Logic & Proof Cheat Sheet", type: "PDF", uploadedBy: "Dr. Ravi Menon", week: 1, size: "280 KB", tags: ["logic", "proof", "cheatsheet"] },
  { id: "M12", course: "MATH-204", title: "Problem Set 3 — Graph Theory & Counting", type: "Worksheet", uploadedBy: "Dr. Ravi Menon", week: 3, size: "410 KB", tags: ["graph theory", "counting", "problem set"] },
  { id: "M13", course: "ENG-101", title: "Week 1 — Technical Writing Guide", type: "PDF", uploadedBy: "Ms. Clara Bennett", week: 1, size: "760 KB", tags: ["writing", "guide", "technical"] },
  { id: "M14", course: "ENG-101", title: "Week 4 — Referencing & Citation Workshop", type: "Slides", uploadedBy: "Ms. Clara Bennett", week: 4, size: "1.1 MB", tags: ["citation", "referencing", "workshop"] }
];

/* ------------------------------------------------------------ announcements */
const ANNOUNCEMENTS = [
  { id: "A01", title: "Mid-semester examinations begin 24 March", body: "The examination timetable is published on the student portal. Seating plans will be posted outside Block A two days before each paper.", author: "Registry Office", role: "management", date: "2025-03-10", audience: ["student", "lecturer", "staff"], pinned: true },
  { id: "A02", title: "CS-301 tutorial moves to Block A · Lecture Hall 2", body: "From week 3 the Wednesday 15:30 tutorial for CS-301 runs in Lecture Hall 2 instead of the seminar room. Attendance is taken at the door.", author: "Dr. Meera Raman", role: "lecturer", date: "2025-03-08", audience: ["student", "lecturer"], pinned: false, course: "CS-301", authorEmail: "meera.raman@northfield.edu", kind: "rescheduled" },
  { id: "A03", title: "Library extended hours during assessment week", body: "The main library stays open until 23:00 from 20 March to 4 April. Quiet-study bookings open 48 hours in advance.", author: "Facilities Team", role: "staff", date: "2025-03-07", audience: ["student", "lecturer", "staff"], pinned: false },
  { id: "A04", title: "New AI assistant available in every panel", body: "Aria now answers role-specific questions — timetable, missing materials, attendance policy and escalation routes — from inside each dashboard.", author: "Platform Team", role: "admin", date: "2025-03-05", audience: ["admin", "management", "lecturer", "staff", "student"], pinned: true },
  { id: "A05", title: "Attendance registers close every Friday at 17:00", body: "Lecturers must submit weekly attendance before the Friday cut-off. Late submissions are flagged to the Management panel.", author: "Academic Office", role: "management", date: "2025-03-04", audience: ["lecturer", "management"], pinned: false }
];

/* -------------------------------------------------------------- staff tasks */
const STAFF_TASKS = [
  { id: "S01", title: "Projector failure — Block A · Lecture Hall 2", category: "Facilities", priority: "High", status: "In progress", raisedBy: "Dr. Meera Raman", opened: "2025-03-11", sla: "4 hours" },
  { id: "S02", title: "Lab 204 workstations 7-12 offline", category: "IT", priority: "High", status: "Open", raisedBy: "Dr. Aisha Karim", opened: "2025-03-11", sla: "4 hours" },
  { id: "S03", title: "Access card not working — Block D", category: "Security", priority: "Medium", status: "Open", raisedBy: "Dr. Ravi Menon", opened: "2025-03-10", sla: "1 working day" },
  { id: "S04", title: "Extra chairs needed for CS-410 lecture", category: "Facilities", priority: "Low", status: "Resolved", raisedBy: "Prof. Lena Fischer", opened: "2025-03-09", sla: "2 working days" },
  { id: "S05", title: "Timetable clash reported — Thursday 11:00", category: "Academic", priority: "Medium", status: "In progress", raisedBy: "Registry", opened: "2025-03-08", sla: "2 working days" },
  { id: "S06", title: "Print quota exhausted — Block B printer", category: "IT", priority: "Low", status: "Open", raisedBy: "Student Union", opened: "2025-03-07", sla: "3 working days" }
];

/* ------------------------------------------------------------------ roster */
const STUDENT_ROSTER = [
  { id: "STU-1001", name: "Ananya Sharma", programme: "BTECH-CSE", year: 3, email: "ananya.sharma@northfield.edu", courses: ["CS-301", "CS-330", "MATH-204"], attendance: 94, gpa: 8.7 },
  { id: "STU-1002", name: "Rohan Verma", programme: "BTECH-CSE", year: 3, email: "rohan.verma@northfield.edu", courses: ["CS-301", "CS-210", "MATH-204"], attendance: 81, gpa: 7.9 },
  { id: "STU-1003", name: "Priya Nair", programme: "BSC-DS", year: 2, email: "priya.nair@northfield.edu", courses: ["CS-330", "CS-410", "MATH-204"], attendance: 96, gpa: 9.1 },
  { id: "STU-1004", name: "Kabir Ahmed", programme: "BTECH-CSE", year: 3, email: "kabir.ahmed@northfield.edu", courses: ["CS-301", "CS-330", "ENG-101"], attendance: 68, gpa: 6.4 },
  { id: "STU-1005", name: "Mei Lin", programme: "BSC-CS", year: 2, email: "mei.lin@northfield.edu", courses: ["CS-210", "MATH-204", "ENG-101"], attendance: 89, gpa: 8.2 },
  { id: "STU-1006", name: "Daniel Costa", programme: "MTECH-CSE", year: 1, email: "daniel.costa@northfield.edu", courses: ["CS-410", "CS-330"], attendance: 92, gpa: 8.9 },
  { id: "STU-1007", name: "Sara Haddad", programme: "BTECH-CSE", year: 3, email: "sara.haddad@northfield.edu", courses: ["CS-301", "CS-210", "ENG-101"], attendance: 75, gpa: 7.2 },
  { id: "STU-1008", name: "Tomas Novak", programme: "BSC-DS", year: 2, email: "tomas.novak@northfield.edu", courses: ["CS-330", "CS-410", "MATH-204"], attendance: 58, gpa: 5.8 },
  { id: "STU-1009", name: "Ishita Rao", programme: "BSC-CS", year: 2, email: "ishita.rao@northfield.edu", courses: ["CS-210", "CS-301", "MATH-204"], attendance: 98, gpa: 9.4 },
  { id: "STU-1010", name: "Omar Farouk", programme: "MTECH-CSE", year: 1, email: "omar.farouk@northfield.edu", courses: ["CS-410"], attendance: 84, gpa: 8.1 }
];

/* ------------------------------------------------------------- permissions */
/* Admin sees everything Management sees, plus audit log and system settings. */
const PERMISSIONS = {
  admin: ["overview", "users", "courses", "timetable", "materials", "attendance", "announcements", "workflows", "reports", "audit", "settings", "ai"],
  management: ["overview", "users", "courses", "timetable", "materials", "attendance", "announcements", "workflows", "reports", "ai"],
  lecturer: ["overview", "schedule", "my-courses", "materials", "attendance", "students", "announcements", "ai"],
  staff: ["overview", "workflows", "facilities", "attendance", "announcements", "ai"],
  student: ["overview", "schedule", "my-courses", "materials", "announcements", "grades", "ai", "solver"]
};

const NAV_ITEMS = {
  overview: { label: "Overview", icon: "grid" },
  users: { label: "User Management", icon: "users" },
  courses: { label: "Course Catalogue", icon: "book" },
  timetable: { label: "Master Timetable", icon: "calendar" },
  materials: { label: "Course Materials", icon: "folder" },
  attendance: { label: "Attendance", icon: "check" },
  announcements: { label: "Announcements", icon: "megaphone" },
  workflows: { label: "Support Queue", icon: "lifebuoy" },
  reports: { label: "Reports", icon: "chart" },
  audit: { label: "Audit Log", icon: "shield" },
  settings: { label: "System Settings", icon: "gear" },
  schedule: { label: "My Timetable", icon: "calendar" },
  "my-courses": { label: "My Courses", icon: "book" },
  students: { label: "My Students", icon: "users" },
  facilities: { label: "Facilities & Rooms", icon: "building" },
  grades: { label: "Grades", icon: "chart" },
  ai: { label: "Ask with AI", icon: "spark" },
  solver: { label: "AI Solver", icon: "solver", href: "solver.html" }
};

const ROLE_META = {
  admin: { label: "Administrator", tier: "Admin tier", blurb: "Full visibility across the institution, including audit trail and system configuration." },
  management: { label: "Management", tier: "Admin tier", blurb: "Runs day-to-day operations — users, courses, timetables, approvals and reports." },
  lecturer: { label: "Lecturer", tier: "Teaching", blurb: "Own timetable, own courses, class rosters, attendance and material uploads." },
  staff: { label: "Staff", tier: "Operations", blurb: "Support queue, facilities, room readiness and attendance operations." },
  student: { label: "Student", tier: "Learner", blurb: "Personal timetable, enrolled courses, materials, grades and the Aria assistant." }
};

/* --------------------------------------------------------------- audit log */
const AUDIT_LOG = [
  { id: "L01", at: "2025-03-11 09:14", actor: "management@northfield.edu", action: "Created user", target: "lecturer — Dr. Meera Raman", ip: "10.4.2.19" },
  { id: "L02", at: "2025-03-11 08:52", actor: "admin@northfield.edu", action: "Changed role", target: "staff@northfield.edu → Staff", ip: "10.4.2.4" },
  { id: "L03", at: "2025-03-10 17:31", actor: "management@northfield.edu", action: "Published announcement", target: "A05 — Attendance registers close Friday", ip: "10.4.2.19" },
  { id: "L04", at: "2025-03-10 15:08", actor: "admin@northfield.edu", action: "Updated timetable", target: "T11 — CS-301 tutorial → Lecture Hall 2", ip: "10.4.2.4" },
  { id: "L05", at: "2025-03-09 11:47", actor: "admin@northfield.edu", action: "Rotated API key", target: "Gemini integration", ip: "10.4.2.4" },
  { id: "L06", at: "2025-03-08 10:22", actor: "management@northfield.edu", action: "Approved material", target: "M10 — CS-410 Assignment 1 brief", ip: "10.4.2.19" }
];
