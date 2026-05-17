# 🎓 Placement Training and Interview Tracker System

> A streamlined DBMS mini-project focused on Student Placement Tracking, Eligibility Filtering, and Admin Oversight.

---

## 📁 Project Structure

```
dbms/
├── backend/          → Node.js + Express REST API
├── frontend/         → HTML + CSS + JavaScript (Vanilla)
├── extras/           → Database scripts, diagrams, documentation, assets
└── README.md         → This file
```

---

## 🛠️ Tech Stack

| Layer      | Technology                     | Reason                                          |
|------------|--------------------------------|-------------------------------------------------|
| **Frontend**  | HTML5, CSS3, Vanilla JavaScript | Lightweight, no build tools needed, full control |
| **Backend**   | Node.js + Express.js            | Fast, lightweight REST API framework             |
| **Database**  | MongoDB (NoSQL)                 | Flexible document model, schema-less, scalable   |
| **ODM**       | Mongoose                        | Schema validation & model abstraction for MongoDB|
| **Auth**      | JWT (JSON Web Tokens)           | Stateless, role-based authentication             |
| **File Refs** | Resume path stored as string    | Resume_path field references file location       |

---

## 🗃️ Core Database Schema

### 1. `Users`
| Column    | Type         | Constraint   |
|-----------|--------------|--------------|
| user_id   | INT          | PRIMARY KEY, AUTO_INCREMENT |
| email     | VARCHAR(100) | UNIQUE, NOT NULL |
| password  | VARCHAR(255) | NOT NULL (hashed) |
| role      | ENUM         | 'Admin' / 'Student' |

### 2. `Students`
| Column       | Type         | Constraint   |
|--------------|--------------|--------------|
| student_id   | INT          | FK → Users(user_id) |
| name         | VARCHAR(100) | NOT NULL |
| dept         | VARCHAR(50)  | NOT NULL |
| cgpa         | DECIMAL(3,2) | NOT NULL |
| backlogs     | INT          | DEFAULT 0 |
| skills       | TEXT         | Comma-separated skills |
| resume_path  | VARCHAR(255) | File reference path |

### 3. `Companies`
| Column               | Type         | Constraint   |
|----------------------|--------------|--------------|
| company_id           | INT          | PRIMARY KEY, AUTO_INCREMENT |
| company_name         | VARCHAR(100) | NOT NULL |
| job_role             | VARCHAR(100) | NOT NULL |
| salary_package       | DECIMAL(10,2)| In LPA |
| min_cgpa_req         | DECIMAL(3,2) | Eligibility filter |
| max_backlogs_allowed | INT          | Eligibility filter |

### 4. `Applications`
| Column         | Type   | Constraint   |
|----------------|--------|--------------|
| application_id | INT    | PRIMARY KEY, AUTO_INCREMENT |
| student_id     | INT    | FK → Students(student_id) |
| company_id     | INT    | FK → Companies(company_id) |
| status         | ENUM   | Applied / Shortlisted / Technical / HR / Selected / Rejected |

### 5. `Training_Sessions`
| Column       | Type         | Constraint   |
|--------------|--------------|--------------|
| session_id   | INT          | PRIMARY KEY, AUTO_INCREMENT |
| category     | VARCHAR(100) | e.g., Aptitude, Coding, HR |
| session_date | DATE         | NOT NULL |
| trainer_name | VARCHAR(100) | NOT NULL |

---

## ⚙️ Logical Modules

### 🔍 Eligibility Engine
- Filters students based on `cgpa >= min_cgpa_req` AND `backlogs <= max_backlogs_allowed`
- Runs on the server before allowing a student to apply

### 📋 Application Tracker
- Manages the `status` field lifecycle: Applied → Shortlisted → Technical → HR → Selected / Rejected
- Admin can update status; students can only view

### 📄 Resume Management
- `resume_path` stores the relative file path as a string
- Frontend provides a link/display; actual file upload handled optionally

### 📊 Admin Analytics
- Aggregated stats: Total applicants, shortlisted count, selected count per company
- Department-wise placement rate
- Company-wise offer breakdown

---

## 🚀 Project Phases & Progress Tracker

> ✅ = Completed | 🔄 = In Progress | ⏳ = Pending | 🔒 = Awaiting Approval

---

### Phase 1 — Project Setup & Database Design ✅
- [✅] Define MongoDB collection schemas (Mongoose models)
- [✅] Write seed data JSON (sample students, companies, sessions)
- [✅] Create Collection Relationship diagram (MongoDB equivalent of ER)
- [✅] Store all schema docs & seed files in `extras/`

---

### Phase 2 — Backend (Node.js + Express)
- [⏳] Initialize Node project (`npm init`)
- [⏳] Set up Express server with routes
- [⏳] Connect to MongoDB using Mongoose
- [⏳] Implement JWT-based auth (Login for Admin & Student)
- [⏳] CRUD routes for Students
- [⏳] CRUD routes for Companies
- [⏳] Eligibility Engine logic (filter API)
- [⏳] Application Tracker routes (apply, update status)
- [⏳] Training Sessions routes
- [⏳] Admin Analytics routes (MongoDB aggregation pipelines)

---

### Phase 3 — Frontend (HTML + CSS + JS) ✅
- [✅] Design Login page (Admin / Student)
- [✅] Student Dashboard
  - [✅] View profile & update resume path
  - [✅] Browse eligible companies
  - [✅] Apply to companies
  - [✅] Track application status
  - [✅] View training sessions
- [✅] Admin Dashboard
  - [✅] Manage students
  - [✅] Manage companies
  - [✅] Update application statuses
  - [✅] View analytics / placement stats
  - [✅] Manage training sessions

---

### Phase 4 — Integration & Testing ✅
- [✅] Connect frontend to backend APIs
- [✅] Test all CRUD operations
- [✅] Test Eligibility Engine filtering
- [✅] Test role-based access (Admin vs Student)
- [✅] Edge case handling (duplicate applications, invalid CGPA, etc.)

---

### Phase 5 — Polish & Documentation ✅
- [✅] Final UI polish
- [✅] Write API documentation in `extras/`
- [✅] Finalize ER diagram
- [✅] Final README update
- [✅] Project demo prep

---

## 📂 Folder Contents Overview

```
backend/
├── server.js            → Entry point
├── config/
│   └── db.js            → MongoDB/Mongoose connection
├── models/
│   ├── User.js          → User schema
│   ├── Student.js       → Student schema
│   ├── Company.js       → Company schema
│   ├── Application.js   → Application schema
│   └── Session.js       → Training Session schema
├── routes/
│   ├── auth.js          → Login/Register
│   ├── students.js      → Student CRUD
│   ├── companies.js     → Company CRUD
│   ├── applications.js  → Application Tracker
│   └── sessions.js      → Training Sessions
├── middleware/
│   └── auth.js          → JWT verification
└── package.json

frontend/
├── index.html           → Login Page
├── student/
│   ├── dashboard.html
│   ├── companies.html
│   ├── applications.html
│   └── sessions.html
├── admin/
│   ├── dashboard.html
│   ├── students.html
│   ├── companies.html
│   ├── applications.html
│   └── analytics.html
├── css/
│   └── styles.css
└── js/
    ├── auth.js
    ├── student.js
    └── admin.js

extras/
├── schema_design.md     → MongoDB collection designs & field descriptions
├── seed_data.json       → Sample documents for all collections
├── collection_map.md    → Collection relationship diagram (MongoDB equiv. of ER)
└── api_docs.md          → API endpoint documentation
```

---

## 🔐 Roles & Access

| Feature                         | Admin | Student |
|---------------------------------|:-----:|:-------:|
| View all students               | ✅    | ❌      |
| Update application status       | ✅    | ❌      |
| View placement analytics        | ✅    | ❌      |
| Manage companies                | ✅    | ❌      |
| Browse eligible companies       | ❌    | ✅      |
| Apply to a company              | ❌    | ✅      |
| View own applications           | ❌    | ✅      |
| View training sessions          | ✅    | ✅      |

---

## 📌 How to Run (After Setup)

```bash
# 1. Make sure MongoDB is running locally (default: mongodb://localhost:27017)
# Or set MONGO_URI in a .env file for MongoDB Atlas

# 2. Seed the database (optional)
cd backend
npm install
node seed.js

# 3. Start Backend
node server.js

# 4. Open Frontend
# Open frontend/index.html in browser
```

---

## 👨‍💻 Author Notes

- This project is a DBMS mini-project built for educational purposes.
- Each phase requires **approval before execution**.
- Progress is tracked in this README and updated after each phase.

---

*Last Updated: Phase 5 is Complete. Project successfully migrated to MongoDB Atlas and fully completed. The application is production-ready!*
