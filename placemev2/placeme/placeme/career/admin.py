from django.contrib import admin

from .models import (
    StudentProfile,
    Project
)


# ============================================
# STUDENT PROFILE ADMIN
# ============================================

@admin.register(StudentProfile)
class StudentProfileAdmin(
    admin.ModelAdmin
):

    list_display = (
        'id',
        'user',
        'branch',
        'cgpa',
        'profile_completion',
        'updated_at'
    )

    search_fields = (
        'user__username',
        'headline',
        'skills'
    )

    list_filter = (
        'branch',
        'graduation_year'
    )


# ============================================
# PROJECT ADMIN
# ============================================

@admin.register(Project)
class ProjectAdmin(
    admin.ModelAdmin
):

    list_display = (
        'id',
        'title',
        'student',
        'featured',
        'created_at'
    )

    search_fields = (
        'title',
        'tech_stack'
    )

    list_filter = (
        'featured',
    )