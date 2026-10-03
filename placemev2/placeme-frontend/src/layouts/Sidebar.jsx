import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { SIDEBAR_ITEMS } from '../constants/dummyData'
import { useAuthStore } from '../context/authContext'
import { LaunchpadLogo } from '../components/LaunchpadLogo'

export const Sidebar = () => {
  const location = useLocation()

  const navigate = useNavigate()

  const { logout } = useAuthStore()

  const [isCollapsed, setIsCollapsed] =
    useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ============================================
  // ADD TRAINING MENU ITEM
  // ============================================

  const updatedSidebarItems = [
    ...SIDEBAR_ITEMS.slice(0, 5),

    {
      id: 'training',
      label: 'Training',
      path: '/training',
      icon: 'BookOpen'
    },

    ...SIDEBAR_ITEMS.slice(5)
  ]

  const containerVariants = {
    initial: { x: -300 },

    animate: { x: 0 },

    exit: { x: -300 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className={`${
        isCollapsed
          ? 'w-24'
          : 'w-72'
      } fixed left-0 top-0 h-screen bg-white border-r border-slate-200 backdrop-blur-xl z-40 transition-all duration-300 flex flex-col`}
    >

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-100 rounded-full blur-3xl opacity-20" />

        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-20" />
      </div>

      {/* LOGO */}
      <div
        className={`relative z-10 flex items-center gap-3 px-6 py-8 border-b border-slate-200 ${
          isCollapsed &&
          'justify-center'
        }`}
      >

        <LaunchpadLogo size={isCollapsed ? 'sm' : 'md'} className="flex-shrink-0" />

        {!isCollapsed && (
          <div>
            <p className="text-xs text-launchpad-slate font-medium">
              Student Dashboard
            </p>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-2">

        {updatedSidebarItems.map(
          (item, index) => {
            const IconComponent =
              Icons[item.icon]

            const isActive =
              location.pathname ===
              item.path

            return (
              <motion.button
                key={item.id}
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
                    index * 0.05
                }}
                whileHover={{
                  x: 4
                }}
                onClick={() =>
                  navigate(
                    item.path
                  )
                }
                className={`w-full relative group overflow-hidden rounded-xl px-4 py-3 transition-all duration-200 flex items-center gap-3 ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >

                {/* ACTIVE BG */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-100 -z-10"
                    transition={{
                      type: 'spring',
                      bounce: 0.2,
                      duration: 0.6
                    }}
                  />
                )}

                {/* ICON */}
                <div
                  className={`flex items-center justify-center ${
                    isActive
                      ? 'text-brand-600'
                      : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                >

                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                </div>

                {/* LABEL */}
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </motion.button>
            )
          }
        )}
      </nav>

      {/* LOGOUT */}
      <div className="relative z-10 border-t border-slate-200 p-4">

        <motion.button
          whileHover={{
            scale: 1.02
          }}
          whileTap={{
            scale: 0.98
          }}
          onClick={handleLogout}
          className="w-full rounded-xl bg-red-50 text-red-600 border border-red-200 px-4 py-3 text-sm font-medium hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2"
        >

          <Icons.LogOut
            className={`${
              isCollapsed
                ? 'w-4 h-4'
                : 'w-5 h-5'
            }`}
          />

          {!isCollapsed &&
            'Logout'}
        </motion.button>
      </div>

      {/* COLLAPSE BUTTON */}
      <motion.button
        onClick={() =>
          setIsCollapsed(
            !isCollapsed
          )
        }
        whileHover={{
          scale: 1.1
        }}
        whileTap={{
          scale: 0.95
        }}
        className="absolute -right-4 bottom-24 w-9 h-9 rounded-full bg-gradient-to-r from-brand-500 to-purple-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow z-50"
      >

        <Icons.ChevronRight
          className={`w-4 h-4 transition-transform ${
            isCollapsed &&
            'rotate-180'
          }`}
        />
      </motion.button>
    </motion.div>
  )
}