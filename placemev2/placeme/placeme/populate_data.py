#!/usr/bin/env python
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placeme.settings')
django.setup()

from django.contrib.auth import get_user_model
from placement.models import Company, Drive
from training.models import Course
from datetime import datetime, timedelta

User = get_user_model()

# Create test user
user, created = User.objects.get_or_create(
    username='student1',
    defaults={
        'email': 'student@example.com',
        'first_name': 'Test',
        'last_name': 'Student',
        'role': 'student'
    }
)
if created:
    user.set_password('student123')
    user.save()
    print("✓ Created test student user")
else:
    print("✓ Student user already exists")

# Create test companies
companies_data = [
    {'name': 'Google', 'location': 'Mountain View, CA', 'industry': 'Technology'},
    {'name': 'Microsoft', 'location': 'Redmond, WA', 'industry': 'Technology'},
    {'name': 'Amazon', 'location': 'Seattle, WA', 'industry': 'Technology'},
    {'name': 'Meta', 'location': 'Menlo Park, CA', 'industry': 'Technology'},
]

for data in companies_data:
    company, created = Company.objects.get_or_create(
        name=data['name'],
        defaults={
            'location': data['location'],
            'industry': data['industry'],
            'website': f"www.{data['name'].lower()}.com",
            'description': f"{data['name']} is a leading technology company"
        }
    )
    if created:
        print(f"✓ Created company: {data['name']}")

# Create test drives
companies = Company.objects.all()
for company in companies:
    drive, created = Drive.objects.get_or_create(
        company=company,
        position='Software Engineer',
        defaults={
            'package': '25 LPA',
            'eligibility': 'CSE',
            'required_skills': 'Python, DSA, Databases',
            'job_description': 'We are looking for Software Engineers',
            'deadline': datetime.now() + timedelta(days=30),
            'is_active': True
        }
    )
    if created:
        print(f"✓ Created drive: {company.name} - {drive.position}")

# Create test courses
courses_data = [
    {'title': 'Python for Beginners', 'category': 'Programming', 'level': 'beginner', 'instructor_name': 'John Doe'},
    {'title': 'Advanced DSA', 'category': 'Programming', 'level': 'advanced', 'instructor_name': 'Jane Smith'},
    {'title': 'Web Development', 'category': 'Web', 'level': 'intermediate', 'instructor_name': 'Bob Johnson'},
]

for data in courses_data:
    course, created = Course.objects.get_or_create(
        title=data['title'],
        defaults={
            'category': data['category'],
            'level': data['level'],
            'instructor_name': data['instructor_name'],
            'duration_hours': 20,
            'rating': 4.5,
            'is_active': True
        }
    )
    if created:
        print(f"✓ Created course: {data['title']}")

print("\n✓ All test data created successfully!")
