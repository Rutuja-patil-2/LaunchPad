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
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"

class Resume(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='resume'
    )

    headline = models.CharField(
        max_length=255,
        blank=True
    )

    summary = models.TextField(
        blank=True
    )

    skills = models.TextField(
        blank=True,
        help_text='Comma separated skills'
    )

    education = models.TextField(
        blank=True
    )

    experience = models.TextField(
        blank=True
    )

    projects = models.TextField(
        blank=True
    )

    linkedin_url = models.URLField(
        blank=True
    )

    github_url = models.URLField(
        blank=True
    )

    portfolio_url = models.URLField(
        blank=True
    )

    resume_score = models.IntegerField(
        default=0
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} Resume"


class EmailVerification(models.Model):
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'email_verifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.created_at})"