/**
 * Axios API client — pre-configured for StartupGPT backend
 */
import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sgpt_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Something went wrong'
    toast.error(message)
    return Promise.reject(error)
  }
)

// ─── AI Endpoints ────────────────────────────────────────────────────────────
export const aiAPI = {
  generateIdeas:         (data) => api.post('/ai/generate-ideas', data),
  swotAnalysis:          (data) => api.post('/ai/swot-analysis', data),
  investorPitch:         (data) => api.post('/ai/investor-pitch', data),
  competitorAnalysis:    (data) => api.post('/ai/competitor-analysis', data),
  businessNames:         (data) => api.post('/ai/business-names', data),
  generateRoadmap:       (data) => api.post('/ai/roadmap', data),
  getMarketTrends:       (data) => api.post('/ai/market-trends', data),
  getHistory:            ()     => api.get('/ai/history'),
}

// ─── ML Endpoints ────────────────────────────────────────────────────────────
export const mlAPI = {
  predict:        (data) => api.post('/ml/predict', data),
  getModelInfo:   ()     => api.get('/ml/model-info'),
  getPredictions: ()     => api.get('/ml/predictions'),
}

// ─── Analytics Endpoints ─────────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard:   () => api.get('/analytics/dashboard'),
  getMarketTrends:() => api.get('/analytics/market-trends'),
}

// ─── Auth Endpoints ──────────────────────────────────────────────────────────
export const authAPI = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  getProfile:    ()     => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

export default api
