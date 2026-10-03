from django.contrib import admin
from .models import Course, Enrollment, MockTest, TestAttempt

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'level', 'duration_hours', 'instructor_name', 'is_active')
    list_filter = ('category', 'level', 'is_active', 'created_at')
    search_fields = ('title', 'instructor_name')
    readonly_fields = ('created_at', 'updated_at', 'total_students')
    fieldsets = (
        ('Course Information', {
            'fields': ('title', 'description', 'category', 'level')
        }),
        ('Course Details', {
            'fields': ('duration_hours', 'instructor_name', 'instructor_bio')
        }),
        ('Media', {
            'fields': ('thumbnail_url',)
        }),
        ('Stats', {
            'fields': ('total_students', 'rating', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'status', 'progress_percentage', 'enrolled_at')
    list_filter = ('status', 'course', 'enrolled_at')
    search_fields = ('student__username', 'course__title')
    readonly_fields = ('enrolled_at',)
    fieldsets = (
        ('Enrollment Details', {
            'fields': ('student', 'course', 'status')
        }),
        ('Progress', {
            'fields': ('progress_percentage', 'completed_at')
        }),
        ('Certificate', {
            'fields': ('certificate_url',)
        }),
        ('Timeline', {
            'fields': ('enrolled_at',),
            'classes': ('collapse',)
        }),
    )

@admin.register(MockTest)
class MockTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'difficulty', 'total_questions', 'duration_minutes', 'test_url', 'is_active')
    list_filter = ('difficulty', 'course', 'is_active')
    search_fields = ('title', 'course__title')
    readonly_fields = ('created_at',)

@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'test', 'score', 'max_score', 'is_passed', 'attempted_at')
    list_filter = ('is_passed', 'test', 'attempted_at')
    search_fields = ('student__username', 'test__title')
    readonly_fields = ('attempted_at',)
