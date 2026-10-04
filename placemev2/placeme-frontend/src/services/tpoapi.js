import apiClient from './apiClient'
import api from './api'
export const tpoapi = {

  getDashboardStats: () =>
    apiClient.get('/placement/tpo/dashboard/stats/'),

  getCompanies: () =>
    apiClient.get('/placement/tpo/companies/'),

  getCompany: (id) =>
    apiClient.get(`/placement/tpo/companies/${id}/`),

  createCompany: (data) =>
    apiClient.post('/placement/tpo/companies/', data),

  updateCompany: (id, data) =>
    apiClient.patch(`/placement/tpo/companies/${id}/`, data),

  deleteCompany: (id) =>
    apiClient.delete(`/placement/tpo/companies/${id}/`),

  getDrives: () =>
    apiClient.get('/placement/tpo/drives/'),

  getDrive: (id) =>
    apiClient.get(`/placement/tpo/drives/${id}/`),

  createDrive: (data) =>
    apiClient.post('/placement/tpo/drives/', data),

  updateDrive: (id, data) =>
    apiClient.patch(`/placement/tpo/drives/${id}/`, data),

  deleteDrive: (id) =>
    apiClient.delete(`/placement/tpo/drives/${id}/`),

  getApplications: () =>
    apiClient.get('/placement/tpo/applications/'),

  getApplication: (id) =>
  apiClient.get(`/placement/tpo/applications/${id}/`),

  updateApplicationStatus: (id, status) =>
    apiClient.patch(
      `/placement/tpo/applications/${id}/update_status/`,
      { status }
    ),

    // Courses
  
  getCourses: () =>
    api.get('/training/tpo/courses/'),

  createCourse: (data) =>
    api.post('/training/tpo/courses/', data),

  deleteCourse: (id) =>
    api.delete(`/training/tpo/courses/${id}/`),

  getCourse: (id) =>
  api.get(
    `/training/tpo/courses/${id}/`
  ),
  getCourseDetails: (id) =>
  api.get(
    `/training/tpo/courses/${id}/details/`
  ),
  updateCourse: (id, data) =>
  api.put(
    `/training/tpo/courses/${id}/`,
    data
  ),


// Mock Tests

getMockTests: () =>
  api.get('/training/tpo/mock-tests/'),

getMockTest: (id) =>
  api.get(`/training/tpo/mock-tests/${id}/`),

createMockTest: (data) =>
  api.post('/training/tpo/mock-tests/', data),

updateMockTest: (id, data) =>
  api.put(`/training/tpo/mock-tests/${id}/`, data),

deleteMockTest: (id) =>
  api.delete(`/training/tpo/mock-tests/${id}/`),

// Enrollments
getEnrollments: () =>
  api.get('/training/tpo/enrollments/'),

updateEnrollmentProgress: (id, progressPercentage) =>
  api.patch(
    `/training/tpo/enrollments/${id}/update_progress/`,
    {
      progress_percentage: progressPercentage
    }
  ),

// Attempts
getAttempts: () =>
  api.get('/training/tpo/attempts/')
,

getStudentDetails: (id) =>
  apiClient.get(`/users/${id}/tpo_detail/`)
  
}
