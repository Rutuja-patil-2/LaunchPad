from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Application, Company, Drive
from .serializers import DriveSerializer

User = get_user_model()


class DriveTypeTests(TestCase):
	def setUp(self):
		self.company = Company.objects.create(name='Example Company')

	def test_existing_drive_default_is_placement(self):
		drive = Drive.objects.create(
			company=self.company,
			position='Software Engineer',
			package='10 LPA',
			required_skills='Python',
			deadline=timezone.now(),
		)

		self.assertEqual(drive.drive_type, 'placement')

	def test_serializer_saves_internship_drive(self):
		serializer = DriveSerializer(data={
			'company_id': self.company.id,
			'position': 'Software Intern',
			'drive_type': 'internship',
			'package': ' stipend',
			'required_skills': 'Python',
			'deadline': timezone.now().isoformat(),
		})

		self.assertTrue(serializer.is_valid(), serializer.errors)
		drive = serializer.save()

		self.assertEqual(drive.drive_type, 'internship')


class CandidateMatchingApiTests(APITestCase):
	def setUp(self):
		self.recruiter = User.objects.create_user(
			username='match-recruiter',
			password='test-password',
			role='recruiter',
		)
		self.company = Company.objects.create(
			name='Matching Company',
			recruiter=self.recruiter,
		)
		self.drive = Drive.objects.create(
			company=self.company,
			position='Data Analyst',
			package='8 LPA',
			required_skills='SQL, Python',
			job_description='Analyze business data using SQL and Python.',
			deadline=timezone.now(),
		)
		self.student = User.objects.create_user(
			username='matching-student',
			password='test-password',
			role='student',
		)
		self.application = Application.objects.create(
			student=self.student,
			drive=self.drive,
		)
		self.url = reverse('drive-match-candidates', args=[self.drive.id])

	@patch('placement.views._match_applicants')
	def test_matching_only_receives_applicants_for_selected_drive(self, match_applicants):
		match_applicants.return_value = {
			'method': 'skills_fallback',
			'matches': [{
				'application_id': self.application.id,
				'score': 50,
				'strengths': ['SQL'],
				'gaps': ['Python'],
				'reason': 'Skills evidence',
			}],
		}
		self.client.force_authenticate(self.recruiter)

		response = self.client.post(self.url, {}, format='json')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['position'], 'Data Analyst')
		self.assertEqual(response.data['applicant_count'], 1)
		self.assertEqual(response.data['matches'][0]['student_name'], 'matching-student')
		candidates = match_applicants.call_args.args[1]
		self.assertEqual([candidate['application_id'] for candidate in candidates], [self.application.id])

	def test_non_recruiter_cannot_match_candidates(self):
		student = User.objects.create_user(
			username='not-a-recruiter',
			password='test-password',
			role='student',
		)
		self.client.force_authenticate(student)

		response = self.client.post(self.url, {}, format='json')

		self.assertEqual(response.status_code, 403)

	def test_recruiter_cannot_match_another_company_drive(self):
		other_recruiter = User.objects.create_user(
			username='other-match-recruiter',
			password='test-password',
			role='recruiter',
		)
		other_company = Company.objects.create(
			name='Other Matching Company',
			recruiter=other_recruiter,
		)
		other_drive = Drive.objects.create(
			company=other_company,
			position='Designer',
			package='7 LPA',
			required_skills='Figma',
			deadline=timezone.now(),
		)
		self.client.force_authenticate(self.recruiter)

		response = self.client.post(
			reverse('drive-match-candidates', args=[other_drive.id]),
			{},
			format='json',
		)

		self.assertEqual(response.status_code, 404)
