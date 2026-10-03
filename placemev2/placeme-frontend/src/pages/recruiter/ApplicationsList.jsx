import { useEffect, useState } from 'react'
import { recruiterService } from '../../services/api'
import { toast } from 'react-toastify'
import * as Icons from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

export default function ApplicationsList() {

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [drives, setDrives] = useState([])
  const [selectedDriveId, setSelectedDriveId] = useState('')
  const [matching, setMatching] = useState(false)
  const [matchResult, setMatchResult] = useState(null)
  const [matchError, setMatchError] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchApplications()
    fetchDrives()
  }, [])

  const fetchDrives = async () => {
    try {
      const response = await recruiterService.getDrives()
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || []
      setDrives(data)
      const requestedId = searchParams.get('drive')
      const requestedDrive = data.find((drive) => String(drive.id) === requestedId)
      setSelectedDriveId(String(requestedDrive?.id || data[0]?.id || ''))
    } catch (error) {
      console.error(error)
      toast.error('Failed to load drives for candidate matching')
    }
  }

  const fetchApplications = async () => {
    try {

      const response =
        await recruiterService.getApplications()

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || []

      setApplications(data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const runCandidateMatch = async () => {
    if (!selectedDriveId) {
      setMatchError('Create a drive before matching candidates.')
      return
    }

    setMatching(true)
    setMatchError('')
    setMatchResult(null)
    try {
      const response = await recruiterService.matchCandidates(selectedDriveId)
      setMatchResult(response.data)
    } catch (error) {
      console.error(error)
      setMatchError(error.response?.data?.detail || 'Candidate matching failed. Please try again.')
    } finally {
      setMatching(false)
    }
  }

  const updateStatus = async (
    id,
    status
  ) => {

    try {

      await recruiterService.updateApplicationStatus(
        id,
        status
      )

      toast.success(
        `Application ${status}`
      )

      fetchApplications()

    } catch (error) {

      console.error(error)

      toast.error(
        'Failed to update application'
      )
    }
  }

  const filteredApplications =
    applications.filter((app) =>
      app.student_name
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    )

  const getStatusColor = (status) => {

    switch (status) {

      case 'selected':
        return 'bg-green-100 text-green-700'

      case 'shortlisted':
        return 'bg-brand-100 text-brand-700'

      case 'interviewed':
        return 'bg-purple-100 text-purple-700'

      case 'rejected':
        return 'bg-red-100 text-red-700'

      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-4xl font-bold">
          Applications
        </h1>

        <p className="text-slate-500 mt-2">
          Review and manage applicants
        </p>

      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Icons.Sparkles size={19} className="text-brand-600" /> Candidate matching
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Rank applicants against one of your positions using skills and role requirements.
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <select
              aria-label="Position for candidate matching"
              value={selectedDriveId}
              onChange={(event) => {
                setSelectedDriveId(event.target.value)
                setMatchResult(null)
                setMatchError('')
              }}
              className="min-w-56 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:flex-none"
            >
              {drives.length === 0 && <option value="">No positions available</option>}
              {drives.map((drive) => (
                <option key={drive.id} value={drive.id}>
                  {drive.position} ({drive.drive_type || 'placement'})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={runCandidateMatch}
              disabled={!selectedDriveId || matching}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {matching ? <Icons.LoaderCircle size={16} className="animate-spin" /> : <Icons.Sparkles size={16} />}
              {matching ? 'Matching...' : 'Match applicants'}
            </button>
          </div>
        </div>

        <div className="p-5">
          <p className="mb-4 text-xs text-slate-500">
            Rankings are decision support only. Review each application yourself; matches are based on profile evidence and job requirements.
          </p>
          {matchError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{matchError}</p>}
          {matchResult && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800">
                  {matchResult.applicant_count} applicants for {matchResult.position}
                </p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                  {matchResult.method === 'ai' ? 'AI-assisted match' : 'Skills-based match'}
                </span>
              </div>
              {matchResult.note && <p className="mb-3 text-sm text-amber-700">{matchResult.note}</p>}
              {matchResult.matches.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No applicants have applied to this position yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {matchResult.matches.map((match) => (
                    <article key={match.application_id} className="grid gap-3 py-4 sm:grid-cols-[minmax(140px,0.8fr)_minmax(120px,0.6fr)_2fr] sm:items-center">
                      <div>
                        <h3 className="font-medium text-slate-900">{match.student_name}</h3>
                        <p className="text-xs text-slate-500">Application #{match.application_id}</p>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-slate-500">Role match</span>
                          <span className="font-semibold text-slate-800">{match.score}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${match.score}%` }} />
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="text-slate-700">{match.reason}</p>
                        {match.strengths.length > 0 && <p className="mt-1 text-xs text-emerald-700">Strengths: {match.strengths.join(', ')}</p>}
                        {match.gaps.length > 0 && <p className="mt-1 text-xs text-amber-700">Gaps: {match.gaps.join(', ')}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Stats */}

      <div className="grid md:grid-cols-4 gap-5">

        <div className="bg-white rounded-2xl border p-5">
          <p className="text-slate-500">
            Total
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {applications.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <p className="text-slate-500">
            Applied
          </p>

          <h2 className="text-3xl font-bold text-yellow-600 mt-2">
            {
              applications.filter(
                a => a.status === 'applied'
              ).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <p className="text-slate-500">
            Shortlisted
          </p>

          <h2 className="text-3xl font-bold text-brand-600 mt-2">
            {
              applications.filter(
                a => a.status === 'shortlisted'
              ).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <p className="text-slate-500">
            Selected
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {
              applications.filter(
                a => a.status === 'selected'
              ).length
            }
          </h2>
        </div>

      </div>

      {/* Search */}

      <div className="bg-white rounded-2xl border p-4">

        <div className="relative">

          <Icons.Search
            className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search applicant..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="w-full border rounded-xl p-3 pl-10"
          />

        </div>

      </div>

      {/* Loading */}

      {loading && (
        <div className="text-center py-20">
          Loading applications...
        </div>
      )}

      {/* Applications */}

      {!loading && (

        <div className="grid gap-6">

          {filteredApplications.map((app) => (

            <div
              key={app.id}
              className="bg-white rounded-2xl border p-6"
            >

              <div className="flex justify-between items-start">

                <div>

                  <h3 className="text-xl font-bold">
                    {app.student_name}
                  </h3>

                  <p className="text-slate-500">
                    {app.drive?.position}
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    {app.drive?.company?.name}
                  </p>

                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(app.status)}`}
                >
                  {app.status}
                </span>

              </div>

              <div className="mt-4 text-sm text-slate-500">

                Applied on

                {' '}

                {new Date(
                  app.applied_at
                ).toLocaleDateString()}

              </div>

              <div className="flex flex-wrap gap-3 mt-6">

                <button
                  onClick={() =>
                    updateStatus(
                      app.id,
                      'shortlisted'
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-brand-100 text-brand-700"
                >
                  Shortlist
                </button>

                {/* <button
                  onClick={() =>
                    updateStatus(
                      app.id,
                      'interviewed'
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-purple-100 text-purple-700"
                >
                  Interview
                </button> */}

                <button
                  onClick={() =>
                    updateStatus(
                      app.id,
                      'selected'
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-green-100 text-green-700"
                >
                  Select
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      app.id,
                      'rejected'
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-red-100 text-red-700"
                >
                  Reject
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}