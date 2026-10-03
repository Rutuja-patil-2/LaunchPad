from rest_framework import mixins, viewsets, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, ExpressionWrapper, F, FloatField
from .models import Course, Enrollment, MockTest, TestAttempt
from .serializers import (
    CourseSerializer, EnrollmentListSerializer, EnrollmentDetailSerializer,
    MockTestSerializer, TestAttemptListSerializer, TestAttemptDetailSerializer
)



class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Course model (Read-only)"""
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'level']
    search_fields = ['title', 'description', 'instructor_name']
    ordering_fields = ['rating', 'created_at']
    ordering = ['-rating']

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def check_enrollment(self, request, pk=None):
        """Check if student is enrolled in course"""
        course = self.get_object()
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        
        if enrollment:
            return Response({
                'enrolled': True,
                'status': enrollment.status,
                'progress_percentage': enrollment.progress_percentage
            })
        return Response({'enrolled': False})


class EnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Enrollment model (Full CRUD)"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'course']
    ordering_fields = ['enrolled_at']
    ordering = ['-enrolled_at']

    def get_queryset(self):
        """Get enrollments for current student"""
        return Enrollment.objects.filter(student=self.request.user).select_related('course')

    def get_serializer_class(self):
        """Use different serializers for list and detail"""
        if self.action == 'retrieve':
            return EnrollmentDetailSerializer
        return EnrollmentListSerializer

    def create(self, request, *args, **kwargs):
        """Enroll in course"""
        serializer = EnrollmentDetailSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        """Serializer handles student assignment"""
        serializer.save()

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_progress(self, request, pk=None):
        """Update enrollment progress"""
        enrollment = self.get_object()
        progress = request.data.get('progress_percentage')
        
        if progress is None or not (0 <= progress <= 100):
            return Response(
                {'error': 'progress_percentage must be between 0 and 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment.progress_percentage = progress
        if progress == 100:
            enrollment.status = 'completed'
        else:
            enrollment.status = 'in_progress'
        enrollment.save()
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)


class MockTestViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for MockTest model (Read-only)"""
    queryset = MockTest.objects.filter(is_active=True)
    serializer_class = MockTestSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['difficulty', 'course']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'difficulty']
    ordering = ['-created_at']

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def attempts(self, request, pk=None):
        """Get student's attempts on this test"""
        test = self.get_object()
        attempts = TestAttempt.objects.filter(student=request.user, test=test)
        serializer = TestAttemptListSerializer(attempts, many=True)
        return Response(serializer.data)


class TestAttemptViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for TestAttempt model (Create/List/Retrieve)"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['test', 'is_passed']
    ordering_fields = ['attempted_at', 'score']
    ordering = ['-attempted_at']

    def get_queryset(self):
        """Get attempts for current student"""
        return TestAttempt.objects.filter(student=self.request.user).select_related('test')

    def get_serializer_class(self):
        """Use different serializers for list and detail"""
        if self.action == 'retrieve':
            return TestAttemptDetailSerializer
        return TestAttemptListSerializer

    def create(self, request, *args, **kwargs):
        """Create test attempt (submit test)"""
        serializer = TestAttemptDetailSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        """Serializer handles student assignment"""
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def statistics(self, request):
        """Get test statistics for student"""
        attempts = self.get_queryset()
        total_attempts = attempts.count()
        passed_attempts = attempts.filter(is_passed=True).count()
        avg_score = attempts.aggregate(
            avg_score=Avg(
                ExpressionWrapper(
                    100.0 * F('score') / F('max_score'),
                    output_field=FloatField(),
                )
            )
        )['avg_score'] or 0
        
        return Response({
            'total_attempts': total_attempts,
            'passed': passed_attempts,
            'failed': total_attempts - passed_attempts,
            'pass_rate': (passed_attempts / total_attempts * 100) if total_attempts > 0 else 0,
            'average_score': round(avg_score, 2)
        })
