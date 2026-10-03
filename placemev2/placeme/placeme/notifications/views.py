from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Notification, InterviewExperience
from .serializers import (
    NotificationSerializer,
    InterviewExperienceListSerializer, InterviewExperienceDetailSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for Notification model"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_read', 'notification_type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Get notifications for current user"""
        return Notification.objects.filter(user=self.request.user)

    serializer_class = NotificationSerializer

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        notifications = self.get_queryset().filter(is_read=False)
        count = notifications.update(is_read=True)
        return Response({
            'message': f'{count} notifications marked as read',
            'count': count
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def unread_count(self, request):
        """Get unread notification count"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_notification(self, request, pk=None):
        """Delete a notification"""
        notification = self.get_object()
        notification.delete()
        return Response({'message': 'Notification deleted'}, status=status.HTTP_204_NO_CONTENT)


class InterviewExperienceViewSet(viewsets.ModelViewSet):
    """ViewSet for InterviewExperience model"""
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['difficulty', 'result']
    search_fields = ['company', 'position', 'tips']
    ordering_fields = ['upvotes', 'created_at']
    ordering = ['-upvotes', '-created_at']

    def get_queryset(self):
        """Get all experiences"""
        return InterviewExperience.objects.all().select_related('author')

    def get_serializer_class(self):
        return InterviewExperienceDetailSerializer

    def create(self, request, *args, **kwargs):
        """Create interview experience (authenticated)"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required to create experience'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer = InterviewExperienceDetailSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        """Serializer handles author assignment"""
        serializer.save()

    def update(self, request, *args, **kwargs):
        """Update only own experience"""
        experience = self.get_object()
        if experience.author != request.user:
            return Response(
                {'error': 'You can only edit your own experiences'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete only own experience"""
        experience = self.get_object()
        if experience.author != request.user:
            return Response(
                {'error': 'You can only delete your own experiences'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        """Upvote experience"""
        experience = self.get_object()
        experience.upvotes += 1
        experience.save()
        serializer = self.get_serializer(experience)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending experiences (top upvoted)"""
        experiences = self.get_queryset().order_by('-upvotes')[:10]
        serializer = self.get_serializer(experiences, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_experiences(self, request):
        """Get current user's experiences"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        experiences = self.get_queryset().filter(author=request.user)
        serializer = self.get_serializer(experiences, many=True)
        return Response(serializer.data)
