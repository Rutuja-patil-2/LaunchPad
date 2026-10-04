import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tpoapi } from '../../services/tpoapi'

const DriveForm = () => {
  const navigate = useNavigate()

  const [companies, setCompanies] = useState([])

  const [formData, setFormData] = useState({
    company_id: '',
    drive_type: 'placement',
    position: '',
    package: '',
    eligibility: 'All',
    required_skills: '',
    job_description: '',
    deadline: '',
    location: '',
    is_active: true,
    is_verified: false
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const res = await tpoapi.getCompanies()
      setCompanies(res.data.results || res.data || [])
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
      await tpoapi.createDrive(formData)

      navigate('/tpo/drives')
    } catch (err) {
  console.log("CREATE COMPANY ERROR:")
  console.log(err.response?.data)

  alert(JSON.stringify(err.response?.data))
}
  }

  return (
    <div className="max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Create Drive
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl border space-y-4"
      >

        <select
          name="company_id"
          value={formData.company_id}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          required
        >
          <option value="">
            Select Company
          </option>

          {companies.map((company) => (
            <option
              key={company.id}
              value={company.id}
            >
              {company.name}
            </option>
          ))}
        </select>

        <input
          name="position"
          placeholder="Position"
          value={formData.position}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          required
        />

        <select
          name="drive_type"
          value={formData.drive_type}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
        >
          <option value="placement">Placement</option>
          <option value="internship">Internship</option>
        </select>

        <input
          name="package"
          placeholder="Package"
          value={formData.package}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
        />

        <select
          name="eligibility"
          value={formData.eligibility}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
        >
          <option value="All">All</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
        </select>

        <textarea
          name="required_skills"
          placeholder="Required Skills"
          value={formData.required_skills}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
        />

        <textarea
          name="job_description"
          placeholder="Job Description"
          value={formData.job_description}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
        />

        <input
          type="datetime-local"
          name="deadline"
          value={formData.deadline}
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
          type="submit"
          className="bg-brand-600 text-white px-6 py-3 rounded-xl"
        >
          Create Drive
        </button>

      </form>

    </div>
  )
}

export default DriveForm