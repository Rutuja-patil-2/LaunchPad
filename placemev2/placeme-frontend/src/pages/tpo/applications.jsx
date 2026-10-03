import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { tpoApi } from '../../services/tpoApi'
import { useNavigate } from 'react-router-dom'

const TPOApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
   const navigate = useNavigate()
  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
  try {
    const res = await tpoApi.getApplications()

    console.log("APPLICATION RESPONSE FULL:")
console.log(JSON.stringify(res.data, null, 2))

    const data = res.data

    setApplications(
      Array.isArray(data)
        ? data
        : data.results
        ? data.results
        : data.data
        ? data.data
        : []
    )
  } catch (err) {
    console.log(err)
  } finally {
    setLoading(false)
  }
}

  const updateStatus = async (id, status) => {
    try {
      await tpoApi.updateApplicationStatus(id, status)

      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status } : app
        )
      )
    } catch (err) {
      console.log(err)
      alert('Failed to update status')
    }
  }

  const filteredApps =
    filter === 'all'
      ? applications
      : applications.filter((a) => a.status === filter)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Applications
        </h1>
        <p className="text-slate-500">
          Manage student applications
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">

        {[
          'all',
          'applied',
          'reviewed',
          'shortlisted',
          'interviewed',
          'selected',
          'rejected'
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full border ${
              filter === status
                ? 'bg-brand-600 text-white'
                : 'bg-white'
            }`}
          >
            {status}
          </button>
        ))}

      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td className="p-6 text-center" colSpan="5">
                  Loading...
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.id} className="border-t">

                  <td className="p-4">
                    {app.student_name}
                  </td>

                  <td className="p-4">
                    {app.drive?.company?.name}
                  </td>

                  <td className="p-4">
                    {app.drive?.position}
                  </td>

                  <td className="p-4">
                    <span
  className={`px-3 py-1 rounded-full text-sm ${
    app.status === 'selected'
      ? 'bg-green-100 text-green-700'
      : app.status === 'rejected'
      ? 'bg-red-100 text-red-700'
      : app.status === 'shortlisted'
      ? 'bg-brand-100 text-brand-700'
      : 'bg-slate-100 text-slate-700'
  }`}
>
                      {app.status}
                    </span>
                  </td>

                  <td className="p-4 flex gap-2">


                    <button onClick={() => navigate(`/tpo/applications/${app.id}`)}
                     className="text-slate-600">
                      <Icons.Eye />
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(app.id, 'shortlisted')
                      }
                      className="text-green-600"
                    >
                      <Icons.CheckCircle />
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(app.id, 'rejected')
                      }
                      className="text-red-600"
                    >
                      <Icons.XCircle />
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(app.id, 'interviewed')
                      }
                      className="text-brand-600"
                    >
                      <Icons.Calendar />
                    </button>

                    <button
                        onClick={() =>updateStatus(app.id, 'selected')}
                        className="text-emerald-600">
                        <Icons.BadgeCheck />
                      </button>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default TPOApplications