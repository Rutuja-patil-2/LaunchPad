from django.contrib import admin
from django.contrib.auth.admin import (
    UserAdmin as BaseUserAdmin
)

from .models import User, Resume


# ============================================
# USER ADMIN
# ============================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):

    list_display = [
        'username',
        'email',
        'role',
        'first_name',
        'last_name'
    ]

    list_filter = [
        'role',
        'is_staff',
        'is_active'
    ]

    fieldsets = (
        BaseUserAdmin.fieldsets
        + (
            (
                'Launchpad',
                {
                    'fields': (
                        'role',
                        'phone'
                    )
                },
            ),
        )
    )


# ============================================
# RESUME ADMIN
# ============================================

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'user',
        'headline',
        'resume_score',
        'updated_at'
    )

    search_fields = (
        'user__username',
        'headline'
    )