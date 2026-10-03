from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import (
    Course,
    MockTest,
    Enrollment,
    TestAttempt
)

from .serializers import (
    CourseSerializer,
    MockTestSerializer,
    EnrollmentDetailSerializer,
    TestAttemptDetailSerializer
)

from placement.permissions import IsTPO

from .models import MockTest
from .serializers import MockTestSerializer

class TPOCourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTPO]

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        course = self.get_object()
        enrollments = Enrollment.objects.filter(
            course=course
        ).select_related('student')

        return Response({
            'course': CourseSerializer(course).data,
            'enrolled_count': enrollments.count(),
            'students': [
                {
                    'enrollment_id': enrollment.id,
                    'id': enrollment.student.id,
                    'username': enrollment.student.username,
                    'first_name': enrollment.student.first_name,
                    'last_name': enrollment.student.last_name,
                    'email': enrollment.student.email,
                    'progress_percentage': enrollment.progress_percentage,
                    'status': enrollment.status,
                    'enrolled_at': enrollment.enrolled_at,
                }
                for enrollment in enrollments
            ]
        })


class TPOMockTestViewSet(viewsets.ModelViewSet):
    queryset = MockTest.objects.all()
    serializer_class = MockTestSerializer
    permission_classes = [IsAuthenticated, IsTPO]


class TPOEnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Enrollment.objects.select_related(
        'student',
        'course'
    )
    serializer_class = EnrollmentDetailSerializer
    permission_classes = [IsAuthenticated, IsTPO]

    @action(detail=True, methods=['patch'])
    def update_progress(self, request, pk=None):
        enrollment = self.get_object()
        progress = request.data.get('progress_percentage')

        try:
            progress = int(progress)
        except (TypeError, ValueError):
            return Response(
                {'error': 'progress_percentage must be a number'},
                status=400
            )

        if progress < 0 or progress > 100:
            return Response(
                {'error': 'progress_percentage must be between 0 and 100'},
                status=400
            )

        enrollment.progress_percentage = progress
        enrollment.status = (
            'completed'
            if progress == 100
            else 'in_progress'
        )
        enrollment.save()

        return Response(
            EnrollmentDetailSerializer(enrollment).data
        )


class TPOTestAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TestAttempt.objects.select_related(
        'student',
        'test'
    )
    serializer_class = TestAttemptDetailSerializer
    permission_classes = [IsAuthenticated, IsTPO]
