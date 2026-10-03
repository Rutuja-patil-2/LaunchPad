from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    """User notification"""
    NOTIFICATION_TYPES = [
        ('placement', 'Placement'),
        ('training', 'Training'),
        ('interview', 'Interview'),
        ('achievement', 'Achievement'),
        ('message', 'Message'),
        ('deadline', 'Deadline'),
        ('system', 'System'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system')
    is_read = models.BooleanField(default=False)
    action_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"[{self.get_notification_type_display()}] {self.title}"

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Notifications'


class InterviewExperience(models.Model):
    """Student's interview experience sharing"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    RESULT_CHOICES = [
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
    ]

    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='medium')
    rounds = models.CharField(max_length=255, help_text="e.g., Written, Group Discussion, Personal Interview")
    questions_asked = models.TextField()
    tips = models.TextField()
    result = models.CharField(max_length=20, choices=RESULT_CHOICES)
    date = models.DateField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interview_experiences')
    upvotes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.position} @ {self.company} by {self.author.username}"

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Interview Experiences'
