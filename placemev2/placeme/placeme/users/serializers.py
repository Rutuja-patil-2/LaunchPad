from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from placement.models import Company
from .models import Resume
from .email_utils import verify_email_code

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'phone',
            'company_name'
        ]
        read_only_fields = ['id']

    def get_company_name(self, obj):
        try:
            return obj.company.name
        except Company.DoesNotExist:
            return None


class TPOStudentDirectorySerializer(serializers.ModelSerializer):
    branch = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    profile_completion = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'branch',
            'skills',
            'profile_completion',
        ]

    def _profile(self, obj):
        try:
            return obj.student_profile
        except ObjectDoesNotExist:
            return None

    def get_branch(self, obj):
        profile = self._profile(obj)
        return profile.branch if profile else ''

    def get_skills(self, obj):
        profile = self._profile(obj)
        return profile.skills if profile else ''

    def get_profile_completion(self, obj):
        profile = self._profile(obj)
        return profile.profile_completion if profile else 0


class TPOStudentCreateSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=150,
        validators=[UniqueValidator(queryset=User.objects.all())],
    )
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())],
    )
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    branch = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def create(self, validated_data):
        branch = validated_data.pop('branch', '')
        password = validated_data.pop('password')
        student = User.objects.create_user(
            **validated_data,
            password=password,
            role='student',
        )

        from career.models import StudentProfile

        StudentProfile.objects.create(user=student, branch=branch)
        return student


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={
            'input_type': 'password'
        }
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={
            'input_type': 'password'
        }
    )
    company_name = serializers.CharField(required=False, allow_blank=True)
    company_website = serializers.URLField(required=False, allow_blank=True)
    verification_code = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        max_length=6,
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password2',
            'first_name',
            'last_name',
            'role',
            'phone',
            'company_name',
            'company_website',
            'verification_code',
        ]

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({
                'password': 'Passwords must match.'
            })

        if data.get('role') == 'recruiter' and not data.get('company_name', '').strip():
            raise serializers.ValidationError({
                'company_name': 'Company name is required for company accounts.'
            })

        ok, err = verify_email_code(
            data['email'],
            data['verification_code'],
        )
        if not ok:
            raise serializers.ValidationError({
                'verification_code': err,
            })

        return data

    def create(self, validated_data):
        company_name = validated_data.pop('company_name', '')
        company_website = validated_data.pop('company_website', '')
        validated_data.pop('password2')
        validated_data.pop('verification_code')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == 'recruiter':
            Company.objects.create(
                name=company_name or user.username,
                website=company_website,
                recruiter=user
            )

        return user


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            'id',
            'headline',
            'summary',
            'skills',
            'education',
            'experience',
            'projects',
            'linkedin_url',
            'github_url',
            'portfolio_url',
            'resume_score',
            'updated_at',
            'created_at'
        ]
        read_only_fields = ['id', 'resume_score', 'updated_at', 'created_at']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=6)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match'
            })
        return data
