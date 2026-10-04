import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { tpoapi } from '../../services/tpoapi'

const TPODrives = () => {
  const navigate = useNavigate()

  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('placement')

  useEffect(() => {
    fetchDrives()
  }, [])

  const fetchDrives = async () => {
    try {
      const res = await tpoapi.getDrives()
      setDrives(res.data.results || res.data || [])
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteDrive = async (id) => {
    if (!window.confirm('Delete this drive?')) return

    try {
      await tpoapi.deleteDrive(id)

      setDrives(
        drives.filter((drive) => drive.id !== id)
      )
    } catch (err) {
      console.log(err)
      alert('Failed to delete drive')
    }
  }

  const visibleDrives = drives.filter(
    (drive) => (drive.drive_type || 'placement') === activeType
  )

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            Drives
          </h1>

          <p className="text-slate-500">
            Manage hiring drives
          </p>
        </div>

        <button
          onClick={() =>
            navigate('/tpo/drives/create')
          }
          className="bg-brand-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <Icons.Plus size={18} />
          Create Drive
        </button>

      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {[
          { value: 'placement', label: 'Placement', icon: Icons.BriefcaseBusiness },
          { value: 'internship', label: 'Internship', icon: Icons.GraduationCap }
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveType(value)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${
              activeType === value
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon size={16} />
            {label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {drives.filter((drive) => (drive.drive_type || 'placement') === value).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">Package</th>
              <th className="p-4 text-left">Applications</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="6"
                  className="p-6 text-center"
                >
                  Loading...
                </td>
              </tr>

            ) : (

              visibleDrives.length ? visibleDrives.map((drive) => (

                <tr
                  key={drive.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {drive.company?.name}
                  </td>

                  <td className="p-4">
                    {drive.position}
                  </td>

                  <td className="p-4">
                    {drive.package}
                  </td>

                  <td className="p-4">
                    {drive.total_applications}
                  </td>

                  <td className="p-4">
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          drive.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {drive.is_active ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {drive.is_verified
                        ? 'Verified by TPO'
                        : 'Pending verification'}
                    </div>
                  </td>

                  <td className="p-4 flex gap-3">

                   <button onClick={() => navigate(`/tpo/drives/edit/${drive.id}`)}>
                    <Icons.Pencil size={18} />
                    </button>

                    <button
                      onClick={() =>
                        deleteDrive(drive.id)
                      }
                    >
                      <Icons.Trash2
                        size={18}
                        className="text-red-500"
                      />
                    </button>

                  </td>

                </tr>

              )) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500">
                    No {activeType} drives found.
                  </td>
                </tr>
              )

            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default TPODrives