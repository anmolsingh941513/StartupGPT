import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map, Sparkles, ChevronDown, CheckCircle2, AlertTriangle,
  Clock, Users, IndianRupee, Target, Rocket, TrendingUp, Flag
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/UI/PageHeader'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { aiAPI } from '../api/client'
import { usePageState } from '../context/AppStateContext'

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'Food & Beverage', 'Real Estate', 'Entertainment', 'Sustainability', 'Other'
]
const BUDGETS = ['< ₹1L', '₹1L - ₹5L', '₹5L - ₹20L', '₹20L - ₹1Cr', '> ₹1Cr']
const TEAM_SIZES = ['Solo', '2-5', '6-10', '11-20', '20+']
const TIMELINES = ['3 months', '6 months', '1 year', '2 years', '3+ years']

const PHASE_COLORS = [
  { bg: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/30', icon: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
  { bg: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-500/30', icon: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  { bg: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  { bg: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/30', icon: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
]

const PRIORITY_COLORS = { High: 'text-red-400 bg-red-500/10', Medium: 'text-amber-400 bg-amber-500/10', Low: 'text-emerald-400 bg-emerald-500/10' }

export default function Roadmap() {
  const { pageState, setPageState } = usePageState('roadmap')
  const { form, result, expandedPhase } = pageState
  const [loading, setLoading] = useState(false)

  const setForm        = (f) => setPageState({ form: f })
  const setResult      = (r) => setPageState({ result: r })
  const setExpandedPhase = (i) => setPageState({ expandedPhase: i })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.values(form).some(v => !v)) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await aiAPI.generateRoadmap(form)
      setResult(res.data)
      toast.success('Roadmap generated!')
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Map}
        title="Startup Roadmap Generator"
        subtitle="Get a detailed phase-by-phase execution plan for your startup"
        color="text-blue-400"
        badge="Gemini AI"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.div
          className="lg:col-span-2 glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="section-title text-lg">Startup Details</h2>
          <p className="section-subtitle">Tell us about your startup</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Rocket className="w-4 h-4 inline mr-1 text-blue-400" />
                Startup Idea
              </label>
              <textarea
                className="input-field resize-none h-24"
                placeholder="e.g., An AI-powered platform that helps farmers predict crop diseases..."
                value={form.startup_idea}
                onChange={e => setForm({ ...form, startup_idea: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Target className="w-4 h-4 inline mr-1 text-purple-400" />
                Industry
              </label>
              <select className="select-field" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <IndianRupee className="w-4 h-4 inline mr-1 text-emerald-400" />
                Budget (INR)
              </label>
              <select className="select-field" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}>
                <option value="">Select budget</option>
                {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Users className="w-4 h-4 inline mr-1 text-orange-400" />
                Team Size
              </label>
              <select className="select-field" value={form.team_size} onChange={e => setForm({ ...form, team_size: e.target.value })}>
                <option value="">Select team size</option>
                {TEAM_SIZES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1 text-cyan-400" />
                Target Timeline
              </label>
              <select className="select-field" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })}>
                <option value="">Select timeline</option>
                {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? <span className="spinner" /> : <Map className="w-4 h-4" />}
              {loading ? 'Generating Roadmap...' : 'Generate Roadmap'}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {loading && (
            <div className="glass-card p-6">
              <LoadingSpinner message="Building your startup roadmap with Gemini AI..." />
            </div>
          )}

          <AnimatePresence>
            {result && !loading && (
              <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                {/* Summary banner */}
                <div className="glass-card p-4 border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Flag className="w-3 h-3" /> Roadmap Summary
                  </p>
                  <p className="text-slate-300 text-sm">{result.summary}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="badge-blue">⏱ Revenue: {result.estimated_revenue_timeline}</span>
                    <span className="badge-purple">{result.total_phases} Phases</span>
                  </div>
                </div>

                {/* Phase cards */}
                {result.phases?.map((phase, i) => {
                  const c = PHASE_COLORS[i % PHASE_COLORS.length]
                  return (
                    <motion.div
                      key={i}
                      className={`glass-card border ${c.border} overflow-hidden`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <button
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedPhase(expandedPhase === i ? -1 : i)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.bg} border ${c.border} flex items-center justify-center font-bold ${c.icon}`}>
                            {phase.phase}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{phase.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-500 text-xs">{phase.duration}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge}`}>{phase.budget_allocation}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedPhase === i ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {expandedPhase === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                              <p className="text-slate-300 text-sm">{phase.goal}</p>

                              {/* Tasks */}
                              <div>
                                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Tasks</p>
                                <div className="space-y-2">
                                  {phase.tasks?.map((t, ti) => (
                                    <div key={ti} className="flex items-start gap-3 bg-dark-600/40 rounded-xl p-3">
                                      <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-white font-medium">{t.task}</span>
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                {/* Milestones */}
                                <div className="bg-dark-600/40 rounded-xl p-3">
                                  <p className="text-xs font-semibold text-emerald-400 mb-2">🎯 Milestones</p>
                                  <ul className="space-y-1">
                                    {phase.milestones?.map((m, mi) => (
                                      <li key={mi} className="text-xs text-slate-300 flex items-start gap-1">
                                        <span className="text-emerald-500 mt-0.5">•</span>{m}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                {/* Success Metrics */}
                                <div className="bg-dark-600/40 rounded-xl p-3">
                                  <p className="text-xs font-semibold text-blue-400 mb-2">📊 Success Metrics</p>
                                  <ul className="space-y-1">
                                    {phase.success_metrics?.map((m, mi) => (
                                      <li key={mi} className="text-xs text-slate-300 flex items-start gap-1">
                                        <span className="text-blue-500 mt-0.5">•</span>{m}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Team needed */}
                              {phase.team_needed?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 mb-2">Team Required</p>
                                  <div className="flex flex-wrap gap-2">
                                    {phase.team_needed.map(r => (
                                      <span key={r} className="badge-purple">{r}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}

                {/* Bottom info row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Key Risks */}
                  <div className="glass-card p-4 border border-red-500/20">
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Key Risks
                    </p>
                    <div className="space-y-2">
                      {result.key_risks?.map((r, i) => (
                        <div key={i} className="bg-dark-600/40 rounded-lg p-2">
                          <p className="text-xs font-medium text-white">{r.risk}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{r.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Critical Success Factors */}
                  <div className="glass-card p-4 border border-emerald-500/20">
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Critical Success Factors
                    </p>
                    <ul className="space-y-1.5">
                      {result.critical_success_factors?.map((f, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                    {result.tech_stack?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-xs font-semibold text-slate-400 mb-2">Tech Stack</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.tech_stack.map(t => <span key={t} className="badge-blue text-xs">{t}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !loading && (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
              <Map className="w-12 h-12 text-blue-400/30 mb-4" />
              <p className="text-slate-500">Fill in your startup details to generate a roadmap</p>
              <p className="text-slate-600 text-sm mt-1">Phase-by-phase execution plan powered by Gemini AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
