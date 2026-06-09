import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Lock, Eye, EyeOff, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../api/client'

export default function EditProfileModal({ open, onClose }) {
  const { user, updateUser } = useAuth()

  const [tab, setTab]         = useState('info')   // 'info' | 'password'
  const [loading, setLoading] = useState(false)

  const [info, setInfo] = useState({ name: user?.name ?? '', email: user?.email ?? '' })
  const [pw, setPw]     = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, next: false })

  const setI = (k) => (e) => setInfo(p => ({ ...p, [k]: e.target.value }))
  const setP = (k) => (e) => setPw(p =>  ({ ...p, [k]: e.target.value }))

  const saveInfo = async (e) => {
    e.preventDefault()
    if (!info.name.trim() || !info.email.trim()) { toast.error('Name and email are required'); return }
    setLoading(true)
    try {
      const res = await authAPI.updateProfile({ name: info.name.trim(), email: info.email.trim() })
      updateUser(res.data.user)
      if (res.data.token) localStorage.setItem('sgpt_token', res.data.token)
      toast.success('Profile updated!')
      onClose()
    } catch { } finally { setLoading(false) }
  }

  const savePw = async (e) => {
    e.preventDefault()
    if (!pw.current || !pw.next || !pw.confirm) { toast.error('Fill in all password fields'); return }
    if (pw.next !== pw.confirm) { toast.error('New passwords do not match'); return }
    if (pw.next.length < 8) { toast.error('New password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await authAPI.updateProfile({ currentPassword: pw.current, newPassword: pw.next })
      toast.success('Password changed!')
      setPw({ current: '', next: '', confirm: '' })
      onClose()
    } catch { } finally { setLoading(false) }
  }

  // initials from name
  const initials = (user?.name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  if (!open) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Panel */}
        <motion.div
          className="relative w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{ background: 'rgba(18,18,30,0.98)' }}
          initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-base font-semibold text-white">Edit Profile</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center pt-6 pb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">{initials}</span>
            </div>
            <p className="text-white font-semibold mt-3">{user?.name}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>

          {/* Tabs */}
          <div className="flex mx-6 mt-4 gap-1 p-1 bg-dark-700/60 rounded-xl">
            {[['info', 'Profile Info'], ['password', 'Change Password']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === key
                    ? 'bg-brand-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Forms */}
          <div className="px-6 py-5">
            {tab === 'info' ? (
              <form onSubmit={saveInfo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <input type="text" className="input-field" value={info.name} onChange={setI('name')}
                    placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input type="email" className="input-field" value={info.email} onChange={setI('email')}
                    placeholder="you@example.com" required />
                </div>
                <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <form onSubmit={savePw} className="space-y-4">
                {[
                  { key: 'current', label: 'Current Password', field: 'current' },
                  { key: 'next',    label: 'New Password',     field: 'next' },
                  { key: 'confirm', label: 'Confirm New Password', field: 'confirm', noToggle: true },
                ].map(({ key, label, field, noToggle }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> {label}
                    </label>
                    <div className="relative">
                      <input
                        type={!noToggle && showPw[field] ? 'text' : 'password'}
                        className="input-field pr-11"
                        placeholder="••••••••"
                        value={pw[field]}
                        onChange={setP(field)}
                        required
                      />
                      {!noToggle && (
                        <button type="button"
                          onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                          {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
