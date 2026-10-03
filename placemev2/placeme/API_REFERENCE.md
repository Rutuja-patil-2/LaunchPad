# PlaceMe API Reference Guide

Quick reference for common API usage patterns.

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Placement Drives](#placement-drives)
4. [Applications](#applications)
5. [Training & Tests](#training--tests)
6. [Notifications](#notifications)

---

## Authentication

### Register a New User

**Endpoint:** `POST /api/users/register/`

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "securepass123",
  "password2": "securepass123",
  "role": "student",
  "phone": "9876543210"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "phone": "9876543210"
  }
}
```

**Roles:** `student`, `recruiter`, `tpo`

---

## User Management

### Get Current User Profile

**Endpoint:** `GET /api/users/me/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",
  "phone": "9876543210"
}
```

### Complete Student Profile

**Endpoint:** `GET /api/users/student-profiles/me/`

**Response:**
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "branch": "Computer Science",
  "cgpa": 8.5,
  "skills": "Python, Django, React, JavaScript",
  "skills_list": ["Python", "Django", "React", "JavaScript"],
  "resume_pdf": null,
  "github_link": "https://github.com/johndoe",
  "linkedin_link": "https://linkedin.com/in/johndoe",
  "bio": "Passionate developer",
  "resume_score": 0,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Update Student Profile

**Endpoint:** `PUT /api/users/student-profiles/{id}/`

**Request:**
```json
{
  "branch": "Computer Science",
  "cgpa": 8.5,
  "skills": "Python, Django, React",
  "github_link": "https://github.com/johndoe",
  "linkedin_link": "https://linkedin.com/in/johndoe",
  "bio": "Passionate developer"
}
```

---

## Placement Drives

### List All Placement Drives

**Endpoint:** `GET /api/placement/drives/`

**Query Parameters:**
- `page`: Page number (default: 1)
- `search`: Search by company name or role

**Response:**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "company": {
        "id": 1,
        "name": "Google",
        "email": "careers@google.com",
        "industry": "Technology",
        "website": "https://google.com",
        "logo": null,
        "description": "Tech company",
        "verified": true,
        "verified_by": null,
        "created_at": "2024-01-10T00:00:00Z"
      },
      "role": "Software Engineer (Backend)",
      "package": 85.0,
      "description": "Looking for backend engineers",
      "eligibility_cgpa": 7.0,
      "required_skills": "Python, Django, PostgreSQL",
      "eligible_branches": "CSE, IT, ECE",
      "drive_date": "2024-02-20T10:00:00Z",
      "registration_deadline": "2024-02-18T23:59:59Z",
      "total_positions": 10,
      "status": "upcoming",
      "created_by": {...},
      "applications_count": 25,
      "created_at": "2024-01-10T12:00:00Z",
      "updated_at": "2024-01-10T12:00:00Z"
    }
  ]
}
```

### Get Upcoming Drives

**Endpoint:** `GET /api/placement/drives/upcoming/`

Same response as above, filtered for upcoming drives only.

### Apply to a Drive

**Endpoint:** `POST /api/placement/drives/{drive_id}/apply/`

**Response (201 Created):**
```json
{
  "id": 1,
  "student": {...},
  "drive": {...},
  "status": "applied",
  "match_score": 0,
  "applied_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

## Applications

### Get My Applications

**Endpoint:** `GET /api/placement/applications/my_applications/`

**Response:**
```json
[
  {
    "id": 1,
    "student": {...},
    "drive": {
      "id": 1,
      "company": {"name": "Google", ...},
      "role": "Software Engineer",
      "package": 85.0,
      ...
    },
    "status": "applied",
    "match_score": 85,
    "applied_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

**Status Values:**
- `applied`: Just applied
- `under_review`: Being reviewed
- `shortlisted`: Selected for interview
- `rejected`: Not selected
- `interview_scheduled`: Interview scheduled
- `selected`: Got the job!

### Track Application Status

**Endpoint:** `GET /api/placement/applications/{application_id}/`

Same structure as above for a single application.

---

## Training & Tests

### List All Courses

**Endpoint:** `GET /api/training/courses/`

**Response:**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "title": "Python Basics",
      "description": "Learn Python fundamentals",
      "instructor": {...},
      "category": "technical",
      "duration_hours": 20,
      "capacity": 50,
      "start_date": "2024-02-01T09:00:00Z",
      "end_date": "2024-02-15T17:00:00Z",
      "is_active": true,
      "created_at": "2024-01-10T00:00:00Z"
    }
  ]
}
```

### Enroll in a Course

**Endpoint:** `POST /api/training/courses/{course_id}/enroll/`

**Response (201 Created):**
```json
{
  "id": 1,
  "student": {...},
  "course": {...},
  "attendance_percentage": 0.0,
  "completed": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### List All Mock Tests

**Endpoint:** `GET /api/training/mock-tests/`

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "title": "Quantitative Aptitude - Basic",
      "category": "quant",
      "description": "Basic math aptitude test",
      "total_questions": 20,
      "duration_minutes": 30,
      "passing_score": 50,
      "created_by": {...},
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "questions": [...]
    }
  ]
}
```

**Categories:**
- `quant`: Quantitative Aptitude
- `verbal`: Verbal Ability
- `logical`: Logical Reasoning
- `technical`: Technical Topics
- `coding`: Coding/Programming

### Filter Tests by Category

**Endpoint:** `GET /api/training/mock-tests/by_category/?category=quant`

**Response:** Same as above, filtered by category

### Start a Test

**Endpoint:** `POST /api/training/mock-tests/{test_id}/start_test/`

**Response (201 Created):**
```json
{
  "id": 1,
  "student": {...},
  "test": {...},
  "score": 0,
  "total_marks": 20,
  "percentage": 0.0,
  "weak_areas": "[]",
  "time_taken_seconds": 0,
  "started_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:30:00Z",
  "answers": []
}
```

### Get My Test Attempts

**Endpoint:** `GET /api/training/test-attempts/my_attempts/`

**Response:**
```json
[
  {
    "id": 1,
    "student": {...},
    "test": {...},
    "score": 15,
    "total_marks": 20,
    "percentage": 75.0,
    "weak_areas": "[]",
    "time_taken_seconds": 1800,
    "started_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T11:00:00Z",
    "answers": [...]
  }
]
```

### Get Test Statistics

**Endpoint:** `GET /api/training/test-attempts/statistics/`

**Response:**
```json
{
  "total_tests": 5,
  "average_score": 72.5
}
```

---

## Notifications

### Get My Notifications

**Endpoint:** `GET /api/notifications/student-notifications/my_notifications/`

**Response:**
```json
[
  {
    "id": 1,
    "student": {...},
    "notification": {
      "id": 1,
      "title": "Google Drive Tomorrow",
      "description": "Google is visiting tomorrow at 10 AM",
      "notification_type": "drive_announce",
      "created_by": {...},
      "target_role": "student",
      "is_active": true,
      "created_at": "2024-01-14T15:00:00Z"
    },
    "is_read": false,
    "read_at": null,
    "created_at": "2024-01-14T15:00:00Z"
  }
]
```

### Get Unread Notifications

**Endpoint:** `GET /api/notifications/student-notifications/unread/`

**Response:** Same structure, only unread notifications

### Mark Notification as Read

**Endpoint:** `POST /api/notifications/student-notifications/{notification_id}/mark_as_read/`

**Response (200 OK):**
```json
{
  "id": 1,
  "student": {...},
  "notification": {...},
  "is_read": true,
  "read_at": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-14T15:00:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "field_name": ["This field is required."]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Common Workflows

### Workflow 1: Student Registration → Application

```
1. POST /api/users/register/
   → Get user created
   
2. PUT /api/users/student-profiles/{id}/
   → Complete profile with CGPA, skills
   
3. GET /api/placement/drives/upcoming/
   → Browse upcoming drives
   
4. POST /api/placement/drives/{drive_id}/apply/
   → Apply to drive
   
5. GET /api/placement/applications/my_applications/
   → Track application status
```

### Workflow 2: Student Takes Mock Test

```
1. GET /api/training/mock-tests/
   → Browse available tests
   
2. POST /api/training/mock-tests/{test_id}/start_test/
   → Start test
   
3. Submit answers (POST to StudentAnswer endpoint - TBD)
   → Submit answers
   
4. GET /api/training/test-attempts/my_attempts/
   → View test results
   
5. GET /api/training/test-attempts/statistics/
   → Check overall performance
```

### Workflow 3: TPO Creates Placement Drive

```
1. POST /api/users/register/
   → TPO registers as role: "tpo"
   
2. POST /api/companies/register/
   → Create company (recruiter)
   
3. POST /api/placement/drives/
   → Create placement drive
   
4. POST /api/notifications/notifications/
   → Send notification to students
   
5. GET /api/placement/applications/
   → View all applications
   
6. POST /api/placement/interview-schedules/
   → Schedule interviews
```

---

## Rate Limiting

API requests are limited to:
- **100 requests per hour** per IP
- **1000 requests per day** per user

---

## Rate Limiting

For support and questions, contact:
- **Backend Team**: backend@placeme.dev
- **Documentation**: Check README.md

---

**API Version:** 1.0
**Last Updated:** May 2026
