import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { recruiterService } from '../../services/api'
import { toast } from 'react-toastify'

export default function EditDrive() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    drive_type: 'placement',
    position: '',
    package: '',
    eligibility: '',
    required_skills: '',
    location: '',
    job_description: '',
  })

  useEffect(() => {
    fetchDrive()
  }, [])

  const fetchDrive = async () => {

    try {

      const response =
        await recruiterService.getDriveById(id)

      const drive = response.data

      setFormData({
        drive_type: drive.drive_type || 'placement',
        position: drive.position || '',
        package: drive.package || '',
        eligibility: drive.eligibility || '',
        required_skills:
          drive.required_skills || '',
        location: drive.location || '',
        job_description:
          drive.job_description || '',
      })

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      await recruiterService.updateDrive(
        id,
        formData
      )

      toast.success(
        'Drive updated successfully'
      )

      navigate(
        '/recruiter/manage-drives'
      )

    } catch (error) {

      console.error(error)

      toast.error(
        'Failed to update drive'
      )
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">

      <div className="bg-white rounded-3xl border p-8">

        <h1 className="text-3xl font-bold mb-8">
          Edit Drive
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <select
            name="drive_type"
            value={formData.drive_type}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          >
            <option value="placement">Placement</option>
            <option value="internship">Internship</option>
          </select>

          <input
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Position"
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="package"
            value={formData.package}
            onChange={handleChange}
            placeholder="Package"
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="eligibility"
            value={formData.eligibility}
            onChange={handleChange}
            placeholder="Eligibility"
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="required_skills"
            value={formData.required_skills}
            onChange={handleChange}
            placeholder="Skills"
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border p-3 rounded-xl"
          />

          <textarea
            rows="6"
            name="job_description"
            value={formData.job_description}
            onChange={handleChange}
            placeholder="Job Description"
            className="w-full border p-3 rounded-xl"
          />

          <button
            type="submit"
            className="bg-brand-600 text-white px-6 py-3 rounded-xl"
          >
            Save Changes
          </button>

        </form>

      </div>

    </div>
  )
}