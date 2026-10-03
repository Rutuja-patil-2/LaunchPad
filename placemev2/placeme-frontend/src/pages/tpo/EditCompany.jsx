import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { tpoApi } from '../../services/tpoApi'

const EditCompany = () => {

  const { id } = useParams()
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

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {

    try {

      const res =
        await tpoApi.getCompany(id)

      setFormData(res.data)

    } catch (err) {
      console.log(err)
    }
  }

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

      await tpoApi.updateCompany(
        id,
        {
          description: formData.description,
          is_verified: formData.is_verified
        }
      )

      navigate('/tpo/companies')

    } catch (err) {

      console.log(err)
      alert('Update failed')

    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Edit Company
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl border space-y-4"
      >

        <ReadOnlyField label="Company Name" value={formData.name} />

        <ReadOnlyField label="Industry" value={formData.industry} />

        <ReadOnlyField label="Location" value={formData.location} />

        <ReadOnlyField label="Website" value={formData.website} />

        <ReadOnlyField label="Logo URL" value={formData.logo_url} />

        <div>
          <label className="text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 w-full border p-3 rounded-xl"
          />
        </div>

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
          className="bg-brand-600 text-white px-6 py-3 rounded-xl"
        >
          Update Company
        </button>

      </form>

    </div>
  )
}

export default EditCompany

const ReadOnlyField = ({ label, value }) => (
  <div>
    <label className="text-sm font-medium text-slate-700">
      {label}
    </label>
    <input
      value={value || 'Not provided'}
      readOnly
      className="mt-1 w-full border p-3 rounded-xl bg-slate-100 text-slate-700"
    />
  </div>
)
