import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { notifications } from '../services/apiClient'

export const NotificationsPage = () => {
  const [notificationsData, setNotificationsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)

      const response = await notifications.getMyNotifications()

      console.log('Notifications:', response.data)

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || []

      setNotificationsData(data)

    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notifications.markAsRead(id)

      setNotificationsData(prev =>
        prev.map(n =>
          n.id === id
            ? { ...n, is_read: true }
            : n
        )
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleDeleteNotification = async (id) => {
    try {
      await notifications.deleteNotification(id)

      setNotificationsData(prev =>
        prev.filter(n => n.id !== id)
      )
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notifications.markAllAsRead()

      setNotificationsData(prev =>
        prev.map(n => ({
          ...n,
          is_read: true
        }))
      )
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getNotificationIcon = (type) => {
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

      default:
        return 'Bell'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },

    show: {
      opacity: 1,

      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },

    show: {
      opacity: 1,
      x: 0,

      transition: {
        duration: 0.3
      }
    }
  }

  const filteredNotifications =
    activeFilter === 'all'
      ? notificationsData
      : notificationsData.filter(
        n =>
          n.notification_type?.toLowerCase() ===
          activeFilter
      )

  const unreadCount = notificationsData.filter(
    n => !n.is_read
  ).length

  const filteredUnread = filteredNotifications.filter(
    n => !n.is_read
  )

  const filteredRead = filteredNotifications.filter(
    n => n.is_read
  )

  const IconComponent = ({
    name,
    className = 'w-5 h-5'
  }) => {
    const Icon =
      Icons[name]

    if (!Icon) {
      return (
        <Icons.Bell
          className={className}
        />
      )
    }

    return (
      <Icon
        className={className}
      />
    )
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin mx-auto mb-4" />

          <p className="text-slate-600">
            Loading notifications...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Notifications
            </h1>

            <p className="text-slate-600">
              Stay updated with placement & training opportunities
            </p>
          </div>

          <div className="flex items-center gap-3">

            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-600 text-sm font-semibold"
              >
                {unreadCount} New
              </motion.div>
            )}

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3"
      >
        <Button
          variant={activeFilter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveFilter('all')}
        >
          All
        </Button>

        <Button
          variant={activeFilter === 'placement' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveFilter('placement')}
        >
          Placement
        </Button>

        <Button
          variant={activeFilter === 'training' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveFilter('training')}
        >
          Training
        </Button>

        <Button
          variant={activeFilter === 'interview' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveFilter('interview')}
        >
          Interviews
        </Button>
      </motion.div>

      {/* Unread Notifications */}
      {filteredUnread.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            📌 New Notifications
          </h3>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredUnread.map((notif) => (
              <motion.div
                key={notif.id}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                onClick={() => handleMarkAsRead(notif.id)}
                className="group rounded-xl border border-brand-500/30 backdrop-blur-xl bg-gradient-to-r from-brand-500/15 to-brand-500/5 hover:border-brand-500/50 transition-all p-4 cursor-pointer"
              >
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-500/20 flex items-center justify-center mt-1">
                    <IconComponent
                      name={getNotificationIcon(notif.notification_type)}
                      className="w-6 h-6 text-brand-600"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">

                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-bold text-slate-900">
                        {notif.title}
                      </h4>

                      <span className="text-xs text-slate-600 flex-shrink-0">
                        {notif.created_at
                          ? new Date(notif.created_at).toLocaleDateString()
                          : 'Now'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mt-1">
                      {notif.message}
                    </p>
                  </div>

                  {/* Delete */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNotification(notif.id)
                    }}
                    className="flex-shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all"
                  >
                    <Icons.X className="w-4 h-4 text-slate-600" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Read Notifications */}
      {filteredRead.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Previous
          </h3>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {filteredRead.map((notif) => (
              <motion.div
                key={notif.id}
                variants={itemVariants}
                whileHover={{ x: 3 }}
                className="group rounded-xl border border-slate-200 backdrop-blur-xl bg-slate-50 hover:border-brand-300 hover:bg-slate-100 transition-all p-4 cursor-pointer opacity-75 hover:opacity-100"
              >
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                    <IconComponent
                      name={getNotificationIcon(notif.notification_type)}
                      className="w-5 h-5 text-slate-600"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">

                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {notif.title}
                      </h4>

                      <span className="text-xs text-slate-600 flex-shrink-0">
                        {notif.created_at
                          ? new Date(notif.created_at).toLocaleDateString()
                          : 'Earlier'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                      {notif.message}
                    </p>
                  </div>

                  {/* Delete */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNotification(notif.id)
                    }}
                    className="flex-shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all"
                  >
                    <Icons.X className="w-4 h-4 text-slate-600" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredUnread.length === 0 &&
        filteredRead.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 rounded-2xl border border-slate-200 backdrop-blur-xl bg-white"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity
              }}
              className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4"
            >
              <Icons.Bell className="w-8 h-8 text-slate-600" />
            </motion.div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Notifications Found
            </h3>

            <p className="text-slate-600 text-center max-w-md">
              No notifications available for this category.
            </p>
          </motion.div>
        )}
    </div>
  )
}