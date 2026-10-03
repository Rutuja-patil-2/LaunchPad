import { motion } from 'framer-motion'

export const StatCard = ({ icon: Icon, label, value, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-brand-50 to-brand-100 border-brand-200 text-brand-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
    emerald: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-600',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-600'
  }

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)' }}
      transition={{ duration: 0.2 }}
      className={`relative group overflow-hidden rounded-2xl border backdrop-blur-xl bg-gradient-to-br ${colorClasses[color]} p-6 cursor-pointer`}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold text-slate-900"
            >
              {value}
            </motion.p>
          </div>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/60"
          >
            <Icon className="h-6 w-6" />
          </motion.div>
        </div>
        {trend && (
          <p className={`mt-2 text-xs font-semibold ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
    </motion.div>
  )
}
