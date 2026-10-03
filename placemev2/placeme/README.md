# PlaceMe - Smart Training & Placement Portal

A comprehensive Django REST API for managing placement drives, training courses, mock tests, and student profiles. Built for colleges' Training & Placement cells.

## 📋 Project Overview

PlaceMe is a full-stack platform that connects:
- **Students**: Apply for placements, take mock tests, track applications
- **Recruiters**: Post drives, filter candidates, manage applications
- **TPO (Training & Placement Officer)**: Manage the entire ecosystem, create announcements

## 🏗️ Project Structure

```
placeme/
├── manage.py
├── requirements.txt
├── placeme/                    # Main project config
│   ├── settings.py            # Django settings
│   ├── urls.py                # Main URL routing
│   ├── asgi.py
│   └── wsgi.py
├── users/                     # User authentication & profiles
│   ├── models.py              # User, StudentProfile, Company
│   ├── views.py               # ViewSets for auth & profiles
│   ├── serializers.py         # DRF serializers
│   ├── urls.py
│   └── admin.py
├── placement/                 # Placement drives & applications
│   ├── models.py              # PlacementDrive, Application, etc.
│   ├── views.py               # ViewSets for drives & apps
│   ├── serializers.py         # DRF serializers
│   ├── urls.py
│   └── admin.py
├── training/                  # Courses & mock tests
│   ├── models.py              # Course, MockTest, TestAttempt
│   ├── views.py               # ViewSets for tests
│   ├── serializers.py         # DRF serializers
│   ├── urls.py
│   └── admin.py
└── notifications/             # Notification system
    ├── models.py              # Notification, StudentNotification
    ├── views.py               # ViewSets for notifications
    ├── serializers.py         # DRF serializers
    ├── urls.py
    └── admin.py
```

## 📦 Database Models

### Users App
- **User**: Custom user model with roles (student, recruiter, tpo)
- **StudentProfile**: Extended profile for students (CGPA, skills, resume)
- **Company**: Company information and verification status

### Placement App
- **PlacementDrive**: Company placement drives
- **Application**: Student applications to drives
- **InterviewSchedule**: Interview scheduling and rounds
- **InterviewExperience**: Student experience sharing

### Training App
- **Course**: Training courses and workshops
- **Enrollment**: Student course enrollments
- **MockTest**: Aptitude and technical tests
- **Question**: Test questions with multiple options
- **TestAttempt**: Student test attempts and scores
- **StudentAnswer**: Individual answers and analytics

### Notifications App
- **Notification**: System notifications
- **StudentNotification**: Student-specific notification tracking

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Database
Update `placeme/settings.py` with your database configuration:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'placeme_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 3. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser
```bash
python manage.py createsuperuser
```

### 5. Run Server
```bash
python manage.py runserver
```

Visit: `http://localhost:8000/admin` for admin panel

## 📡 API Endpoints

### Users
- `POST /api/users/register/` - Register new user
- `GET /api/users/me/` - Get current user
- `GET /api/student-profiles/` - List all student profiles
- `GET /api/student-profiles/me/` - Get own profile
- `GET /api/companies/` - List companies
- `GET /api/companies/verified_only/` - List verified companies

### Placement
- `GET /api/placement/drives/` - List all drives
- `GET /api/placement/drives/upcoming/` - Get upcoming drives
- `POST /api/placement/drives/{id}/apply/` - Apply to drive
- `GET /api/placement/applications/` - Get your applications
- `GET /api/placement/applications/my_applications/` - List my applications

### Training
- `GET /api/training/courses/` - List courses
- `POST /api/training/courses/{id}/enroll/` - Enroll in course
- `GET /api/training/mock-tests/` - List mock tests
- `GET /api/training/mock-tests/by_category/` - Filter tests by category
- `POST /api/training/mock-tests/{id}/start_test/` - Start a test
- `GET /api/training/test-attempts/my_attempts/` - Get test history
- `GET /api/training/test-attempts/statistics/` - Get test statistics

### Notifications
- `GET /api/notifications/notifications/` - List notifications
- `GET /api/notifications/student-notifications/my_notifications/` - Get my notifications
- `GET /api/notifications/student-notifications/unread/` - Get unread notifications
- `POST /api/notifications/student-notifications/{id}/mark_as_read/` - Mark read

## 🔐 Authentication

Uses JWT (JSON Web Tokens) via `djangorestframework-simplejwt`.

### Get Token
```bash
POST /api-token-auth/
{
    "username": "your_username",
    "password": "your_password"
}
```

Response:
```json
{
    "access": "token_here",
    "refresh": "refresh_token_here"
}
```

Use in headers:
```
Authorization: Bearer <access_token>
```

## 👥 User Roles

### 1. **Student**
- Create and manage profile
- View available placement drives
- Apply to drives
- Track application status
- Take mock tests
- Share interview experiences
- Enroll in training courses

### 2. **Recruiter**
- Register and create company profile
- Post placement drives
- Filter and search students
- Shortlist candidates
- Schedule interviews
- View applications

### 3. **TPO (Training & Placement Officer)**
- Manage all students
- Verify companies
- Create training courses
- Create and manage mock tests
- Send notifications to students
- View analytics and reports

## 📊 Key Features

### For Students
✅ Complete profile management
✅ Resume score analysis (AI-ready)
✅ Job-student matching (AI-ready)
✅ Mock tests with weak area detection
✅ Interview experience sharing
✅ Application tracking
✅ Training course enrollment
✅ Real-time notifications

### For Recruiters
✅ Drive management
✅ Student filtering by criteria
✅ Shortlisting automation
✅ Interview scheduling
✅ Application tracking

### For TPO
✅ Student database management
✅ Company onboarding
✅ Course creation
✅ Test creation and management
✅ Bulk notifications
✅ Analytics dashboard (frontend needed)
✅ Report generation

## 🤖 AI Features (Ready to Integrate)

1. **Resume Scorer**: Uses OpenAI API to score resumes
2. **Job-Student Matcher**: Matches students with job requirements
3. **Weak Area Detector**: Analyzes test performance and suggests improvements

## 📝 Admin Panel

Access at `/admin/` after login with superuser credentials.

Manage:
- Users and profiles
- Companies and verification
- Placement drives
- Applications and interviews
- Courses and enrollments
- Mock tests and questions
- Notifications

## 🔧 Tech Stack

- **Backend**: Django 5.2.12
- **API**: Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: PostgreSQL (recommended) / SQLite (default)
- **Image Processing**: Pillow
- **Environment**: Python-decouple

## 📈 Next Steps to Extend

1. **Frontend**: React + Tailwind CSS dashboard
2. **Real-time Chat**: Django Channels for TPO-Student communication
3. **Email Notifications**: Celery + SendGrid
4. **File Storage**: AWS S3 for resume/offer PDFs
5. **Analytics**: Dashboard with placement statistics
6. **Mobile App**: React Native for mobile access
7. **AI Integration**: OpenAI API for resume scoring
8. **Search**: Elasticsearch for advanced student search

## 🎯 API Flow Examples

### Student Registration & Application
```
1. POST /api/users/register/ → Create account
2. POST /api/users/student-profiles/ → Complete profile
3. GET /api/placement/drives/upcoming/ → View drives
4. POST /api/placement/drives/{id}/apply/ → Apply
5. GET /api/placement/applications/my_applications/ → Track status
```

### Mock Test Flow
```
1. GET /api/training/mock-tests/ → View tests
2. POST /api/training/mock-tests/{id}/start_test/ → Start test
3. POST /api/training/test-attempts/submit/ → Submit answers
4. GET /api/training/test-attempts/statistics/ → Check score
```

## 🚢 Deployment

### Using Railway or Heroku:
1. Add `.env` file with database credentials
2. Set `DEBUG = False` in settings
3. Add domain to `ALLOWED_HOSTS`
4. Run migrations on server
5. Deploy!

```bash
python manage.py collectstatic --noinput
```

## 📞 Support & Contributions

This is a team project. For questions or contributions, contact the team leads.

## 📄 License

This project is for educational purposes.

---

**Happy Coding! 🚀**

Last Updated: May 2026
