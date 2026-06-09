import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Presentation, Sparkles, DollarSign, Mic, Target, TrendingUp, Users, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/UI/PageHeader'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { aiAPI } from '../api/client'
import { usePageState } from '../context/AppStateContext'

export default function InvestorPitch() {
  const { pageState, setPageState } = usePageState('investorPitch')
  const { form, result } = pageState
  const [loading, setLoading] = useState(false)

  const setForm   = (f) => setPageState({ form: f })
  const setResult = (r) => setPageState({ result: r })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.values(form).some(v => !v)) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await aiAPI.investorPitch(form)
      setResult(res.data)
      toast.success('Pitch generated!')
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }

  const PitchSection = ({ icon: Icon, title, content, color = 'text-brand-400', delay = 0 }) => (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">{content}</p>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Presentation}
        title="Investor Pitch Generator"
        subtitle="Generate compelling pitch decks and funding proposals"
        color="text-purple-400"
        badge="Gemini AI"
      />

      {/* Form */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Startup Name</label>
            <input className="input-field" placeholder="e.g., HealthAI Pro" value={form.startup_title}
              onChange={e => setForm({ ...form, startup_title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Funding Needed</label>
            <input className="input-field" placeholder="e.g., $500,000 Seed Round" value={form.funding_needed}
              onChange={e => setForm({ ...form, funding_needed: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea className="input-field resize-none h-20" placeholder="What does your startup do?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
            <input className="input-field" placeholder="e.g., SMBs, enterprise, consumers" value={form.target_audience}
              onChange={e => setForm({ ...form, target_audience: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Revenue Model</label>
            <input className="input-field" placeholder="e.g., SaaS subscription, marketplace fee" value={form.revenue_model}
              onChange={e => setForm({ ...form, revenue_model: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary justify-center" disabled={loading}>
              {loading ? <span className="spinner" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Generating Pitch...' : 'Generate Investor Pitch'}
            </button>
          </div>
        </form>
      </motion.div>

      {loading && <div className="glass-card p-6"><LoadingSpinner message="Crafting your investor pitch..." /></div>}

      <AnimatePresence>
        {result && !loading && (
          <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Elevator pitch highlight */}
            {result.elevator_pitch && (
              <motion.div
                className="glass-card p-6 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-violet-500/5"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-purple-300">Elevator Pitch (30 seconds)</h3>
                </div>
                <p className="text-white text-lg leading-relaxed font-medium">"{result.elevator_pitch}"</p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PitchSection icon={Target} title="Problem Statement" content={result.problem_statement} color="text-red-400" delay={0.1} />
              <PitchSection icon={Sparkles} title="Our Solution" content={result.solution} color="text-emerald-400" delay={0.15} />
              <PitchSection icon={TrendingUp} title="Market Opportunity" content={result.market_opportunity} color="text-blue-400" delay={0.2} />
              <PitchSection icon={DollarSign} title="Business Model" content={result.business_model} color="text-yellow-400" delay={0.25} />
              <PitchSection icon={CheckCircle} title="Traction" content={result.traction} color="text-cyan-400" delay={0.3} />
            </div>

            {/* Funding breakdown */}
            {result.funding_breakdown && (
              <motion.div className="glass-card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" /> Funding Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(result.funding_breakdown).map(([key, val]) => (
                    <div key={key} className="bg-dark-600/40 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-white">{val}</p>
                      <p className="text-slate-400 text-xs capitalize mt-1">{key.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Team & Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.team_requirements?.length > 0 && (
                <motion.div className="glass-card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" /> Team Requirements
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.team_requirements.map(role => (
                      <span key={role} className="badge-orange">{role}</span>
                    ))}
                  </div>
                </motion.div>
              )}
              {result.milestones?.length > 0 && (
                <motion.div className="glass-card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                  <h3 className="font-semibold text-white mb-3">Key Milestones</h3>
                  <ol className="space-y-2">
                    {result.milestones.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-brand-400 font-bold">{i + 1}.</span> {m}
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}
            </div>

            {/* CTA */}
            {result.call_to_action && (
              <motion.div
                className="glass-card p-5 border border-brand-500/30 text-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              >
                <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-2">Call to Action</p>
                <p className="text-white font-medium">{result.call_to_action}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <Presentation className="w-12 h-12 text-purple-400/30 mb-4" />
          <p className="text-slate-500">Fill in your startup details to generate an investor pitch</p>
        </div>
      )}
    </div>
  )
}
