import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuthStore } from '../context/authContext'
import { auth } from '../services/apiClient'
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { LaunchpadLogo } from '../components/LaunchpadLogo'

const ROLE_TABS = [
  { id: 'student', label: 'Student', hint: 'Sign in with your student account' },
  { id: 'tpo', label: 'TPO', hint: 'Training & Placement Officer sign in' },
  { id: 'recruiter', label: 'Company', hint: 'Sign in with your company recruiter account' },
]

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') || 'student'
  const validInitial = ROLE_TABS.some((r) => r.id === initialRole)
    ? initialRole
    : 'student'

  const { login } = useAuthStore()
  const setAuthToken = useAuthStore((state) => state.setToken)
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState(validInitial)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const activeTab = ROLE_TABS.find((r) => r.id === userType) ?? ROLE_TABS[0]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tokenRes = await auth.login(formData.username, formData.password)
      const { access, refresh } = tokenRes.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      setAuthToken(access)
      useAuthStore.setState({ token: access, refreshToken: refresh })

      let userData = { username: formData.username }
      try {
        const userRes = await auth.getProfile()
        userData = userRes.data
      } catch (err) {
        console.error('Error fetching profile:', err)
      }

      const role = userData.role
      const roleMismatch =
        (userType === 'recruiter' && role !== 'recruiter') ||
        (userType === 'tpo' && role !== 'tpo') ||
        (userType === 'student' && role !== 'student')

      if (roleMismatch) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        useAuthStore.getState().logout()
        toast.error(
          userType === 'student'
            ? 'Please use the TPO or Company tab for this account.'
            : `This account is not a ${activeTab.label} account.`
        )
        setLoading(false)
        return
      }

      login(userData, access, refresh)
      toast.success('Login successful!')

      if (role === 'recruiter') {
        navigate('/recruiter/dashboard')
      } else if (role === 'tpo' || userData.is_tpo || userData.is_staff) {
        navigate('/tpo')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Login failed'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <LaunchpadLogo size="lg" />
          <p className="text-gray-600 text-center text-sm">{activeTab.hint}</p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white mb-4 shadow-sm">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setUserType(tab.id)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                userType === tab.id
                  ? 'bg-launchpad-purple text-white'
                  : 'bg-white text-launchpad-purple hover:bg-brand-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {userType === 'recruiter' ? 'Username or company email' : 'Username or email'}
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-3 w-5 h-5 text-launchpad-purple" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder={
                  userType === 'recruiter'
                    ? 'Company account username'
                    : 'Enter your username'
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-3 w-5 h-5 text-launchpad-purple" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 font-semibold disabled:opacity-50"
          >
            {loading ? 'Signing in...' : `Sign in as ${activeTab.label}`}
          </button>

          <div className="flex justify-between items-center text-sm">
            <Link to="/" className="text-launchpad-purple font-medium hover:underline">
              Back to Home
            </Link>
            <Link
              to={`/register?role=${userType}`}
              className="text-gray-600 hover:text-launchpad-purple"
            >
              Create account
            </Link>
          </div>
        </form>

        <div className="rounded-xl p-4 mt-6 text-sm border border-gray-200 bg-white shadow-sm">
          <p className="font-semibold text-launchpad-purple mb-2">Demo (Student):</p>
          <p className="text-gray-600">
            Username: <code className="px-2 py-1 rounded bg-gray-50 border border-gray-100">student1</code>
          </p>
          <p className="text-gray-600">
            Password: <code className="px-2 py-1 rounded bg-gray-50 border border-gray-100">test123</code>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
