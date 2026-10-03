from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from .models import Course, MockTest, TestAttempt
from .serializers import MockTestSerializer

from .models import MockTest


User = get_user_model()


class TPOCourseCreationTests(APITestCase):
	def setUp(self):
		self.tpo = User.objects.create_user(
			username='course-tpo',
			password='test-password',
			role='tpo',
		)
		self.client.force_authenticate(self.tpo)

	def test_tpo_can_create_active_course_without_test_link(self):
		response = self.client.post(
			reverse('tpo-course-list'),
			{
				'title': 'Placement Preparation',
				'description': 'A course for placement preparation.',
				'category': 'other',
				'level': 'beginner',
				'duration_hours': 12,
				'instructor_name': 'Training Team',
				'is_active': True,
			},
			format='json',
		)

		self.assertEqual(response.status_code, 201)
		self.assertTrue(response.data['is_active'])
		self.assertTrue(Course.objects.filter(title='Placement Preparation').exists())


class ExternalTestScoreEvaluationTests(APITestCase):
	def setUp(self):
		self.student = User.objects.create_user(
			username='score-student',
			password='test-password',
			role='student',
		)
		self.test = MockTest.objects.create(
			title='Linked Assessment',
			test_url='https://example.com/assessment',
			passing_percentage=70,
			is_active=True,
		)
		self.client.force_authenticate(self.student)
		self.url = reverse('test-attempt-list')

	def test_server_calculates_pass_from_threshold(self):
		response = self.client.post(self.url, {
			'test_id': self.test.id,
			'score': 7,
			'max_score': 10,
			'is_passed': False,
		}, format='json')

		self.assertEqual(response.status_code, 201)
		self.assertTrue(response.data['is_passed'])
		self.assertEqual(response.data['percentage'], 70)

	def test_client_cannot_force_a_fail_to_pass(self):
		response = self.client.post(self.url, {
			'test_id': self.test.id,
			'score': 6,
			'max_score': 10,
			'is_passed': True,
		}, format='json')

		self.assertEqual(response.status_code, 201)
		self.assertFalse(response.data['is_passed'])

	def test_score_cannot_exceed_maximum(self):
		response = self.client.post(self.url, {
			'test_id': self.test.id,
			'score': 11,
			'max_score': 10,
		}, format='json')

		self.assertEqual(response.status_code, 400)

	def test_attempt_score_cannot_be_changed_after_submission(self):
		create_response = self.client.post(self.url, {
			'test_id': self.test.id,
			'score': 8,
			'max_score': 10,
		}, format='json')

		response = self.client.patch(
			reverse('test-attempt-detail', args=[create_response.data['id']]),
			{'score': 0},
			format='json',
		)

		self.assertEqual(response.status_code, 405)

	def test_active_mock_test_requires_a_link(self):
		serializer = MockTestSerializer(data={
			'title': 'Missing Link',
			'is_active': True,
		})

		self.assertFalse(serializer.is_valid())
		self.assertIn('test_url', serializer.errors)

	def test_statistics_average_normalized_percentages(self):
		TestAttempt.objects.create(
			student=self.student,
			test=self.test,
			score=15,
			max_score=20,
			is_passed=True,
		)

		response = self.client.get(reverse('test-attempt-statistics'))

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['average_score'], 75)
