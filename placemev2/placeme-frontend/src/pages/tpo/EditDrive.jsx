import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { tpoapi } from '../../services/tpoapi'

const EditDrive = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [driveDetails, setDriveDetails] = useState(null)

  const [formData, setFormData] = useState({
    drive_type: 'placement',
    required_skills: '',
    job_description: '',
    deadline: '',
    location: '',
    is_verified: false
  })

  useEffect(() => {
    loadDrive()
  }, [])

  const loadDrive = async () => {
    try {
      const res = await tpoapi.getDrive(id)

      setDriveDetails(res.data)
      setFormData({
        drive_type: res.data.drive_type || 'placement',
        required_skills: res.data.required_skills || '',
        job_description: res.data.job_description || '',
        deadline: res.data.deadline
          ?.slice(0, 16) || '',
        location: res.data.location || '',
        is_verified: Boolean(res.data.is_verified)
      })
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
      await tpoapi.updateDrive(id, {
        drive_type: formData.drive_type,
        required_skills: formData.required_skills,
        job_description: formData.job_description,
        deadline: formData.deadline,
        location: formData.location,
        is_verified: formData.is_verified
      })

      navigate('/tpo/drives')
    } catch (err) {
      console.log(err)
      alert('Failed to update drive')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Edit Drive
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl border space-y-4"
      >

        {driveDetails && (
          <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              <span className="font-medium">Company:</span>{' '}
              {driveDetails.company?.name || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Position:</span>{' '}
              {driveDetails.position || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Package:</span>{' '}
              {driveDetails.package || 'N/A'}
            </p>
          </div>
        )}

        <select
          name="drive_type"
          value={formData.drive_type}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
        >
          <option value="placement">Placement</option>
          <option value="internship">Internship</option>
        </select>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Required Skills
          </label>
          <textarea
            name="required_skills"
            value={formData.required_skills}
            onChange={handleChange}
            className="mt-1 w-full border rounded-xl p-3"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Job Description
          </label>
          <textarea
            name="job_description"
            value={formData.job_description}
            onChange={handleChange}
            className="mt-1 w-full border rounded-xl p-3"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="mt-1 w-full border rounded-xl p-3"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 w-full border rounded-xl p-3"
          />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            name="is_verified"
            checked={formData.is_verified}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          <div>
            <label className="text-sm font-medium text-slate-800">
              Verified by TPO
            </label>
            <p className="text-xs text-slate-500">
              Verified drives are visible to students.
            </p>
          </div>
        </div>

        <button
          className="bg-brand-600 text-white px-6 py-3 rounded-xl"
        >
          Update Drive
        </button>

      </form>

    </div>
  )
}

export default EditDrive
