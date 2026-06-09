/**
 * AppStateContext
 * Persists form inputs and AI results for every page across navigation.
 * Uses sessionStorage so state survives tab refreshes but clears on new session.
 */
import { createContext, useContext, useState, useCallback } from 'react'

const AppStateContext = createContext(null)

// Default state for every page
const DEFAULTS = {
  ideaGenerator:      { form: { interests: '', skills: '', budget: '', industry: '' }, result: null, expandedIdea: 0 },
  swotAnalysis:       { form: { startup_title: '', description: '', industry: '' }, result: null },
  investorPitch:      { form: { startup_title: '', description: '', target_audience: '', revenue_model: '', funding_needed: '' }, result: null },
  competitorAnalysis: { form: { startup_title: '', industry: '', description: '' }, result: null },
  businessNames:      { form: { industry: '', description: '', keywords: '' }, result: null },
  roadmap:            { form: { startup_idea: '', industry: '', budget: '', team_size: '', timeline: '' }, result: null, expandedPhase: 0 },
  marketTrends:       { form: { industry: '', region: '', focus: '' }, result: null },
  successPredictor:   {
    form: {
      industry: '', business_model: '', budget: '', team_size: '',
      market_size_score: 5, innovation_score: 5, founder_experience: 3,
      has_mvp: false, has_traction: false, competition_level: 5,
    },
    result: null,
  },
}

// Load from sessionStorage on init
function loadFromSession() {
  try {
    const saved = sessionStorage.getItem('startupgpt_appstate')
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function AppStateProvider({ children }) {
  const [state, setState] = useState(loadFromSession)

  const setPageState = useCallback((page, updates) => {
    setState(prev => {
      const next = {
        ...prev,
        [page]: { ...prev[page], ...updates },
      }
      // Persist to sessionStorage
      try { sessionStorage.setItem('startupgpt_appstate', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const clearPage = useCallback((page) => {
    setState(prev => {
      const next = { ...prev, [page]: { ...DEFAULTS[page] } }
      try { sessionStorage.setItem('startupgpt_appstate', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  return (
    <AppStateContext.Provider value={{ state, setPageState, clearPage }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function usePageState(page) {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('usePageState must be used within AppStateProvider')
  return {
    pageState:    ctx.state[page],
    setPageState: (updates) => ctx.setPageState(page, updates),
    clearPage:    () => ctx.clearPage(page),
  }
}
