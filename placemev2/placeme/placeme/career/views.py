from rest_framework import (
    viewsets,
    status
)

from rest_framework.views import (
    APIView
)

from rest_framework.permissions import (
    IsAuthenticated
)

from rest_framework.response import (
    Response
)

from .models import (
    StudentProfile,
    Project
)

from .serializers import (
    StudentProfileSerializer,
    ProjectSerializer
)


# ============================================
# MY PROFILE API VIEW
# ============================================

class MyProfileView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def serialize_profile(
        self,
        profile,
        request
    ):
        return (
            StudentProfileSerializer(
                profile,
                context={
                    'request': request
                }
            ).data
        )

    # ========================================
    # GET MY PROFILE
    # ========================================

    def get(self, request):
        try:
            profile, created = (
                StudentProfile.objects.get_or_create(
                    user=request.user
                )
            )

            return Response(
                self.serialize_profile(
                    profile,
                    request
                ),
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # ========================================
    # UPDATE MY PROFILE
    # ========================================

    def put(self, request):
        try:
            profile, created = (
                StudentProfile.objects.get_or_create(
                    user=request.user
                )
            )

            serializer = (
                StudentProfileSerializer(
                    profile,

                    data=request.data,

                    partial=True,

                    context={
                        'request': request
                    }
                )
            )

            if serializer.is_valid():

                profile = serializer.save()
                profile.update_completion()

                return Response(
                    self.serialize_profile(
                        profile,
                        request
                    ),
                    status=status.HTTP_200_OK
                )

            return Response(
                serializer.errors,

                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error updating profile: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # ========================================
    # PATCH PROFILE
    # ========================================

    def patch(self, request):
        try:
            profile, created = (
                StudentProfile.objects.get_or_create(
                    user=request.user
                )
            )

            serializer = (
                StudentProfileSerializer(
                    profile,

                    data=request.data,

                    partial=True,

                    context={
                        'request': request
                    }
                )
            )

            if serializer.is_valid():

                profile = serializer.save()
                profile.update_completion()

                return Response(
                    self.serialize_profile(
                        profile,
                        request
                    ),
                    status=status.HTTP_200_OK
                )

            return Response(
                serializer.errors,

                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error patching profile: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            serializer.errors,

            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================
# PROJECT VIEWSET
# ============================================

class ProjectViewSet(
    viewsets.ModelViewSet
):

    serializer_class = (
        ProjectSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    # ========================================
    # ONLY MY PROJECTS
    # ========================================

    def get_queryset(self):

        profile, created = (
            StudentProfile.objects.get_or_create(
                user=self.request.user
            )
        )

        return (
            Project.objects.filter(
                student=profile
            )
        )

    # ========================================
    # CREATE PROJECT
    # ========================================

    def perform_create(
        self,
        serializer
    ):

        profile, created = (
            StudentProfile.objects.get_or_create(
                user=self.request.user
            )
        )

        serializer.save(
            student=profile
        )

        profile.update_completion()

    def perform_update(self, serializer):

        project = serializer.save()

        project.student.update_completion()

    def perform_destroy(self, instance):

        profile = instance.student

        instance.delete()

        profile.update_completion()