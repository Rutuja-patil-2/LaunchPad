import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../services/apiClient'

const Students = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState('all')
  const [skillsFilter, setSkillsFilter] = useState('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createForm, setCreateForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    branch: '',
    password: '',
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await apiClient.get('/users/tpo_students/')
      const users = Array.isArray(res.data) ? res.data : res.data.results || []
      setStudents(users)
    } catch (err) {
      console.error('Failed to load TPO student directory:', err)
      setError(err.response?.data?.detail || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStudent = async (event) => {
    event.preventDefault()
    setCreating(true)
    setCreateError('')
    setSuccess('')
    try {
      const response = await apiClient.post('/users/create_student/', createForm)
      setIsCreateOpen(false)
      setCreateForm({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        branch: '',
        password: '',
      })
      setSuccess(`Student account created for ${response.data.username}. Share the initial password securely.`)
      await fetchStudents()
    } catch (err) {
      const errors = err.response?.data
      setCreateError(
        errors
          ? Object.entries(errors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join(' ')
          : 'Failed to create student account. Please try again.'
      )
    } finally {
      setCreating(false)
    }
  }

  const branches = [...new Set(students.map((student) => student.branch?.trim()).filter(Boolean))].sort()
  const branchCounts = students.reduce((counts, student) => {
    const branch = student.branch?.trim() || 'Branch not provided'
    counts[branch] = (counts[branch] || 0) + 1
    return counts
  }, {})
  const studentsNeedingSkills = students.filter((student) => !student.skills?.trim()).length
  const filtered = students.filter((student) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [
      student.username,
      student.first_name,
      student.last_name,
      student.email,
    ].some((value) => value?.toLowerCase().includes(query))
    const branch = student.branch?.trim() || ''
    const matchesBranch = branchFilter === 'all' ||
      (branchFilter === '__missing__' ? !branch : branch === branchFilter)
    const hasSkills = Boolean(student.skills?.trim())
    const matchesSkills = skillsFilter === 'all' ||
      (skillsFilter === 'missing' ? !hasSkills : hasSkills)
    return matchesSearch && matchesBranch && matchesSkills
  })

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500">Browse students by branch and identify mentoring needs</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchStudents}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Icons.RefreshCw size={16} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setCreateError('')
              setIsCreateOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Icons.UserPlus size={16} /> Create Student
          </button>
        </div>
      </div>

      {success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-student-title"
            className="my-8 w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="create-student-title" className="text-xl font-semibold text-slate-900">Create student account</h2>
                <p className="mt-1 text-sm text-slate-500">The student can update their profile after signing in.</p>
              </div>
              <button type="button" onClick={() => setIsCreateOpen(false)} aria-label="Close" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <Icons.X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  First name
                  <input value={createForm.first_name} onChange={(event) => setCreateForm({ ...createForm, first_name: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5" />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Last name
                  <input value={createForm.last_name} onChange={(event) => setCreateForm({ ...createForm, last_name: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5" />
                </label>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                Username
                <input required autoComplete="username" value={createForm.username} onChange={(event) => setCreateForm({ ...createForm, username: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Student email
                <input required type="email" autoComplete="email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Branch
                <input required placeholder="e.g. CSE, ENTC, IT" value={createForm.branch} onChange={(event) => setCreateForm({ ...createForm, branch: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Initial password
                <input required type="password" minLength={8} autoComplete="new-password" value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5" />
              </label>
              <p className="text-xs text-slate-500">Share the initial password using your institution’s approved channel.</p>
              {createError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{createError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
                  {creating && <Icons.LoaderCircle size={16} className="animate-spin" />}
                  {creating ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Students</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{students.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Branches represented</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{branches.length}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-800">Need skills support</p>
          <p className="mt-1 text-2xl font-semibold text-amber-950">{studentsNeedingSkills}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(branchCounts).map(([branch, count]) => (
          <button
            key={branch}
            type="button"
            onClick={() => setBranchFilter(branch === 'Branch not provided' ? '__missing__' : branch)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              (branchFilter === branch || (branch === 'Branch not provided' && branchFilter === '__missing__'))
                ? 'border-brand-300 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {branch} <span className="ml-1 text-xs opacity-70">{count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row">
        <label className="relative flex-1">
          <Icons.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-brand-500"
          />
        </label>
        <select
          aria-label="Filter by branch"
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">All branches</option>
          {branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
          {branchCounts['Branch not provided'] && <option value="__missing__">Branch not provided</option>}
        </select>
        <select
          aria-label="Filter by skills"
          value={skillsFilter}
          onChange={(e) => setSkillsFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">All skills profiles</option>
          <option value="missing">Skills missing ({studentsNeedingSkills})</option>
          <option value="present">Skills listed</option>
        </select>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-100 text-sm text-slate-600">
              <tr>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Branch</th>
                <th className="p-4 text-left">Skills</th>
                <th className="p-4 text-left">Profile</th>
                <th className="p-4 text-left">Support</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading students...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">No students match these filters</td></tr>
              ) : filtered.map((student) => {
                const hasSkills = Boolean(student.skills?.trim())
                return (
                  <tr key={student.id} className="border-t border-slate-100 align-top">
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{student.first_name || student.username} {student.last_name}</p>
                      <p className="mt-1 text-sm text-slate-500">{student.email || student.username}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-700">{student.branch || 'Not provided'}</td>
                    <td className="max-w-xs p-4 text-sm text-slate-600">
                      {hasSkills ? student.skills : <span className="text-amber-700">No skills listed</span>}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700">{student.profile_completion || 0}%</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        hasSkills ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {hasSkills ? <Icons.Check size={13} /> : <Icons.BookOpen size={13} />}
                        {hasSkills ? 'Skills listed' : 'Mentoring suggested'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        title="Review student and support options"
                        onClick={() => navigate(`/tpo/students/${student.id}`)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Icons.Eye size={16} /> Review
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default Students
