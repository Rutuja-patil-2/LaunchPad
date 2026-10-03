from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet
from .resume_views import ResumeAnalyzeView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path(
        'users/resume/analyze/',
        ResumeAnalyzeView.as_view(),
        name='resume-analyze',
    ),
    path('', include(router.urls)),
]
