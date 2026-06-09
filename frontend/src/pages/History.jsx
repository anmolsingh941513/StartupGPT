/**
 * History page — shows every saved input + output from MongoDB
 * covering: StartupIdeas, Predictions, Reports (swot/pitch/competitor/names/roadmap/market_trends)
 */
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb, TrendingUp, BarChart3, Presentation, Users, Type,
  Map, LineChart, ChevronDown, ChevronUp, Clock, RefreshCw,
  ArrowRight, Brain, Sparkles, AlertTriangle, CheckCircle
} from 'lucide-react'
import PageHeader from '../components/UI/PageHeader'
import { aiAPI, mlAPI } from '../api/client'

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const TYPE_META = {
  idea_generation: { label: 'Idea Generator',       icon: Lightbulb,   color: 'text-yellow-400',  bg: 'bg-yellow-500/15', border: 'border-yellow-500/20' },
  prediction:      { label: 'Success Predictor',    icon: Brain,       color: 'text-emerald-400', bg: 'bg-emerald-500/15',border: 'border-emerald-500/20' },
  swot:            { label: 'SWOT Analysis',        icon: BarChart3,   color: 'text-blue-400',    bg: 'bg-blue-500/15',   border: 'border-blue-500/20' },
  pitch:           { label: 'Investor Pitch',       icon: Presentation,color: 'text-purple-400',  bg: 'bg-purple-500/15', border: 'border-purple-500/20' },
  competitor:      { label: 'Competitor Analysis',  icon: Users,       color: 'text-orange-400',  bg: 'bg-orange-500/15', border: 'border-orange-500/20' },
  names:           { label: 'Business Names',       icon: Type,        color: 'text-pink-400',    bg: 'bg-pink-500/15',   border: 'border-pink-500/20' },
  roadmap:         { label: 'Roadmap',              icon: Map,         color: 'text-cyan-400',    bg: 'bg-cyan-500/15',   border: 'border-cyan-500/20' },
  market_trends:   { label: 'Market Trends',        icon: TrendingUp,  color: 'text-rose-400',    bg: 'bg-rose-500/15',   border: 'border-rose-500/20' },
}

const RISK_COLORS = {
  Low:    'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  Medium: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  High:   'text-red-400 bg-red-500/20 border-red-500/30',
}

// ─── Input display ─────────────────────────────────────────────────────────────
function InputGrid({ input }) {
  if (!input) return null
  const entries = Object.entries(input).filter(([k]) => k !== '__v')
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
      {entries.map(([key, val]) => (
        <div key={key} className="bg-dark-600/50 rounded-lg px-3 py-2 border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">
            {key.replace(/_/g, ' ')}
          </p>
          <p className="text-sm text-slate-200 font-medium truncate">
            {typeof val === 'boolean' ? (val ? '✅ Yes' : '❌ No') : String(val ?? '—')}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Output sections per type ──────────────────────────────────────────────────
function IdeaOutput({ output }) {
  if (!output?.ideas) return null
  return (
    <div className="space-y-3 mt-3">
      {output.ideas.map((idea, i) => (
        <div key={i} className="p-3 rounded-xl bg-dark-600/40 border border-white/5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-white">{idea.title}</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 whitespace-nowrap">
              {idea.difficulty_level}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{idea.description}</p>
          <div className="flex gap-3 mt-2 flex-wrap">
            {idea.revenue_model && <span className="text-xs text-slate-500">💰 {idea.revenue_model.slice(0,50)}</span>}
            {idea.time_to_market && <span className="text-xs text-slate-500">⏱ {idea.time_to_market}</span>}
          </div>
        </div>
      ))}
      {output.market_insights && (
        <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/20">
          <p className="text-xs font-semibold text-brand-400 mb-1">Market Insights</p>
          <p className="text-xs text-slate-400 leading-relaxed">{output.market_insights.slice(0, 250)}…</p>
        </div>
      )}
    </div>
  )
}

function PredictionOutput({ output, input }) {
  if (!output) return null
  const prob = output.success_probability ?? output.probability ?? 0
  const risk = output.risk_level
  return (
    <div className="mt-3 space-y-3">
      {/* Score row */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-dark-600/40 border border-white/5">
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{prob}%</p>
          <p className="text-xs text-slate-500">success probability</p>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {prob >= 50
              ? <CheckCircle className="w-4 h-4 text-emerald-400" />
              : <AlertTriangle className="w-4 h-4 text-amber-400" />
            }
            <span className="text-sm font-semibold text-white">
              {output.prediction ?? (prob >= 50 ? 'Likely to Succeed' : 'Needs Improvement')}
            </span>
          </div>
          {risk && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${RISK_COLORS[risk]}`}>
              {risk} Risk
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{output.confidence ?? '—'}%</p>
          <p className="text-xs text-slate-500">confidence</p>
        </div>
      </div>

      {/* Feature scores */}
      {output.feature_importance && (
        <div className="p-3 rounded-xl bg-dark-600/40 border border-white/5">
          <p className="text-xs font-semibold text-slate-400 mb-2">Feature Scores</p>
          <div className="space-y-1.5">
            {(Array.isArray(output.feature_importance)
              ? output.feature_importance.map(f => [f.feature, f.score])
              : Object.entries(output.feature_importance)
            ).map(([label, score]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-32 flex-shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-dark-500 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-xs text-white w-8 text-right">{score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {(output.insights ?? output.recommendations)?.length > 0 && (
        <div className="p-3 rounded-xl bg-dark-600/40 border border-white/5">
          <p className="text-xs font-semibold text-slate-400 mb-2">Recommendations</p>
          <ul className="space-y-1">
            {(output.insights ?? output.recommendations).map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <ArrowRight className="w-3 h-3 text-brand-400 mt-0.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ReportOutput({ type, output }) {
  if (!output) return null

  // Generic key-value display for any report type
  const renderValue = (val, depth = 0) => {
    if (val === null || val === undefined) return <span className="text-slate-600">—</span>
    if (typeof val === 'boolean') return <span className={val ? 'text-emerald-400' : 'text-slate-500'}>{val ? 'Yes' : 'No'}</span>
    if (typeof val !== 'object') return <span className="text-slate-300">{String(val).slice(0, 300)}</span>
    if (Array.isArray(val)) {
      return (
        <ul className="space-y-1 mt-1">
          {val.slice(0, 5).map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
              <span className="text-brand-500 mt-0.5 flex-shrink-0">•</span>
              {typeof item === 'object' ? (
                <div className="space-y-0.5">
                  {Object.entries(item).slice(0, 3).map(([k, v]) => (
                    <p key={k}><span className="text-slate-500">{k}: </span>{String(v).slice(0,100)}</p>
                  ))}
                </div>
              ) : String(item).slice(0, 150)}
            </li>
          ))}
          {val.length > 5 && <li className="text-xs text-slate-600">+{val.length - 5} more…</li>}
        </ul>
      )
    }
    if (depth < 1) {
      return (
        <div className="space-y-1 mt-1">
          {Object.entries(val).slice(0, 4).map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs">
              <span className="text-slate-500 capitalize min-w-[80px]">{k.replace(/_/g,' ')}:</span>
              <span className="text-slate-300 flex-1">{typeof v === 'object' ? JSON.stringify(v).slice(0,80) : String(v).slice(0,120)}</span>
            </div>
          ))}
        </div>
      )
    }
    return <span className="text-slate-500 text-xs">[object]</span>
  }

  const topKeys = Object.entries(output).slice(0, 8)

  return (
    <div className="mt-3 space-y-2">
      {topKeys.map(([key, val]) => (
        <div key={key} className="p-3 rounded-xl bg-dark-600/40 border border-white/5">
          <p className="text-xs font-semibold text-slate-400 capitalize mb-1">
            {key.replace(/_/g, ' ')}
          </p>
          <div className="text-xs">{renderValue(val)}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Single history card ───────────────────────────────────────────────────────
function HistoryCard({ item, index }) {
  const [open, setOpen] = useState(false)
  const type = item._type
  const meta = TYPE_META[type] ?? TYPE_META.idea_generation
  const Icon = meta.icon

  return (
    <motion.div
      className={`glass-card border ${meta.border} overflow-hidden`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/3 transition-colors"
      >
        <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{meta.label}</span>
            {/* Quick summary chips */}
            {item.input?.industry && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                {item.input.industry}
              </span>
            )}
            {item.input?.business_model && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                {item.input.business_model}
              </span>
            )}
            {item._type === 'prediction' && item.output && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${RISK_COLORS[item.output.risk_level] ?? 'text-slate-400'}`}>
                {item.output.success_probability ?? item.output.probability ?? 0}% · {item.output.risk_level} Risk
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-600" />
            <span className="text-xs text-slate-600">{fmt(item.createdAt)}</span>
          </div>
        </div>
        <div className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-4">
              {/* INPUT */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> Input
                </p>
                <InputGrid input={item.input} />
              </div>

              {/* OUTPUT */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-400" /> Output
                </p>
                {type === 'idea_generation' && <IdeaOutput output={item.output} />}
                {type === 'prediction'      && <PredictionOutput output={item.output} input={item.input} />}
                {!['idea_generation','prediction'].includes(type) && <ReportOutput type={type} output={item.output} />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Ideas', 'Predictions', 'Reports']

// ─── Main page ────────────────────────────────────────────────────────────────
export default function History() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('All')

  const load = async () => {
    setLoading(true)
    try {
      const [ideasRes, predsRes] = await Promise.all([
        aiAPI.getHistory(),
        mlAPI.getPredictions(),
      ])
      const ideas = (ideasRes.data.ideas ?? []).map(i => ({ ...i, _type: i.type ?? 'idea_generation' }))
      const preds = (predsRes.data.predictions ?? []).map(p => ({ ...p, _type: 'prediction' }))
      // Merge and sort newest first
      const all = [...ideas, ...preds].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setItems(all)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = items.filter(item => {
    if (filter === 'All')         return true
    if (filter === 'Ideas')       return item._type === 'idea_generation'
    if (filter === 'Predictions') return item._type === 'prediction'
    if (filter === 'Reports')     return !['idea_generation','prediction'].includes(item._type)
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          icon={Clock}
          title="History"
          subtitle="Full input & output log of every AI request"
          color="text-brand-400"
        />
        <button onClick={load} disabled={loading}
          className="btn-secondary flex items-center gap-2 h-10 flex-shrink-0">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all border ${
              filter === f
                ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                : 'bg-dark-600/30 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200'
            }`}>
            {f}
            {f !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                ({items.filter(i =>
                  f === 'Ideas'       ? i._type === 'idea_generation' :
                  f === 'Predictions' ? i._type === 'prediction' :
                  !['idea_generation','prediction'].includes(i._type)
                ).length})
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-600 self-center">{filtered.length} records</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="glass-card p-12 text-center">
          <RefreshCw className="w-8 h-8 text-brand-400/40 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading history…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No records yet</p>
          <p className="text-slate-600 text-sm mt-1">Use any feature to generate your first entry</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <HistoryCard key={item._id ?? i} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
