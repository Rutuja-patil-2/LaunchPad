import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { Badge } from '../components/Badge'
import { useState, useEffect } from 'react'
import { placement } from '../services/apiClient'

const StageIndicator = ({ status }) => {
  const stages = [
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Selected'
  ]

  return (
    <div className="flex items-center justify-between gap-2 mt-4">
      {stages.map((stage, idx) => {
        const completed = stages.indexOf(status) >= idx

        return (
          <motion.div key={idx} className="flex-1 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                completed
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-200 text-slate-600 border border-slate-300'
              }`}
            >
              {completed ? '✓' : idx + 1}
            </motion.div>

            <p className="text-xs text-slate-600 mt-2 text-center">
              {stage}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}

export const Applications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await placement.getMyApplications()

      const appsData = Array.isArray(response.data)
        ? response.data
        : response.data.results || []

      setApplications(appsData)
    } catch (err) {
      setError('Failed to load applications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'default'
      case 'Under Review':
        return 'warning'
      case 'Shortlisted':
        return 'success'
      case 'Interview Scheduled':
        return 'purple'
      case 'Selected':
        return 'success'
      default:
        return 'default'
    }
  }

  const shortlistedCount = applications.filter(
    (app) => app.status === 'Shortlisted'
  ).length

  const interviewCount = applications.filter(
    (app) => app.status === 'Interview Scheduled'
  ).length

  const rejectedCount = applications.filter(
    (app) => app.status === 'Rejected'
  ).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          My Applications
        </h1>

        <p className="text-slate-600">
          Track the status of your job applications
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: 'Total Applied',
            value: applications.length,
            color: 'blue'
          },
          {
            label: 'Shortlisted',
            value: shortlistedCount,
            color: 'emerald'
          },
          {
            label: 'Interviews',
            value: interviewCount,
            color: 'purple'
          },
          {
            label: 'Rejected',
            value: rejectedCount,
            color: 'red'
          }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2 }}
            className={`p-4 rounded-lg border bg-gradient-to-br backdrop-blur-xl ${
              stat.color === 'blue'
                ? 'from-brand-500/10 to-brand-600/10 border-brand-500/20'
                : stat.color === 'emerald'
                ? 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/20'
                : stat.color === 'purple'
                ? 'from-purple-500/10 to-purple-600/10 border-purple-500/20'
                : 'from-red-500/10 to-red-600/10 border-red-500/20'
            }`}
          >
            <p className="text-xs text-slate-600">{stat.label}</p>

            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {applications.length === 0 && (
        <div className="text-center py-16">
          <Icons.Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />

          <p className="text-slate-600">
            You have not applied to any drives yet
          </p>
        </div>
      )}

      {/* Applications */}
      <div className="space-y-6">
        {applications.map((app, idx) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="overflow-hidden rounded-2xl border border-slate-200 backdrop-blur-xl bg-white hover:border-brand-300 transition-all p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {app.drive?.company?.name || 'Company'}
                </h3>

                <p className="text-slate-600 text-sm mt-1">
                  {app.drive?.position || 'Position'}
                </p>

                <p className="text-xs text-slate-500 mt-2">
                  Applied on:{' '}
                  {app.created_at
                    ? new Date(app.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>

              <Badge variant={getStatusColor(app.status)}>
                {app.status}
              </Badge>
            </div>

            {/* Stage Timeline */}
            <div className="relative">
              <StageIndicator status={app.status} />
            </div>

            {/* Progress */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (([
                            'Applied',
                            'Under Review',
                            'Shortlisted',
                            'Interview Scheduled',
                            'Selected'
                          ].indexOf(app.status) +
                            1) /
                            5) *
                          100
                        }%`
                      }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-brand-500 to-purple-500"
                    />
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  {
                    [
                      'Applied',
                      'Under Review',
                      'Shortlisted',
                      'Interview Scheduled',
                      'Selected'
                    ].indexOf(app.status) + 1
                  }
                  /5
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}