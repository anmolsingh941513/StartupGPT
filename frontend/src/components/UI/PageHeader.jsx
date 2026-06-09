import { motion } from 'framer-motion'

export default function PageHeader({ icon: Icon, title, subtitle, color = 'text-brand-400', badge }) {
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-dark-600/80 border border-white/10 flex items-center justify-center shadow-card`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {badge && <span className="badge-purple">{badge}</span>}
          </div>
          <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  )
}
