import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import * as Icons from 'lucide-react'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { training } from '../services/apiClient'

export const Training = () => {
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [searchTerm, setSearchTerm] =
    useState('')

  const [categoryFilter, setCategoryFilter] =
    useState('all')

  const [enrollingId, setEnrollingId] =
    useState(null)

  // ============================================
  // FETCH DATA
  // ============================================

  useEffect(() => {
    fetchTrainingData()
  }, [])

  const fetchTrainingData = async () => {
    try {
      setLoading(true)

      const [
        coursesResponse,
        enrollmentsResponse
      ] = await Promise.all([
        training.getCourses(),
        training.getMyEnrollments()
      ])

      const coursesData =
        Array.isArray(
          coursesResponse.data
        )
          ? coursesResponse.data
          : coursesResponse.data
              .results || []

      const enrollmentsData =
        Array.isArray(
          enrollmentsResponse.data
        )
          ? enrollmentsResponse.data
          : enrollmentsResponse.data
              .results || []

      setCourses(coursesData)

      setEnrollments(
        enrollmentsData
      )

    } catch (error) {
      console.error(
        'Failed to fetch training data:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // ENROLL
  // ============================================

  const handleEnroll = async (
    courseId
  ) => {
    try {
      setEnrollingId(courseId)

      const response =
        await training.enrollCourse(
            courseId
        )

      setEnrollments((prev) => [
        response.data,
        ...prev
      ])

    } catch (error) {
      console.error(
        'Enrollment failed:',
        error.response?.data || error
        )
    } finally {
      setEnrollingId(null)
    }
  }

  // ============================================
  // CHECK ENROLLED
  // ============================================

  const isEnrolled = (courseId) => {
  return enrollments.some(
    (enrollment) =>
      enrollment.course?.id ===
        courseId ||
      enrollment.course_id ===
        courseId ||
      enrollment.course === courseId
  )
}

  // ============================================
  // FILTER COURSES
  // ============================================

  const filteredCourses =
    useMemo(() => {
      return courses.filter(
        (course) => {
          const matchesSearch =
            course.title
              ?.toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              ) ||
            course.description
              ?.toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              )

          const matchesCategory =
            categoryFilter ===
            'all'
              ? true
              : course.category ===
                categoryFilter

          return (
            matchesSearch &&
            matchesCategory
          )
        }
      )
    }, [
      courses,
      searchTerm,
      categoryFilter
    ])

  // ============================================
  // LEVEL COLORS
  // ============================================

  const getLevelVariant = (
    level
  ) => {
    switch (level) {
      case 'beginner':
        return 'success'

      case 'intermediate':
        return 'warning'

      case 'advanced':
        return 'danger'

      default:
        return 'secondary'
    }
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">

        <div className="text-center">

          <div className="w-14 h-14 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600 text-lg">
            Loading training
            courses...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <motion.div
        initial={{
          opacity: 0,
          y: -20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
      >

        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Training Courses
        </h1>

        <p className="text-slate-600">
          Upgrade your skills and
          prepare for placements
        </p>
      </motion.div>

      {/* SEARCH + FILTER */}
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        className="flex flex-col lg:flex-row gap-4"
      >

        {/* SEARCH */}
        <div className="relative flex-1">

          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-300 bg-white"
          />

          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        </div>

        {/* CATEGORY */}
        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(
              e.target.value
            )
          }
          className="px-4 py-3 rounded-xl border border-slate-300 bg-white"
        >
          <option value="all">
            All Categories
          </option>

          <option value="dsa">
            DSA
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
        </select>
      </motion.div>

      {/* STATS */}
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >

        <div className="p-6 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white">

          <div className="flex items-center justify-between mb-4">

            <Icons.BookOpen className="w-8 h-8 text-brand-600" />

            <Badge variant="primary">
              Courses
            </Badge>
          </div>

          <h3 className="text-3xl font-bold text-slate-900">
            {courses.length}
          </h3>

          <p className="text-slate-600 text-sm mt-1">
            Total Courses
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">

          <div className="flex items-center justify-between mb-4">

            <Icons.CheckCircle2 className="w-8 h-8 text-emerald-600" />

            <Badge variant="success">
              Enrolled
            </Badge>
          </div>

          <h3 className="text-3xl font-bold text-slate-900">
            {enrollments.length}
          </h3>

          <p className="text-slate-600 text-sm mt-1">
            My Courses
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white">

          <div className="flex items-center justify-between mb-4">

            <Icons.TrendingUp className="w-8 h-8 text-purple-600" />

            <Badge variant="secondary">
              Skills
            </Badge>
          </div>

          <h3 className="text-3xl font-bold text-slate-900">
            Growth
          </h3>

          <p className="text-slate-600 text-sm mt-1">
            Skill Development
          </p>
        </div>
      </motion.div>

      {/* COURSES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {filteredCourses.map(
          (course, index) => {
            const enrolled =
              isEnrolled(
                course.id
              )

            return (
              <motion.div
                key={course.id}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay:
                    index * 0.05
                }}
                whileHover={{
                  y: -5
                }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
              >

                {/* THUMBNAIL */}
                <div className="h-44 rounded-2xl bg-gradient-to-br from-brand-500 via-purple-500 to-pink-500 flex items-center justify-center mb-6">

                  <Icons.BookOpen className="w-16 h-16 text-white" />
                </div>

                {/* TOP */}
                <div className="flex items-start justify-between gap-4 mb-4">

                  <div>

                    <h2 className="text-2xl font-bold text-slate-900">
                      {
                        course.title
                      }
                    </h2>

                    <p className="text-slate-600 mt-2 line-clamp-2">
                      {
                        course.description
                      }
                    </p>
                  </div>

                  <Badge
                    variant={getLevelVariant(
                      course.level
                    )}
                  >
                    {
                      course.level
                    }
                  </Badge>
                </div>

                {/* BADGES */}
                <div className="flex flex-wrap gap-2 mb-5">

                  <Badge variant="default">
                    {
                      course.category
                    }
                  </Badge>

                  <Badge variant="secondary">
                    {
                      course.duration_hours
                    }{' '}
                    hrs
                  </Badge>

                  <Badge variant="success">
                    ⭐{' '}
                    {
                      course.rating
                    }
                  </Badge>
                </div>

                {/* INSTRUCTOR */}
                <div className="mb-6">

                  <p className="text-sm text-slate-500 mb-1">
                    Instructor
                  </p>

                  <p className="font-semibold text-slate-900">
                    {
                      course.instructor_name
                    }
                  </p>
                </div>

                {/* STUDENTS */}
                <div className="flex items-center gap-2 text-slate-600 mb-6">

                  <Icons.Users className="w-4 h-4" />

                  <span>
                    {
                      course.total_students
                    }{' '}
                    students enrolled
                  </span>
                </div>

                {/* ACTION */}
                <div className="flex gap-3">

                  {enrolled ? (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      disabled
                    >
                      Enrolled
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() =>
                        handleEnroll(
                          course.id
                        )
                      }
                      disabled={
                        enrollingId ===
                        course.id
                      }
                    >
                      {enrollingId ===
                      course.id
                        ? 'Enrolling...'
                        : 'Enroll Now'}
                    </Button>
                  )}

                  <Button variant="secondary">

                    <Icons.Eye className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )
          }
        )}
      </div>

      {/* EMPTY STATE */}
      {filteredCourses.length ===
        0 && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="py-24 text-center rounded-3xl border border-slate-200 bg-white"
        >

          <Icons.BookX className="w-16 h-16 text-slate-400 mx-auto mb-4" />

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No Courses Found
          </h2>

          <p className="text-slate-600">
            No training courses match
            your search/filter.
          </p>
        </motion.div>
      )}
    </div>
  )
}