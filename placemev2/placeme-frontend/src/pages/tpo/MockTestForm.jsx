import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { tpoApi } from '../../services/tpoApi'
import * as Icons from 'lucide-react'

const MockTestForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const isEditMode = !!id

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    course: '',
    title: '',
    description: '',
    difficulty: 'medium',
    total_questions: 10,
    duration_minutes: 60,
    passing_percentage: 50,
    test_url: '',
    is_active: true
  })

  // ---------------- FETCH COURSES ----------------
  useEffect(() => {
    fetchCourses()
    if (isEditMode) fetchTest()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await tpoApi.getCourses()
      setCourses(res.data.results || res.data || [])
    } catch (err) {
      console.log(err)
    }
  }

  const fetchTest = async () => {
    try {
      const res = await tpoApi.getMockTest(id)
      setFormData(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditMode) {
        await tpoApi.updateMockTest(id, formData)
      } else {
        await tpoApi.createMockTest(formData)
      }

      navigate('/tpo/mock-tests')
    } catch (err) {
      console.log('ERROR:', err.response?.data || err)
      alert('Failed to save mock test')
    } finally {
      setLoading(false)
    }
  }

  // ---------------- UI ----------------
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Mock Test' : 'Create Mock Test'}
        </h1>
        <p className="text-slate-500">
          Fill all required details
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Course */}
        <div>
          <label className="text-sm font-medium">Course</label>
          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />
        </div>

        {/* Test URL */}
        <div>
          <label className="text-sm font-medium">Test URL</label>
          <input
            type="url"
            name="test_url"
            value={formData.test_url || ''}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            placeholder="https://example.com/test"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Students will open this link to take the assessment.
          </p>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-sm font-medium">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Numbers Row */}
        <div className="grid grid-cols-3 gap-4">

          <div>
            <label>Total Questions</label>
            <input
              type="number"
              name="total_questions"
              value={formData.total_questions}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label>Duration (min)</label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div>
            <label>Passing %</label>
            <input
              type="number"
              name="passing_percentage"
              value={formData.passing_percentage}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            />
          </div>

        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          <label>Active</label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">

          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 text-white px-5 py-3 rounded-lg flex items-center gap-2"
          >
            {loading && <Icons.Loader2 className="animate-spin" size={18} />}
            {isEditMode ? 'Update Test' : 'Create Test'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/tpo/mock-tests')}
            className="border px-5 py-3 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  )
}

export default MockTestForm
