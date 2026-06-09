import { createPortal } from 'react-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Bell, Shield, Palette, Globe,
  Check, Moon, Sun, Laptop
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettings } from '../../context/SettingsContext'

const SECTIONS = ['Appearance', 'Notifications', 'Privacy', 'About']

const SECTION_ICONS = { Appearance: Palette, Notifications: Bell, Privacy: Shield, About: Globe }

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
        value ? 'bg-brand-500' : 'bg-dark-400 border border-white/10'
      }`}
      role="switch"
      aria-checked={value}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
        value ? 'left-6' : 'left-1'
      }`} />
    </button>
  )
}

function Row({ label, sub, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

const ACCENT_OPTIONS = [
  { key: 'brand',   color: 'bg-indigo-500',  hex: '#6366f1' },
  { key: 'purple',  color: 'bg-purple-500',  hex: '#8b5cf6' },
  { key: 'cyan',    color: 'bg-cyan-500',    hex: '#06b6d4' },
  { key: 'emerald', color: 'bg-emerald-500', hex: '#10b981' },
  { key: 'amber',   color: 'bg-amber-500',   hex: '#f59e0b' },
  { key: 'rose',    color: 'bg-rose-500',    hex: '#f43f5e' },
]

export default function SettingsModal({ open, onClose }) {
  const { settings, updateSettings } = useSettings()
  const [section, setSection] = useState('Appearance')

  const set = (key) => (val) => updateSettings({ [key]: val })

  const handleSave = () => {
    toast.success('Settings saved!')
    onClose()
  }

  if (!open) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          className="relative w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          style={{ background: 'rgba(18,18,30,0.99)', maxHeight: '85vh' }}
          initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
            <h2 className="text-base font-semibold text-white">Settings</h2>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-44 border-r border-white/5 flex-shrink-0 py-3 space-y-0.5 px-2">
              {SECTIONS.map((s) => {
                const Icon = SECTION_ICONS[s]
                return (
                  <button key={s} onClick={() => setSection(s)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      section === s
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {s}
                  </button>
                )
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">

              {/* ── APPEARANCE ────────────────────────────────────── */}
              {section === 'Appearance' && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Display</p>

                  {/* Theme */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-slate-200 mb-3">Theme</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'dark',   label: 'Dark',   Icon: Moon,   preview: 'bg-slate-900' },
                        { key: 'light',  label: 'Light',  Icon: Sun,    preview: 'bg-slate-100' },
                        { key: 'system', label: 'System', Icon: Laptop, preview: 'bg-gradient-to-r from-slate-900 to-slate-100' },
                      ].map(({ key, label, Icon, preview }) => (
                        <button key={key} onClick={() => set('theme')(key)}
                          className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                            settings.theme === key
                              ? 'border-brand-500/60 bg-brand-500/10 text-brand-300'
                              : 'border-white/10 bg-dark-700/40 text-slate-400 hover:border-white/20 hover:bg-dark-700/60'
                          }`}>
                          {/* Mini preview swatch */}
                          <div className={`w-10 h-6 rounded-md ${preview} border border-white/10 flex items-center justify-center`}>
                            <Icon className="w-3 h-3 text-white/70" />
                          </div>
                          <span className="text-xs font-medium">{label}</span>
                          {settings.theme === key && (
                            <span className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      {settings.theme === 'light' && '☀️ Light mode is active — page background is now white'}
                      {settings.theme === 'dark'  && '🌙 Dark mode is active'}
                      {settings.theme === 'system'&& '💻 Follows your OS setting'}
                    </p>
                  </div>

                  {/* Accent color */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-slate-200 mb-3">Accent Color</p>
                    <div className="flex gap-3 flex-wrap">
                      {ACCENT_OPTIONS.map(({ key, color, hex }) => (
                        <button key={key} onClick={() => set('accentColor')(key)}
                          title={key}
                          className={`w-8 h-8 rounded-full ${color} transition-all duration-200 ${
                            settings.accentColor === key
                              ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-dark-800 scale-110'
                              : 'hover:scale-105 opacity-70 hover:opacity-100'
                          }`}>
                          {settings.accentColor === key && (
                            <Check className="w-3.5 h-3.5 text-white mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      Selected: <span className="text-slate-400 capitalize">{settings.accentColor}</span>
                    </p>
                  </div>

                  {/* Toggles */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Layout & Motion</p>
                    <Row label="Compact Sidebar" sub="Collapse sidebar to icon-only view">
                      <Toggle value={settings.compactSidebar} onChange={set('compactSidebar')} />
                    </Row>
                    <Row label="Animations" sub="Page transitions and motion effects">
                      <Toggle value={settings.animations} onChange={set('animations')} />
                    </Row>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS ─────────────────────────────────── */}
              {section === 'Notifications' && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Alerts & Emails</p>
                  <p className="text-xs text-slate-600 mb-4">Controls which toast notifications appear while using the app.</p>

                  <div>
                    <Row
                      label="All Notifications"
                      sub="Master switch — disables all alerts below when off"
                    >
                      <Toggle value={settings.emailNotifs} onChange={set('emailNotifs')} />
                    </Row>
                    <Row
                      label="Idea Generation Alerts"
                      sub="Toast when idea generation completes"
                    >
                      <Toggle
                        value={settings.ideaAlerts && settings.emailNotifs}
                        onChange={(v) => set('ideaAlerts')(v)}
                      />
                    </Row>
                    <Row
                      label="Prediction Alerts"
                      sub="Toast when ML prediction finishes"
                    >
                      <Toggle
                        value={settings.predAlerts && settings.emailNotifs}
                        onChange={(v) => set('predAlerts')(v)}
                      />
                    </Row>
                    <Row
                      label="Weekly Digest"
                      sub="Email summary of your activity every Monday"
                    >
                      <Toggle value={settings.weeklyDigest} onChange={set('weeklyDigest')} />
                    </Row>
                  </div>

                  {/* Live preview */}
                  <div className="mt-5 p-4 rounded-xl bg-dark-700/40 border border-white/5">
                    <p className="text-xs font-semibold text-slate-400 mb-3">Preview — click to test</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => settings.ideaAlerts && settings.emailNotifs
                          ? toast.success('💡 Idea generation complete!')
                          : toast.error('Idea alerts are disabled')
                        }
                        className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium hover:bg-yellow-500/20 transition-colors"
                      >
                        Test Idea Alert
                      </button>
                      <button
                        onClick={() => settings.predAlerts && settings.emailNotifs
                          ? toast.success('🧠 Prediction complete!')
                          : toast.error('Prediction alerts are disabled')
                        }
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                      >
                        Test Prediction Alert
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PRIVACY ───────────────────────────────────────── */}
              {section === 'Privacy' && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Data & Privacy</p>
                  <div>
                    <Row label="Save Search History" sub="Store idea searches in MongoDB for Analytics">
                      <Toggle value={settings.saveHistory} onChange={set('saveHistory')} />
                    </Row>
                    <Row label="Usage Analytics" sub="Help improve StartupGPT with anonymous usage data">
                      <Toggle value={settings.usageAnalytics} onChange={set('usageAnalytics')} />
                    </Row>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <p className="text-sm font-semibold text-red-400 mb-1">Danger Zone</p>
                    <p className="text-xs text-slate-500 mb-3">
                      Permanently delete all your stored data — ideas, predictions, and reports. This cannot be undone.
                    </p>
                    <button
                      onClick={() => toast.error('Data deletion requires account verification — contact support.')}
                      className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                    >
                      Delete All My Data
                    </button>
                  </div>
                </div>
              )}

              {/* ── ABOUT ─────────────────────────────────────────── */}
              {section === 'About' && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">App Info</p>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-700/40 border border-white/5 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">StartupGPT</p>
                      <p className="text-xs text-slate-500">AI Startup Ecosystem · v1.0.0</p>
                    </div>
                  </div>

                  {[
                    { label: 'Version',    value: '1.0.0' },
                    { label: 'AI Model',   value: 'Gemini 2.5 Flash Lite' },
                    { label: 'ML Engine',  value: 'Weighted Scoring Model v1.0' },
                    { label: 'Backend',    value: 'Node.js + Express + MongoDB' },
                    { label: 'Frontend',   value: 'React + Vite + Tailwind CSS' },
                    { label: 'Current Theme', value: settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1) },
                    { label: 'Animations', value: settings.animations ? 'Enabled' : 'Disabled' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="text-sm font-medium text-slate-200">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between flex-shrink-0">
            <p className="text-xs text-slate-600">Changes apply instantly</p>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                Close
              </button>
              <button onClick={handleSave}
                className="btn-primary px-5 py-2 text-sm">
                <Check className="w-3.5 h-3.5" /> Save & Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
