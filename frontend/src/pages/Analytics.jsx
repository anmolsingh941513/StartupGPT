import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { LineChart, RefreshCw, TrendingUp, BarChart3, PieChart, Lightbulb, Brain, FileText, Clock } from 'lucide-react'
import PageHeader from '../components/UI/PageHeader'
import StatCard from '../components/UI/StatCard'
import { analyticsAPI, aiAPI, mlAPI } from '../api/client'

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
)

// Shared chart options
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
    },
    tooltip: {
      backgroundColor: '#1a1a35',
      borderColor: 'rgba(99,102,241,0.3)',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
    }
  },
  scales: {
    x: {
      ticks: { color: '#64748b' },
      grid: { color: 'rgba(255,255,255,0.05)' }
    },
    y: {
      ticks: { color: '#64748b' },
      grid: { color: 'rgba(255,255,255,0.05)' }
    }
  }
}

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null)
  const [trends, setTrends] = useState(null)
  const [history, setHistory] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [dashRes, trendRes, histRes, predRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getMarketTrends(),
        aiAPI.getHistory(),
        mlAPI.getPredictions(),
      ])
      setDashboard(dashRes.data)
      setTrends(trendRes.data)
      setHistory(histRes.data.ideas ?? [])
      setPredictions(predRes.data.predictions ?? [])
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // ── Chart data builders ──────────────────────────────────────────────────
  const industryChartData = dashboard?.industry_distribution?.length > 0 ? {
    labels: dashboard.industry_distribution.map(d => d.industry),
    datasets: [{
      label: 'Ideas Generated',
      data: dashboard.industry_distribution.map(d => d.count),
      backgroundColor: [
        'rgba(99,102,241,0.7)', 'rgba(139,92,246,0.7)', 'rgba(59,130,246,0.7)',
        'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)', 'rgba(236,72,153,0.7)',
        'rgba(6,182,212,0.7)', 'rgba(239,68,68,0.7)',
      ],
      borderRadius: 8,
      borderSkipped: false,
    }]
  } : null

  const riskChartData = dashboard?.risk_distribution?.length > 0 ? {
    labels: dashboard.risk_distribution.map(d => d.risk_level),
    datasets: [{
      data: dashboard.risk_distribution.map(d => d.count),
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
      borderColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 2,
    }]
  } : null

  const trendChartData = trends?.trending_industries?.length > 0 ? {
    labels: trends.trending_industries.map(t => t.name),
    datasets: [
      {
        label: 'Growth Score',
        data: trends.trending_industries.map(t => t.score),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
      },
    ]
  } : null

  const dailyChartData = dashboard?.recent_ideas?.length > 0 ? {
    labels: dashboard.recent_ideas.map((_, i) => `Entry ${i + 1}`),
    datasets: [{
      label: 'Ideas',
      data: dashboard.recent_ideas.map(() => 1),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.15)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
    }]
  } : null

  const summary = dashboard?.stats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          icon={LineChart}
          title="Analytics Dashboard"
          subtitle="Visual insights into your startup ecosystem activity"
          color="text-cyan-400"
        />
        <button
          onClick={fetchData}
          className="btn-secondary flex items-center gap-2 h-10"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={LineChart}   label="Ideas Generated"    value={summary?.total_ideas ?? '—'}       color="text-yellow-400" delay={0.1} />
        <StatCard icon={TrendingUp}  label="Predictions Run"    value={summary?.total_predictions ?? '—'} color="text-emerald-400" delay={0.2} />
        <StatCard icon={BarChart3}   label="Reports Created"    value={summary?.total_reports ?? '—'}     color="text-blue-400" delay={0.3} />
        <StatCard icon={PieChart}    label="Avg Success Score"
          value={summary?.avg_success_probability ? `${summary.avg_success_probability}%` : '—'}
          color="text-brand-400" delay={0.4}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market trends line chart */}
        <motion.div
          className="lg:col-span-2 glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Market Trend Scores
          </h3>
          <div className="h-64">
            {trendChartData ? (
              <Line data={trendChartData} options={baseOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                {loading ? 'Loading...' : 'No trend data available'}
              </div>
            )}
          </div>
        </motion.div>

        {/* Risk distribution doughnut */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-orange-400" /> Risk Distribution
          </h3>
          <div className="h-64">
            {riskChartData ? (
              <Doughnut
                data={riskChartData}
                options={{
                  ...baseOptions,
                  scales: undefined,
                  cutout: '65%',
                  plugins: {
                    ...baseOptions.plugins,
                    legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16 } }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                {loading ? 'Loading...' : 'No prediction data yet'}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry distribution bar chart */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-400" /> Ideas by Industry
          </h3>
          <div className="h-64">
            {industryChartData ? (
              <Bar data={industryChartData} options={baseOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                {loading ? 'Loading...' : 'No idea data yet — generate some ideas!'}
              </div>
            )}
          </div>
        </motion.div>

        {/* Daily predictions line chart */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <LineChart className="w-4 h-4 text-emerald-400" /> Predictions (Last 7 Days)
          </h3>
          <div className="h-64">
            {dailyChartData ? (
              <Line data={dailyChartData} options={baseOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                {loading ? 'Loading...' : 'No recent prediction data'}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Report types */}
      {dashboard?.report_type_distribution?.length > 0 && (
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-semibold text-white mb-4">Report Breakdown</h3>
          <div className="flex flex-wrap gap-3">
            {dashboard.report_type_distribution.map(({ type, count }) => (
              <div key={type} className="glass-card px-4 py-3 border border-white/10 flex items-center gap-3">
                <span className="text-2xl font-bold text-white">{count}</span>
                <span className="text-slate-400 text-sm capitalize">{type?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Idea search history */}
        <motion.div className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" /> Idea Search History
          </h3>
          {history.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              {loading ? 'Loading...' : 'No searches yet — try the Idea Generator!'}
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {history.map((item, i) => (
                <div key={item._id ?? i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-600/40 border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">
                      {item.input?.industry ?? 'General'} · {item.input?.skills?.slice(0, 35) ?? item.input?.interests?.slice(0, 35) ?? 'Idea search'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {item.input?.budget && <span className="text-xs text-slate-500">Budget: {item.input.budget}</span>}
                      {item.input?.interests && <span className="text-xs text-slate-500 truncate max-w-[150px]">"{item.input.interests.slice(0, 30)}"</span>}
                      <span className="text-xs text-slate-600 ml-auto">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Prediction history */}
        <motion.div className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-emerald-400" /> Prediction History
          </h3>
          {predictions.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              {loading ? 'Loading...' : 'No predictions yet — try the Success Predictor!'}
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {predictions.map((pred, i) => {
                const riskColors = {
                  Low: 'text-emerald-400 bg-emerald-500/20',
                  Medium: 'text-amber-400 bg-amber-500/20',
                  High: 'text-red-400 bg-red-500/20'
                }
                const rc = riskColors[pred.riskLevel] ?? 'text-slate-400 bg-slate-500/20'
                return (
                  <div key={pred._id ?? i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-600/40 border border-white/5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">
                        {pred.input?.industry ?? '—'} · {pred.input?.business_model ?? '—'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {pred.input?.budget ?? ''} · Team: {pred.input?.team_size ?? '—'} · {pred.createdAt ? new Date(pred.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-sm font-bold text-white">{pred.probability ?? 0}%</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${rc}`}>
                        {pred.riskLevel ?? 'Unknown'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  )
}
