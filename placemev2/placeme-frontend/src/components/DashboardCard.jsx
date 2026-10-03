import { motion } from 'framer-motion'

export const DashboardCard = ({ title, icon: Icon, children, className = '' }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 backdrop-blur-xl bg-white p-6 ${className}`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 via-transparent to-brand-100/30" />
      
      <div className="relative z-10">
        {title && (
          <div className="flex items-center gap-3 mb-4">
            {Icon && <Icon className="h-5 w-5 text-brand-600" />}
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
        )}
        {children}
      </div>
    </motion.div>
  )
}
