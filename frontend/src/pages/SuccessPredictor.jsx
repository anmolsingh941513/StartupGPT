import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Brain, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/UI/PageHeader'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { mlAPI } from '../api/client'
import { useSettings } from '../context/SettingsContext'

export default function SuccessPredictor() {
  const [modelInfo, setModelInfo] = useState(null)
  const [form, setForm] = useState({
    industry: '', business_model: '', budget: '', team_size: '',
    market_size_score: 5, innovation_score: 5, founder_experience: 3,
    has_mvp: false, has_traction: false, competition_level: 5,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { settings } = useSettings()

  useEffect(() => {
    mlAPI.getModelInfo().then(res => setModelInfo(res.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const required = ['industry', 'business_model', 'budget', 'team_size']
    if (required.some(f => !form[f])) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await mlAPI.predict(form)
      setResult(res.data)
      if (settings.predAlerts && settings.emailNotifs) toast.success('🧠 Prediction complete!')
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const riskColor = {
    Low: 'text-emerald-400',
    Medium: 'text-amber-400',
    High: 'text-red-400',
  }

  const probColor = (p) => {
    if (p >= 70) return 'from-emerald-500 to-green-400'
    if (p >= 45) return 'from-amber-500 to-yellow-400'
    return 'from-red-500 to-rose-400'
  }

  const SliderField = ({ label, field, min = 1, max = 10, step = 0.5, hint }) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-brand-400 font-bold text-sm">{form[field]}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={form[field]}
        onChange={e => setForm({ ...form, [field]: parseFloat(e.target.value) })}
        className="w-full h-2 bg-dark-500 rounded-full appearance-none cursor-pointer accent-brand-500"
      />
      {hint && <p className="text-slate-600 text-xs mt-1">{hint}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        icon={TrendingUp}
        title="Success Predictor"
        subtitle="ML model predicts your startup's success probability"
        color="text-emerald-400"
        badge="Scikit-learn"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.div
          className="lg:col-span-2 glass-card p-6 space-y-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div>
            <h2 className="section-title text-lg">Startup Profile</h2>
            <p className="section-subtitle">Provide details for ML analysis</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dropdowns */}
            {[
              { label: 'Industry', field: 'industry', options: modelInfo?.industries },
              { label: 'Business Model', field: 'business_model', options: modelInfo?.business_models },
              { label: 'Budget Range', field: 'budget', options: modelInfo?.budget_ranges },
              { label: 'Team Size', field: 'team_size', options: modelInfo?.team_sizes },
            ].map(({ label, field, options }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
                <select
                  className="select-field"
                  value={form[field]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                >
                  <option value="">Select {label.toLowerCase()}</option>
                  {options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}

            {/* Sliders */}
            <SliderField label="Market Size Score" field="market_size_score" hint="1 = niche, 10 = massive market" />
            <SliderField label="Innovation Score" field="innovation_score" hint="1 = common, 10 = highly innovative" />
            <SliderField label="Founder Experience (years)" field="founder_experience" min={0} max={20} step={1} />
            <SliderField label="Competition Level" field="competition_level" hint="1 = low competition, 10 = very competitive" />

            {/* Toggles */}
            <div className="flex gap-4">
              {[
                { label: 'Has MVP', field: 'has_mvp' },
                { label: 'Has Traction', field: 'has_traction' },
              ].map(({ label, field }) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => setForm({ ...form, [field]: !form[field] })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form[field]
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-dark-600/40 border-white/10 text-slate-400'
                  }`}
                >
                  {form[field] ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? <span className="spinner" /> : <Brain className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Predict Success'}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {loading && (
            <div className="glass-card p-6">
              <LoadingSpinner message="Running ML prediction model..." />
            </div>
          )}

          <AnimatePresence>
            {result && !loading && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Main score */}
                <div className="glass-card p-6 text-center border border-white/10">
                  <p className="text-slate-400 text-sm mb-4">Success Probability</p>
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="url(#grad)" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${result.success_probability * 2.51} 251`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">{result.success_probability}%</span>
                      <span className="text-xs text-slate-400">probability</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-2">
                    {result.success_probability >= 50
                      ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                      : <AlertTriangle className="w-5 h-5 text-amber-400" />
                    }
                    <span className="font-semibold text-white">{result.prediction}</span>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className={`font-medium ${riskColor[result.risk_level]}`}>
                      {result.risk_level} Risk
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{result.confidence}% confidence</span>
                  </div>
                </div>

                {/* Feature importance */}
                {result.feature_importance && (
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white mb-4 text-sm">Feature Scores</h3>
                    <div className="space-y-3">
                      {Object.entries(result.feature_importance).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                            <span className="text-white font-medium">{val}%</span>
                          </div>
                          <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full bg-gradient-to-r ${probColor(val)}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${val}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights */}
                {result.insights?.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white mb-3 text-sm flex items-center gap-2">
                      <Info className="w-4 h-4 text-brand-400" /> AI Insights
                    </h3>
                    <ul className="space-y-2">
                      {result.insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-brand-400 mt-0.5">→</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !loading && (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
              <Brain className="w-12 h-12 text-emerald-400/30 mb-4" />
              <p className="text-slate-500">Configure your startup profile and run the prediction</p>
              <p className="text-slate-600 text-sm mt-1">Gradient Boosting ML Model</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
