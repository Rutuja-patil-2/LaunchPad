import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { tpoapi } from '../../services/tpoapi'

const CourseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    fetchDetails()
  }, [id])

  const fetchDetails = async () => {
    try {
      const res = await tpoapi.getCourseDetails(id)
      setData(res.data)
    } catch (err) {
      console.log(err)
      alert('Failed to load course details')
    } finally {
      setLoading(false)
    }
  }

  const updateStudentProgress = async (student, value) => {
    const progress = Number(value)

    if (!student.enrollment_id || Number.isNaN(progress)) {
      return
    }

    const normalizedProgress = Math.max(
      0,
      Math.min(100, progress)
    )

    setSavingId(student.enrollment_id)

    try {
      await tpoapi.updateEnrollmentProgress(
        student.enrollment_id,
        normalizedProgress
      )

      setData((prev) => ({
        ...prev,
        students: prev.students.map((item) =>
          item.enrollment_id === student.enrollment_id
            ? {
                ...item,
                progress_percentage: normalizedProgress,
                status:
                  normalizedProgress === 100
                    ? 'completed'
                    : 'in_progress'
              }
            : item
        )
      }))
    } catch (err) {
      console.log(err)
      alert('Failed to update progress')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const course = data?.course
  const students = data?.students || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {course?.title || 'Course Details'}
          </h1>
          <p className="text-slate-500">
            Full course information and enrollments
          </p>
        </div>

        <button
          onClick={() => navigate('/tpo/courses')}
          className="border px-4 py-2 rounded-xl"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-2xl border p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Info label="Description" value={course?.description} wide />
        <Info label="Category" value={course?.category} />
        <Info label="Level" value={course?.level} />
        <Info label="Duration" value={`${course?.duration_hours || 0} hours`} />
        <Info label="Instructor" value={course?.instructor_name} />
        <Info label="Instructor Bio" value={course?.instructor_bio} wide />
        <Info label="Rating" value={course?.rating} />
        <Info label="Students Enrolled" value={data?.enrolled_count || 0} />
        <Info label="Status" value={course?.is_active ? 'Active' : 'Inactive'} />
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 flex items-center gap-2 border-b">
          <Icons.Users size={18} />
          <h2 className="font-semibold">
            Enrolled Students
          </h2>
        </div>

        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Progress</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td className="p-6 text-center" colSpan="4">
                  No students enrolled
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="p-4 font-medium">
                    {student.first_name || student.last_name
                      ? `${student.first_name} ${student.last_name}`.trim()
                      : student.username}
                  </td>
                  <td className="p-4">{student.email || '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={student.progress_percentage}
                        disabled={savingId === student.enrollment_id}
                        onBlur={(e) =>
                          updateStudentProgress(
                            student,
                            e.target.value
                          )
                        }
                        className="w-20 border rounded-lg p-2"
                      />
                      <span className="text-slate-500">%</span>
                      {savingId === student.enrollment_id && (
                        <span className="text-xs text-slate-500">
                          Saving...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">{student.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Info = ({ label, value, wide = false }) => (
  <div className={wide ? 'md:col-span-2' : ''}>
    <p className="text-sm text-slate-500">{label}</p>
    <p className="font-medium text-slate-900 whitespace-pre-wrap">
      {value || '-'}
    </p>
  </div>
)

export default CourseDetails
