import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Shield, AlertTriangle, TrendingUp, Zap, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/UI/PageHeader'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { aiAPI } from '../api/client'
import { usePageState } from '../context/AppStateContext'

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'Food & Beverage', 'Real Estate', 'Entertainment', 'Sustainability', 'Other'
]

const SWOT_CONFIG = [
  { key: 'strengths',     label: 'Strengths',     icon: Shield,       color: 'text-emerald-400', bg: 'from-emerald-500/10 to-green-500/5',   border: 'border-emerald-500/20' },
  { key: 'weaknesses',    label: 'Weaknesses',    icon: AlertTriangle,color: 'text-red-400',     bg: 'from-red-500/10 to-rose-500/5',        border: 'border-red-500/20' },
  { key: 'opportunities', label: 'Opportunities', icon: TrendingUp,   color: 'text-blue-400',    bg: 'from-blue-500/10 to-cyan-500/5',       border: 'border-blue-500/20' },
  { key: 'threats',       label: 'Threats',       icon: Zap,          color: 'text-amber-400',   bg: 'from-amber-500/10 to-yellow-500/5',    border: 'border-amber-500/20' },
]

export default function SwotAnalysis() {
  const { pageState, setPageState } = usePageState('swotAnalysis')
  const { form, result } = pageState
  const [loading, setLoading] = useState(false)

  const setForm   = (f) => setPageState({ form: f })
  const setResult = (r) => setPageState({ result: r })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.startup_title || !form.description || !form.industry) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await aiAPI.swotAnalysis(form)
      setResult(res.data)
      toast.success('SWOT analysis complete!')
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="SWOT Analysis"
        subtitle="Strategic analysis of your startup's position"
        color="text-blue-400"
        badge="Gemini AI"
      />

      {/* Form */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Startup Name</label>
            <input
              className="input-field"
              placeholder="e.g., EcoTrack AI"
              value={form.startup_title}
              onChange={e => setForm({ ...form, startup_title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
            <select
              className="select-field"
              value={form.industry}
              onChange={e => setForm({ ...form, industry: e.target.value })}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? <span className="spinner" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Generate SWOT'}
            </button>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              className="input-field resize-none h-20"
              placeholder="Describe your startup idea in 2-3 sentences..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </form>
      </motion.div>

      {loading && (
        <div className="glass-card p-6">
          <LoadingSpinner message="Generating SWOT analysis..." />
        </div>
      )}

      <AnimatePresence>
        {result && !loading && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* SWOT Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SWOT_CONFIG.map(({ key, label, icon: Icon, color, bg, border }, i) => (
                <motion.div
                  key={key}
                  className={`glass-card p-5 border ${border} bg-gradient-to-br ${bg}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <h3 className={`font-bold ${color}`}>{label}</h3>
                    <span className="ml-auto text-xs text-slate-500">{result[key]?.length} points</span>
                  </div>
                  <ul className="space-y-2">
                    {result[key]?.map((item, j) => (
                      <motion.li
                        key={j}
                        className="flex items-start gap-2 text-sm text-slate-300"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + j * 0.05 }}
                      >
                        <span className={`${color} mt-0.5 flex-shrink-0`}>•</span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Assessment & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.overall_assessment && (
                <div className="glass-card p-5 border border-brand-500/20">
                  <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-2">Overall Assessment</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.overall_assessment}</p>
                </div>
              )}
              {result.strategic_recommendations?.length > 0 && (
                <div className="glass-card p-5 border border-purple-500/20">
                  <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-2">Strategic Recommendations</p>
                  <ul className="space-y-1.5">
                    {result.strategic_recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-purple-400 mt-0.5">{i + 1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-12 h-12 text-blue-400/30 mb-4" />
          <p className="text-slate-500">Enter your startup details to generate a SWOT analysis</p>
        </div>
      )}
    </div>
  )
}
