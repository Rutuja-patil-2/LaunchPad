# placement/tpo_views.py

from rest_framework import viewsets
from .models import Company
from .serializers import CompanySerializer
from .permissions import IsTPO
from rest_framework.permissions import IsAuthenticated
from .models import Company, Drive, Application
from .serializers import (
    CompanySerializer,
    DriveSerializer,
    ApplicationDetailSerializer
)

from rest_framework.response import Response
from rest_framework.decorators import action

class TPOCompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsTPO]

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        editable_fields = {
            'description',
            'is_verified'
        }
        data = {
            field: request.data[field]
            for field in editable_fields
            if field in request.data
        }

        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)
    
class TPODriveViewSet(viewsets.ModelViewSet):
    queryset = Drive.objects.all()
    serializer_class = DriveSerializer
    permission_classes = [IsAuthenticated, IsTPO]

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        editable_fields = {
            'drive_type',
            'required_skills',
            'job_description',
            'deadline',
            'location',
            'is_verified'
        }
        data = {
            field: request.data[field]
            for field in editable_fields
            if field in request.data
        }

        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)
    
class TPOApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Application.objects.select_related(
        'student',
        'drive',
        'drive__company'
    )
    serializer_class = ApplicationDetailSerializer
    permission_classes = [IsAuthenticated, IsTPO]
    
class TPODashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsTPO]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            "companies": Company.objects.count(),
            "drives": Drive.objects.count(),
            "applications": Application.objects.count(),
            "selected": Application.objects.filter(
                status="selected"
            ).count()
        })
