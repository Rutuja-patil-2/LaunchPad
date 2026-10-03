import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { toast } from 'react-toastify'
import { recruiterService } from '../../services/api'

export default function ManageDrives() {
  const navigate = useNavigate()

  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchDrives()
  }, [])

  const fetchDrives = async () => {
    try {
      setLoading(true)

      const response =
        await recruiterService.getDrives()

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || []

      setDrives(data)

    } catch (error) {
      console.error(error)
      toast.error('Failed to load drives')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this drive?'
    )

    if (!confirmDelete) return

    try {
      setDeletingId(id)

      await recruiterService.deleteDrive(id)

      setDrives(
        drives.filter(
          (drive) => drive.id !== id
        )
      )

      toast.success('Drive deleted successfully')

    } catch (error) {
      console.error(error)
      toast.error('Failed to delete drive')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredDrives = drives.filter(
    (drive) =>
      drive.position
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        ) ||
      drive.company?.name
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
  )

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Manage Drives
        </h1>

        <p className="text-slate-500 mt-2">
          View, manage and track all placement drives
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl border p-6">
          <p className="text-slate-500">
            Total Drives
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {drives.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <p className="text-slate-500">
            Active Drives
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {
              drives.filter(
                (d) => d.is_active
              ).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <p className="text-slate-500">
            Applications
          </p>

          <h2 className="text-3xl font-bold text-brand-600 mt-2">
            {
              drives.reduce(
                (sum, drive) =>
                  sum +
                  (drive.total_applications || 0),
                0
              )
            }
          </h2>
        </div>

      </div>

      {/* Search */}
      <div className="flex gap-4">

        <div className="relative flex-1">

          <Icons.Search
            className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search drives..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="w-full border rounded-xl pl-10 p-3"
          />
        </div>

        <button
          onClick={fetchDrives}
          className="px-5 py-3 bg-slate-100 rounded-xl hover:bg-slate-200"
        >
          Refresh
        </button>

      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Icons.Loader2 className="w-10 h-10 animate-spin text-brand-600" />
        </div>
      )}

      {/* Empty */}
      {!loading &&
        filteredDrives.length === 0 && (
          <div className="bg-white border rounded-2xl p-12 text-center">
            <Icons.Briefcase className="w-14 h-14 mx-auto text-slate-300 mb-4" />

            <p className="text-slate-500">
              No drives found
            </p>
          </div>
        )}

      {/* Drive Cards */}
      {!loading &&
        filteredDrives.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6">

            {filteredDrives.map((drive) => (

              <motion.div
                key={drive.id}
                whileHover={{
                  y: -4,
                }}
                className="bg-white border rounded-2xl p-6 shadow-sm"
              >

                <div className="flex justify-between items-start">

                  <div>
                    <h3 className="text-xl font-bold">
                      {drive.position}
                    </h3>

                    <p className="text-slate-500">
                      {drive.company?.name}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium capitalize text-brand-700">
                      {drive.drive_type || 'placement'}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      drive.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {drive.is_active
                      ? 'Active'
                      : 'Closed'}
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">

                  <div>
                    <p className="text-xs text-slate-500">
                      Package
                    </p>

                    <p className="font-semibold">
                      {drive.package}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Applications
                    </p>

                    <p className="font-semibold">
                      {
                        drive.total_applications
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Eligibility
                    </p>

                    <p className="font-semibold">
                      {drive.eligibility}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Deadline
                    </p>

                    <p className="font-semibold">
                      {new Date(
                        drive.deadline
                      ).toLocaleDateString()}
                    </p>
                  </div>

                </div>

                {/* Actions */}

                <div className="flex gap-3 mt-6">

                  <button
                    onClick={() => navigate(`/recruiter/drives/${drive.id}`)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    View
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/recruiter/applications?drive=${drive.id}`
                      )
                    }
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-brand-100 text-brand-700 hover:bg-blue-200"
                  >
                    <Icons.Sparkles size={16} /> Match candidates
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/recruiter/drives/edit/${drive.id}`
                      )
                    }
                    className="flex-1 py-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        drive.id
                      )
                    }
                    disabled={
                      deletingId === drive.id
                    }
                    className="flex-1 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    {deletingId === drive.id
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>

                </div>

              </motion.div>

            ))}
          </div>
        )}
    </div>
  )
}