import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authService } from '../services/api'
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline'
import { LaunchpadLogo } from '../components/LaunchpadLogo'

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'recruiter', label: 'Company / Recruiter' },
  { value: 'tpo', label: 'TPO' },
]

const Register = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') || 'student'
  const validRole = ROLE_OPTIONS.some((r) => r.value === initialRole)
    ? initialRole
    : 'student'

  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: validRole,
    phone: '',
    company_name: '',
    company_website: '',
    verification_code: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === 'email') {
      setCodeSent(false)
    }
  }

  const handleSendCode = async () => {
    if (!formData.email) {
      toast.error('Enter your email first')
      return
    }

    setSendingCode(true)
    try {
      await authService.sendVerificationCode(formData.email)
      setCodeSent(true)
      toast.success('Verification code sent to your Gmail. Check your inbox.')
    } catch (error) {
      const data = error.response?.data
      const message =
        data?.email?.[0] ||
        data?.detail ||
        (typeof data === 'object' ? JSON.stringify(data) : null) ||
        'Could not send verification code'
      toast.error(message)
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match')
      return
    }

    if (!formData.verification_code) {
      toast.error('Enter the verification code from your email')
      return
    }

    if (formData.role === 'recruiter' && !formData.company_name.trim()) {
      toast.error('Company name is required')
      return
    }

    setLoading(true)

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        phone: formData.phone,
        verification_code: formData.verification_code,
      }

      if (formData.role === 'recruiter') {
        payload.company_name = formData.company_name
        payload.company_website = formData.company_website
      }

      await authService.register(payload)
      toast.success('Account created! You can sign in now.')
      navigate(`/login?role=${formData.role}`)
    } catch (error) {
      const data = error.response?.data
      const message =
        data?.verification_code?.[0] ||
        data?.email?.[0] ||
        data?.detail ||
        (typeof data === 'object' ? JSON.stringify(data) : 'Registration failed')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center gap-3">
          <LaunchpadLogo size="lg" />
          <p className="text-gray-600 text-sm">Create your Launchpad account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Register as
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {formData.role === 'recruiter' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company name
                </label>
                <div className="relative">
                  <BuildingOffice2Icon className="absolute left-3 top-3 w-5 h-5 text-launchpad-purple" />
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Your hiring organization"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company website (optional)
                </label>
                <input
                  type="url"
                  name="company_website"
                  value={formData.company_website}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://company.com"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-5 h-5 text-launchpad-purple" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gmail / Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <EnvelopeIcon className="absolute left-3 top-3 w-5 h-5 text-launchpad-purple" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="you@gmail.com"
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode}
                className="btn-secondary px-4 whitespace-nowrap text-sm disabled:opacity-50"
              >
                {sendingCode ? 'Sending…' : 'Send code'}
              </button>
            </div>
            {codeSent && (
              <p className="text-xs mt-1 text-launchpad-purple">
                Code sent. Enter it below to verify your email.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email verification code
            </label>
            <input
              type="text"
              name="verification_code"
              value={formData.verification_code}
              onChange={handleChange}
              className="input-field tracking-widest"
              placeholder="6-digit code"
              maxLength={6}
              required
            />
          </div>

          {formData.role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="Contact number"
              />
            </div>
          )}

          {formData.role === 'tpo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office phone (optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="TPO desk contact"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-3 w-5 h-5 text-launchpad-purple" />
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 font-semibold mt-4 disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Verify email & create account'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-700">Already have an account? </span>
            <Link
              to={`/login?role=${formData.role}`}
              className="text-launchpad-purple font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
