from rest_framework import (
    viewsets,
    status
)

from rest_framework.decorators import (
    action
)

from rest_framework.response import (
    Response
)

from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny
)

from .models import (
    User,
    Resume
)

from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    ResumeSerializer,
    ChangePasswordSerializer,
    TPOStudentDirectorySerializer,
    TPOStudentCreateSerializer,
)
from .email_utils import create_and_send_verification_code


# ============================================
# USER VIEWSET
# ============================================

class UserViewSet(
    viewsets.ModelViewSet
):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [
        IsAuthenticated
    ]

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[AllowAny],
        url_path='send_verification_code',
    )
    def send_verification_code(self, request):
        email = (request.data.get('email') or '').strip().lower()

        if not email:
            return Response(
                {'email': ['Email is required.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {'email': ['An account with this email already exists.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            create_and_send_verification_code(email)
        except Exception as exc:
            return Response(
                {
                    'detail': (
                        'Could not send verification email. '
                        'Check server email settings (Gmail SMTP).'
                    ),
                    'error': str(exc),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {'message': 'Verification code sent to your email.'},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[
            AllowAny
        ]
    )
    def register(self, request):
        serializer = UserRegistrationSerializer(
            data=request.data
        )

        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User registered successfully",
                    "user": UserSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(
        detail=False,
        methods=[
            'get',
            'put',
            'patch'
        ],
        permission_classes=[
            IsAuthenticated
        ]
    )
    def me(self, request):

        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)

        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(
        detail=False,
        methods=['get'],
        url_path='tpo_students'
    )
    def tpo_students(self, request):
        if request.user.role != 'tpo':
            return Response(
                {'detail': 'Only TPO users can view the student directory.'},
                status=status.HTTP_403_FORBIDDEN
            )

        students = User.objects.filter(
            role='student'
        ).select_related('student_profile').order_by('username')
        serializer = TPOStudentDirectorySerializer(
            students,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['post'],
        url_path='create_student',
    )
    def create_student(self, request):
        if request.user.role != 'tpo':
            return Response(
                {'detail': 'Only TPO users can create student accounts.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TPOStudentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        return Response(
            TPOStudentDirectorySerializer(student).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[
            IsAuthenticated
        ]
    )
    def change_password(
        self,
        request
    ):

        serializer = ChangePasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():
            user = request.user
            if not user.check_password(
                serializer.validated_data[
                    'current_password'
                ]
            ):
                return Response(
                    {
                        'current_password':
                            'Current password is incorrect'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(
                serializer.validated_data['new_password']
            )
            user.save()
            return Response({'detail': 'Password updated successfully'})

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(
        detail=True,
        methods=['get'],
        permission_classes=[
            IsAuthenticated
        ]
    )
    def tpo_detail(self, request, pk=None):
        if request.user.role != 'tpo':
            return Response(
                {'detail': 'Only TPO users can view student details.'},
                status=status.HTTP_403_FORBIDDEN
            )

        student = self.get_object()

        if student.role != 'student':
            return Response(
                {'detail': 'User is not a student.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from career.serializers import StudentProfileSerializer
        from placement.models import Application
        from placement.serializers import ApplicationDetailSerializer
        from training.models import Enrollment, TestAttempt
        from training.serializers import (
            EnrollmentDetailSerializer,
            TestAttemptDetailSerializer
        )

        profile = getattr(student, 'student_profile', None)
        applications = Application.objects.filter(
            student=student
        ).select_related(
            'drive',
            'drive__company'
        )
        enrollments = Enrollment.objects.filter(
            student=student
        ).select_related('course')
        attempts = TestAttempt.objects.filter(
            student=student
        ).select_related('test')

        return Response({
            'student': UserSerializer(student).data,
            'profile': (
                StudentProfileSerializer(
                    profile,
                    context={'request': request}
                ).data
                if profile
                else None
            ),
            'applications': ApplicationDetailSerializer(
                applications,
                many=True
            ).data,
            'enrollments': EnrollmentDetailSerializer(
                enrollments,
                many=True
            ).data,
            'test_attempts': TestAttemptDetailSerializer(
                attempts,
                many=True
            ).data,
        })
