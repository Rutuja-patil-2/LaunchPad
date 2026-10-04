import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { tpoapi } from '../../services/tpoapi'

const TPOCourses = () => {
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await tpoapi.getCourses()

      setCourses(
        res.data.results ||
        res.data ||
        []
      )
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?'))
      return

    try {
      await tpoapi.deleteCourse(id)

      setCourses(
        courses.filter(
          (course) => course.id !== id
        )
      )
    } catch (err) {
      console.log(err)
      alert('Failed to delete course')
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            Courses
          </h1>

          <p className="text-slate-500">
            Manage training courses
          </p>
        </div>

        <button
          onClick={() =>
            navigate('/tpo/courses/create')
          }
          className="bg-brand-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <Icons.Plus size={18} />
          Create Course
        </button>

      </div>

      {/* Table */}

      <div className="bg-white rounded-2xl border overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">
                Title
              </th>

              <th className="p-4 text-left">
                Category
              </th>

              <th className="p-4 text-left">
                Level
              </th>

              <th className="p-4 text-left">
                Instructor
              </th>

              <th className="p-4 text-left">
                Rating
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="7"
                  className="p-6 text-center"
                >
                  Loading...
                </td>
              </tr>

            ) : (

              courses.map((course) => (

                <tr
                  key={course.id}
                  className="border-t"
                >
                  <td className="p-4 font-medium">
                    {course.title}
                  </td>

                  <td className="p-4">
                    {course.category}
                  </td>

                  <td className="p-4">
                    {course.level}
                  </td>

                  <td className="p-4">
                    {course.instructor_name}
                  </td>

                  <td className="p-4">
                    ⭐ {course.rating}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        course.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {course.is_active
                        ? 'Active'
                        : 'Inactive'}
                    </span>

                  </td>

                  <td className="p-4 flex gap-3">

                    <button
                      title="View course details"
                      onClick={() =>
                        navigate(
                          `/tpo/courses/${course.id}`
                        )
                      }
                    >
                      <Icons.Eye
                        size={18}
                        className="text-slate-600"
                      />
                    </button>

                    <button
                      title="Edit course"
                      onClick={() =>
                        navigate(
                          `/tpo/courses/edit/${course.id}`
                        )
                      }
                    >
                      <Icons.Pencil
                        size={18}
                        className="text-brand-600"
                      />
                    </button>

                    <button
                      title="Delete course"
                      onClick={() =>
                        deleteCourse(course.id)
                      }
                    >
                      <Icons.Trash2
                        size={18}
                        className="text-red-500"
                      />
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default TPOCourses
