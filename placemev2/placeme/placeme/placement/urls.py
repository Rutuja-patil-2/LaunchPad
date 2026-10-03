from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, DriveViewSet, ApplicationViewSet, InterviewScheduleViewSet
from . import tpo_views

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'drives', DriveViewSet, basename='drive')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(
    r'interview-schedules',
    InterviewScheduleViewSet
)


# TPO-specific endpoints (restricted to users with TPO role)
tpo_router = DefaultRouter()
tpo_router.register(r'companies', tpo_views.TPOCompanyViewSet, basename='tpo-company')
tpo_router.register(r'drives', tpo_views.TPODriveViewSet, basename='tpo-drive')
tpo_router.register(r'applications', tpo_views.TPOApplicationViewSet, basename='tpo-application')
tpo_router.register(r'dashboard', tpo_views.TPODashboardViewSet, basename='tpo-dashboard')

urlpatterns = [
    path('', include(router.urls)),
    path('tpo/', include(tpo_router.urls)),
]
