from rest_framework import status
from rest_framework.parsers import (
    FormParser,
    MultiPartParser,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from career.models import StudentProfile

from .models import Resume
from .resume_analyzer import (
    analyze_resume,
    extract_text_from_file,
)


class ResumeAnalyzeView(APIView):

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):

        job_description = (
            request.data.get('job_description') or ''
        ).strip()

        if len(job_description) < 50:
            return Response(
                {
                    'error': (
                        'Job description must be at least '
                        '50 characters.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        resume_file = request.FILES.get('resume')
        use_profile_resume = (
            request.data.get('use_profile_resume')
            in ('true', 'True', '1', True)
        )

        resume_text = None
        resume_source = None

        try:
            if resume_file:
                resume_text = extract_text_from_file(
                    resume_file
                )
                resume_source = 'upload'

            elif use_profile_resume:
                profile = (
                    StudentProfile.objects.filter(
                        user=request.user
                    ).first()
                )

                if not profile or not profile.resume:
                    return Response(
                        {
                            'error': (
                                'No resume found on your profile. '
                                'Upload one on the Profile page first.'
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                profile.resume.open('rb')
                try:
                    resume_text = extract_text_from_file(
                        profile.resume
                    )
                finally:
                    profile.resume.close()

                resume_source = 'profile'

            else:
                return Response(
                    {
                        'error': (
                            'Upload a resume file or enable '
                            '"Use profile resume".'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except ValueError as exc:
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            return Response(
                {
                    'error': (
                        'Could not read the resume file. '
                        'Try a text-based PDF or DOCX.'
                    ),
                    'detail': str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not resume_text or len(resume_text.strip()) < 80:
            return Response(
                {
                    'error': (
                        'Could not extract enough text from '
                        'the resume. Use a text-based PDF or '
                        'DOCX (not a scanned image).'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        analysis = analyze_resume(
            resume_text,
            job_description,
        )

        analysis['resume_source'] = resume_source

        resume_record, _ = Resume.objects.get_or_create(
            user=request.user
        )
        resume_record.resume_score = analysis['score']
        resume_record.save(
            update_fields=['resume_score', 'updated_at']
        )

        analysis['saved_resume_score'] = (
            resume_record.resume_score
        )

        return Response(
            analysis,
            status=status.HTTP_200_OK,
        )
