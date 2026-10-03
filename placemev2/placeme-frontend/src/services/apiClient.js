import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000/api'

export const API_ORIGIN =
  API_BASE_URL.replace(
    /\/api\/?$/,
    ''
  )

export const resolveMediaUrl = (
  path
) => {
  if (!path) {
    return null
  }

  if (
    typeof path === 'string' &&
    (path.startsWith('http://') ||
      path.startsWith('https://'))
  ) {
    return path
  }

  const normalized = String(path).startsWith(
    '/')
    ? path
    : `/${path}`

  return `${API_ORIGIN}${normalized}`
}

export const getResumeFileName = (
  resumePath
) => {
  if (!resumePath) {
    return ''
  }

  const url =
    resolveMediaUrl(resumePath) ||
    String(resumePath)

  try {
    const name = url.split('/').pop() || 'Resume'

    return decodeURIComponent(name)
  } catch {
    return 'Resume'
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    'Content-Type':
      'application/json',
  },

  withCredentials: true,
})

// ============================================
// REQUEST INTERCEPTOR
// ============================================

apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'access_token'
      )

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },

  (error) =>
    Promise.reject(error)
)

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config

    if (
      error.response?.status ===
      401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      const refreshToken =
        localStorage.getItem(
          'refresh_token'
        )

      if (refreshToken) {
        try {
          const response =
            await axios.post(
              `${API_BASE_URL}/token/refresh/`,
              {
                refresh:
                  refreshToken,
              }
            )

          const { access } =
            response.data

          localStorage.setItem(
            'access_token',
            access
          )

          originalRequest.headers.Authorization =
            `Bearer ${access}`

          return apiClient(
            originalRequest
          )

        } catch (
        refreshError
        ) {
          localStorage.removeItem(
            'access_token'
          )

          localStorage.removeItem(
            'refresh_token'
          )

          window.location.href =
            '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

// ============================================
// PLACEMENT API SERVICES
// ============================================

export const placement = {
  // Companies
  getCompanies: (params) =>
    apiClient.get(
      '/placement/companies/',
      { params }
    ),

  getCompanyById: (id) =>
    apiClient.get(
      `/placement/companies/${id}/`
    ),

  // Drives
  getDrives: (params) =>
    apiClient.get(
      '/placement/drives/',
      { params }
    ),

  getDriveById: (id) =>
    apiClient.get(
      `/placement/drives/${id}/`
    ),

  checkApplicationStatus: (
    driveId
  ) =>
    apiClient.get(
      `/placement/drives/${driveId}/check_application_status/`
    ),

  // Applications
  getMyApplications: (
    params
  ) =>
    apiClient.get(
      '/placement/applications/',
      { params }
    ),

  getApplicationById: (
    id
  ) =>
    apiClient.get(
      `/placement/applications/${id}/`
    ),

  createApplication: (
    data
  ) =>
    apiClient.post(
      '/placement/applications/',
      data
    ),

  updateApplicationStatus: (
    id,
    status
  ) =>
    apiClient.patch(
      `/placement/applications/${id}/update_status/`,
      {
        status,
      }
    ),

  uploadResume: (
    id,
    resumeUrl
  ) =>
    apiClient.patch(
      `/placement/applications/${id}/upload_resume/`,
      {
        resume_url:
          resumeUrl,
      }
    ),

  checkProfileStatus: () =>
    apiClient.get(
      '/placement/applications/check_profile_status/'
    ),
}

// ============================================
// TRAINING API SERVICES
// ============================================

export const training = {
  // Courses
  getCourses: (params) =>
    apiClient.get(
      '/training/courses/',
      { params }
    ),

  getCourseById: (id) =>
    apiClient.get(
      `/training/courses/${id}/`
    ),

  checkEnrollment: (
    courseId
  ) =>
    apiClient.get(
      `/training/courses/${courseId}/check_enrollment/`
    ),

  // Enrollments
  getMyEnrollments: (
    params
  ) =>
    apiClient.get(
      '/training/enrollments/',
      { params }
    ),

  getEnrollmentById: (
    id
  ) =>
    apiClient.get(
      `/training/enrollments/${id}/`
    ),

  enrollCourse: (
    courseId
  ) =>
    apiClient.post(
      '/training/enrollments/',
      {
        course_id:
          courseId,
      }
    ),

  updateProgress: (
    id,
    progressPercentage
  ) =>
    apiClient.patch(
      `/training/enrollments/${id}/update_progress/`,
      {
        progress_percentage:
          progressPercentage,
      }
    ),

  // Mock Tests
  getTests: (params) =>
    apiClient.get(
      '/training/tests/',
      { params }
    ),

  getTestById: (id) =>
    apiClient.get(
      `/training/tests/${id}/`
    ),

  getTestAttempts: (
    testId
  ) =>
    apiClient.get(
      `/training/tests/${testId}/attempts/`
    ),

  // Attempts
  getMyAttempts: (
    params
  ) =>
    apiClient.get(
      '/training/attempts/',
      { params }
    ),

  getAttemptById: (
    id
  ) =>
    apiClient.get(
      `/training/attempts/${id}/`
    ),

  submitTestAttempt: (
    data
  ) =>
    apiClient.post(
      '/training/attempts/',
      data
    ),

  getTestStatistics: () =>
    apiClient.get(
      '/training/attempts/statistics/'
    ),
}

export const aiStudyAssistant = {
  sendMessage: (data) =>
    apiClient.post('/training/study-assistant/', data),
}

// ============================================
// NOTIFICATIONS API SERVICES
// ============================================

export const notifications = {
  // Notifications
  getMyNotifications: (
    params
  ) =>
    apiClient.get(
      '/notifications/notifications/',
      { params }
    ),

  markAsRead: (id) =>
    apiClient.patch(
      `/notifications/notifications/${id}/mark_as_read/`
    ),

  markAllAsRead: () =>
    apiClient.patch(
      '/notifications/notifications/mark_all_as_read/'
    ),

  getUnreadCount: () =>
    apiClient.get(
      '/notifications/notifications/unread_count/'
    ),

  deleteNotification: (
    id
  ) =>
    apiClient.delete(
      `/notifications/notifications/${id}/delete_notification/`
    ),

  // Experiences
  getExperiences: (
    params
  ) =>
    apiClient.get(
      '/notifications/experiences/',
      { params }
    ),

  getExperienceById: (
    id
  ) =>
    apiClient.get(
      `/notifications/experiences/${id}/`
    ),

  createExperience: (
    data
  ) =>
    apiClient.post(
      '/notifications/experiences/',
      data
    ),

  updateExperience: (
    id,
    data
  ) =>
    apiClient.patch(
      `/notifications/experiences/${id}/`,
      data
    ),

  deleteExperience: (
    id
  ) =>
    apiClient.delete(
      `/notifications/experiences/${id}/`
    ),

  upvoteExperience: (
    id
  ) =>
    apiClient.post(
      `/notifications/experiences/${id}/upvote/`
    ),

  getTrendingExperiences:
    () =>
      apiClient.get(
        '/notifications/experiences/trending/'
      ),

  getMyExperiences: () =>
    apiClient.get(
      '/notifications/experiences/my_experiences/'
    ),
}

// ============================================
// AUTHENTICATION SERVICES
// ============================================

export const auth = {
  login: (
    username,
    password
  ) =>
    axios.post(
      `${API_BASE_URL}/token/`,
      {
        username,
        password,
      }
    ),

  changePassword: (data) =>
    apiClient.post(
      '/users/change_password/',
      data
    ),

  updateProfile: (data) =>
    apiClient.put(
      '/users/me/',
      data
    ),
  refresh: (
    refreshToken
  ) =>
    axios.post(
      `${API_BASE_URL}/token/refresh/`,
      {
        refresh:
          refreshToken,
      }
    ),

  register: (data) =>
    axios.post(
      `${API_BASE_URL}/users/register/`,
      data
    ),

  getProfile: () =>
    apiClient.get(
      '/users/me/'
    ),

  // ========================================
  // RESUME APIs
  // ========================================

  getResume: () =>
    apiClient.get(
      '/users/resume/'
    ),

  updateResume: (
    data
  ) =>
    apiClient.put(
      '/users/resume/',
      data
    ),

  getResumeScore: () =>
    apiClient.get(
      '/users/resume/'
    ),

  analyzeResume: (
    formData
  ) =>
    apiClient.post(
      '/users/resume/analyze/',
      formData
    ),
}

// ============================================
// CAREER PROFILE API SERVICES
// ============================================

export const career = {

  // ========================================
  // PROFILE
  // ========================================

  getMyProfile: () =>
    apiClient.get(
      '/career/profiles/me/'
    ),

  updateMyProfile: (
    data
  ) =>
    apiClient.put(
      '/career/profiles/me/',
      data
    ),

  // ========================================
  // PROJECTS
  // ========================================

  getProjects: () =>
    apiClient.get(
      '/career/projects/'
    ),

  getProjectById: (
    id
  ) =>
    apiClient.get(
      `/career/projects/${id}/`
    ),

  createProject: (
    data
  ) =>
    apiClient.post(
      '/career/projects/',
      data
    ),

  updateProject: (
    id,
    data
  ) =>
    apiClient.patch(
      `/career/projects/${id}/`,
      data
    ),

  deleteProject: (
    id
  ) =>
    apiClient.delete(
      `/career/projects/${id}/`
    ),
}

// ============================================
// RECRUITER API SERVICES
// ============================================

export const recruiter = {

  // ==========================
  // COMPANY
  // ==========================

  getMyCompany: () =>
    apiClient.get(
      '/placement/companies/my_company/'
    ),

  updateCompany: (
    id,
    data
  ) =>
    apiClient.put(
      `/placement/companies/${id}/`,
      data
    ),

  getCompanyById: (
    id
  ) =>
    apiClient.get(
      `/placement/companies/${id}/`
    ),

  // ==========================
  // DRIVES
  // ==========================

  getDrives: () =>
    apiClient.get(
      '/placement/drives/'
    ),

  getDriveById: (
    id
  ) =>
    apiClient.get(
      `/placement/drives/${id}/`
    ),

  createDrive: (
    data
  ) =>
    apiClient.post(
      '/placement/drives/',
      data
    ),

  updateDrive: (id, data) =>
    apiClient.patch(`/placement/drives/${id}/`, data),

  deleteDrive: (
    id
  ) =>
    apiClient.delete(
      `/placement/drives/${id}/`
    ),

  // ==========================
  // APPLICATIONS
  // ==========================

  getApplications: () =>
    apiClient.get(
      '/placement/applications/'
    ),

  getApplicationById: (
    id
  ) =>
    apiClient.get(
      `/placement/applications/${id}/`
    ),

  updateApplicationStatus: (
    id,
    status
  ) =>
    apiClient.patch(
      `/placement/applications/${id}/update_status/`,
      {
        status,
      }
    ),

  // ==========================
  // INTERVIEWS
  // ==========================

  getInterviews: () =>
    apiClient.get(
      '/placement/interview-schedules/'
    ),

  createInterview: (
    data
  ) =>
    apiClient.post(
      '/placement/interview-schedules/',
      data
    ),

  updateInterview: (
    id,
    data
  ) =>
    apiClient.put(
      `/placement/interview-schedules/${id}/`,
      data
    ),

  deleteInterview: (
    id
  ) =>
    apiClient.delete(
      `/placement/interview-schedules/${id}/`
    ),
}
