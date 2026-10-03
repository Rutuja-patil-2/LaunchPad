from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Company(models.Model):
    """Company conducting placement drives"""

    name = models.CharField(max_length=255, unique=True)

    recruiter = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='company',
        null=True,
        blank=True
    )

    logo_url = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    industry = models.CharField(max_length=255, blank=True)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Companies'

class Drive(models.Model):
    """Placement drive by a company"""

    DRIVE_TYPE_CHOICES = [
        ('placement', 'Placement'),
        ('internship', 'Internship'),
    ]

    ELIGIBILITY_CHOICES = [
        ('All', 'All Branches'),
        ('CSE', 'CSE Only'),
        ('IT', 'IT Only'),
        ('ECE', 'ECE Only'),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='drives'
    )

    position = models.CharField(max_length=255)

    drive_type = models.CharField(
        max_length=20,
        choices=DRIVE_TYPE_CHOICES,
        default='placement'
    )

    package = models.CharField(
        max_length=50,
        help_text="e.g., 12 LPA"
    )

    ctc = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    eligibility = models.CharField(
        max_length=50,
        choices=ELIGIBILITY_CHOICES,
        default='All'
    )

    required_skills = models.TextField(
        help_text="Comma-separated skills"
    )

    job_description = models.TextField(blank=True)

    deadline = models.DateTimeField()

    drive_date = models.DateTimeField(
        null=True,
        blank=True
    )

    location = models.CharField(
        max_length=255,
        blank=True
    )

    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company.name} - {self.position}"

    class Meta:
        ordering = ['-deadline']

    @property
    def days_left(self):
        days = (self.deadline - timezone.now()).days
        return max(0, days)


class Application(models.Model):
    """Student application to a drive"""

    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('reviewed', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('interviewed', 'Interviewed'),
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
    ]

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    drive = models.ForeignKey(
        Drive,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='applied'
    )

    resume_url = models.URLField(
        blank=True,
        null=True
    )

    applied_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    interview_date = models.DateTimeField(
        null=True,
        blank=True
    )

    notes = models.TextField(blank=True)

    def __str__(self):
        return (
            f"{self.student.username} - "
            f"{self.drive.position} @ "
            f"{self.drive.company.name}"
        )

    class Meta:
        ordering = ['-applied_at']
        unique_together = ('student', 'drive')




class InterviewSchedule(models.Model):

    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('passed', 'Passed'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name='interviews'
    )

    round_name = models.CharField(
        max_length=100
    )

    interview_date = models.DateTimeField()

    meeting_link = models.URLField(
        blank=True,
        null=True
    )

    notes = models.TextField(
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.application.student.username} - {self.round_name}"
