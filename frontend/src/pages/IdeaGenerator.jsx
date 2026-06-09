import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Sparkles, ChevronDown, Target, IndianRupee, Code, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/UI/PageHeader'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { aiAPI } from '../api/client'
import { usePageState } from '../context/AppStateContext'
import { useSettings } from '../context/SettingsContext'

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'Food & Beverage', 'Real Estate', 'Entertainment', 'Sustainability', 'Other'
]

const BUDGETS = ['< ₹1L', '₹1L - ₹5L', '₹5L - ₹20L', '₹20L - ₹1Cr', '> ₹1Cr']

export default function IdeaGenerator() {
  const { pageState, setPageState } = usePageState('ideaGenerator')
  const { form, result, expandedIdea } = pageState
  const [loading, setLoading] = useState(false)
  const { settings } = useSettings()

  const setForm    = (f) => setPageState({ form: f })
  const setResult  = (r) => setPageState({ result: r })
  const setExpanded = (i) => setPageState({ expandedIdea: i })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.interests || !form.skills || !form.budget || !form.industry) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await aiAPI.generateIdeas(form)
      setResult(res.data)
      if (settings.ideaAlerts && settings.emailNotifs) toast.success('💡 Ideas generated successfully!')
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Lightbulb}
        title="Startup Idea Generator"
        subtitle="Enter your profile and let AI generate tailored startup ideas"
        color="text-yellow-400"
        badge="Gemini AI"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.div
          className="lg:col-span-2 glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="section-title text-lg">Your Profile</h2>
          <p className="section-subtitle">Tell us about yourself</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Target className="w-4 h-4 inline mr-1 text-yellow-400" />
                Interests & Passions
              </label>
              <textarea
                className="input-field resize-none h-24"
                placeholder="e.g., AI, sustainability, health & wellness, gaming..."
                value={form.interests}
                onChange={e => setForm({ ...form, interests: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Code className="w-4 h-4 inline mr-1 text-blue-400" />
                Skills & Expertise
              </label>
              <textarea
                className="input-field resize-none h-24"
                placeholder="e.g., Python, marketing, design, finance, sales..."
                value={form.skills}
                onChange={e => setForm({ ...form, skills: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <IndianRupee className="w-4 h-4 inline mr-1 text-emerald-400" />
                Available Budget (INR)
              </label>
              <select
                className="select-field"
                value={form.budget}
                onChange={e => setForm({ ...form, budget: e.target.value })}
              >
                <option value="">Select budget range</option>
                {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Sparkles className="w-4 h-4 inline mr-1 text-purple-400" />
                Target Industry
              </label>
              <select
                className="select-field"
                value={form.industry}
                onChange={e => setForm({ ...form, industry: e.target.value })}
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? <span className="spinner" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Ideas'}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {loading && (
            <div className="glass-card p-6">
              <LoadingSpinner message="Generating startup ideas with Gemini AI..." />
            </div>
          )}

          <AnimatePresence>
            {result && !loading && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Industry insight */}
                {result.industry_insights && (
                  <div className="glass-card p-4 border border-yellow-500/20">
                    <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider mb-1">Industry Insight</p>
                    <p className="text-slate-300 text-sm">{result.industry_insights}</p>
                  </div>
                )}

                {/* Idea cards */}
                {result.ideas?.map((idea, i) => (
                  <motion.div
                    key={i}
                    className="glass-card border border-white/10 overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <button
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                      onClick={() => setExpanded(expandedIdea === i ? -1 : i)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 flex items-center justify-center text-sm font-bold text-yellow-400">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{idea.title}</h3>
                          <p className="text-slate-500 text-xs">{idea.revenue_model}</p>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedIdea === i ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {expandedIdea === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                            <p className="text-slate-300 text-sm">{idea.description}</p>

                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: 'Problem Solved', value: idea.problem_solved, color: 'text-red-400' },
                                { label: 'Unique Value', value: idea.unique_value, color: 'text-emerald-400' },
                                { label: 'Target Audience', value: idea.target_audience, color: 'text-blue-400' },
                                { label: 'Market Size', value: idea.estimated_market_size, color: 'text-purple-400' },
                              ].map(({ label, value, color }) => (
                                <div key={label} className="bg-dark-600/40 rounded-xl p-3">
                                  <p className={`text-xs font-semibold ${color} mb-1`}>{label}</p>
                                  <p className="text-slate-300 text-xs">{value}</p>
                                </div>
                              ))}
                            </div>

                            {idea.tech_stack_suggestion?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-slate-400 mb-2">Suggested Tech Stack</p>
                                <div className="flex flex-wrap gap-2">
                                  {idea.tech_stack_suggestion.map(tech => (
                                    <span key={tech} className="badge-blue">{tech}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Recommendation */}
                {result.recommendation && (
                  <div className="glass-card p-4 border border-brand-500/20">
                    <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Recommendation
                    </p>
                    <p className="text-slate-300 text-sm">{result.recommendation}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !loading && (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
              <Lightbulb className="w-12 h-12 text-yellow-400/30 mb-4" />
              <p className="text-slate-500">Fill in your profile and click Generate Ideas</p>
              <p className="text-slate-600 text-sm mt-1">Powered by Google Gemini AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
