import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { motion } from 'framer-motion'

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Animated background gradient - subtle light accent */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" />
        <div className="absolute -bottom-8 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" />
      </div>

      <Sidebar />
      <Navbar />

      {/* Main Content Area */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="ml-72 mt-20 p-8"
      >
        <div className="max-w-7xl">
          <Outlet />
        </div>
      </motion.main>
    </div>
  )
}
