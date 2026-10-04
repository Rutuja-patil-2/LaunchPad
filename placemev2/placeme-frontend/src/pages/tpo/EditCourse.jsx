import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { tpoapi } from '../../services/tpoapi'

const EditCourse = () => {
  const { id } = useParams()
  const navigate = useNavigate()

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
    is_active: true,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadCourse = async () => {
    try {
      const res = await tpoapi.getCourse(id)
      setFormData(res.data)
    } catch (err) {
      console.log('Failed to load course', err)
      alert('Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await tpoapi.updateCourse(id, formData)
      navigate('/tpo/courses')
    } catch (err) {
      console.log(err)
      alert('Update failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Course</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl border space-y-4"
        >
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="instructor_name"
            value={formData.instructor_name}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={!!formData.is_active}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          <button className="bg-brand-600 text-white px-6 py-3 rounded-xl">
            Update Course
          </button>
        </form>
      )}
    </div>
  )
}

export default EditCourse