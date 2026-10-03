from django.contrib import admin
from .models import Notification, InterviewExperience

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    readonly_fields = ('created_at', 'read_at')
    fieldsets = (
        ('Notification', {
            'fields': ('user', 'title', 'message', 'notification_type')
        }),
        ('Links', {
            'fields': ('action_url',)
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Timeline', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

@admin.register(InterviewExperience)
class InterviewExperienceAdmin(admin.ModelAdmin):
    list_display = ('position', 'company', 'author', 'difficulty', 'result', 'created_at')
    list_filter = ('difficulty', 'result', 'created_at')
    search_fields = ('company', 'position', 'author__username')
    readonly_fields = ('created_at', 'updated_at', 'upvotes')
    fieldsets = (
        ('Company & Position', {
            'fields': ('company', 'position')
        }),
        ('Interview Details', {
            'fields': ('rounds', 'difficulty', 'questions_asked', 'tips', 'result', 'date')
        }),
        ('Author', {
            'fields': ('author',)
        }),
        ('Engagement', {
            'fields': ('upvotes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
