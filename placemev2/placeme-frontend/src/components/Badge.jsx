import { motion } from 'framer-motion'

export const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const variants = {
    default: 'bg-brand-100 text-brand-700 border border-brand-200',
    success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    purple: 'bg-purple-100 text-purple-700 border border-purple-200'
  }

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs font-medium',
    md: 'px-4 py-2 text-sm font-medium'
  }

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-block rounded-full backdrop-blur-sm ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </motion.span>
  )
}
