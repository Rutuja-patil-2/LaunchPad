import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { RECRUITER_SIDEBAR_ITEMS } from '../../constants/recruiterData'
import { LaunchpadLogo } from '../LaunchpadLogo'

export const RecruiterSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

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
        isCollapsed ? 'w-24' : 'w-72'
      } fixed left-0 top-0 h-screen bg-white border-r border-slate-200 backdrop-blur-xl z-40 transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-6 py-8 border-b border-slate-200 ${
          isCollapsed && 'justify-center'
        }`}
      >
        <LaunchpadLogo size={isCollapsed ? 'sm' : 'md'} className="flex-shrink-0" />

        {!isCollapsed && (
          <div>
            <p className="text-xs text-launchpad-slate font-medium">
              Company Portal
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {RECRUITER_SIDEBAR_ITEMS.map((item, index) => {
          const IconComponent = Icons[item.icon]
          const isActive = location.pathname === item.path

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(item.path)}
              className={`w-full relative group overflow-hidden rounded-lg px-4 py-3 transition-all duration-200 flex items-center gap-3 ${
                isActive
                  ? 'bg-brand-50 text-brand-600 border border-brand-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeRecruiterTab"
                  className="absolute inset-0 bg-brand-100 -z-10"
                />
              )}

              <IconComponent className="w-5 h-5 flex-shrink-0" />

              {!isCollapsed && (
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 p-4">
        <button className="w-full rounded-lg bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 text-sm font-medium hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2">
          <Icons.LogOut className="w-5 h-5" />
          {!isCollapsed && 'Logout'}
        </button>
      </div>

      {/* Collapse Button */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        whileHover={{ scale: 1.1 }}
        className="absolute -right-4 bottom-24 w-8 h-8 rounded-full bg-gradient-to-r from-brand-500 to-purple-600 flex items-center justify-center text-white shadow-lg"
      >
        <Icons.ChevronRight
          className={`w-4 h-4 transition-transform ${
            isCollapsed && 'rotate-180'
          }`}
        />
      </motion.button>
    </motion.div>
  )
}