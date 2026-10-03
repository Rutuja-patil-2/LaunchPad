import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { auth } from '../../services/apiClient'

const RecruiterLogin = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {
      const tokenRes = await auth.login(
        formData.username,
        formData.password
      )

      const { access, refresh } = tokenRes.data

      localStorage.setItem(
        'access_token',
        access
      )

      localStorage.setItem(
        'refresh_token',
        refresh
      )

      toast.success('Login successful')

      navigate('/recruiter/dashboard')

    } catch (error) {
      console.error(error)

      toast.error(
        error.response?.data?.detail ||
        'Invalid credentials'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Recruiter Login
        </h1>

        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded"
        >
          {loading
            ? 'Signing In...'
            : 'Login'}
        </button>

        <div className="text-center">
          <Link
            to="/recruiter/register"
            className="text-brand-600"
          >
            Create Recruiter Account
          </Link>
        </div>
      </form>
    </div>
  )
}

export default RecruiterLogin