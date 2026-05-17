# 🗺️ MongoDB Collection Relationship Map

> MongoDB is document-oriented (NoSQL), so relationships are represented via **ObjectId references** instead of SQL foreign keys. This document maps out all inter-collection relationships.

---

## 📊 Collection Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS COLLECTION                         │
│  _id (ObjectId)  |  email  |  password  |  role                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ 1-to-1
                         │ students.userId → users._id
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STUDENTS COLLECTION                        │
│  _id  |  userId  |  name  |  dept  |  cgpa  |  backlogs        │
│       |  skills[]  |  resumePath                                │
└────────────────────────┬────────────────────────────────────────┘
                         │ 1-to-Many
                         │ applications.studentId → students._id
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATIONS COLLECTION                      │
│  _id  |  studentId  |  companyId  |  status  |  appliedAt      │
└─────────────────┬──────────────────────────────────────────────┘
                  │ Many-to-1
                  │ applications.companyId → companies._id
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     COMPANIES COLLECTION                        │
│  _id  |  companyName  |  jobRole  |  salaryPackage             │
│       |  minCgpaRequired  |  maxBacklogsAllowed                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  TRAINING_SESSIONS COLLECTION                   │
│  _id  |  category  |  sessionDate  |  trainerName              │
│                                                                 │
│  (Standalone — no FK. Visible to all users.)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Relationship Table

| From Collection    | Field         | References        | Type         | Cardinality |
|--------------------|---------------|-------------------|--------------|-------------|
| `students`         | `userId`      | `users._id`       | ObjectId ref | One-to-One  |
| `applications`     | `studentId`   | `students._id`    | ObjectId ref | Many-to-One |
| `applications`     | `companyId`   | `companies._id`   | ObjectId ref | Many-to-One |
| `training_sessions`| *(none)*      | *(standalone)*    | —            | —           |

---

## 🧩 Data Flow by Module

### 🔍 Eligibility Engine
```
Request: Student wants to apply to a Company
    │
    ├─► Fetch student.cgpa, student.backlogs
    ├─► Fetch company.minCgpaRequired, company.maxBacklogsAllowed
    │
    └─► CHECK: (student.cgpa >= company.minCgpaRequired)
             AND (student.backlogs <= company.maxBacklogsAllowed)
                │
                ├─ TRUE  → Allow application → Insert to applications
                └─ FALSE → Block with eligibility error
```

### 📋 Application Status Lifecycle
```
Applied → Shortlisted → Technical → HR → Selected
                                       ↘ Rejected
                      ↘ Rejected
           ↘ Rejected
```

### 📊 Admin Analytics Aggregation Pipeline
```
applications collection
    │
    ├─► $group by companyId → count totals, selected, rejected
    ├─► $lookup companies → join company name
    ├─► $lookup students → join student details
    └─► Return placement statistics
```

---

## 🔒 Unique Constraints (Mongoose Index)

| Collection     | Index Fields              | Constraint |
|----------------|---------------------------|------------|
| `users`        | `email`                   | Unique     |
| `applications` | `[studentId, companyId]`  | Unique (prevent duplicate application) |

---

## 📁 Seeding Order

Because of cross-references, seed data must be inserted in this order:

```
1. users           (no dependencies)
2. students        (depends on users)
3. companies       (no dependencies)
4. applications    (depends on students + companies)
5. training_sessions (no dependencies)
```
