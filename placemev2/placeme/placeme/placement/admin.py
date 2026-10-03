from django.contrib import admin
from .models import Company, Drive, Application

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'industry', 'created_at')
    list_filter = ('industry', 'created_at')
    search_fields = ('name', 'location')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Drive)
class DriveAdmin(admin.ModelAdmin):
    list_display = ('position', 'company', 'package', 'eligibility', 'deadline', 'is_active')
    list_filter = ('is_active', 'eligibility', 'company', 'deadline')
    search_fields = ('position', 'company__name')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Drive Information', {
            'fields': ('company', 'position', 'package', 'ctc', 'eligibility')
        }),
        ('Details', {
            'fields': ('job_description', 'required_skills', 'location')
        }),
        ('Timeline', {
            'fields': ('deadline', 'drive_date')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'drive', 'status', 'applied_at')
    list_filter = ('status', 'applied_at', 'drive__company')
    search_fields = ('student__username', 'drive__position')
    readonly_fields = ('applied_at', 'updated_at')
    fieldsets = (
        ('Application Details', {
            'fields': ('student', 'drive', 'status')
        }),
        ('Interview Info', {
            'fields': ('interview_date', 'notes')
        }),
        ('Documents', {
            'fields': ('resume_url',)
        }),
        ('Timestamps', {
            'fields': ('applied_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
