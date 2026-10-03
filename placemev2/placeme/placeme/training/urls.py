from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, EnrollmentViewSet, MockTestViewSet, TestAttemptViewSet
from .ai_views import StudyAssistantChatView

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'tests', MockTestViewSet, basename='mock-test')
router.register(r'attempts', TestAttemptViewSet, basename='test-attempt')

urlpatterns = [
    path('', include(router.urls)),
    path('study-assistant/', StudyAssistantChatView.as_view(), name='study-assistant'),
]

from . import tpo_views

tpo_router = DefaultRouter()
tpo_router.register(r'courses', tpo_views.TPOCourseViewSet, basename='tpo-course')
tpo_router.register(r'mock-tests', tpo_views.TPOMockTestViewSet, basename='tpo-mock-test')
tpo_router.register(r'enrollments', tpo_views.TPOEnrollmentViewSet, basename='tpo-enrollment')
tpo_router.register(r'attempts', tpo_views.TPOTestAttemptViewSet, basename='tpo-attempt')

urlpatterns += [
    path('tpo/', include(tpo_router.urls)),
]
