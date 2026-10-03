from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Course(models.Model):
    """Training course"""
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    CATEGORY_CHOICES = [
        ('dsa', 'Data Structures & Algorithms'),
        ('web', 'Web Development'),
        ('ml', 'Machine Learning'),
        ('cloud', 'Cloud Computing'),
        ('devops', 'DevOps'),
        ('database', 'Database'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    duration_hours = models.IntegerField(help_text="Duration in hours")
    instructor_name = models.CharField(max_length=255)
    instructor_bio = models.TextField(blank=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    total_students = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Enrollment(models.Model):
    """Student enrollment in a course"""
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    progress_percentage = models.IntegerField(default=0)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    certificate_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.username} - {self.course.title}"

    class Meta:
        ordering = ['-enrolled_at']
        unique_together = ('student', 'course')


class MockTest(models.Model):
    """Mock test for assessment"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tests', null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='medium')
    total_questions = models.IntegerField(default=0)
    duration_minutes = models.IntegerField(default=60)
    passing_percentage = models.IntegerField(default=50)
    test_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class TestAttempt(models.Model):
    """Student's attempt at a mock test"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='test_attempts')
    test = models.ForeignKey(MockTest, on_delete=models.CASCADE, related_name='attempts')
    score = models.IntegerField(default=0)
    max_score = models.IntegerField(default=100)
    attempted_at = models.DateTimeField(auto_now_add=True)
    time_taken_minutes = models.IntegerField(null=True, blank=True)
    is_passed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.username} - {self.test.title} ({self.score}/{self.max_score})"

    class Meta:
        ordering = ['-attempted_at']
        unique_together = ('student', 'test', 'attempted_at')
