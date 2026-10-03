from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, Enrollment, MockTest, TestAttempt

User = get_user_model()


# ============================================
# COURSE SERIALIZER
# ============================================

class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model"""

    class Meta:
        model = Course

        fields = [
            'id',
            'title',
            'description',
            'category',
            'level',
            'duration_hours',
            'instructor_name',
            'instructor_bio',
            'thumbnail_url',
            'total_students',
            'rating',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'total_students'
        ]


# ============================================
# ENROLLMENT LIST SERIALIZER
# ============================================

class EnrollmentListSerializer(serializers.ModelSerializer):
    """Serializer for listing enrollments"""

    course = CourseSerializer(read_only=True)

    class Meta:
        model = Enrollment

        fields = [
            'id',
            'course',
            'status',
            'progress_percentage',
            'enrolled_at',
            'completed_at'
        ]

        read_only_fields = [
            'id',
            'enrolled_at'
        ]


# ============================================
# ENROLLMENT DETAIL SERIALIZER
# ============================================

class EnrollmentDetailSerializer(serializers.ModelSerializer):
    """Serializer for enrollment details"""

    course = CourseSerializer(read_only=True)

    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source='course',
        write_only=True
    )

    student = serializers.StringRelatedField(
        read_only=True
    )

    class Meta:
        model = Enrollment

        fields = [
            'id',
            'student',
            'course',
            'course_id',
            'status',
            'progress_percentage',
            'enrolled_at',
            'completed_at',
            'certificate_url'
        ]

        read_only_fields = [
            'id',
            'student',
            'enrolled_at',
            'certificate_url'
        ]

    def create(self, validated_data):
        student = self.context['request'].user

        course = validated_data.get('course')

        # Prevent duplicate enrollment
        existing = Enrollment.objects.filter(
            student=student,
            course=course
        ).exists()

        if existing:
            raise serializers.ValidationError(
                'You are already enrolled in this course'
            )

        return Enrollment.objects.create(
            student=student,
            **validated_data
        )


# ============================================
# MOCK TEST SERIALIZER
# ============================================

class MockTestSerializer(serializers.ModelSerializer):
    """Serializer for MockTest model"""

    course_title = serializers.CharField(
        source='course.title',
        read_only=True,
        required=False
    )

    class Meta:
        model = MockTest

        fields = [
            'id',
            'course',
            'course_title',
            'title',
            'description',
            'difficulty',
            'total_questions',
            'duration_minutes',
            'passing_percentage',
            'test_url',
            'is_active',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'created_at'
        ]

    def validate(self, attrs):
        test_url = attrs.get('test_url') or getattr(self.instance, 'test_url', None)
        is_active = attrs.get('is_active', getattr(self.instance, 'is_active', True))
        if is_active and not test_url:
            raise serializers.ValidationError({
                'test_url': 'An active test must have a live test link.'
            })
        return attrs


# ============================================
# TEST ATTEMPT LIST SERIALIZER
# ============================================

class TestAttemptListSerializer(serializers.ModelSerializer):
    """Serializer for listing test attempts"""

    test_title = serializers.CharField(
        source='test.title',
        read_only=True
    )

    test_id = serializers.IntegerField(read_only=True)
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = TestAttempt

        fields = [
            'id',
            'test_id',
            'test_title',
            'score',
            'max_score',
            'percentage',
            'is_passed',
            'attempted_at'
        ]

        read_only_fields = fields

    def get_percentage(self, obj):
        if obj.max_score > 0:
            return round(
                (obj.score / obj.max_score) * 100,
                2
            )

        return 0


# ============================================
# TEST ATTEMPT DETAIL SERIALIZER
# ============================================

class TestAttemptDetailSerializer(serializers.ModelSerializer):
    """Serializer for test attempt details"""

    test = MockTestSerializer(read_only=True)

    test_id = serializers.IntegerField(
        write_only=True
    )

    score = serializers.IntegerField(min_value=0, required=True)
    max_score = serializers.IntegerField(min_value=1, required=True)
    is_passed = serializers.BooleanField(read_only=True)

    student = serializers.StringRelatedField(
        read_only=True
    )

    percentage = serializers.SerializerMethodField()

    class Meta:
        model = TestAttempt

        fields = [
            'id',
            'student',
            'test',
            'test_id',
            'score',
            'max_score',
            'percentage',
            'time_taken_minutes',
            'is_passed',
            'attempted_at'
        ]

        read_only_fields = [
            'id',
            'student',
            'attempted_at'
        ]

    def get_percentage(self, obj):
        if obj.max_score > 0:
            return round(
                (obj.score / obj.max_score) * 100,
                2
            )

        return 0

    def validate(self, attrs):
        if attrs['score'] > attrs['max_score']:
            raise serializers.ValidationError({
                'score': 'Score cannot exceed the maximum score.'
            })
        return attrs

    def create(self, validated_data):
        student = self.context['request'].user

        test_id = validated_data.pop('test_id')

        try:
            test = MockTest.objects.get(id=test_id, is_active=True)

        except MockTest.DoesNotExist:
            raise serializers.ValidationError({
                'test_id': 'Active test not found.'
            })

        if not test.test_url:
            raise serializers.ValidationError({
                'test_id': 'This test does not have an external test link.'
            })

        score_percentage = (
            validated_data['score'] / validated_data['max_score'] * 100
        )

        return TestAttempt.objects.create(
            student=student,
            test=test,
            is_passed=score_percentage >= test.passing_percentage,
            **validated_data
        )
