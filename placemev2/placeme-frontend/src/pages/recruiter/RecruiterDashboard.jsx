import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { recruiterService } from '../../services/api'

export default function RecruiterDashboard() {

  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    drives: 0,
    applications: 0,
    shortlisted: 0,
    interviews: 0,
  })

  const [drives, setDrives] = useState([])
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {

    try {

      const [
        drivesRes,
        applicationsRes,
        interviewsRes,
      ] = await Promise.all([
        recruiterService.getDrives(),
        recruiterService.getApplications(),
        recruiterService.getInterviews(),
      ])

      const drivesData =
        drivesRes.data.results ||
        drivesRes.data ||
        []

      const applicationsData =
        applicationsRes.data.results ||
        applicationsRes.data ||
        []

      const interviewsData =
        interviewsRes.data.results ||
        interviewsRes.data ||
        []

      setDrives(drivesData)
      setApplications(applicationsData)
      setInterviews(interviewsData)

      setStats({
        drives: drivesData.length,

        applications:
          applicationsData.length,

        shortlisted:
          applicationsData.filter(
            item =>
              item.status ===
              'shortlisted'
          ).length,

        interviews:
          interviewsData.length,
      })

    } catch (error) {

      console.error(
        'Dashboard Error',
        error
      )

    } finally {

      setLoading(false)
    }
  }

  if (loading) {

    return (
      <div className="h-96 flex justify-center items-center">
        <div className="text-xl font-semibold">
          Loading Dashboard...
        </div>
      </div>
    )
  }

  return (

    <div className="space-y-8">

      {/* Hero Section */}

      <div className="bg-gradient-to-r from-brand-600 via-blue-600 to-cyan-500 rounded-3xl p-8 text-white">

        <div className="flex justify-between items-center">

          <div>

            <h1 className="text-4xl font-bold">
              Recruiter Dashboard
            </h1>

            <p className="mt-3 text-brand-100">
              Manage drives, applications,
              interviews and recruitment
              activities from one place.
            </p>

          </div>

          <Icons.Building2
            size={80}
            className="opacity-80"
          />

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white rounded-3xl border shadow-sm p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500">
                Active Drives
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {stats.drives}
              </h2>

            </div>

            <Icons.Briefcase
              className="text-brand-600"
              size={40}
            />

          </div>

        </div>

        <div className="bg-white rounded-3xl border shadow-sm p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500">
                Applications
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {stats.applications}
              </h2>

            </div>

            <Icons.Users
              className="text-brand-600"
              size={40}
            />

          </div>

        </div>

        <div className="bg-white rounded-3xl border shadow-sm p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500">
                Shortlisted
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {stats.shortlisted}
              </h2>

            </div>

            <Icons.UserCheck
              className="text-green-600"
              size={40}
            />

          </div>

        </div>

        <div className="bg-white rounded-3xl border shadow-sm p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500">
                Interviews
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {stats.interviews}
              </h2>

            </div>

            <Icons.CalendarDays
              className="text-orange-500"
              size={40}
            />

          </div>

        </div>

      </div>

      {/* Quick Actions */}

      <div className="bg-white rounded-3xl border shadow-sm p-6">

        <h2 className="text-2xl font-bold mb-6">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-4 gap-5">

          <button
            onClick={() =>
              navigate(
                '/recruiter/create-drive'
              )
            }
            className="bg-brand-50 hover:bg-brand-100 transition rounded-2xl p-6 text-left"
          >

            <Icons.PlusCircle
              className="text-brand-600 mb-3"
              size={32}
            />

            <h3 className="font-semibold">
              Create Drive
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Post a new opportunity
            </p>

          </button>

          <button
            onClick={() =>
              navigate(
                '/recruiter/manage-drives'
              )
            }
            className="bg-blue-50 hover:bg-brand-100 transition rounded-2xl p-6 text-left"
          >

            <Icons.Briefcase
              className="text-brand-600 mb-3"
              size={32}
            />

            <h3 className="font-semibold">
              Manage Drives
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Update and monitor drives
            </p>

          </button>

          <button
            onClick={() =>
              navigate(
                '/recruiter/applications'
              )
            }
            className="bg-green-50 hover:bg-green-100 transition rounded-2xl p-6 text-left"
          >

            <Icons.Users
              className="text-green-600 mb-3"
              size={32}
            />

            <h3 className="font-semibold">
              Applications
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Review applicants
            </p>

          </button>

          <button
            onClick={() =>
              navigate(
                '/recruiter/interviews'
              )
            }
            className="bg-orange-50 hover:bg-orange-100 transition rounded-2xl p-6 text-left"
          >

            <Icons.CalendarDays
              className="text-orange-500 mb-3"
              size={32}
            />

            <h3 className="font-semibold">
              Interviews
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Schedule interviews
            </p>

          </button>

        </div>

      </div>

      {/* Tables */}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Drives */}

        <div className="bg-white rounded-3xl border shadow-sm p-6">

          <h2 className="text-xl font-bold mb-5">
            Recent Drives
          </h2>

          <div className="space-y-4">

            {drives.slice(0, 5).map(
              drive => (

                <div
                  key={drive.id}
                  className="border rounded-xl p-4"
                >

                  <h3 className="font-semibold">
                    {drive.position}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {drive.company?.name}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

        {/* Recent Applications */}

        <div className="bg-white rounded-3xl border shadow-sm p-6">

          <h2 className="text-xl font-bold mb-5">
            Recent Applications
          </h2>

          <div className="space-y-4">

            {applications
              .slice(0, 5)
              .map(app => (

                <div
                  key={app.id}
                  className="border rounded-xl p-4 flex justify-between"
                >

                  <div>

                    <h3 className="font-semibold">
                      {app.student_name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {app.status}
                    </p>

                  </div>

                  <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm h-fit">
                    {app.status}
                  </span>

                </div>

              ))}

          </div>

        </div>

      </div>

      {/* Upcoming Interviews */}

      <div className="bg-white rounded-3xl border shadow-sm p-6">

        <h2 className="text-xl font-bold mb-6">
          Upcoming Interviews
        </h2>

        <div className="space-y-4">

          {interviews.length === 0 ? (

            <div className="text-slate-500">
              No interviews scheduled
            </div>

          ) : (

            interviews
              .slice(0, 5)
              .map(interview => (

                <div
                  key={interview.id}
                  className="flex justify-between items-center border rounded-xl p-4"
                >

                  <div>

                    <h3 className="font-semibold">
                      {
                        interview.student_name
                      }
                    </h3>

                    <p className="text-sm text-slate-500">
                      {interview.round}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="font-medium">
                      {new Date(
                        interview.interview_date
                      ).toLocaleDateString()}
                    </p>

                  </div>

                </div>

              ))

          )}

        </div>

      </div>

    </div>
  )
}