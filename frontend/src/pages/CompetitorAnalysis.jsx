import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Sparkles, Target, TrendingUp, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/UI/PageHeader'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { aiAPI } from '../api/client'
import { usePageState } from '../context/AppStateContext'

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'Food & Beverage', 'Real Estate', 'Entertainment', 'Sustainability', 'Other'
]

export default function CompetitorAnalysis() {
  const { pageState, setPageState } = usePageState('competitorAnalysis')
  const { form, result } = pageState
  const [loading, setLoading] = useState(false)

  const setForm   = (f) => setPageState({ form: f })
  const setResult = (r) => setPageState({ result: r })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.startup_title || !form.industry || !form.description) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await aiAPI.competitorAnalysis(form)
      setResult(res.data)
      toast.success('Competitor analysis complete!')
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Competitor Analysis"
        subtitle="Identify competitors, market gaps, and differentiation strategies"
        color="text-orange-400"
        badge="Gemini AI"
      />

      {/* Form */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Startup Name</label>
            <input className="input-field" placeholder="e.g., PayFlow" value={form.startup_title}
              onChange={e => setForm({ ...form, startup_title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
            <select className="select-field" value={form.industry}
              onChange={e => setForm({ ...form, industry: e.target.value })}>
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? <span className="spinner" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Analyze Market'}
            </button>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea className="input-field resize-none h-20" placeholder="Describe your startup..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </form>
      </motion.div>

      {loading && <div className="glass-card p-6"><LoadingSpinner message="Analyzing competitive landscape..." /></div>}

      <AnimatePresence>
        {result && !loading && (
          <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Direct competitors */}
            {result.direct_competitors?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Direct Competitors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.direct_competitors.map((comp, i) => (
                    <motion.div
                      key={i}
                      className="glass-card p-5 border border-orange-500/20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">{comp.name}</h3>
                        {comp.market_share && (
                          <span className="badge-orange">{comp.market_share}</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mb-3">{comp.description}</p>
                      <div className="space-y-2">
                        {comp.strengths?.length > 0 && (
                          <div>
                            <p className="text-xs text-emerald-400 font-medium mb-1">Strengths</p>
                            {comp.strengths.map(s => (
                              <p key={s} className="text-xs text-slate-400">• {s}</p>
                            ))}
                          </div>
                        )}
                        {comp.weaknesses?.length > 0 && (
                          <div>
                            <p className="text-xs text-red-400 font-medium mb-1">Weaknesses</p>
                            {comp.weaknesses.map(w => (
                              <p key={w} className="text-xs text-slate-400">• {w}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Indirect competitors */}
            {result.indirect_competitors?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Indirect Competitors</h2>
                <div className="flex flex-wrap gap-3">
                  {result.indirect_competitors.map((comp, i) => (
                    <div key={i} className="glass-card px-4 py-3 border border-white/10">
                      <p className="font-medium text-white text-sm">{comp.name}</p>
                      <p className="text-slate-500 text-xs">{comp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market gaps & strategy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.market_gaps?.length > 0 && (
                <div className="glass-card p-5 border border-blue-500/20">
                  <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Market Gaps
                  </h3>
                  <ul className="space-y-2">
                    {result.market_gaps.map((gap, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-blue-400">→</span> {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.differentiation_strategy && (
                <div className="glass-card p-5 border border-emerald-500/20">
                  <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Differentiation
                  </h3>
                  <p className="text-slate-300 text-sm">{result.differentiation_strategy}</p>
                </div>
              )}
              {result.competitive_advantage && (
                <div className="glass-card p-5 border border-purple-500/20">
                  <h3 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Competitive Advantage
                  </h3>
                  <p className="text-slate-300 text-sm">{result.competitive_advantage}</p>
                </div>
              )}
            </div>

            {result.market_positioning && (
              <div className="glass-card p-5 border border-brand-500/20 text-center">
                <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-2">Market Positioning</p>
                <p className="text-white font-medium">"{result.market_positioning}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <Users className="w-12 h-12 text-orange-400/30 mb-4" />
          <p className="text-slate-500">Enter your startup details to analyze the competitive landscape</p>
        </div>
      )}
    </div>
  )
}
