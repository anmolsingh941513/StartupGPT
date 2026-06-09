/**
 * SettingsContext
 * All settings are persisted to localStorage and applied immediately as side-effects.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const SettingsContext = createContext(null)

const STORAGE_KEY = 'sgpt_settings'

const DEFAULTS = {
  // Appearance
  theme:          'dark',    // 'dark' | 'light' | 'system'
  accentColor:    'brand',
  compactSidebar: false,
  animations:     true,

  // Notifications
  emailNotifs:   true,
  ideaAlerts:    true,
  predAlerts:    true,
  weeklyDigest:  false,

  // Privacy
  saveHistory:   true,
  usageAnalytics: true,
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch { return { ...DEFAULTS } }
}

function save(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}

// Resolve 'system' → actual dark/light
function resolveTheme(theme) {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyTheme(theme, animations) {
  const resolved = resolveTheme(theme)
  const html = document.documentElement
  html.setAttribute('data-theme', resolved)
  html.setAttribute('data-animations', animations ? 'on' : 'off')
}

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(load)

  // Apply on mount + whenever settings change
  useEffect(() => {
    applyTheme(settings.theme, settings.animations)
  }, [settings.theme, settings.animations])

  // Listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (settings.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system', settings.animations)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [settings.theme, settings.animations])

  const updateSettings = useCallback((patch) => {
    setSettingsState(prev => {
      const next = { ...prev, ...patch }
      save(next)
      return next
    })
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
