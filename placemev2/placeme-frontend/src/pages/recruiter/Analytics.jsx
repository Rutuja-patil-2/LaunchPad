import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { recruiterService } from '../../services/api'

export default function Analytics() {

  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    drives: 0,
    applications: 0,
    shortlisted: 0,
    selected: 0,
    interviews: 0,
    shortlistRate: 0,
    selectionRate: 0,
  })

  const [recentApplications, setRecentApplications] =
    useState([])

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {

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

      const drives =
        drivesRes.data.results ||
        drivesRes.data ||
        []

      const applications =
        applicationsRes.data.results ||
        applicationsRes.data ||
        []

      const interviews =
        interviewsRes.data.results ||
        interviewsRes.data ||
        []

      const shortlisted =
        applications.filter(
          app =>
            app.status ===
            'shortlisted'
        ).length

      const selected =
        applications.filter(
          app =>
            app.status ===
            'selected'
        ).length

      const shortlistRate =
        applications.length > 0
          ? Math.round(
              (shortlisted /
                applications.length) *
                100
            )
          : 0

      const selectionRate =
        applications.length > 0
          ? Math.round(
              (selected /
                applications.length) *
                100
            )
          : 0

      setStats({
        drives: drives.length,
        applications:
          applications.length,
        shortlisted,
        selected,
        interviews:
          interviews.length,
        shortlistRate,
        selectionRate,
      })

      setRecentApplications(
        applications.slice(0, 5)
      )

    } catch (error) {

      console.error(
        'Analytics Error:',
        error
      )

    } finally {

      setLoading(false)
    }
  }

  const Card = ({
    title,
    value,
    icon: Icon,
    color,
  }) => (

    <div className="bg-white rounded-3xl border shadow-sm p-6 hover:shadow-md transition">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-500 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {value}
          </h2>

        </div>

        <div
          className={`p-4 rounded-2xl ${color}`}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>

      </div>

    </div>
  )

  if (loading) {

    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl font-medium">
          Loading Analytics...
        </div>
      </div>
    )
  }

  return (

    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold">
          Recruitment Analytics
        </h1>

        <p className="text-slate-500 mt-2">
          Track hiring performance and recruitment metrics
        </p>

      </div>

      {/* Stats Cards */}

      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">

        <Card
          title="Active Drives"
          value={stats.drives}
          icon={Icons.Briefcase}
          color="bg-brand-600"
        />

        <Card
          title="Applications"
          value={stats.applications}
          icon={Icons.Users}
          color="bg-brand-600"
        />

        <Card
          title="Shortlisted"
          value={stats.shortlisted}
          icon={Icons.UserCheck}
          color="bg-green-600"
        />

        <Card
          title="Interviews"
          value={stats.interviews}
          icon={Icons.Calendar}
          color="bg-orange-500"
        />

        <Card
          title="Selected"
          value={stats.selected}
          icon={Icons.Trophy}
          color="bg-purple-600"
        />

      </div>

      {/* Performance Section */}

      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl border shadow-sm p-8">

          <h2 className="text-xl font-bold mb-6">
            Recruitment Performance
          </h2>

          <div className="space-y-6">

            <div>

              <div className="flex justify-between mb-2">

                <span>
                  Shortlist Rate
                </span>

                <span className="font-semibold">
                  {stats.shortlistRate}%
                </span>

              </div>

              <div className="h-4 bg-slate-100 rounded-full">

                <div
                  className="h-4 bg-green-500 rounded-full"
                  style={{
                    width:
                      `${stats.shortlistRate}%`,
                  }}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>
                  Selection Rate
                </span>

                <span className="font-semibold">
                  {stats.selectionRate}%
                </span>

              </div>

              <div className="h-4 bg-slate-100 rounded-full">

                <div
                  className="h-4 bg-brand-600 rounded-full"
                  style={{
                    width:
                      `${stats.selectionRate}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </div>

        <div className="bg-gradient-to-r from-brand-600 to-blue-600 rounded-3xl p-8 text-white">

          <h2 className="text-2xl font-bold">
            Recruitment Summary
          </h2>

          <p className="mt-2 opacity-90">
            Overview of your hiring activity
          </p>

          <div className="mt-8 space-y-4">

            <div className="flex justify-between">

              <span>
                Total Applications
              </span>

              <strong>
                {stats.applications}
              </strong>

            </div>

            <div className="flex justify-between">

              <span>
                Shortlisted Candidates
              </span>

              <strong>
                {stats.shortlisted}
              </strong>

            </div>

            <div className="flex justify-between">

              <span>
                Interviews Scheduled
              </span>

              <strong>
                {stats.interviews}
              </strong>

            </div>

            <div className="flex justify-between">

              <span>
                Final Selections
              </span>

              <strong>
                {stats.selected}
              </strong>

            </div>

          </div>

        </div>

      </div>

      {/* Recent Applications */}

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

        <div className="p-6 border-b">

          <h2 className="text-xl font-bold">
            Recent Applications
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="text-left p-4">
                Candidate
              </th>

              <th className="text-left p-4">
                Position
              </th>

              <th className="text-left p-4">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {recentApplications.length === 0 ? (

              <tr>

                <td
                  colSpan="3"
                  className="text-center py-10 text-slate-500"
                >
                  No applications found
                </td>

              </tr>

            ) : (

              recentApplications.map(
                application => (

                  <tr
                    key={application.id}
                    className="border-t"
                  >

                    <td className="p-4">

                      {application.student_name ||
                        'Student'}

                    </td>

                    <td className="p-4">

                      {application.position ||
                        application.drive?.position ||
                        'N/A'}

                    </td>

                    <td className="p-4">

                      <span className="px-3 py-1 rounded-full text-xs bg-slate-100">

                        {application.status}

                      </span>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}