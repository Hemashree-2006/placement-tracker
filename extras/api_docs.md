# 🔌 API Documentation

This document outlines the RESTful API endpoints available in the Placement Tracker backend.

## Base URL
`http://localhost:5000/api`

---

## 🔐 Authentication (`/api/auth`)

### 1. Register a Student
* **Endpoint:** `POST /auth/register`
* **Access:** Public
* **Description:** Creates a new user account with the role "Student" and a linked student profile.
* **Body:**
  ```json
  {
    "email": "student@example.com",
    "password": "Password123",
    "name": "John Doe",
    "dept": "CSE",
    "cgpa": 8.5,
    "backlogs": 0,
    "skills": ["Java", "React"]
  }
  ```
* **Response (201):** `{ "success": true, "token": "jwt_token...", "role": "Student", "message": "..." }`

### 2. Login
* **Endpoint:** `POST /auth/login`
* **Access:** Public
* **Description:** Authenticates a user (Admin or Student) and returns a JWT.
* **Body:**
  ```json
  {
    "email": "student@example.com",
    "password": "Password123"
  }
  ```
* **Response (200):** `{ "success": true, "token": "jwt_token...", "role": "Student", "userId": "...", "studentId": "..." }`

---

## 🎓 Students (`/api/students`)

*All routes require a valid JWT (`Bearer <token>`).*

### 1. Get All Students
* **Endpoint:** `GET /students`
* **Access:** Admin Only
* **Response (200):** `{ "success": true, "count": X, "data": [...] }`

### 2. Get Student Profile
* **Endpoint:** `GET /students/:id`
* **Access:** Admin or the specific Student
* **Response (200):** `{ "success": true, "data": { ... } }`

### 3. Update Student Profile
* **Endpoint:** `PUT /students/:id`
* **Access:** Admin or the specific Student
* **Body:** Any of `name`, `dept`, `cgpa`, `backlogs`, `skills`, `resumePath`
* **Response (200):** `{ "success": true, "data": { ...updatedProfile } }`

### 4. Delete Student
* **Endpoint:** `DELETE /students/:id`
* **Access:** Admin Only
* **Response (200):** `{ "success": true, "message": "Student deleted." }`

---

## 🏢 Companies (`/api/companies`)

*All routes require a valid JWT (`Bearer <token>`).*

### 1. Get All Companies
* **Endpoint:** `GET /companies`
* **Access:** Authenticated (Admin & Student)
* **Response (200):** `{ "success": true, "count": X, "data": [...] }`

### 2. Get Eligible Companies
* **Endpoint:** `GET /companies/eligible`
* **Access:** Student Only
* **Description:** Returns only the companies for which the logged-in student meets the `minCgpaRequired` and `maxBacklogsAllowed` criteria.
* **Response (200):** `{ "success": true, "studentCgpa": 8.5, "studentBacklogs": 0, "count": X, "data": [...] }`

### 3. Add Company
* **Endpoint:** `POST /companies`
* **Access:** Admin Only
* **Body:**
  ```json
  {
    "companyName": "Tech Corp",
    "jobRole": "Software Engineer",
    "salaryPackage": 8.5,
    "minCgpaRequired": 7.0,
    "maxBacklogsAllowed": 1
  }
  ```
* **Response (201):** `{ "success": true, "data": { ... } }`

### 4. Update / Delete Company
* **Endpoint:** `PUT /companies/:id` | `DELETE /companies/:id`
* **Access:** Admin Only

---

## 📋 Applications (`/api/applications`)

*All routes require a valid JWT (`Bearer <token>`).*

### 1. Get Applications
* **Endpoint:** `GET /applications`
* **Access:** Admin (sees all), Student (sees own)
* **Response (200):** `{ "success": true, "count": X, "data": [...] }`

### 2. Get Application Analytics
* **Endpoint:** `GET /applications/analytics`
* **Access:** Admin Only
* **Description:** Returns aggregated placement statistics by company.
* **Response (200):** 
  ```json
  {
    "success": true,
    "overall": { "total": 10, "selected": 2, "rejected": 1 },
    "byCompany": [...]
  }
  ```

### 3. Apply to Company
* **Endpoint:** `POST /applications`
* **Access:** Student Only
* **Description:** Applies to a company. Internally verifies eligibility requirements and prevents duplicate applications.
* **Body:** `{ "companyId": "..." }`
* **Response (201):** `{ "success": true, "data": { ... } }`

### 4. Update Application Status
* **Endpoint:** `PUT /applications/:id/status`
* **Access:** Admin Only
* **Body:** `{ "status": "Shortlisted" }` *(Valid: Applied, Shortlisted, Technical, HR, Selected, Rejected)*
* **Response (200):** `{ "success": true, "data": { ... } }`

---

## 📚 Training Sessions (`/api/sessions`)

*All routes require a valid JWT (`Bearer <token>`).*

### 1. Get All Sessions
* **Endpoint:** `GET /sessions`
* **Access:** Authenticated (Admin & Student)
* **Response (200):** `{ "success": true, "count": X, "data": [...] }`

### 2. Add Session
* **Endpoint:** `POST /sessions`
* **Access:** Admin Only
* **Body:**
  ```json
  {
    "category": "Aptitude",
    "sessionDate": "2026-05-20T00:00:00.000Z",
    "trainerName": "Mr. Smith"
  }
  ```
* **Response (201):** `{ "success": true, "data": { ... } }`

### 3. Update / Delete Session
* **Endpoint:** `PUT /sessions/:id` | `DELETE /sessions/:id`
* **Access:** Admin Only
