import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { placement } from '../services/apiClient'

export const PlacementDrives = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [applyingId, setApplyingId] = useState(null)
  
  // Profile completion states
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [profileReady, setProfileReady] = useState(false)
  const [missingFields, setMissingFields] = useState([])

  useEffect(() => {
    fetchDrives()
    checkProfileStatus()
  }, [])

  const checkProfileStatus = async () => {
    try {
      const response = await placement.checkProfileStatus()
      setProfileCompletion(response.data.profile_completion)
      setProfileReady(response.data.profile_ready)
      setMissingFields(response.data.missing_fields || [])
    } catch (err) {
      console.error('Error checking profile status:', err)
      setProfileReady(false)
    }
  }

  const fetchDrives = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await placement.getDrives({
        is_active: true,
        is_verified: true
      })

      const drivesData = Array.isArray(response.data)
        ? response.data
        : response.data.results || []

      setDrives(drivesData)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load drives')
      console.error('Error fetching drives:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (driveId) => {
    // Check profile completion first
    if (!profileReady) {
      alert(`Your profile is ${profileCompletion}% complete.\n\nMissing: ${missingFields.join(', ')}\n\nPlease complete your profile to apply.`)
      navigate('/profile')
      return
    }

    try {
      setApplyingId(driveId)

      const response = await placement.createApplication({
        drive_id: driveId
      })
      
      alert('Application submitted successfully! 🎉')
      // Refresh profile status
      checkProfileStatus()

    } catch (err) {
      console.error('Apply error:', err)

      // Check if error is due to incomplete profile
      if (err.response?.data?.profile_completion !== undefined) {
        setProfileCompletion(err.response.data.profile_completion)
        setMissingFields(err.response.data.missing_fields || [])
        alert(`Profile is only ${err.response.data.profile_completion}% complete.\n\nMissing: ${err.response.data.missing_fields?.join(', ')}\n\nPlease complete your profile first!`)
        navigate('/profile')
      } else if (err.response?.data) {
        alert(err.response.data.message || JSON.stringify(err.response.data))
      } else {
        alert('Failed to apply')
      }
    } finally {
      setApplyingId(null)
    }
  }

  const activeType = searchParams.get('type') === 'internship'
    ? 'internship'
    : 'placement'

  const categoryDrives = drives.filter((drive) =>
    (drive.drive_type || 'placement') === activeType
  )

  const filteredDrives = categoryDrives.filter((drive) =>
    drive.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drive.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
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
          Placement Drives
        </h1>

        <p className="text-slate-600">
          Browse and apply to active opportunities
        </p>
      </motion.div>

      <div className="flex gap-2 border-b border-slate-200">
        {[
          { value: 'placement', label: 'Placement', icon: Icons.BriefcaseBusiness },
          { value: 'internship', label: 'Internship', icon: Icons.GraduationCap }
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSearchParams({ type: value })}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeType === value
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {drives.filter((drive) => (drive.drive_type || 'placement') === value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Profile Completion Warning */}
      {!profileReady && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900"
        >
          <div className="flex items-start gap-3">
            <Icons.AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Complete Your Profile to Apply</h4>
              <p className="text-sm mb-2">Your profile is {profileCompletion}% complete. Missing: {missingFields.join(', ')}</p>
              <Button 
                size="sm"
                variant="secondary"
                onClick={() => navigate('/profile')}
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Profile Completion Success */}
      {profileReady && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 flex items-center gap-3"
        >
          <Icons.CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Profile Complete ✓</h4>
            <p className="text-sm">You're all set to apply for drives!</p>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-4 flex-wrap"
      >
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search companies or positions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-all"
          />

          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        </div>

        <Button variant="secondary" onClick={fetchDrives}>
          Refresh
        </Button>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          <div className="flex items-center gap-2">
            <Icons.AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin mx-auto mb-4" />

            <p className="text-slate-600">Loading drives...</p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredDrives.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Icons.Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />

          <p className="text-slate-600">
            {searchTerm
              ? 'No drives match your search'
              : `No active ${activeType} opportunities available`}
          </p>
        </motion.div>
      )}

      {/* Drives */}
      {!loading && filteredDrives.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredDrives.map((drive) => (
            <motion.div
              key={drive.id}
              variants={itemVariants}
              whileHover={{
                y: -10,
                boxShadow: '0 25px 50px rgba(59, 130, 246, 0.1)'
              }}
              className="group overflow-hidden rounded-2xl border border-slate-200 backdrop-blur-xl bg-white hover:border-brand-300 transition-all"
            >
              {/* Top Gradient */}
              <div className="relative h-32 bg-gradient-to-r from-brand-600 to-purple-600 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                {drive.company?.logo_url && (
                  <img
                    src={drive.company.logo_url}
                    alt={drive.company?.name}
                    className="absolute w-20 h-20 top-1/2 left-8 -translate-y-1/2 rounded-lg border-2 border-white shadow-lg object-cover"
                  />
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {drive.company?.name || 'Company'}
                </h3>

                <p className="text-slate-600 text-sm mt-2">
                  {drive.position}
                </p>

                {/* Package */}
                <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                  <p className="text-xs text-emerald-500 font-medium">
                    PACKAGE (CTC)
                  </p>

                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {drive.ctc
                      ? `${drive.ctc} LPA`
                      : drive.package || 'N/A'}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-[1px] text-slate-500">
                      Verification
                    </p>
                    <p className="mt-2 font-medium text-slate-900">
                      {drive.is_verified ? 'Verified by TPO' : 'Pending verification'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-[1px] text-slate-500">
                      Selected Students
                    </p>
                    <p className="mt-2 font-medium text-slate-900">
                      {drive.selected_count ?? 0}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 mb-2">
                      ELIGIBILITY
                    </p>

                    <Badge variant="default">
                      {drive.eligibility || 'No restriction'}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600 mb-2">
                      REQUIRED SKILLS
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {drive.required_skills ? (
                        typeof drive.required_skills === 'string'
                          ? drive.required_skills
                            .split(',')
                            .map((skill) => (
                              <Badge
                                key={skill.trim()}
                                variant="purple"
                                size="xs"
                              >
                                {skill.trim()}
                              </Badge>
                            ))
                          : Array.isArray(drive.required_skills)
                            ? drive.required_skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="purple"
                                size="xs"
                              >
                                {skill}
                              </Badge>
                            ))
                            : (
                              <span className="text-xs text-slate-500">
                                No skills specified
                              </span>
                            )
                      ) : (
                        <span className="text-xs text-slate-500">
                          No skills specified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Icons.Calendar className="w-4 h-4" />

                    Deadline:{' '}
                    {drive.deadline
                      ? new Date(drive.deadline).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleApply(drive.id)}
                    disabled={!profileReady || applyingId === drive.id}
                    title={!profileReady ? `Profile ${profileCompletion}% complete. Missing: ${missingFields.join(', ')}` : 'Apply to this drive'}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      !profileReady
                        ? 'bg-slate-300 text-slate-600 cursor-not-allowed opacity-60'
                        : 'bg-brand-600 text-white hover:bg-brand-700 cursor-pointer'
                    }`}
                  >
                    {applyingId === drive.id
                      ? 'Applying...'
                      : !profileReady
                      ? `${profileCompletion}% Complete`
                      : 'Apply Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Footer */}
      {!loading && filteredDrives.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12"
        >
          <p className="text-slate-600">
            Showing {filteredDrives.length} out of {drives.length} drives
          </p>
        </motion.div>
      )}
    </div>
  )
}