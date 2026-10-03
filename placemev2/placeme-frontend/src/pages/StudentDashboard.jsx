import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'

import { StatCard } from '../components/StatCard'
import { DashboardCard } from '../components/DashboardCard'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import StudyChatbot from '../components/StudyChatbot'

import {
  auth,
  placement,
  training,
  notifications
} from '../services/apiClient'

export const StudentDashboard = () => {
  const [user, setUser] =
    useState(null)

  const [drives, setDrives] =
    useState([])

  const [
    notificationsList,
    setNotificationsList
  ] = useState([])

  const [
    enrollments,
    setEnrollments
  ] = useState([])

  const [attempts, setAttempts] =
    useState([])

  const [stats, setStats] =
    useState({
      appliedDrives: 0,
      upcomingDrives: 0,
      resumeScore: 78,
      testsCompleted: 0
    })

  const [loading, setLoading] =
    useState(true)

  // ============================================
  // FETCH DASHBOARD DATA
  // ============================================

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // ========================================
      // USER PROFILE
      // ========================================

      try {
        const userRes =
          await auth.getProfile()

        setUser(userRes.data)

      } catch (err) {
        console.error(
          'Error fetching user profile:',
          err
        )
      }

      // ========================================
      // APPLICATIONS
      // ========================================

      try {
        const appsRes =
          await placement.getMyApplications(
            {
              page_size: 1
            }
          )

        const appliedCount =
          appsRes.data?.count || 0

        setStats((prev) => ({
          ...prev,
          appliedDrives:
            appliedCount
        }))

      } catch (err) {
        console.error(
          'Error fetching applications:',
          err
        )
      }

      // ========================================
      // DRIVES
      // ========================================

      try {
        const drivesRes =
          await placement.getDrives({
            is_active: true
          })

        const drivesData =
          Array.isArray(
            drivesRes.data
          )
            ? drivesRes.data
            : drivesRes.data
              ?.results || []

        setDrives(drivesData)

        setStats((prev) => ({
          ...prev,
          upcomingDrives:
            drivesData.length
        }))

      } catch (err) {
        console.error(
          'Error fetching drives:',
          err
        )
      }

      // ========================================
      // ENROLLMENTS
      // ========================================

      try {
        const enrollmentsRes =
          await training.getMyEnrollments()

        const enrollmentsData =
          Array.isArray(
            enrollmentsRes.data
          )
            ? enrollmentsRes.data
            : enrollmentsRes.data
              ?.results || []

        setEnrollments(
          enrollmentsData
        )

      } catch (err) {
        console.error(
          'Error fetching enrollments:',
          err
        )
      }

      // ========================================
      // TEST ATTEMPTS
      // ========================================

      try {
        const attemptsRes =
          await training.getMyAttempts()

        const attemptsData =
          Array.isArray(
            attemptsRes.data
          )
            ? attemptsRes.data
            : attemptsRes.data
              ?.results || []

        setAttempts(
          attemptsData
        )

        setStats((prev) => ({
          ...prev,
          testsCompleted:
            attemptsData.length
        }))

      } catch (err) {
        console.error(
          'Error fetching attempts:',
          err
        )
      }

      // ========================================
      // NOTIFICATIONS
      // ========================================

      try {
        const notificationsRes =
          await notifications.getMyNotifications()

        const notificationsData =
          Array.isArray(
            notificationsRes.data
          )
            ? notificationsRes.data
            : notificationsRes.data
              ?.results || []

        setNotificationsList(
          notificationsData
        )

      } catch (err) {
        console.error(
          'Error fetching notifications:',
          err
        )
      }

    } catch (err) {
      console.error(
        'Error fetching dashboard data:',
        err
      )

    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // ANIMATION VARIANTS
  // ============================================

  const containerVariants = {
    hidden: {
      opacity: 0
    },

    show: {
      opacity: 1,

      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },

    show: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.3
      }
    }
  }

  // ============================================
  // USER NAME
  // ============================================

  const userName =
    user?.first_name ||
    user?.username ||
    'Student'

  const placementDrives = drives.filter(
    (drive) => (drive.drive_type || 'placement') === 'placement'
  )

  const internshipDrives = drives.filter(
    (drive) => drive.drive_type === 'internship'
  )

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">

        <div className="text-center">

          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin mx-auto mb-4" />

          <p className="text-slate-600">
            Loading your dashboard...
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
        className="mb-8"
      >

        <h1 className="text-4xl font-bold text-slate-900 mb-2">

          Welcome back,
          {' '}
          {userName}
          {' '}
          👋
        </h1>

        <p className="text-slate-600">
          Here's your recruitment
          dashboard snapshot
        </p>
      </motion.div>

      {/* STATS GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >

        <motion.div variants={itemVariants}>
          <StatCard
            icon={Icons.Briefcase}
            label="Applied Drives"
            value={
              stats.appliedDrives
            }
            trend={15}
            color="blue"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            icon={Icons.TrendingUp}
            label="Upcoming Drives"
            value={
              stats.upcomingDrives
            }
            trend={20}
            color="purple"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            icon={Icons.BookOpen}
            label="Enrolled Courses"
            value={
              enrollments.length
            }
            trend={12}
            color="emerald"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            icon={Icons.Award}
            label="Tests Completed"
            value={
              attempts.length
            }
            trend={25}
            color="orange"
          />
        </motion.div>
      </motion.div>

      {/* MAIN GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >

        {/* DRIVES */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2"
        >

          <DashboardCard
            title="Upcoming Placement Drives"
            icon={Icons.Calendar}
          >

            <div className="space-y-3">

              {placementDrives.length > 0 ? (
                placementDrives
                  .slice(0, 5)
                  .map(
                    (
                      drive,
                      idx
                    ) => (
                      <motion.div
                        key={
                          drive.id
                        }
                        initial={{
                          opacity: 0,
                          x: -20
                        }}
                        animate={{
                          opacity: 1,
                          x: 0
                        }}
                        transition={{
                          delay:
                            idx *
                            0.1
                        }}
                        whileHover={{
                          translateX: 5
                        }}
                        className="group p-4 rounded-xl border border-slate-200 hover:border-brand-300 bg-white hover:bg-slate-50 transition-all"
                      >

                        <div className="flex items-start justify-between">

                          <div className="flex items-start gap-4 flex-1">

                            <div className="w-12 h-12 rounded-lg border border-slate-200 bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">

                              {drive
                                ?.company
                                ?.name?.charAt(
                                  0
                                ) ||
                                '?'}
                            </div>

                            <div className="flex-1">

                              <h3 className="font-semibold text-slate-900">

                                {
                                  drive
                                    ?.company
                                    ?.name
                                }
                              </h3>

                              <p className="text-sm text-slate-600 mt-1">

                                {
                                  drive.position
                                }
                              </p>

                              <div className="flex items-center gap-2 mt-2">

                                <Badge
                                  variant="success"
                                  size="xs"
                                >
                                  ₹
                                  {
                                    drive.ctc
                                  }
                                  {' '}
                                  LPA
                                </Badge>

                                <Badge
                                  variant="default"
                                  size="xs"
                                >
                                  {
                                    drive.location
                                  }
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              window.location.href =
                              '/drives'
                            }
                          >
                            Apply Now
                          </Button>
                        </div>
                      </motion.div>
                    )
                  )
              ) : (
                <div className="text-center py-8 text-slate-500">

                  <p>
                    No upcoming
                    drives at the
                    moment
                  </p>
                </div>
              )}
            </div>
          </DashboardCard>
        </motion.div>

        {/* COURSE PREVIEW */}
        <motion.div variants={itemVariants}>

          <DashboardCard
            title="My Courses"
            icon={Icons.BookOpen}
          >

            <div className="space-y-3">

              {enrollments.length >
                0 ? (
                enrollments
                  .slice(0, 4)
                  .map(
                    (
                      enrollment,
                      idx
                    ) => (
                      <motion.div
                        key={
                          enrollment.id
                        }
                        initial={{
                          opacity: 0
                        }}
                        animate={{
                          opacity: 1
                        }}
                        transition={{
                          delay:
                            idx *
                            0.1
                        }}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <h3 className="font-semibold text-slate-900 text-sm">

                              {
                                enrollment
                                  ?.course
                                  ?.title
                              }
                            </h3>

                            <p className="text-xs text-slate-600 mt-1">

                              {
                                enrollment
                                  ?.course
                                  ?.category
                              }
                            </p>
                          </div>

                          <Badge variant="success">
                            {
                              enrollment.status
                            }
                          </Badge>
                        </div>

                        <div className="mt-3">

                          <div className="flex justify-between text-xs mb-1">

                            <span className="text-slate-500">
                              Progress
                            </span>

                            <span className="text-brand-600 font-medium">
                              {
                                enrollment.progress_percentage
                              }
                              %
                            </span>
                          </div>

                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">

                            <motion.div
                              initial={{
                                width: 0
                              }}
                              animate={{
                                width: `${enrollment.progress_percentage}%`
                              }}
                              transition={{
                                duration: 0.8
                              }}
                              className="h-full bg-gradient-to-r from-brand-500 to-purple-500"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )
                  )
              ) : (
                <div className="text-center py-8 text-slate-500">

                  <Icons.BookX className="w-12 h-12 mx-auto mb-3 text-slate-400" />

                  <p>
                    No enrolled
                    courses yet
                  </p>
                </div>
              )}
            </div>
          </DashboardCard>
        </motion.div>
      </motion.div>

      <DashboardCard
        title="Internship Opportunities"
        icon={Icons.GraduationCap}
      >
        <div className="space-y-3">
          {internshipDrives.length > 0 ? (
            internshipDrives.slice(0, 4).map((drive) => (
              <div
                key={drive.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {drive.position}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {drive.company?.name} · {drive.location || 'Location not specified'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = '/drives?type=internship'}
                >
                  Explore Internships
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 py-3">
              <p className="text-sm text-slate-500">
                No active internships are available right now.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = '/drives?type=internship'}
              >
                Browse Internships
              </Button>
            </div>
          )}
        </div>
      </DashboardCard>

      {/* SECOND GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >

        {/* NOTIFICATIONS */}
        <motion.div variants={itemVariants}>

          <DashboardCard
            title="Recent Notifications"
            icon={Icons.Bell}
          >

            <div className="space-y-3">

              {notificationsList
                .slice(0, 5)
                .map(
                  (
                    notification,
                    idx
                  ) => (
                    <motion.div
                      key={
                        notification.id
                      }
                      initial={{
                        opacity: 0,
                        x: -20
                      }}
                      animate={{
                        opacity: 1,
                        x: 0
                      }}
                      transition={{
                        delay:
                          idx *
                          0.05
                      }}
                      className={`p-3 rounded-lg border transition-all ${notification.is_read
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-brand-50 border-brand-200'
                        }`}
                    >

                      <div className="flex items-start justify-between">

                        <div className="flex-1">

                          <p
                            className={`text-sm font-medium ${notification.is_read
                                ? 'text-slate-600'
                                : 'text-slate-900'
                              }`}
                          >

                            {
                              notification.title
                            }
                          </p>

                          <p className="text-xs text-slate-600 mt-1">

                            {
                              notification.message
                            }
                          </p>
                        </div>

                        {!notification.is_read && (
                          <motion.div
                            initial={{
                              scale: 0
                            }}
                            animate={{
                              scale: 1
                            }}
                            className="w-2 h-2 bg-brand-500 rounded-full mt-1 flex-shrink-0"
                          />
                        )}
                      </div>
                    </motion.div>
                  )
                )}
            </div>
          </DashboardCard>
        </motion.div>

        {/* TEST ATTEMPTS */}
        <motion.div variants={itemVariants}>

          <DashboardCard
            title="Recent Mock Tests"
            icon={Icons.Zap}
          >

            <div className="space-y-3">

              {attempts.length >
                0 ? (
                attempts
                  .slice(0, 5)
                  .map(
                    (
                      attempt,
                      idx
                    ) => (
                      <motion.div
                        key={
                          attempt.id
                        }
                        initial={{
                          opacity: 0,
                          x: -20
                        }}
                        animate={{
                          opacity: 1,
                          x: 0
                        }}
                        transition={{
                          delay:
                            idx *
                            0.05
                        }}
                        className="p-4 rounded-xl border border-slate-200 bg-white"
                      >

                        <div className="flex items-center justify-between mb-3">

                          <div>

                            <h3 className="font-semibold text-slate-900">

                              {
                                attempt.test_title
                              }
                            </h3>

                            <p className="text-xs text-slate-500 mt-1">

                              Attempted
                              recently
                            </p>
                          </div>

                          <Badge
                            variant={
                              attempt.is_passed
                                ? 'success'
                                : 'danger'
                            }
                          >

                            {attempt.is_passed
                              ? 'Passed'
                              : 'Failed'}
                          </Badge>
                        </div>

                        <div className="flex justify-between text-sm">

                          <span className="text-slate-600">
                            Score
                          </span>

                          <span className="font-semibold text-brand-600">

                            {
                              attempt.score
                            }
                            /
                            {
                              attempt.max_score
                            }
                          </span>
                        </div>
                      </motion.div>
                    )
                  )
              ) : (
                <div className="text-center py-8 text-slate-500">

                  <Icons.FileX className="w-12 h-12 mx-auto mb-3 text-slate-400" />

                  <p>
                    No mock tests
                    attempted yet
                  </p>
                </div>
              )}
            </div>
          </DashboardCard>
        </motion.div>
      </motion.div>

      <StudyChatbot user={user} />
    </div>
  )
}