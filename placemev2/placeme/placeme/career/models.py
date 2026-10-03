from django.db import models

from django.contrib.auth import (
    get_user_model
)

User = get_user_model()


# ============================================
# STUDENT PROFILE
# ============================================

class StudentProfile(models.Model):

    user = models.OneToOneField(
        User,

        on_delete=models.CASCADE,

        related_name='student_profile'
    )

    # ========================================
    # BASIC INFO
    # ========================================

    profile_picture = models.ImageField(
        upload_to='profile_pictures/',

        blank=True,

        null=True
    )

    headline = models.CharField(
        max_length=255,

        blank=True
    )

    about = models.TextField(
        blank=True
    )

    location = models.CharField(
        max_length=100,

        blank=True
    )

    # ========================================
    # ACADEMIC INFO
    # ========================================

    branch = models.CharField(
        max_length=100,

        blank=True
    )

    graduation_year = models.IntegerField(
        null=True,

        blank=True
    )

    cgpa = models.DecimalField(
        max_digits=4,

        decimal_places=2,

        null=True,

        blank=True
    )

    backlogs = models.IntegerField(
        default=0
    )

    # ========================================
    # SKILLS
    # ========================================

    skills = models.TextField(
        blank=True,

        help_text=
            "Comma separated skills"
    )

    # ========================================
    # SOCIAL LINKS
    # ========================================

    github_url = models.URLField(
        blank=True
    )

    linkedin_url = models.URLField(
        blank=True
    )

    portfolio_url = models.URLField(
        blank=True
    )

    leetcode_url = models.URLField(
        blank=True
    )

    # ========================================
    # RESUME
    # ========================================

    resume = models.FileField(
        upload_to='resumes/',

        blank=True,

        null=True
    )

    # ========================================
    # PROFILE COMPLETION
    # ========================================

    profile_completion = models.IntegerField(
        default=0
    )

    # ========================================
    # TIMESTAMPS
    # ========================================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # ========================================
    # STRING
    # ========================================

    def __str__(self):

        return (
            f"{self.user.username} "
            f"Profile"
        )

    # ========================================
    # CALCULATE PROFILE COMPLETION
    # ========================================

    def calculate_completion(self):
        """Calculate profile completion percentage"""
        
        score = 0
        
        # Required fields (must have for placement)
        if self.branch:
            score += 20
        
        if self.cgpa:
            score += 20
        
        if self.skills:
            score += 20
        
        # Important fields
        if self.headline:
            score += 10
        
        if self.about:
            score += 10
        
        if self.resume:
            score += 10
        
        # Optional fields (bonus)
        if self.projects.exists():
            score += 5
        
        if self.github_url:
            score += 2
        
        if self.linkedin_url:
            score += 2
        
        if self.portfolio_url:
            score += 1
        
        if self.leetcode_url:
            score += 1
        
        return min(score, 100)

    # ========================================
    # UPDATE COMPLETION PERCENTAGE
    # ========================================

    def update_completion(self):
        """Update profile_completion field"""
        
        self.profile_completion = self.calculate_completion()
        
        self.save(update_fields=['profile_completion'])
        
        return self.profile_completion

    # ========================================
    # CHECK IF PLACEMENT READY
    # ========================================

    def is_placement_ready(self):
        """Check if profile is ready for placement (70% complete & all required fields)"""
        
        required_met = (
            self.branch and 
            self.cgpa and 
            self.skills
        )
        
        completion = self.calculate_completion()
        
        return required_met and completion >= 70

    # ========================================
    # GET MISSING FIELDS
    # ========================================

    def get_missing_fields(self):
        """Get list of missing required fields"""
        
        missing = []
        
        if not self.branch:
            missing.append('Branch')
        
        if not self.cgpa:
            missing.append('CGPA')
        
        if not self.skills:
            missing.append('Skills')
        
        if not self.headline:
            missing.append('Headline')
        
        if not self.about:
            missing.append('About/Bio')
        
        if not self.resume:
            missing.append('Resume')
        
        return missing

    # ========================================
    # META
    # ========================================

    class Meta:

        ordering = ['-updated_at']


# ============================================
# PROJECT MODEL
# ============================================

class Project(models.Model):

    student = models.ForeignKey(
        StudentProfile,

        on_delete=models.CASCADE,

        related_name='projects'
    )

    title = models.CharField(
        max_length=255
    )

    description = models.TextField()

    tech_stack = models.CharField(
        max_length=255,

        help_text=
            "React, Django, MongoDB"
    )

    github_url = models.URLField(
        blank=True
    )

    live_url = models.URLField(
        blank=True
    )

    featured = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    # ========================================
    # STRING
    # ========================================

    def __str__(self):

        return self.title

    # ========================================
    # META
    # ========================================

    class Meta:

        ordering = ['-created_at']