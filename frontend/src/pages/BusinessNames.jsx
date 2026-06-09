import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Type, Sparkles, Globe, Tag, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/UI/PageHeader'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { aiAPI } from '../api/client'
import { usePageState } from '../context/AppStateContext'

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'Food & Beverage', 'Real Estate', 'Entertainment', 'Sustainability', 'Other'
]

const STYLE_COLORS = {
  modern:       'badge-blue',
  playful:      'badge-purple',
  professional: 'badge-green',
  tech:         'badge-orange',
}

export default function BusinessNames() {
  const { pageState, setPageState } = usePageState('businessNames')
  const { form, result } = pageState
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)

  const setForm   = (f) => setPageState({ form: f })
  const setResult = (r) => setPageState({ result: r })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.industry || !form.description || !form.keywords) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await aiAPI.businessNames(form)
      setResult(res.data)
      toast.success('Names generated!')
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }

  const copyName = (name) => {
    navigator.clipboard.writeText(name)
    setCopied(name)
    toast.success(`Copied "${name}"`)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Type}
        title="Business Name Generator"
        subtitle="AI-generated startup names, taglines, and brand identity"
        color="text-pink-400"
        badge="Gemini AI"
      />

      {/* Form */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
            <select className="select-field" value={form.industry}
              onChange={e => setForm({ ...form, industry: e.target.value })}>
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Keywords</label>
            <input className="input-field" placeholder="e.g., fast, smart, green, connect"
              value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? <span className="spinner" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Names'}
            </button>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea className="input-field resize-none h-20" placeholder="What does your startup do?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </form>
      </motion.div>

      {loading && <div className="glass-card p-6"><LoadingSpinner message="Brainstorming creative names..." /></div>}

      <AnimatePresence>
        {result && !loading && (
          <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Name cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.names?.map((item, i) => (
                <motion.div
                  key={i}
                  className="glass-card p-5 border border-pink-500/20 hover:border-pink-500/40 transition-all group"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    <button
                      onClick={() => copyName(item.name)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-pink-400 hover:bg-pink-500/10 transition-all"
                    >
                      {copied === item.name ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-pink-300 text-sm italic mb-3">"{item.tagline}"</p>

                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-500 text-xs">{item.domain_suggestion}</span>
                    {item.style && (
                      <span className={STYLE_COLORS[item.style?.toLowerCase()] || 'badge-purple'}>
                        {item.style}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs">{item.reasoning}</p>
                </motion.div>
              ))}
            </div>

            {/* Tips & brand personality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.naming_tips?.length > 0 && (
                <div className="glass-card p-5 border border-pink-500/20">
                  <h3 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Naming Tips
                  </h3>
                  <ul className="space-y-2">
                    {result.naming_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-pink-400">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.brand_personality && (
                <div className="glass-card p-5 border border-purple-500/20">
                  <h3 className="font-semibold text-purple-400 mb-3">Brand Personality</h3>
                  <p className="text-slate-300 text-sm">{result.brand_personality}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <Type className="w-12 h-12 text-pink-400/30 mb-4" />
          <p className="text-slate-500">Enter your startup details to generate creative business names</p>
        </div>
      )}
    </div>
  )
}
