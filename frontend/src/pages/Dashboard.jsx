import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Lightbulb, TrendingUp, BarChart3, Presentation,
  Users, Type, LineChart, Zap, ArrowRight, Sparkles,
  Clock, Brain, FileText, ChevronRight
} from 'lucide-react'
import StatCard from '../components/UI/StatCard'
import { analyticsAPI, aiAPI, mlAPI } from '../api/client'

const FEATURES = [
  {
    to: '/idea-generator',
    icon: Lightbulb,
    title: 'Idea Generator',
    desc: 'Generate innovative startup ideas tailored to your skills and interests',
    color: 'text-yellow-400',
    bg: 'from-yellow-500/10 to-amber-500/5',
    border: 'border-yellow-500/20',
  },
  {
    to: '/success-predictor',
    icon: TrendingUp,
    title: 'Success Predictor',
    desc: 'ML-powered prediction of your startup\'s success probability',
    color: 'text-emerald-400',
    bg: 'from-emerald-500/10 to-green-500/5',
    border: 'border-emerald-500/20',
  },
  {
    to: '/swot-analysis',
    icon: BarChart3,
    title: 'SWOT Analysis',
    desc: 'Deep strategic analysis of strengths, weaknesses, opportunities & threats',
    color: 'text-blue-400',
    bg: 'from-blue-500/10 to-cyan-500/5',
    border: 'border-blue-500/20',
  },
  {
    to: '/investor-pitch',
    icon: Presentation,
    title: 'Investor Pitch',
    desc: 'Generate compelling pitch decks and elevator pitches for investors',
    color: 'text-purple-400',
    bg: 'from-purple-500/10 to-violet-500/5',
    border: 'border-purple-500/20',
  },
  {
    to: '/competitor-analysis',
    icon: Users,
    title: 'Competitor Analysis',
    desc: 'Identify competitors, market gaps, and differentiation strategies',
    color: 'text-orange-400',
    bg: 'from-orange-500/10 to-red-500/5',
    border: 'border-orange-500/20',
  },
  {
    to: '/business-names',
    icon: Type,
    title: 'Business Names',
    desc: 'AI-generated startup names, taglines, and brand identity suggestions',
    color: 'text-pink-400',
    bg: 'from-pink-500/10 to-rose-500/5',
    border: 'border-pink-500/20',
  },
  {
    to: '/analytics',
    icon: LineChart,
    title: 'Analytics',
    desc: 'Visual dashboards with market trends and prediction statistics',
    color: 'text-cyan-400',
    bg: 'from-cyan-500/10 to-teal-500/5',
    border: 'border-cyan-500/20',
  },
]

export default function Dashboard() {
  const [stats, setStats]       = useState(null)
  const [history, setHistory]   = useState([])
  const [predictions, setPredictions] = useState([])

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setStats(res.data.stats))
      .catch(() => {})

    aiAPI.getHistory()
      .then(res => setHistory(res.data.ideas ?? []))
      .catch(() => {})

    mlAPI.getPredictions()
      .then(res => setPredictions(res.data.predictions ?? []))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <motion.div
        className="relative glass-card p-8 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-accent-purple/5 to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-purple">
                <Sparkles className="w-3 h-3" /> AI Powered
              </span>
              <span className="badge-green">Live</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome to{' '}
              <span className="gradient-text">StartupGPT</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Your AI-powered startup ecosystem. Generate ideas, predict success,
              analyze markets, and build your pitch — all in one place.
            </p>
          </div>
          <Link to="/idea-generator" className="btn-primary flex-shrink-0">
            <Zap className="w-4 h-4" />
            Generate Ideas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Lightbulb}
          label="Ideas Generated"
          value={stats?.total_ideas ?? '—'}
          color="text-yellow-400"
          trend="up"
          trendValue="+12%"
          delay={0.1}
        />
        <StatCard
          icon={TrendingUp}
          label="Predictions Run"
          value={stats?.total_predictions ?? '—'}
          color="text-emerald-400"
          trend="up"
          trendValue="+8%"
          delay={0.2}
        />
        <StatCard
          icon={BarChart3}
          label="Reports Created"
          value={stats?.total_reports ?? '—'}
          color="text-blue-400"
          trend="up"
          trendValue="+5%"
          delay={0.3}
        />
        <StatCard
          icon={Zap}
          label="Avg. Success Score"
          value={stats?.avg_success_probability ? `${stats.avg_success_probability}%` : '—'}
          color="text-brand-400"
          delay={0.4}
        />
      </div>

      {/* Feature cards grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">All Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURES.map(({ to, icon: Icon, title, desc, color, bg, border }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <Link
                to={to}
                className={`group block glass-card p-5 border ${border} hover:shadow-glow-sm transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bg} border ${border} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-brand-300 transition-colors">
                  {title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                <div className={`mt-3 flex items-center gap-1 text-xs ${color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Recent Activity */}
      {(history.length > 0 || predictions.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Idea Searches */}
          {history.length > 0 && (
            <motion.div
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" /> Recent Idea Searches
                </h2>
                <Link to="/analytics" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {history.slice(0, 5).map((idea, i) => (
                  <div key={idea._id ?? i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-600/40 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">
                        {idea.input?.industry ?? 'General'} — {idea.input?.interests?.slice(0, 40) ?? 'Startup idea'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {idea.input?.budget && (
                          <span className="text-xs text-slate-500">Budget: {idea.input.budget}</span>
                        )}
                        <span className="text-xs text-slate-600">
                          {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Predictions */}
          {predictions.length > 0 && (
            <motion.div
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-400" /> Recent Predictions
                </h2>
                <Link to="/success-predictor" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                  New <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {predictions.slice(0, 5).map((pred, i) => {
                  const riskColors = { Low: 'text-emerald-400 bg-emerald-500/20', Medium: 'text-amber-400 bg-amber-500/20', High: 'text-red-400 bg-red-500/20' }
                  const rc = riskColors[pred.riskLevel] ?? 'text-slate-400 bg-slate-500/20'
                  return (
                    <div key={pred._id ?? i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-600/40 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 font-medium truncate">
                          {pred.input?.industry ?? '—'} · {pred.input?.business_model ?? '—'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {pred.input?.budget ?? ''} · Team: {pred.input?.team_size ?? '—'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-sm font-bold text-white">{pred.probability ?? 0}%</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${rc}`}>
                          {pred.riskLevel ?? 'Unknown'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

        </div>
      )}

    </div>
  )
}
