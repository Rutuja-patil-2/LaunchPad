# 🚀 PlaceMe - Setup Guide

This guide will help you get PlaceMe running on your system.

## Step 1: Install Python Dependencies

```bash
cd "d:\1st hachathon\cravita project\place me"
pip install -r requirements.txt
```

**What's being installed:**
- Django 5.2.12 - Web framework
- Django REST Framework - API tools
- djangorestframework-simplejwt - JWT authentication
- Pillow - Image processing
- psycopg2-binary - PostgreSQL database connector (optional)
- python-decouple - Environment variable management

## Step 2: Database Setup

### Option A: SQLite (Quick Start - Default)
No setup needed! Django will create a SQLite database automatically.

### Option B: PostgreSQL (Production Ready)

1. Install PostgreSQL
2. Create database:
```bash
createdb placeme_db
```

3. Update `placeme/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'placeme_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Step 3: Run Migrations

```bash
cd placeme  # Enter the project directory
python manage.py makemigrations
python manage.py migrate
```

This creates all database tables.

## Step 4: Create Admin User

```bash
python manage.py createsuperuser
```

You'll be prompted for:
- Username
- Email
- Password
- Password (again)

Example:
```
Username: admin
Email: admin@placeme.com
Password: ****
```

## Step 5: Start the Server

```bash
python manage.py runserver
```

Output:
```
Starting development server at http://127.0.0.1:8000/
```

## Step 6: Access the Application

### Admin Panel
- URL: `http://localhost:8000/admin/`
- Login with credentials from Step 4
- Manage all users, drives, tests, etc.

### API Root
- URL: `http://localhost:8000/api/`
- Browse all API endpoints

### API Endpoints

**Users:**
- POST `/api/users/register/` - Register new user
- GET `/api/users/me/` - Your profile
- GET `/api/student-profiles/` - All student profiles
- GET `/api/companies/` - All companies

**Placement:**
- GET `/api/placement/drives/` - All placement drives
- GET `/api/placement/drives/upcoming/` - Upcoming drives
- POST `/api/placement/drives/{id}/apply/` - Apply to drive
- GET `/api/placement/applications/` - Your applications

**Training:**
- GET `/api/training/courses/` - All courses
- GET `/api/training/mock-tests/` - All tests
- GET `/api/training/mock-tests/by_category/?category=quant` - Tests by category
- POST `/api/training/mock-tests/{id}/start_test/` - Start test
- GET `/api/training/test-attempts/my_attempts/` - Your test history

**Notifications:**
- GET `/api/notifications/notifications/` - All notifications
- GET `/api/notifications/student-notifications/my_notifications/` - Your notifications
- GET `/api/notifications/student-notifications/unread/` - Unread notifications

## Testing the API

### Using cURL

```bash
# Register a student
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "email": "student1@example.com",
    "password": "securepass123",
    "password2": "securepass123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student"
  }'

# Get all placement drives
curl http://localhost:8000/api/placement/drives/
```

### Using Postman or Thunder Client
1. Import API collection
2. Set up environment variables
3. Create requests for each endpoint

## Creating Sample Data

### Through Admin Panel

1. Login to `/admin/`
2. Create entries:
   - **Company**: Click "Companies" → "Add Company"
   - **PlacementDrive**: Click "Placement Drives" → "Add Drive"
   - **MockTest**: Click "Mock Tests" → "Add Test"
   - **Course**: Click "Courses" → "Add Course"

### Through Python Shell

```bash
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from users.models import StudentProfile, Company
from placement.models import PlacementDrive
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

# Create a company
company = Company.objects.create(
    name="Google",
    email="careers@google.com",
    industry="Tech",
    verified=True
)

# Create a placement drive
drive = PlacementDrive.objects.create(
    company=company,
    role="Software Engineer",
    package=50.0,
    eligibility_cgpa=7.0,
    required_skills="Python, Django, React",
    eligible_branches="CSE, IT",
    drive_date=timezone.now() + timedelta(days=7),
    registration_deadline=timezone.now() + timedelta(days=5),
    total_positions=10,
    status="upcoming"
)

print("Created:", drive)
exit()
```

## Project Structure Map

```
placeme/
├── manage.py              → Django command line utility
├── requirements.txt       → Python dependencies
├── README.md             → Project documentation
├── SETUP.md              → This file!
│
├── placeme/              → Main project settings
│   ├── settings.py       → Django configuration
│   ├── urls.py          → URL routing
│   ├── asgi.py          → ASGI config
│   └── wsgi.py          → WSGI config
│
├── users/               → User management
│   ├── models.py        → User, StudentProfile, Company models
│   ├── views.py         → API views (ViewSets)
│   ├── serializers.py   → Data serialization
│   ├── urls.py          → App-specific URLs
│   └── admin.py         → Admin panel config
│
├── placement/           → Placement management
│   ├── models.py        → Drive, Application, Interview models
│   ├── views.py         → API views
│   ├── serializers.py   → Data serialization
│   ├── urls.py          → App-specific URLs
│   └── admin.py         → Admin panel config
│
├── training/            → Training & tests
│   ├── models.py        → Course, MockTest, TestAttempt models
│   ├── views.py         → API views
│   ├── serializers.py   → Data serialization
│   ├── urls.py          → App-specific URLs
│   └── admin.py         → Admin panel config
│
└── notifications/       → Notification system
    ├── models.py        → Notification models
    ├── views.py         → API views
    ├── serializers.py   → Data serialization
    ├── urls.py          → App-specific URLs
    └── admin.py         → Admin panel config
```

## Useful Django Commands

```bash
# Check for errors
python manage.py check

# See all migrations
python manage.py showmigrations

# See specific app migrations
python manage.py showmigrations users

# Rollback last migration
python manage.py migrate placement 0001
python manage.py migrate placement zero  # Revert all migrations for app

# Create empty migration
python manage.py makemigrations --empty users --name migration_name

# View raw SQL
python manage.py sqlmigrate placement 0001

# Load sample data from file
python manage.py loaddata data.json

# Dump current data
python manage.py dumpdata > data.json

# Interactive shell
python manage.py shell

# Run tests
python manage.py test
```

## Common Issues

### Issue: ModuleNotFoundError: No module named 'rest_framework'
**Solution**: Install requirements first
```bash
pip install -r requirements.txt
```

### Issue: Database error (sqlite3 locked)
**Solution**: Django processes might have locks. Restart:
```bash
python manage.py runserver
```

### Issue: Port 8000 already in use
**Solution**: Use different port
```bash
python manage.py runserver 8001
```

### Issue: Static files not serving
**Solution**: Collect static files
```bash
python manage.py collectstatic --noinput
```

### Issue: CSRF verification failed
**Solution**: Add `Content-Type: application/json` header in API requests

## Next Steps

1. **Create Frontend**: React dashboard using these APIs
2. **Add Email**: Setup Celery + SendGrid for notifications
3. **Add AI**: Integrate OpenAI API for resume scoring
4. **Add Chat**: Setup Django Channels for real-time chat
5. **Mobile App**: Build React Native app using same API

## Authentication Guide

PlaceMe uses JWT authentication. Here's how it works:

### Get Token
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "student1", "password": "yoursecretpassword"}'
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Use Token
```bash
curl http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "your_refresh_token"}'
```

## Environment Variables

Create a `.env` file in the project root:

```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/placeme_db
JWT_SECRET=your-jwt-secret
```

Then in settings.py:
```python
from decouple import config

DEBUG = config('DEBUG', default=True, cast=bool)
SECRET_KEY = config('SECRET_KEY')
```

---

**Questions?** Check README.md or contact the team.

Happy Coding! 🎉
