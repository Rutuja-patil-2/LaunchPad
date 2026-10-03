# 📚 Complete Learning Guide: How Django & React Connect

**For: Person 2 (beginner in React)**  
**Status: Copy this entire file to ChatGPT for detailed explanations**

---

## 📖 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Django vs Django + React](#django-vs-django--react)
3. [How They Communicate](#how-they-communicate)
4. [File Structure & Relationships](#file-structure--relationships)
5. [Complete Flow Examples](#complete-flow-examples)
6. [Authentication Deep Dive](#authentication-deep-dive)
7. [Key Concepts](#key-concepts)

---

## 🏗️ Architecture Overview

### Traditional Django (what you know)
```
User → Django Server → Templates (HTML) → Render & Send HTML
                              ↓
                         User sees HTML page
```

### Django + React (what we're using now)
```
User → React App (Browser) → REST API Calls → Django Backend
                              ↑
                         Backend returns JSON
                         
React renders JSON into beautiful UI
```

### Key Difference
- **Django Renders HTML:** Server sends completed HTML page
- **React Renders HTML:** Browser receives JSON data → React builds HTML dynamically

---

## 📝 Django vs Django + React

### Django with Templates (Old Way - You Know This)
```python
# urls.py
path('students/', views.student_list, name='student_list')

# views.py
def student_list(request):
    students = Student.objects.all()
    return render(request, 'students.html', {'students': students})

# students.html (template)
{% for student in students %}
    <div>{{ student.name }}</div>
{% endfor %}

# Flow:
Request → Django Views → Query Database → Render HTML → Send HTML to Browser
```

### Django + REST API + React (New Way - What We're Using)
```python
# Backend (Django REST API)
# urls.py
path('api/students/', StudentViewSet.as_view({'get': 'list'}))

# views.py
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

# serializers.py
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name', 'email', 'cgpa']

# Flow:
Request → Django REST API → Query Database → Return JSON → Send to React

# Example JSON Response:
[
  {"id": 1, "name": "John", "email": "john@college.com", "cgpa": 8.5},
  {"id": 2, "name": "Jane", "email": "jane@college.com", "cgpa": 9.0}
]

# Frontend (React)
# src/services/api.js
export const studentService = {
  getStudents: () => api.get('/api/students/')
}

# src/pages/StudentList.jsx
import { useState, useEffect } from 'react'
import { studentService } from '../services/api'

export default function StudentList() {
  const [students, setStudents] = useState([])
  
  useEffect(() => {
    studentService.getStudents().then(response => {
      setStudents(response.data)  // Store JSON in state
    })
  }, [])
  
  return (
    <div>
      {students.map(student => (
        <div key={student.id}>{student.name}</div>
      ))}
    </div>
  )
}

# Flow:
React Component → Call API → Get JSON → Store in State → Render HTML
```

---

## 🔄 How They Communicate

### The Communication Chain

```
1. USER ACTION (click button, fill form)
        ↓
2. REACT EVENT (onClick, onChange)
        ↓
3. JAVASCRIPT FUNCTION (in React component/page)
        ↓
4. API CALL (using axios from services/api.js)
        ↓
5. HTTP REQUEST (GET, POST, PUT, DELETE)
        ↓
6. DJANGO RECEIVES REQUEST (urls.py routes it)
        ↓
7. DJANGO VIEWSET/VIEW (processes request)
        ↓
8. DATABASE QUERY (using models)
        ↓
9. SERIALIZER (converts Python objects to JSON)
        ↓
10. HTTP RESPONSE (sends JSON back)
        ↓
11. REACT RECEIVES JSON
        ↓
12. UPDATE STATE (setStudents([...]))
        ↓
13. RE-RENDER COMPONENT (shows new data)
        ↓
14. USER SEES NEW UI
```

### Real Example: Student Applies to a Drive

```
FRONTEND (React):
───────────────
User clicks "Apply Button"
        ↓
onClick handler fires: handleApply()
        ↓
placementService.applyToDrive(driveId)
        ↓
api.post('/placement/drives/2/apply/')
        ↓
HTTP POST request sent to backend


BACKEND (Django):
────────────────
Django receives POST /api/placement/drives/2/apply/
        ↓
urls.py finds matching pattern and calls view
        ↓
PlacementDriveViewSet.apply() method executes
        ↓
Creates Application object in database
        ↓
Serializer converts Application object to JSON
        ↓
HTTP 201 response with JSON:
{
  "id": 1,
  "student": 5,
  "drive": 2,
  "status": "applied",
  "applied_at": "2024-01-15T10:30:00Z"
}


FRONTEND (React):
────────────────
Receives JSON response
        ↓
Toast notification: "Applied successfully!"
        ↓
Updates state: setApplications([...prev, response.data])
        ↓
Re-renders component
        ↓
User sees "Applied" status instead of "Apply" button
```

---

## 📂 File Structure & Relationships

### BACKEND FILES (Django)

```
placeme/placeme/
├── placeme/
│   ├── settings.py
│   │   └── REST_FRAMEWORK = {
│   │       'DEFAULT_AUTHENTICATION_CLASSES': [
│   │           'rest_framework_simplejwt.authentication.JWTAuthentication',
│   │       ],
│   │   }
│   │   └── Tells Django: Use JWT for authentication
│   │
│   ├── urls.py
│   │   └── from rest_framework.routers import DefaultRouter
│   │       router = DefaultRouter()
│   │       router.register('placement/drives', PlacementDriveViewSet)
│   │       urlpatterns = router.urls
│   │   └── Maps URLs to ViewSets
│   │       GET /api/placement/drives/ → PlacementDriveViewSet.list()
│   │       POST /api/placement/drives/ → PlacementDriveViewSet.create()
│   │       GET /api/placement/drives/2/ → PlacementDriveViewSet.retrieve(id=2)
│   │       POST /api/placement/drives/2/apply/ → PlacementDriveViewSet.apply()
│   │
│   └── asgi.py / wsgi.py
│       └── Server configuration
│
├── users/
│   ├── models.py
│   │   └── class User(AbstractUser):
│   │           role = CharField(choices=['student', 'recruiter', 'tpo'])
│   │       class StudentProfile(models.Model):
│   │           user = OneToOneField(User)
│   │           cgpa = FloatField()
│   │       └── Data structures (like database schema)
│   │
│   ├── serializers.py
│   │   └── class UserSerializer(serializers.ModelSerializer):
│   │           class Meta:
│   │               model = User
│   │               fields = ['id', 'username', 'email', 'role']
│   │       └── Converts User object → JSON and JSON → User object
│   │       └── Frontend receives this JSON
│   │
│   ├── views.py
│   │   └── class UserViewSet(viewsets.ModelViewSet):
│   │           queryset = User.objects.all()
│   │           serializer_class = UserSerializer
│   │       
│   │       @action(detail=False, methods=['get'])
│   │       def me(self, request):
│   │           return Response(UserSerializer(request.user).data)
│   │       └── GET /api/users/me/ returns current user info
│   │       └── Frontend calls this to check who's logged in
│   │
│   ├── urls.py
│   │   └── router.register('users', UserViewSet)
│   │       └── Maps /users/ URLs to UserViewSet
│   │
│   └── admin.py
│       └── Django admin configuration
│
├── placement/
│   ├── models.py
│   │   └── class PlacementDrive(models.Model):
│   │           company = ForeignKey(Company)
│   │           role = CharField()
│   │           package = DecimalField()
│   │       class Application(models.Model):
│   │           student = ForeignKey(StudentProfile)
│   │           drive = ForeignKey(PlacementDrive)
│   │           status = CharField()
│   │       └── Database tables
│   │
│   ├── serializers.py
│   │   └── PlacementDriveSerializer
│   │       ApplicationSerializer
│   │       └── Convert to/from JSON
│   │
│   ├── views.py
│   │   └── class PlacementDriveViewSet(viewsets.ModelViewSet):
│   │           @action(detail=True, methods=['post'])
│   │           def apply(self, request, pk=None):
│   │               # Create application
│   │               # Return response
│   │       └── Handles POST /api/placement/drives/2/apply/
│   │
│   ├── urls.py
│   │   └── router.register('placement/drives', PlacementDriveViewSet)
│   │
│   └── admin.py
│
├── training/
│   ├── models.py
│   │   └── MockTest, Question, TestAttempt, StudentAnswer
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
│
└── notifications/
    ├── models.py
    ├── serializers.py
    ├── views.py
    ├── urls.py
    └── admin.py
```

### FRONTEND FILES (React)

```
placeme-frontend/src/
├── services/
│   └── api.js
│       ├── const API_URL = 'http://localhost:8000/api'
│       │   └── Points to Django backend
│       │
│       ├── const api = axios.create({ baseURL: API_URL })
│       │   └── Axios instance for making HTTP requests
│       │
│       ├── api.interceptors.request.use((config) => {
│       │   const token = useAuthStore.getState().token
│       │   config.headers.Authorization = `Bearer ${token}`
│       │   })
│       │   └── Automatically add JWT token to every request
│       │
│       ├── export const authService = {
│       │   register: (userData) => api.post('/users/register/', userData),
│       │   login: (username, password) => api.post('/token/', {username, password}),
│       │   getMe: () => api.get('/users/me/'),
│       │   }
│       │   └── Functions to call Django auth endpoints
│       │
│       ├── export const placementService = {
│       │   getDrives: () => api.get('/placement/drives/'),
│       │   applyToDrive: (driveId) => api.post(`/placement/drives/${driveId}/apply/`),
│       │   getApplications: () => api.get('/placement/applications/my_applications/'),
│       │   }
│       │   └── Functions to call Django placement endpoints
│       │
│       └── export const trainingService = {
│           getMockTests: () => api.get('/training/mock-tests/'),
│           startTest: (testId) => api.post(`/training/mock-tests/${testId}/start_test/`),
│           }
│           └── Functions to call Django training endpoints
│
├── context/
│   └── authContext.js
│       ├── export const useAuthStore = create(
│       │   persist(
│       │       (set) => ({
│       │           user: null,
│       │           token: null,
│       │           refreshToken: null,
│       │           
│       │           login: (user, token, refreshToken) => set({user, token, refreshToken}),
│       │           logout: () => set({user: null, token: null}),
│       │       })
│       │   )
│       ├── Global state management (like Django session)
│       ├── Stores user info and tokens
│       └── Accessible from any React component
│
├── pages/
│   ├── Login.jsx
│   │   ├── import { authService } from '../services/api'
│   │   ├── import { useAuthStore } from '../context/authContext'
│   │   │
│   │   ├── const handleLogin = async (username, password) => {
│   │   │   const { data } = await authService.login(username, password)
│   │   │   // data = {access: TOKEN, refresh: REFRESH_TOKEN}
│   │   │   
│   │   │   // Store in Zustand
│   │   │   useAuthStore.login(data.user, data.access, data.refresh)
│   │   │   
│   │   │   // Redirect to dashboard
│   │   │   navigate('/dashboard')
│   │   │ }
│   │   │
│   │   └── Form inputs → onClick → handleLogin() → API call → Django
│   │
│   ├── StudentDashboard.jsx
│   │   ├── const [applications, setApplications] = useState([])
│   │   │   └── Local state for this component
│   │   │
│   │   ├── useEffect(() => {
│   │   │   fetchApplications()
│   │   │ }, [])
│   │   │   └── On page load, fetch data
│   │   │
│   │   ├── const fetchApplications = async () => {
│   │   │   const { data } = await placementService.getApplications()
│   │   │   // data = [{id: 1, status: 'applied'}, ...]
│   │   │   setApplications(data)
│   │   │ }
│   │   │   └── Get data from Django and store in state
│   │   │
│   │   ├── return (
│   │   │   <div>
│   │   │     {applications.map(app => (
│   │   │       <div key={app.id}>{app.status}</div>
│   │   │     ))}
│   │   │   </div>
│   │   │ )
│   │   │   └── Render data on screen
│   │
│   ├── PlacementDrives.jsx
│   │   ├── State: [drives, setDrives]
│   │   ├── Load drives on mount
│   │   ├── Display drives in grid
│   │   ├── User clicks drive → navigate to DriveDetails
│   │
│   ├── DriveDetails.jsx
│   │   ├── const { id } = useParams()
│   │   │   └── Get drive ID from URL
│   │   │
│   │   ├── useEffect(() => {
│   │   │   placementService.getDriveById(id)
│   │   │ }, [id])
│   │   │   └── Fetch specific drive details
│   │   │
│   │   ├── const handleApply = async () => {
│   │   │   const { data } = await placementService.applyToDrive(id)
│   │   │   // data = Application object
│   │   │   toast.success('Applied successfully!')
│   │   │ }
│   │   │   └── POST to Django, show success message
│   │
│   ├── Applications.jsx
│   │   ├── Display user's applications
│   │   ├── Filter by status
│   │
│   ├── MockTests.jsx
│   │   ├── Display all tests
│   │   ├── Filter by category
│   │   ├── User clicks test → navigate to TestDetail
│   │
│   ├── TestDetail.jsx
│   │   ├── User clicks "Start Test"
│   │   ├── const handleStartTest = async () => {
│   │   │   const { data } = await trainingService.startTest(testId)
│   │   │   // data = TestAttempt object
│   │   │   setTestActive(true)
│   │   │ }
│   │   │   └── POST to Django to create TestAttempt
│   │   │
│   │   ├── Display questions
│   │   ├── User selects answer
│   │   ├── User clicks Submit
│   │   ├── const handleSubmitTest = async () => {
│   │   │   const { data } = await trainingService.submitTestAnswers(testId, answers)
│   │   │   // data = {score: 70, percentage: 75, ...}
│   │   │   navigate to results page
│   │   │ }
│   │   │   └── POST answers to Django, get results
│   │
│   ├── Profile.jsx
│   │   ├── Display user's profile
│   │   ├── Edit form
│   │   ├── Save changes → POST to Django
│   │
│   └── Notifications.jsx
│       ├── Display notifications
│       ├── Mark as read
│
├── components/
│   ├── Navbar.jsx
│   │   └── Navigation bar (all pages)
│   │
│   ├── PrivateRoute.jsx
│   │   └── Check if user authenticated
│   │   └── If yes → show page, if no → redirect to login
│   │
│   └── Other components
│
├── App.jsx
│   ├── import { BrowserRouter, Routes, Route } from 'react-router-dom'
│   │   └── Routing library (like Django urls.py)
│   │
│   ├── <Route path="/login" element={<Login />} />
│   │   └── When URL is /login, show Login component
│   │
│   ├── <Route path="/dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
│   │   └── When URL is /dashboard, check if authenticated, then show StudentDashboard
│   │
│   ├── <Route path="/drives/:id" element={<DriveDetails />} />
│   │   └── When URL is /drives/2, show DriveDetails with id=2
│   │
│   └── Similar for all pages
│
└── main.jsx
    └── ReactDOM.render(<App />, document.getElementById('root'))
        └── Start React app
```

---

## 🔄 Complete Flow Examples

### Example 1: User Registration & Login Flow

#### FRONTEND (React)

**File: [placeme-frontend/src/pages/Register.jsx](placeme-frontend/src/pages/Register.jsx)**
```jsx
import { useState } from 'react'
import { authService } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'student'
  })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Step 1: Send data to Django
    const { data } = await authService.register(formData)
    // What happens:
    // - Axios creates HTTP POST request
    // - Sends to http://localhost:8000/api/users/register/
    // - Includes formData as JSON body
    
    // Step 2: Django processes and returns response
    // Response data = {message: "User registered successfully", user: {...}}
    
    toast.success('Registration successful!')
    navigate('/login')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
      />
      {/* More inputs... */}
      <button type="submit">Register</button>
    </form>
  )
}
```

#### BACKEND (Django)

**File: [placeme/placeme/users/views.py](placeme/placeme/users/views.py)**
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .models import StudentProfile
from .serializers import UserSerializer, UserRegistrationSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        # Step 1: Receive JSON data from frontend
        # request.data = {username: 'john_student', email: '...', ...}
        
        # Step 2: Validate data using serializer
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            # Step 3: Save user to database
            user = serializer.save()
            # This runs: User.objects.create_user(...)
            
            # Step 4: Create StudentProfile for student
            if request.data.get('role') == 'student':
                StudentProfile.objects.create(user=user)
            
            # Step 5: Convert user object to JSON
            user_data = UserSerializer(user).data
            # user_data = {id: 1, username: 'john_student', email: '...', role: 'student'}
            
            # Step 6: Return JSON response to frontend
            return Response(
                {"message": "User registered successfully", "user": user_data},
                status=status.HTTP_201_CREATED
            )
        
        # If validation fails, return error
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

**File: [placeme/placeme/users/serializers.py](placeme/placeme/users/serializers.py)**
```python
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'role']
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate(self, data):
        # Check if passwords match
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        # Remove password2 (only for validation)
        validated_data.pop('password2')
        
        # Create user with hashed password
        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
```

**File: [placeme/placeme/users/models.py](placeme/placeme/users/models.py)**
```python
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('recruiter', 'Recruiter'),
        ('tpo', 'TPO'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=15, blank=True)
    
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    cgpa = models.FloatField(default=0.0)
    skills = models.TextField(blank=True)
    # ... more fields
```

**File: [placeme/placeme/users/urls.py](placeme/placeme/users/urls.py)**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register('users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

#### FLOW DIAGRAM
```
FRONTEND (React)                    BACKEND (Django)
────────────────────────────────────────────────────

User fills form
        ↓
handleSubmit()
        ↓
authService.register(formData)
        ↓
axios.post('/users/register/', formData)
        ↓
HTTP POST with JSON body
        ├──────────────────────────→  Django receives POST
                                       ↓
                                  urls.py routes to UserViewSet.register()
                                       ↓
                                  Receive request.data (JSON)
                                       ↓
                                  UserRegistrationSerializer validates
                                       ↓
                                  User.objects.create_user() - Save to DB
                                       ↓
                                  StudentProfile.objects.create()
                                       ↓
                                  UserSerializer converts User → JSON
                                       ↓
                                  Return Response (JSON)
        ←──────────────────────────  Send HTTP 201 with JSON
        ↓
Response received
        ↓
toast.success()
        ↓
navigate('/login')
        ↓
User sees login page
```

---

### Example 2: Student Applies to Placement Drive Flow

#### FRONTEND (React)

**File: [placeme-frontend/src/pages/DriveDetails.jsx](placeme-frontend/src/pages/DriveDetails.jsx)**
```jsx
import { useState } from 'react'
import { placementService } from '../services/api'

export default function DriveDetails() {
  const { id } = useParams()
  const [drive, setDrive] = useState(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    // Load drive details on page load
    fetchDrive()
  }, [id])

  const fetchDrive = async () => {
    const { data } = await placementService.getDriveById(id)
    // Makes GET /api/placement/drives/2/
    // Django returns: {id: 2, company: {...}, role: 'SDE', package: 85.0, ...}
    setDrive(data)
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      const { data } = await placementService.applyToDrive(id)
      // Makes POST /api/placement/drives/2/apply/
      // Django returns: {id: 1, student: 5, drive: 2, status: 'applied', ...}
      
      toast.success('Applied successfully!')
      fetchDrive() // Refresh to show updated status
    } catch (error) {
      toast.error('Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div>
      <h1>{drive?.role}</h1>
      <p>{drive?.company?.name}</p>
      <button onClick={handleApply} disabled={applying}>
        {applying ? 'Applying...' : 'Apply Now'}
      </button>
    </div>
  )
}
```

#### BACKEND (Django)

**File: [placeme/placeme/placement/views.py](placeme/placeme/placement/views.py)**
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import PlacementDrive, Application
from .serializers import PlacementDriveSerializer, ApplicationSerializer

class PlacementDriveViewSet(viewsets.ModelViewSet):
    queryset = PlacementDrive.objects.all()
    serializer_class = PlacementDriveSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def apply(self, request, pk=None):
        # Step 1: Get the drive
        drive = self.get_object()
        # pk=2, so drive = PlacementDrive.objects.get(id=2)
        
        # Step 2: Get the student (from JWT token)
        student = request.user.student_profile
        # request.user is extracted from JWT token in Authorization header
        
        # Step 3: Check if already applied
        if Application.objects.filter(student=student, drive=drive).exists():
            return Response(
                {"error": "Already applied"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Step 4: Create application record in database
        application = Application.objects.create(
            student=student,
            drive=drive,
            status='applied'
        )
        
        # Step 5: Convert Application object to JSON
        serializer = ApplicationSerializer(application)
        
        # Step 6: Return JSON response to frontend
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

**File: [placeme/placeme/placement/models.py](placeme/placeme/placement/models.py)**
```python
from django.db import models
from users.models import StudentProfile, Company

class PlacementDrive(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    role = models.CharField(max_length=100)
    package = models.DecimalField(max_digits=10, decimal_places=2)
    # ... more fields

class Application(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    drive = models.ForeignKey(PlacementDrive, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=30,
        choices=[
            ('applied', 'Applied'),
            ('shortlisted', 'Shortlisted'),
            ('rejected', 'Rejected'),
        ],
        default='applied'
    )
    applied_at = models.DateTimeField(auto_now_add=True)
```

**File: [placeme/placeme/placement/serializers.py](placeme/placeme/placement/serializers.py)**
```python
from rest_framework import serializers
from .models import PlacementDrive, Application

class PlacementDriveSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlacementDrive
        fields = ['id', 'company', 'role', 'package', 'status', ...]

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['id', 'student', 'drive', 'status', 'applied_at']
```

#### FLOW DIAGRAM
```
FRONTEND                        BACKEND
────────────────────────────────────────

User on DriveDetails page
        ↓
User clicks "Apply Now"
        ↓
handleApply()
        ↓
placementService.applyToDrive(2)
        ↓
axios.post('/placement/drives/2/apply/')
        ↓
Axios interceptor adds token:
Authorization: Bearer eyJhbGc...
        ↓
HTTP POST request
        ├────────────────────────→  Django receives
                                     ↓
                                 urls.py → PlacementDriveViewSet.apply(pk=2)
                                     ↓
                                 JWT middleware extracts user from token
                                     ↓
                                 request.user = User object (john_student)
                                     ↓
                                 drive = PlacementDrive.objects.get(id=2)
                                     ↓
                                 student = request.user.student_profile
                                     ↓
                                 Check: already applied?
                                     ↓
                                 Application.objects.create(...)
                                 Save to database
                                     ↓
                                 Serialize: Application → JSON
                                 {id: 1, student: 5, drive: 2, status: 'applied'}
                                     ↓
                                 Return HTTP 201
        ←────────────────────────  Send JSON
        ↓
Receive response
        ↓
toast.success()
        ↓
fetchDrive() refresh
        ↓
Button shows "Applied" instead of "Apply"
        ↓
User sees update
```

---

## 🔐 Authentication Deep Dive

### How JWT Authentication Works

#### STEP 1: LOGIN
```
FRONTEND sends:
POST /api/token/
{username: 'john_student', password: 'pass123'}

BACKEND receives:
↓
Validates credentials against User table
↓
If valid:
  - Create Access Token (15 min expiry)
  - Create Refresh Token (7 day expiry)
  - Return both

Response:
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

FRONTEND receives:
↓
Stores in Zustand (global state)
useAuthStore.login(user, accessToken, refreshToken)
↓
Also stored in localStorage (persisted)
```

#### STEP 2: MAKING AUTHENTICATED REQUESTS
```
FRONTEND (React):
File: [src/services/api.js](placeme-frontend/src/services/api.js#L7-L17)

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token  // Get token from state
  if (token) {
    config.headers.Authorization = `Bearer ${token}`  // Add to headers
  }
  return config
})

When React makes request:
GET /api/users/me/
↓
Interceptor automatically adds:
Authorization: Bearer eyJhbGciOiJIUzI1NiI...
↓
Axios sends HTTP request with header
```

```
BACKEND (Django):
File: [settings.py](placeme/placeme/settings.py#L150-L160)

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

When Django receives request:
1. Read Authorization header
2. Extract token: "eyJhbGciOiJIUzI1NiI..."
3. Decode and verify token signature
4. Extract user info from token
5. Set request.user to that user
6. Continue with view

In view:
@permission_classes([IsAuthenticated])
def my_view(request):
    print(request.user)  # User object (john_student)
    print(request.user.role)  # 'student'
    print(request.user.student_profile)  # StudentProfile object
```

#### STEP 3: TOKEN EXPIRES
```
After 15 minutes, access token expires.

FRONTEND makes request:
GET /api/users/me/
Authorization: Bearer <expired_token>

BACKEND:
↓
Reads token
↓
Decodes token
↓
Checks expiry: EXPIRED!
↓
Returns 401 Unauthorized

FRONTEND (Interceptor):
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && refreshToken) {
      // Token expired, try to refresh
      const { data } = await axios.post('/api/token/refresh/', {
        refresh: refreshToken
      })
      
      // Get new access token
      setToken(data.access)  // Update state
      
      // Retry original request with new token
      error.config.headers.Authorization = `Bearer ${data.access}`
      return api(error.config)
    }
    
    return Promise.reject(error)
  }
)

BACKEND receives refresh request:
POST /api/token/refresh/
{refresh: <refresh_token>}
↓
Validates refresh token
↓
If valid: Create new access token
↓
Return new token

FRONTEND:
↓
Stores new access token
↓
Retries original request with new token
↓
Success!

User doesn't notice anything!
```

### Key Files for Authentication

| File | What it does |
|------|------------|
| [settings.py](placeme/placeme/settings.py#L150-L160) | Configures JWT authentication |
| [urls.py](placeme/placeme/placeme/urls.py) | Token endpoints (/api/token/, /api/token/refresh/) |
| [users/views.py](placeme/placeme/users/views.py) | Register + /me/ endpoints |
| [users/serializers.py](placeme/placeme/users/serializers.py) | Validate + serialize user data |
| [authContext.js](placeme-frontend/src/context/authContext.js) | Zustand store for tokens |
| [api.js](placeme-frontend/src/services/api.js) | Axios interceptors |

---

## 🔑 Key Concepts

### 1. REST API
```
Representational State Transfer API

Traditional Django:
GET /students/ → Server renders HTML → HTML sent to browser

REST API:
GET /api/students/ → Server returns JSON → Browser renders with React

Benefits:
- Same backend can serve multiple frontends (React, Vue, Mobile App)
- Separates backend logic from frontend logic
- Frontend can be updated independently
- Lighter requests (JSON vs HTML)
```

### 2. Serializers
```
Django Serializer = Converter between Python objects and JSON

Python object:
user = User.objects.get(id=1)
user.username  # "john_student"
user.email     # "john@college.com"

↓ Serializer.to_representation() ↓

JSON:
{
  "id": 1,
  "username": "john_student",
  "email": "john@college.com"
}

↓ Serializer.to_internal_value() ↓

Python object:
user = User(**validated_data)
```

### 3. ViewSets
```
ViewSet = One class to handle multiple HTTP methods

Old Django view (one per HTTP method):
def get_student(request, student_id):
    student = Student.objects.get(id=student_id)
    return render(request, 'student.html', {...})

def create_student(request):
    student = Student.objects.create(...)
    return redirect('student_detail', student.id)

DRF ViewSet (one class):
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    # Automatically provides:
    # list()     - GET /students/
    # retrieve() - GET /students/1/
    # create()   - POST /students/
    # update()   - PUT /students/1/
    # destroy()  - DELETE /students/1/
```

### 4. State Management (Zustand)
```
Think of it like Django sessions but in frontend.

Django Session:
request.session['user_id'] = 1
# Stored on server, accessed in views

React Zustand Store:
useAuthStore.user = {...}
// Stored in browser memory + localStorage
// Accessible from any component

Example:
// In LoginPage
useAuthStore.login(user, token, refreshToken)

// In Dashboard (different component, no props needed)
const { user } = useAuthStore()
console.log(user.username)  // Works!
```

### 5. React Hooks
```
useState - Local component state
const [students, setStudents] = useState([])
// Like a variable that triggers re-render when changed

useEffect - Run code after render
useEffect(() => {
  // Fetch data from API
  fetchStudents()
}, [])  // [] = only run once on mount
// Like Django signal or __init__ method

Custom hooks - Reusable logic
export const useAuth = () => {
  return useAuthStore()
}
// Used in any component
const { user } = useAuth()
```

### 6. React Router
```
Frontend routing (no page reload)

url /dashboard → Dashboard component
url /drives/2 → DriveDetails component with id=2
url /applications → Applications component

Like Django urls.py but in browser:

Django:
path('students/', views.student_list)
path('students/<int:id>/', views.student_detail)

React Router:
<Route path="/students" element={<StudentList />} />
<Route path="/students/:id" element={<StudentDetail />} />
```

### 7. Axios Interceptors
```
Middleware for HTTP requests

Like Django middleware but for frontend requests.

Request Interceptor:
Before sending request → Add JWT token to headers

Response Interceptor:
After receiving response:
- If 401 (token expired) → Refresh token → Retry request
- If error → Show toast notification
```

---

## 🔗 How Django REST Framework Works

### Traditional Django Route
```
URLs:
path('students/', views.student_list)

Views:
def student_list(request):
    if request.method == 'GET':
        ... render template
    elif request.method == 'POST':
        ... create object

No separation of concerns
```

### DRF Route
```
URLs:
router.register('students', StudentViewSet)
# Automatically creates:
# GET    /students/          → StudentViewSet.list()
# POST   /students/          → StudentViewSet.create()
# GET    /students/1/        → StudentViewSet.retrieve(id=1)
# PUT    /students/1/        → StudentViewSet.update(id=1)
# DELETE /students/1/        → StudentViewSet.destroy(id=1)

ViewSets:
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    # Optionally override:
    def list(self, request):
        pass  # GET /students/
    
    def create(self, request):
        pass  # POST /students/
    
    @action(detail=True, methods=['post'])
    def custom_action(self, request, pk=None):
        pass  # POST /students/{id}/custom_action/

Clear separation: Model → Serializer → ViewSet → Response
```

---

## 📚 Files Used in Your Project

### Backend Files
1. [placeme/placeme/settings.py](placeme/placeme/settings.py) - Configuration
2. [placeme/placeme/urls.py](placeme/placeme/placeme/urls.py) - URL routing
3. [placeme/placeme/users/models.py](placeme/placeme/users/models.py) - User & StudentProfile models
4. [placeme/placeme/users/serializers.py](placeme/placeme/users/serializers.py) - Serializers
5. [placeme/placeme/users/views.py](placeme/placeme/users/views.py) - Auth endpoints
6. [placeme/placeme/placement/models.py](placeme/placeme/placement/models.py) - Placement models
7. [placeme/placeme/placement/serializers.py](placeme/placeme/placement/serializers.py) - Placement serializers
8. [placeme/placeme/placement/views.py](placeme/placeme/placement/views.py) - Placement endpoints
9. [placeme/placeme/training/models.py](placeme/placeme/training/models.py) - Training models
10. [placeme/placeme/training/serializers.py](placeme/placeme/training/serializers.py) - Training serializers
11. [placeme/placeme/training/views.py](placeme/placeme/training/views.py) - Training endpoints

### Frontend Files
1. [placeme-frontend/src/services/api.js](placeme-frontend/src/services/api.js) - API client
2. [placeme-frontend/src/context/authContext.js](placeme-frontend/src/context/authContext.js) - Auth state
3. [placeme-frontend/src/pages/Login.jsx](placeme-frontend/src/pages/Login.jsx) - Login page
4. [placeme-frontend/src/pages/Register.jsx](placeme-frontend/src/pages/Register.jsx) - Register page
5. [placeme-frontend/src/pages/StudentDashboard.jsx](placeme-frontend/src/pages/StudentDashboard.jsx) - Dashboard
6. [placeme-frontend/src/pages/PlacementDrives.jsx](placeme-frontend/src/pages/PlacementDrives.jsx) - Drives listing
7. [placeme-frontend/src/pages/DriveDetails.jsx](placeme-frontend/src/pages/DriveDetails.jsx) - Drive detail + apply
8. [placeme-frontend/src/pages/Applications.jsx](placeme-frontend/src/pages/Applications.jsx) - Applications tracking
9. [placeme-frontend/src/pages/MockTests.jsx](placeme-frontend/src/pages/MockTests.jsx) - Tests listing
10. [placeme-frontend/src/pages/TestDetail.jsx](placeme-frontend/src/pages/TestDetail.jsx) - Test attempt
11. [placeme-frontend/src/App.jsx](placeme-frontend/src/App.jsx) - Routing setup

---

## 🎯 Summary: How They Connect

```
┌──────────────────────────────────────────────────────┐
│          USER OPENS BROWSER                           │
│          React app loads (JavaScript)                 │
└──────────────────┬───────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  ui displayed       │
        │  stored in state    │
        │  (Zustand)          │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  USER INTERACTION   │
        │  (click, submit)    │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────────────┐
        │  EVENT HANDLER TRIGGERED   │
        │  handleApply(),            │
        │  handleSubmit(), etc       │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────────┐
        │  CALL API SERVICE                │
        │  placementService.applyToDrive() │
        │  trainingService.startTest()     │
        └──────────┬──────────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │  AXIOS HTTP REQUEST          │
        │  POST /api/placement/...     │
        │  GET /api/training/...       │
        │  (with JWT token)            │
        └──────────┬──────────────────┘
                   │
    ═══════════════════════════════════════════════════════
                 NETWORK (HTTP)
    ═══════════════════════════════════════════════════════
                   │
        ┌──────────▼──────────────────┐
        │  DJANGO RECEIVES REQUEST    │
        │  Django Routes using urls   │
        │  Finds matching ViewSet     │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │  JWT MIDDLEWARE             │
        │  Extracts user from token   │
        │  Sets request.user          │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │  VIEWSET METHOD EXECUTES    │
        │  apply(), create(), etc     │
        │  Can access request.user    │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │  DATABASE OPERATIONS        │
        │  Query/Create/Update        │
        │  Django ORM                 │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │  SERIALIZER                 │
        │  Convert Model → JSON       │
        │  UserSerializer,            │
        │  ApplicationSerializer      │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │  RESPONSE (JSON)            │
        │  HTTP 200 / 201 / 400 /     │
        │  {data: {...}}              │
        └──────────┬──────────────────┘
                   │
    ═══════════════════════════════════════════════════════
                 NETWORK (HTTP)
    ═══════════════════════════════════════════════════════
                   │
        ┌──────────▼──────────────────┐
        │  REACT RECEIVES JSON        │
        │  payload.data               │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │  UPDATE STATE               │
        │  setState(data)             │
        │  setApplications([...])     │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │  REACT RE-RENDERS           │
        │  Uses new state             │
        │  Calls render() function    │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │  UI UPDATED IN BROWSER      │
        │  User sees new data         │
        └──────────────────────────────┘
```

---

**END OF LEARNING GUIDE**

Now copy this entire file and paste it into ChatGPT for detailed explanations! 🚀
