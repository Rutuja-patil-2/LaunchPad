import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Public Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'


// Student Pages
import { StudentDashboard } from './pages/StudentDashboard'
import TPODashboard from './pages/tpo/tpoDashboard'
import TPOCompanies from './pages/tpo/companies'
import CompanyForm from './pages/tpo/companyForm'
import EditCompany from './pages/tpo/EditCompany'
import CompanyDetails from './pages/tpo/CompanyDetails'
import Drives from './pages/tpo/Drives'
import DriveForm from './pages/tpo/DriveForm'
import EditDrive from './pages/tpo/EditDrive'
import TPOApplications from './pages/tpo/applications'
import ApplicationDetails from './pages/tpo/applicationDetails'
import TpoCourses from './pages/tpo/tpoCourses'
import CourseForm from './pages/tpo/courseForm'
import EditCourse from './pages/tpo/EditCourse'
import CourseDetails from './pages/tpo/CourseDetails'
import TpoMockTests from './pages/tpo/TpoMockTests'
import MockTestForm from './pages/tpo/MockTestForm'
import EditMockTest from './pages/tpo/EditMockTest'
import Students from './pages/tpo/students'
import StudentDetails from './pages/tpo/StudentDetails'
import TpoEnrollments from './pages/tpo/TpoEnrollments'
import TpoTestAttempts from './pages/tpo/TpoTestAttempts'
import TPOProfile from './pages/tpo/tpoProfile'
import { Profile } from './pages/Profile'
import { PlacementDrives } from './pages/PlacementDrives'
import { Applications } from './pages/Applications'
import { MockTests } from './pages/MockTests'
import { InterviewExperience } from './pages/InterviewExperience'
import { ResumeBuilder } from './pages/ResumeBuilder'
import { NotificationsPage } from './pages/Notifications'
import { Settings } from './pages/Settings'
import { Training } from './pages/Training'

// Recruiter Pages
import ViewDrive from './pages/recruiter/ViewDrive'
import TPOEditDrive from './pages/tpo/EditDrive'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import CreateDrive from './pages/recruiter/CreateDrive'
import ManageDrives from './pages/recruiter/ManageDrives'
import ApplicationsList from './pages/recruiter/ApplicationsList'
import InterviewSchedule from './pages/recruiter/InterviewSchedule'
import CompanyProfile from './pages/recruiter/CompanyProfile'
import Analytics from './pages/recruiter/Analytics'
import ApplicantProfile from './pages/recruiter/ApplicantProfile'
import RecruiterEditDrive from './pages/recruiter/EditDrive'

// Layouts
import { MainLayout } from './layouts/MainLayout'
import RecruiterLayout from './layouts/RecruiterLayout'
import TPOLayout from './layouts/TPOLayout'

// Components
import PrivateRoute from './components/PrivateRoute'

function App() {
  // Check localStorage directly for login status
  // Auth store might not be hydrated on first load
  const hasToken = localStorage.getItem('access_token')

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>

          
        {/* Public Routes */}
<Route path="/" element={<Home />} />

<Route
  path="/login"
  element={
    hasToken ? (
      <Navigate to="/dashboard" />
    ) : (
      <Login />
    )
  }
/>

<Route
  path="/register"
  element={
    hasToken ? (
      <Navigate to="/dashboard" />
    ) : (
      <Register />
    )
  }
/>

{/* STUDENT ROUTES */}
<Route element={<PrivateRoute />}>
  <Route element={<MainLayout />}>
    <Route path="/dashboard" element={<StudentDashboard />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/drives" element={<PlacementDrives />} />
    <Route path="/placement-drives" element={<Navigate to="/drives" replace />} />
    <Route path="/applications" element={<Applications />} />
    <Route path="/mock-tests" element={<MockTests />} />
    <Route path="/interviews" element={<InterviewExperience />} />
    <Route path="/resume" element={<ResumeBuilder />} />
    <Route path="/notifications" element={<NotificationsPage />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/training" element={<Training />} />
  </Route>
</Route>

{/* RECRUITER ROUTES */}
<Route element={<PrivateRoute />}>
  <Route element={<RecruiterLayout />}>
    <Route
      path="/recruiter/dashboard"
      element={<RecruiterDashboard />}
    />
    <Route
      path="/recruiter/create-drive"
      element={<CreateDrive />}
    />
    <Route
      path="/recruiter/manage-drives"
      element={<ManageDrives />}
    />
    <Route
      path="/recruiter/applications"
      element={<ApplicationsList />}
    />
    <Route
      path="/recruiter/interviews"
      element={<InterviewSchedule />}
    />
    <Route
      path="/recruiter/company"
      element={<CompanyProfile />}
    />
    <Route
      path="/recruiter/analytics"
      element={<Analytics />}
    />
    <Route
      path="/recruiter/drives/:id"
      element={<ViewDrive />}
    />
    <Route
      path="/recruiter/drives/edit/:id"
      element={<RecruiterEditDrive />}
    />
    <Route
      path="/recruiter/applicant/:id"
      element={<ApplicantProfile />}
    />
  </Route>

  <Route path="/tpo" element={<TPOLayout />}>
    <Route index element={<TPODashboard />} />
    <Route path="profile" element={<TPOProfile />} />
    <Route path="companies" element={<TPOCompanies />} />
    <Route path="companies/:id" element={<CompanyDetails />} />
    <Route path="companies/create" element={<CompanyForm />} />
    <Route path="companies/edit/:id" element={<EditCompany />} />
    <Route path="drives" element={<Drives />} />
    <Route path="drives/create" element={<DriveForm />} />
    <Route path="drives/edit/:id" element={<TPOEditDrive />} />
    <Route path="applications" element={<TPOApplications />} />
    <Route path="applications/:id" element={<ApplicationDetails />} />
    <Route path="courses" element={<TpoCourses />} />
    <Route path="courses/:id" element={<CourseDetails />} />
    <Route path="courses/create" element={<CourseForm />} />
    <Route path="courses/edit/:id" element={<EditCourse />} />
    <Route path="mock-tests" element={<TpoMockTests />} />
    <Route path="mock-tests/create" element={<MockTestForm />} />
    <Route path="mock-tests/edit/:id" element={<EditMockTest />} />
    <Route path="students" element={<Students />} />
    <Route path="students/:id" element={<StudentDetails />} />
    <Route path="enrollments" element={<TpoEnrollments />} />
    <Route path="attempts" element={<TpoTestAttempts />} />
  </Route>
</Route>

<Route
  path="/recruiter/login"
  element={<Navigate to="/login?role=recruiter" replace />}
/>

<Route
  path="/recruiter/register"
  element={<Navigate to="/register?role=recruiter" replace />}
/>

{/* 404 */}
{/* 404 */}
{/* 404 */}
<Route path="*" element={<NotFound />} />
</Routes>

<ToastContainer
  position="bottom-right"
  autoClose={3000}
  theme="dark"
/>
</div>
</Router>
)
}

export default App
