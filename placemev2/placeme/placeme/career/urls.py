from django.urls import (
    path,
    include
)

from rest_framework.routers import (
    DefaultRouter
)

from .views import (
    MyProfileView,
    ProjectViewSet
)

router = DefaultRouter()

router.register(
    r'projects',
    ProjectViewSet,
    basename='project'
)

urlpatterns = [

    # ========================================
    # MY PROFILE
    # ========================================

    path(
        'profiles/me/',
        MyProfileView.as_view()
    ),

    # ========================================
    # PROJECT ROUTES
    # ========================================

    path(
        '',
        include(router.urls)
    ),
]