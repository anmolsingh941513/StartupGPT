import { Routes, Route, Navigate } from 'react-router-dom'
import { AppStateProvider } from './context/AppStateContext'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import IdeaGenerator from './pages/IdeaGenerator'
import SuccessPredictor from './pages/SuccessPredictor'
import SwotAnalysis from './pages/SwotAnalysis'
import InvestorPitch from './pages/InvestorPitch'
import CompetitorAnalysis from './pages/CompetitorAnalysis'
import BusinessNames from './pages/BusinessNames'
import Analytics from './pages/Analytics'
import Roadmap from './pages/Roadmap'
import MarketTrends from './pages/MarketTrends'
import History from './pages/History'

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppStateProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected app routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"           element={<Dashboard />} />
            <Route path="idea-generator"      element={<IdeaGenerator />} />
            <Route path="success-predictor"   element={<SuccessPredictor />} />
            <Route path="swot-analysis"       element={<SwotAnalysis />} />
            <Route path="investor-pitch"      element={<InvestorPitch />} />
            <Route path="competitor-analysis" element={<CompetitorAnalysis />} />
            <Route path="business-names"      element={<BusinessNames />} />
            <Route path="analytics"           element={<Analytics />} />
            <Route path="roadmap"             element={<Roadmap />} />
            <Route path="market-trends"       element={<MarketTrends />} />
            <Route path="history"             element={<History />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppStateProvider>
    </AuthProvider>
    </SettingsProvider>
  )
}
