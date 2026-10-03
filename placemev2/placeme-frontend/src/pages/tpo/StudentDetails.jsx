import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { tpoApi } from '../../services/tpoApi'

const StudentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDetails()
  }, [id])

  const fetchDetails = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await tpoApi.getStudentDetails(id)
      setData(res.data)
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.detail || 'Failed to load student details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-6 text-center">
        <p role="alert" className="text-sm text-red-700">{error || 'Student details are unavailable.'}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" onClick={fetchDetails} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Retry</button>
          <button type="button" onClick={() => navigate('/tpo/students')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Back to students</button>
        </div>
      </div>
    )
  }

  const student = data?.student
  const profile = data?.profile
  const applications = data?.applications || []
  const enrollments = data?.enrollments || []
  const attempts = data?.test_attempts || []

  const fullName =
    student?.first_name || student?.last_name
      ? `${student.first_name} ${student.last_name}`.trim()
      : student?.username

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {fullName || 'Student Details'}
          </h1>
          <p className="text-slate-500">
            Full student information and activity
          </p>
        </div>

        <button
          onClick={() => navigate('/tpo/students')}
          className="border px-4 py-2 rounded-xl"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-2xl border p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Info label="Username" value={student?.username} />
        <Info label="Email" value={student?.email} />
        <Info label="Phone" value={student?.phone} />
        <Info label="Branch" value={profile?.branch} />
        <Info label="CGPA" value={profile?.cgpa} />
        <Info label="Graduation Year" value={profile?.graduation_year} />
        <Info label="Location" value={profile?.location} />
        <Info label="Profile Completion" value={`${profile?.profile_completion || 0}%`} />
        <Info label="Headline" value={profile?.headline} wide />
        <Info label="Skills" value={profile?.skills} wide />
        <Info label="About" value={profile?.about} wide />
      </div>

      <Section title="Support plan">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-medium text-slate-900">
              {!profile?.skills?.trim()
                ? 'No skills are listed yet. Consider a mentoring check-in and a foundational course.'
                : (profile?.profile_completion || 0) < 70
                  ? 'The profile is incomplete. Review the missing details with the student.'
                  : 'Skills are listed. Review the student’s goals and recommend a next step.'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Use the course catalog to discuss relevant training with the student.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={student?.email
                ? `mailto:${student.email}?subject=${encodeURIComponent('Placement preparation support')}`
                : undefined}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                student?.email
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'pointer-events-none border-slate-200 text-slate-400'
              }`}
            >
              <Icons.Mail size={16} /> Email student
            </a>
            <button
              type="button"
              onClick={() => navigate('/tpo/courses')}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Icons.BookOpen size={16} /> View courses
            </button>
          </div>
        </div>
      </Section>

      <Section title="Applied Drives">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Applied At</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <Empty colSpan="4" text="No drive applications" />
            ) : (
              applications.map((application) => (
                <tr key={application.id} className="border-t">
                  <td className="p-4">{application.company_name || application.drive?.company?.name || '-'}</td>
                  <td className="p-4">{application.position || application.drive?.position || '-'}</td>
                  <td className="p-4">
                    <Status value={application.status} />
                  </td>
                  <td className="p-4">{formatDate(application.applied_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>

      <Section title="Course Enrollments">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Course</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Progress</th>
              <th className="p-4 text-left">Enrolled At</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 ? (
              <Empty colSpan="4" text="No course enrollments" />
            ) : (
              enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="border-t">
                  <td className="p-4">{enrollment.course?.title || '-'}</td>
                  <td className="p-4">{enrollment.status}</td>
                  <td className="p-4">{enrollment.progress_percentage}%</td>
                  <td className="p-4">{formatDate(enrollment.enrolled_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>

      <Section title="Mock Test Attempts">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Test Name</th>
              <th className="p-4 text-left">Score</th>
              <th className="p-4 text-left">Passed</th>
              <th className="p-4 text-left">Attempted At</th>
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 ? (
              <Empty colSpan="4" text="No mock tests taken" />
            ) : (
              attempts.map((attempt) => (
                <tr key={attempt.id} className="border-t">
                  <td className="p-4">{attempt.test?.title || attempt.test_title || '-'}</td>
                  <td className="p-4">{attempt.score}/{attempt.max_score}</td>
                  <td className="p-4">{attempt.is_passed ? 'Yes' : 'No'}</td>
                  <td className="p-4">{formatDate(attempt.attempted_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>
    </div>
  )
}

const Info = ({ label, value, wide = false }) => (
  <div className={wide ? 'md:col-span-2' : ''}>
    <p className="text-sm text-slate-500">{label}</p>
    <p className="font-medium text-slate-900 whitespace-pre-wrap">
      {value || '-'}
    </p>
  </div>
)

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl border overflow-hidden">
    <div className="p-4 border-b">
      <h2 className="font-semibold">{title}</h2>
    </div>
    {children}
  </div>
)

const Empty = ({ colSpan, text }) => (
  <tr>
    <td className="p-6 text-center text-slate-500" colSpan={colSpan}>
      {text}
    </td>
  </tr>
)

const Status = ({ value }) => {
  const normalized = value || 'applied'
  const colors = {
    selected: 'bg-green-100 text-green-700',
    shortlisted: 'bg-brand-100 text-brand-700',
    rejected: 'bg-red-100 text-red-700',
    interviewed: 'bg-purple-100 text-purple-700',
    reviewed: 'bg-amber-100 text-amber-700',
    applied: 'bg-slate-100 text-slate-700'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${colors[normalized] || colors.applied}`}>
      {normalized}
    </span>
  )
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

export default StudentDetails
