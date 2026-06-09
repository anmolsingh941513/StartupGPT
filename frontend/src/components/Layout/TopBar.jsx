import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Menu, Sparkles, Settings, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import EditProfileModal from '../Auth/EditProfileModal'
import SettingsModal from '../Auth/SettingsModal'

// ─── Click-outside + Escape hook ─────────────────────────────────────────────
function useDropdownClose(ref, anchorRef, handler) {
  useEffect(() => {
    const onMouse = (e) => {
      if (
        ref.current && !ref.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) handler()
    }
    const onKey = (e) => { if (e.key === 'Escape') handler() }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onMouse); document.removeEventListener('keydown', onKey) }
  }, [ref, anchorRef, handler])
}

// ─── Portal dropdown ──────────────────────────────────────────────────────────
function DropdownPortal({ anchorRef, panelRef, children }) {
  const [pos, setPos] = useState({ top: 0, right: 0 })

  useEffect(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
  }, [anchorRef])

  return createPortal(
    <div ref={panelRef} style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}>
      {children}
    </div>,
    document.body
  )
}

// ─── Profile dropdown panel ───────────────────────────────────────────────────
function ProfilePanel({ user, onEditProfile, onSettings, onSignOut }) {
  const initials = (user?.name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="w-64 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
         style={{ background: 'rgba(18,18,30,0.98)', backdropFilter: 'blur(20px)' }}>

      {/* Avatar + info */}
      <div className="px-4 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'User'}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email ?? ''}</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-2.5 border-b border-white/5">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30">
          <Sparkles className="w-3 h-3" />
          {user?.role === 'admin' ? 'Admin' : 'Pro Plan'}
        </span>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <button onClick={onEditProfile}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-200 font-medium">Edit Profile</p>
            <p className="text-xs text-slate-500">Update your details</p>
          </div>
        </button>

        <button onClick={onSettings}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <Settings className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-200 font-medium">Settings</p>
            <p className="text-xs text-slate-500">Preferences & account</p>
          </div>
        </button>
      </div>

      {/* Sign out */}
      <div className="border-t border-white/5 py-1">
        <button onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-left group">
          <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500/20 flex items-center justify-center flex-shrink-0 transition-colors">
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400 transition-colors" />
          </div>
          <p className="text-sm text-slate-400 group-hover:text-red-400 font-medium transition-colors">Sign Out</p>
        </button>
      </div>
    </div>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [showProfile, setShowProfile]       = useState(false)
  const [showEditModal, setShowEditModal]   = useState(false)
  const [showSettings, setShowSettings]     = useState(false)

  const profileBtnRef = useRef(null)
  const profilePanelRef = useRef(null)

  const closeProfile = useCallback(() => setShowProfile(false), [])
  useDropdownClose(profilePanelRef, profileBtnRef, closeProfile)

  const initials = (user?.name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const handleSignOut = () => {
    setShowProfile(false)
    logout()
    navigate('/login', { replace: true })
  }

  const handleEditProfile = () => {
    setShowProfile(false)
    setShowEditModal(true)
  }

  const handleSettings = () => {
    setShowProfile(false)
    setShowSettings(true)
  }

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-dark-800/50 backdrop-blur-sm flex-shrink-0">
        {/* Left */}
        <button onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle sidebar">
          <Menu className="w-5 h-5" />
        </button>

        {/* Center */}
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>AI-Powered Startup Innovation Platform</span>
        </div>

        {/* Right — Profile only */}
        <button
          ref={profileBtnRef}
          onClick={() => setShowProfile(v => !v)}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-dark-600/50 border border-white/10 hover:border-brand-500/40 transition-all"
          aria-label="Profile menu"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">{initials}</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">{user?.name ?? 'Profile'}</p>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">{user?.email ?? ''}</p>
          </div>
        </button>

        {showProfile && (
          <DropdownPortal anchorRef={profileBtnRef} panelRef={profilePanelRef}>
            <ProfilePanel
              user={user}
              onEditProfile={handleEditProfile}
              onSettings={handleSettings}
              onSignOut={handleSignOut}
            />
          </DropdownPortal>
        )}
      </header>

      <EditProfileModal open={showEditModal} onClose={() => setShowEditModal(false)} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
