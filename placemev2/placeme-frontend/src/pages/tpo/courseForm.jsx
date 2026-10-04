import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { tpoapi } from '../../services/tpoapi'

const CourseForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const isEdit = Boolean(id)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    level: 'beginner',
    duration_hours: 0,
    instructor_name: '',
    instructor_bio: '',
    thumbnail_url: '',
    rating: 0,
    is_active: true
  })

  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  useEffect(() => {
  if (isEdit) {
    fetchCourse()
  }
  console.log('Course ID:', id)
  console.log('Edit Mode:', isEdit)
}, [id])

const fetchCourse = async () => {
  try {
    const res = await tpoapi.getCourse(id)

    setFormData({
      title: res.data.title || '',
      description: res.data.description || '',
      category: res.data.category || 'other',
      level: res.data.level || 'beginner',
      duration_hours: res.data.duration_hours || '',
      instructor_name: res.data.instructor_name || '',
      instructor_bio: res.data.instructor_bio || '',
      thumbnail_url: res.data.thumbnail_url || '',
      is_active: res.data.is_active
    })
  } catch (err) {
  console.log("FULL ERROR:", err)

  if (err.response) {
    console.log("STATUS:", err.response.status)
    console.log("DATA:", err.response.data)
    alert(JSON.stringify(err.response.data))
  }
}
}

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData({
      ...formData,
      [name]:
        type === 'checkbox'
          ? checked
          : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError('')

    try {
      if (isEditMode) {
        await tpoapi.updateCourse(id, formData)
      } else {
        await tpoapi.createCourse(formData)
      }

      navigate('/tpo/courses', { replace: true })
    } catch (err) {
      const data = err.response?.data
      const message = data?.detail || (data && Object.values(data)
        .flat()
        .filter(Boolean)
        .join(' '))
      setSubmitError(message || 'Could not save the course. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Create Course
        </h1>

        <p className="text-slate-500">
          Add a new training course
        </p>
      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl p-6 space-y-6"
      >

        {/* Course Title */}

        <div>
          <label className="block mb-2 font-medium">
            Course Title
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            required
          />
        </div>

        {/* Description */}

        <div>
          <label className="block mb-2 font-medium">
            Description
          </label>

          <textarea
            rows="5"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            required
          />
        </div>

        {/* Category + Level */}

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="block mb-2 font-medium">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >
              <option value="dsa">
                Data Structures & Algorithms
              </option>

              <option value="web">
                Web Development
              </option>

              <option value="ml">
                Machine Learning
              </option>

              <option value="cloud">
                Cloud Computing
              </option>

              <option value="devops">
                DevOps
              </option>

              <option value="database">
                Database
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Level
            </label>

            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >
              <option value="beginner">
                Beginner
              </option>

              <option value="intermediate">
                Intermediate
              </option>

              <option value="advanced">
                Advanced
              </option>
            </select>
          </div>

        </div>

        {/* Duration + Rating */}

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="block mb-2 font-medium">
              Duration (Hours)
            </label>

            <input
              type="number"
              min="1"
              name="duration_hours"
              value={formData.duration_hours}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Rating
            </label>

            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />
          </div>

        </div>

        {/* Instructor */}

        <div>
          <label className="block mb-2 font-medium">
            Instructor Name
          </label>

          <input
            type="text"
            name="instructor_name"
            value={formData.instructor_name}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />
        </div>

        {/* Instructor Bio */}

        <div>
          <label className="block mb-2 font-medium">
            Instructor Bio
          </label>

          <textarea
            rows="4"
            name="instructor_bio"
            value={formData.instructor_bio}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />
        </div>

        {/* Thumbnail */}

        <div>
          <label className="block mb-2 font-medium">
            Thumbnail URL
          </label>

          <input
            type="url"
            name="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Active Checkbox */}

        <div className="flex items-center gap-3">

          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />

          <label className="font-medium">
            Active Course
          </label>

        </div>

        {/* Buttons */}

        {submitError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <div className="flex gap-4">

          <button type="submit" disabled={loading} className="rounded-xl bg-brand-600 px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/tpo/courses')
            }
            className="border px-6 py-3 rounded-xl"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  )
}

export default CourseForm