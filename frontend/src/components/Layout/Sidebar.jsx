import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Lightbulb, TrendingUp, BarChart3,
  Presentation, Users, Type, LineChart, Zap, X, Map, Activity, Clock
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard',           color: 'text-brand-400' },
  { to: '/idea-generator',      icon: Lightbulb,       label: 'Idea Generator',       color: 'text-yellow-400' },
  { to: '/roadmap',             icon: Map,             label: 'Roadmap',              color: 'text-blue-400' },
  { to: '/market-trends',       icon: TrendingUp,      label: 'Market Trends',        color: 'text-rose-400' },
  { to: '/success-predictor',   icon: Activity,        label: 'Success Predictor',    color: 'text-emerald-400' },
  { to: '/swot-analysis',       icon: BarChart3,       label: 'SWOT Analysis',        color: 'text-cyan-400' },
  { to: '/investor-pitch',      icon: Presentation,    label: 'Investor Pitch',       color: 'text-purple-400' },
  { to: '/competitor-analysis', icon: Users,           label: 'Competitor Analysis',  color: 'text-orange-400' },
  { to: '/business-names',      icon: Type,            label: 'Business Names',       color: 'text-pink-400' },
  { to: '/analytics',           icon: LineChart,       label: 'Analytics',            color: 'text-slate-400' },
  { to: '/history',             icon: Clock,           label: 'History',              color: 'text-brand-300' },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        className={`
          fixed lg:relative z-30 h-full flex flex-col
          bg-dark-800/90 backdrop-blur-xl border-r border-white/5
          transition-all duration-300 ease-in-out
          ${open ? 'w-64 translate-x-0' : 'w-0 lg:w-16 -translate-x-full lg:translate-x-0'}
          overflow-hidden
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-bold text-white text-base leading-tight">StartupGPT</span>
              <span className="text-xs text-slate-500">AI Ecosystem</span>
            </motion.div>
          )}
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {open && (
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-3">
              Features
            </p>
          )}
          {NAV_ITEMS.map(({ to, icon: Icon, label, color }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''} ${!open ? 'justify-center px-2' : ''}`
              }
              title={!open ? label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
              {open && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {open && (
          <div className="px-4 py-4 border-t border-white/5">
            <div className="glass-card p-3 text-center">
              <p className="text-xs text-slate-500">Powered by</p>
              <p className="text-xs font-semibold gradient-text">Gemini AI + Scikit-learn</p>
            </div>
          </div>
        )}
      </motion.aside>
    </>
  )
}
