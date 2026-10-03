import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tpoApi } from '../../services/tpoApi'

const CompanyForm = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    logo_url: '',
    description: '',
    is_verified: false
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      await tpoApi.createCompany(formData)

      navigate('/tpo/companies')
    } catch (err) {
      console.log(err)
      alert('Failed to create company')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Create Company
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6"
      >

        <input
          name="name"
          placeholder="Company Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          required
        />

        <input
          name="industry"
          placeholder="Industry"
          value={formData.industry}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
        />

        <input
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
        />

        <input
          name="website"
          placeholder="Website"
          value={formData.website}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
        />

        <input
          name="logo_url"
          placeholder="Logo URL"
          value={formData.logo_url}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
        />

        <textarea
          name="description"
          placeholder="Description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_verified"
            checked={formData.is_verified}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          <label className="text-sm text-slate-700">
            Verified by TPO
          </label>
        </div>

        <button
          disabled={loading}
          className="bg-brand-600 text-white px-6 py-3 rounded-xl"
        >
          {loading ? 'Creating...' : 'Create Company'}
        </button>

      </form>

    </div>
  )
}

export default CompanyForm