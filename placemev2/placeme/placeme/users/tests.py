from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from career.models import StudentProfile


User = get_user_model()


class TPOStudentDirectoryTests(APITestCase):
	def setUp(self):
		self.tpo = User.objects.create_user(
			username='directory-tpo',
			password='test-password',
			role='tpo',
		)
		self.student = User.objects.create_user(
			username='directory-student',
			email='student@example.com',
			password='test-password',
			role='student',
		)
		StudentProfile.objects.create(
			user=self.student,
			branch='ENTC',
			skills='',
			profile_completion=25,
		)
		self.url = reverse('user-tpo-students')

	def test_tpo_receives_branch_and_skills_summary(self):
		self.client.force_authenticate(self.tpo)

		response = self.client.get(self.url)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data[0]['branch'], 'ENTC')
		self.assertEqual(response.data[0]['skills'], '')
		self.assertEqual(response.data[0]['profile_completion'], 25)

	def test_student_profile_without_profile_is_included(self):
		User.objects.create_user(
			username='no-profile-student',
			password='test-password',
			role='student',
		)
		self.client.force_authenticate(self.tpo)

		response = self.client.get(self.url)
		no_profile = next(
			student for student in response.data
			if student['username'] == 'no-profile-student'
		)

		self.assertEqual(no_profile['branch'], '')
		self.assertEqual(no_profile['skills'], '')
		self.assertEqual(no_profile['profile_completion'], 0)

	def test_non_tpo_cannot_access_directory(self):
		self.client.force_authenticate(self.student)

		response = self.client.get(self.url)

		self.assertEqual(response.status_code, 403)

	def test_tpo_can_create_student_and_profile(self):
		self.client.force_authenticate(self.tpo)

		response = self.client.post(
			reverse('user-create-student'),
			{
				'username': 'new-directory-student',
				'email': 'new-student@example.com',
				'first_name': 'New',
				'last_name': 'Student',
				'password': 'initial-password',
				'branch': 'CSE',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 201)
		created = User.objects.get(username='new-directory-student')
		self.assertEqual(created.role, 'student')
		self.assertTrue(created.check_password('initial-password'))
		self.assertEqual(created.student_profile.branch, 'CSE')

	def test_non_tpo_cannot_create_student(self):
		self.client.force_authenticate(self.student)

		response = self.client.post(
			reverse('user-create-student'),
			{
				'username': 'blocked-student',
				'email': 'blocked@example.com',
				'password': 'initial-password',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 403)
		self.assertFalse(User.objects.filter(username='blocked-student').exists())

	def test_tpo_can_load_student_review_details(self):
		self.client.force_authenticate(self.tpo)

		response = self.client.get(
			reverse('user-tpo-detail', args=[self.student.id]),
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['student']['id'], self.student.id)
		self.assertEqual(response.data['profile']['branch'], 'ENTC')
