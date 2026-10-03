import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import * as Icons from 'lucide-react'
import { Badge } from '../components/Badge'
import { useAuthStore } from '../context/authContext'
import { auth, notifications } from '../services/apiClient'

const getNotificationIconName = (type) => {
  switch (type?.toLowerCase()) {
    case 'placement':
      return 'Briefcase'
    case 'training':
      return 'BookOpen'
    case 'interview':
      return 'Users'
    case 'achievement':
      return 'Trophy'
    case 'message':
      return 'MessageSquare'
    case 'deadline':
      return 'Clock'
    default:
      return 'Bell'
  }
}

const NotificationIcon = ({
  type,
  className = 'w-4 h-4',
}) => {
  const name = getNotificationIconName(type)
  const Icon = Icons[name] || Icons.Bell
  return <Icon className={className} />
}

export const Navbar = () => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [notificationList, setNotificationList] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] =
    useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true)

      const [listRes, countRes] = await Promise.all([
        notifications.getMyNotifications(),
        notifications.getUnreadCount(),
      ])

      const data = Array.isArray(listRes.data)
        ? listRes.data
        : listRes.data.results || []

      setNotificationList(data.slice(0, 5))
      setUnreadCount(
        countRes.data?.unread_count ?? 0
      )
    } catch (err) {
      console.error(
        'Error fetching notifications:',
        err
      )
    } finally {
      setLoadingNotifications(false)
    }
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await auth.getProfile()
        setUser(res.data)
      } catch (err) {
        console.error(
          'Error fetching profile:',
          err
        )
      }
    }

    fetchUser()
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (isNotificationsOpen) {
      fetchNotifications()
    }
  }, [isNotificationsOpen, fetchNotifications])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.is_read) {
      try {
        await notifications.markAsRead(
          notification.id
        )

        setNotificationList((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        )
        setUnreadCount((prev) =>
          Math.max(0, prev - 1)
        )
      } catch (err) {
        console.error(
          'Failed to mark notification as read:',
          err
        )
      }
    }

    setIsNotificationsOpen(false)

    if (notification.action_url) {
      const url = notification.action_url

      if (
        url.startsWith('http://') ||
        url.startsWith('https://')
      ) {
        window.open(url, '_blank', 'noreferrer')
      } else {
        navigate(url.startsWith('/') ? url : `/${url}`)
      }
      return
    }

    navigate('/notifications')
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notifications.markAllAsRead()

      setNotificationList((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
        }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error(
        'Failed to mark all as read:',
        err
      )
    }
  }

  const formatNotificationTime = (
    createdAt
  ) => {
    if (!createdAt) {
      return ''
    }

    try {
      return formatDistanceToNow(
        new Date(createdAt),
        { addSuffix: true }
      )
    } catch {
      return ''
    }
  }

  const userName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'Student'

  const userEmail =
    user?.email || 'student@example.com'

  const userBranch =
    user?.branch || 'Computer Science'

  const userAvatar =
    user?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${
      user?.username || 'user'
    }`

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-72 right-0 z-30 flex h-20 items-center justify-between border-b border-brand-700 bg-launchpad-purple px-8 text-white"
    >
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full px-4 py-2.5 pl-10 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:bg-white transition-all duration-200"
        />
        <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 ml-8">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsNotificationsOpen(
                !isNotificationsOpen
              )
              setIsProfileOpen(false)
            }}
            className="relative p-2 text-white transition-colors hover:text-launchpad-yellow"
            aria-label="Notifications"
          >
            <Icons.Bell className="w-5 h-5" />

            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold"
              >
                {unreadCount > 9
                  ? '9+'
                  : unreadCount}
              </motion.span>
            )}
          </motion.button>

          {isNotificationsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full right-0 mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-slate-900 font-semibold">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {unreadCount} unread
                    </p>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 mx-auto border-2 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 mt-3">
                      Loading...
                    </p>
                  </div>
                ) : notificationList.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {notificationList.map(
                      (notification) => (
                        <motion.button
                          key={notification.id}
                          type="button"
                          whileHover={{
                            backgroundColor:
                              'rgba(79, 70, 229, 0.04)',
                          }}
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                          className={`w-full text-left p-4 transition-colors ${
                            !notification.is_read
                              ? 'bg-brand-50/50'
                              : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                                !notification.is_read
                                  ? 'bg-brand-100 text-brand-600'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              <NotificationIcon
                                type={
                                  notification.notification_type
                                }
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    !notification.is_read
                                      ? 'text-slate-900'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {
                                    notification.title
                                  }
                                </p>

                                {!notification.is_read && (
                                  <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-brand-500" />
                                )}
                              </div>

                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {
                                  notification.message
                                }
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant="default"
                                  size="xs"
                                >
                                  {notification.notification_type ||
                                    'system'}
                                </Badge>

                                <p className="text-xs text-slate-500">
                                  {formatNotificationTime(
                                    notification.created_at
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      )
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Icons.Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">
                      No notifications yet
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false)
                    navigate('/notifications')
                  }}
                  className="w-full text-center text-sm font-semibold text-brand-600 hover:text-brand-700 py-2"
                >
                  View all notifications
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/30" />

        {/* Profile */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsProfileOpen(!isProfileOpen)
              setIsNotificationsOpen(false)
            }}
            className="flex items-center gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-brand-700"
          >
            <img
              src={userAvatar}
              alt={userName}
              className="h-9 w-9 rounded-full border border-launchpad-yellow object-cover"
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-white">
                {userName}
              </p>
              <p className="text-xs text-launchpad-yellow">
                {userBranch}
              </p>
            </div>
            <Icons.ChevronDown className="h-4 w-4 text-white" />
          </motion.button>

          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200">
                <p className="text-sm font-semibold text-slate-900">
                  {userName}
                </p>
                <p className="text-xs text-slate-600">
                  {userEmail}
                </p>
              </div>
              <div className="p-2">
                <motion.button
                  whileHover={{
                    backgroundColor:
                      'rgba(79, 70, 229, 0.05)',
                  }}
                  onClick={() =>
                    navigate('/settings')
                  }
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:text-brand-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Icons.Settings className="w-4 h-4" />
                  Settings
                </motion.button>
                <motion.button
                  whileHover={{
                    backgroundColor:
                      'rgba(239, 68, 68, 0.05)',
                  }}
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:text-red-700 rounded-lg transition-colors flex items-center gap-2 mt-2"
                >
                  <Icons.LogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
