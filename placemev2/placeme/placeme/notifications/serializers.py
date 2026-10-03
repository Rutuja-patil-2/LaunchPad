from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, InterviewExperience

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'title', 'message', 'notification_type',
            'is_read', 'action_url', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        return Notification.objects.create(user=user, **validated_data)


class InterviewExperienceListSerializer(serializers.ModelSerializer):
    """Serializer for listing interview experiences"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)

    class Meta:
        model = InterviewExperience
        fields = [
            'id', 'company', 'position', 'difficulty', 'author_name',
            'author_email', 'upvotes', 'created_at'
        ]
        read_only_fields = fields


class InterviewExperienceDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed interview experience"""
    author = serializers.StringRelatedField(read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)

    class Meta:
        model = InterviewExperience
        fields = [
            'id', 'company', 'position', 'difficulty',
            'rounds', 'questions_asked', 'tips', 'result',
            'date', 'author', 'author_email', 'upvotes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'author_email', 'upvotes', 'created_at', 'updated_at']

    def create(self, validated_data):
        author = self.context['request'].user
        return InterviewExperience.objects.create(author=author, **validated_data)

    def validate_difficulty(self, value):
        valid_choices = ['easy', 'medium', 'hard']
        if value not in valid_choices:
            raise serializers.ValidationError(
                f'Difficulty must be one of: {", ".join(valid_choices)}'
            )
        return value
