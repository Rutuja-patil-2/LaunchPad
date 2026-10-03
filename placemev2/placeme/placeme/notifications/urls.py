from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, InterviewExperienceViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'experiences', InterviewExperienceViewSet, basename='interview-experience')

urlpatterns = [
    path('', include(router.urls)),
]
