import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, Sparkles, Globe, Target, Zap, AlertTriangle,
  DollarSign, BarChart2, Lightbulb, Star, ArrowUpRight, Building2
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
const REGIONS = ['India', 'Global', 'Southeast Asia', 'USA', 'Europe', 'Middle East']
const FOCUS_AREAS = [
  'Startup Opportunities', 'Investment Landscape', 'Consumer Trends',
  'Technology Adoption', 'Regulatory Changes', 'Competitive Landscape'
]

const IMPACT_COLORS = {
  High:   'bg-red-500/20 text-red-300 border border-red-500/30',
  Medium: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  Low:    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
}
const ADOPTION_COLORS = {
  Early:      'bg-blue-500/20 text-blue-300',
  Growing:    'bg-purple-500/20 text-purple-300',
  Mainstream: 'bg-emerald-500/20 text-emerald-300',
}
const POTENTIAL_COLORS = {
  High:   'text-emerald-400',
  Medium: 'text-amber-400',
  Low:    'text-slate-400',
}

export default function MarketTrends() {
  const { pageState, setPageState } = usePageState('marketTrends')
  const { form, result } = pageState
  const [loading, setLoading] = useState(false)

  const setForm   = (f) => setPageState({ form: f })
  const setResult = (r) => setPageState({ result: r })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.industry || !form.region || !form.focus) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await aiAPI.getMarketTrends(form)
      setResult(res.data)
      toast.success('Market trends loaded!')
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={TrendingUp}
        title="Market Trends"
        subtitle="AI-powered analysis of current market trends, opportunities and investment landscape"
        color="text-rose-400"
        badge="Gemini AI"
      />

      {/* Form */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Building2 className="w-4 h-4 inline mr-1 text-rose-400" /> Industry
            </label>
            <select className="select-field" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Globe className="w-4 h-4 inline mr-1 text-blue-400" /> Region
            </label>
            <select className="select-field" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
              <option value="">Select region</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Target className="w-4 h-4 inline mr-1 text-purple-400" /> Focus Area
            </label>
            <select className="select-field" value={form.focus} onChange={e => setForm({ ...form, focus: e.target.value })}>
              <option value="">Select focus</option>
              {FOCUS_AREAS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary justify-center" disabled={loading}>
            {loading ? <span className="spinner" /> : <TrendingUp className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Analyze Trends'}
          </button>
        </form>
      </motion.div>

      {loading && (
        <div className="glass-card p-8">
          <LoadingSpinner message="Analyzing market trends with Gemini AI..." />
        </div>
      )}

      <AnimatePresence>
        {result && !loading && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* Overview + Market Size */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 glass-card p-5 border border-rose-500/20">
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <BarChart2 className="w-3 h-3" /> Industry Overview
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">{result.industry_overview}</p>
                <p className="text-xs text-slate-600 mt-3">Last updated: {result.last_updated}</p>
              </div>
              <div className="glass-card p-5 border border-emerald-500/20 space-y-3">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Market Size</p>
                <div>
                  <p className="text-xs text-slate-500">Current</p>
                  <p className="text-white font-bold">{result.market_size?.current}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">5-Year Projection</p>
                  <p className="text-emerald-400 font-bold">{result.market_size?.projected}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl px-3 py-2 text-center">
                  <p className="text-xs text-slate-500">CAGR</p>
                  <p className="text-2xl font-bold text-emerald-400">{result.market_size?.cagr}</p>
                </div>
              </div>
            </div>

            {/* Top Trends */}
            <div className="glass-card p-5">
              <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-400" /> Top Market Trends
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.top_trends?.map((t, i) => (
                  <motion.div
                    key={i}
                    className="bg-dark-600/40 rounded-xl p-4 border border-white/5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-white">{t.trend}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${IMPACT_COLORS[t.impact]}`}>{t.impact}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{t.description}</p>
                    <div className="bg-brand-500/10 rounded-lg p-2">
                      <p className="text-xs text-brand-300 flex items-start gap-1">
                        <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />{t.opportunity}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Emerging Tech + Hot Segments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Emerging Technologies
                </p>
                <div className="space-y-2">
                  {result.emerging_technologies?.map((t, i) => (
                    <div key={i} className="flex items-start gap-3 bg-dark-600/40 rounded-xl p-3">
                      <span className={`text-xs px-2 py-1 rounded-lg flex-shrink-0 ${ADOPTION_COLORS[t.adoption_stage]}`}>
                        {t.adoption_stage}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{t.tech}</p>
                        <p className="text-xs text-slate-500">{t.relevance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-orange-400" /> Hot Segments
                </p>
                <div className="space-y-2">
                  {result.hot_segments?.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-dark-600/40 rounded-xl p-3">
                      <div>
                        <p className="text-sm font-medium text-white">{s.segment}</p>
                        <p className="text-xs text-slate-500">{s.why_hot}</p>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm flex-shrink-0 ml-2">{s.growth}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Investment Landscape */}
            <div className="glass-card p-5 border border-purple-500/20">
              <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-400" /> Investment Landscape
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Total Funding 2024', value: result.investment_landscape?.total_funding_2024, color: 'text-purple-400' },
                  { label: 'Avg Seed Round', value: result.investment_landscape?.avg_seed_round, color: 'text-emerald-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-dark-600/40 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <p className={`font-bold text-sm ${color}`}>{value}</p>
                  </div>
                ))}
                <div className="bg-dark-600/40 rounded-xl p-3 col-span-2">
                  <p className="text-xs text-slate-500 mb-2">Top Investors</p>
                  <div className="flex flex-wrap gap-1">
                    {result.investment_landscape?.top_investors?.map(inv => (
                      <span key={inv} className="badge-purple text-xs">{inv}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Hot Investment Areas</p>
                <div className="flex flex-wrap gap-2">
                  {result.investment_landscape?.hot_investment_areas?.map(a => (
                    <span key={a} className="badge-green">{a}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Opportunities + Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-5 border border-emerald-500/20">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-emerald-400" /> Opportunities
                </p>
                <div className="space-y-2">
                  {result.opportunities?.map((o, i) => (
                    <div key={i} className="bg-dark-600/40 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white">{o.opportunity}</p>
                        <span className={`text-xs font-semibold ${POTENTIAL_COLORS[o.potential]}`}>{o.potential}</span>
                      </div>
                      <p className="text-xs text-slate-500">{o.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5 border border-red-500/20">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" /> Challenges
                </p>
                <div className="space-y-2">
                  {result.challenges?.map((c, i) => (
                    <div key={i} className="bg-dark-600/40 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white">{c.challenge}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${IMPACT_COLORS[c.severity]}`}>{c.severity}</span>
                      </div>
                      <p className="text-xs text-slate-500">{c.advice}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Success Stories + Predictions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" /> Success Stories
                </p>
                <div className="space-y-2">
                  {result.success_stories?.map((s, i) => (
                    <div key={i} className="bg-dark-600/40 rounded-xl p-3">
                      <p className="text-sm font-semibold text-brand-300">{s.company}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.what_they_did}</p>
                      <p className="text-xs text-emerald-400 mt-1 font-medium">→ {s.outcome}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5 border border-brand-500/20">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-400" /> Future Predictions
                </p>
                <ul className="space-y-2">
                  {result.predictions?.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-brand-400 font-bold flex-shrink-0">{i + 1}.</span>{p}
                    </li>
                  ))}
                </ul>
                {result.consumer_behavior_shifts?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs font-semibold text-slate-400 mb-2">Consumer Behavior Shifts</p>
                    <ul className="space-y-1">
                      {result.consumer_behavior_shifts.map((s, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-1">
                          <span className="text-brand-500">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-14 h-14 text-rose-400/30 mb-4" />
          <p className="text-slate-500">Select an industry, region and focus area</p>
          <p className="text-slate-600 text-sm mt-1">Get AI-powered market intelligence powered by Gemini</p>
        </div>
      )}
    </div>
  )
}
