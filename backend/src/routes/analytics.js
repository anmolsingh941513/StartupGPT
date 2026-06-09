/**
 * Analytics Routes — /api/analytics
 * Aggregated stats from MongoDB collections.
 */
import { Router } from 'express'
import { StartupIdea } from '../models/StartupIdea.js'
import { Prediction } from '../models/Prediction.js'
import { Report } from '../models/Report.js'
import { User } from '../models/User.js'

const router = Router()

// ── GET /api/analytics/dashboard ─────────────────────────────────────────────

router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalIdeas,
      totalPredictions,
      totalReports,
      totalUsers,
      industryDist,
      riskDist,
      reportTypeDist,
      recentIdeas,
      avgProbability,
    ] = await Promise.all([
      StartupIdea.countDocuments(),
      Prediction.countDocuments(),
      Report.countDocuments(),
      User.countDocuments(),

      // Industry distribution from ideas
      StartupIdea.aggregate([
        { $group: { _id: '$input.industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // Risk level distribution from predictions
      Prediction.aggregate([
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      ]),

      // Report type distribution
      Report.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),

      // Last 5 ideas
      StartupIdea.find().sort({ createdAt: -1 }).limit(5).lean(),

      // Average prediction probability
      Prediction.aggregate([
        { $group: { _id: null, avg: { $avg: '$probability' } } },
      ]),
    ])

    return res.json({
      stats: {
        total_ideas:       totalIdeas,
        total_predictions: totalPredictions,
        total_reports:     totalReports,
        total_users:       totalUsers,
        avg_success_probability: avgProbability[0]?.avg
          ? Math.round(avgProbability[0].avg)
          : 0,
      },
      industry_distribution: industryDist.map(d => ({
        industry: d._id ?? 'Unknown',
        count:    d.count,
      })),
      risk_distribution: riskDist.map(d => ({
        risk_level: d._id ?? 'Unknown',
        count:      d.count,
      })),
      report_type_distribution: reportTypeDist.map(d => ({
        type:  d._id ?? 'Unknown',
        count: d.count,
      })),
      recent_ideas: recentIdeas,
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/analytics/trends ─────────────────────────────────────────────────

router.get('/trends', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days ?? '7', 10)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [ideaTrends, predictionTrends] = await Promise.all([
      StartupIdea.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Prediction.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            avgProbability: { $avg: '$probability' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    // Fill in missing days with 0
    const labels = []
    const ideaData = []
    const predData = []
    const probData = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const label = d.toISOString().slice(0, 10)
      labels.push(label)

      const ideaDay = ideaTrends.find(t => t._id === label)
      const predDay = predictionTrends.find(t => t._id === label)

      ideaData.push(ideaDay?.count ?? 0)
      predData.push(predDay?.count ?? 0)
      probData.push(predDay ? Math.round(predDay.avgProbability) : 0)
    }

    return res.json({ labels, ideas: ideaData, predictions: predData, avg_probability: probData })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/analytics/market-trends ─────────────────────────────────────────

router.get('/market-trends', (req, res) => {
  // Static market insights — replace with real data API in production
  res.json({
    trending_industries: [
      { name: 'AI & Machine Learning', growth: '+42%', score: 95 },
      { name: 'Climate Tech',          growth: '+38%', score: 88 },
      { name: 'HealthTech',            growth: '+31%', score: 82 },
      { name: 'EdTech',                growth: '+27%', score: 76 },
      { name: 'FinTech',               growth: '+24%', score: 72 },
    ],
    hot_business_models: [
      { model: 'SaaS',         adoption: 90 },
      { model: 'Marketplace',  adoption: 78 },
      { model: 'Subscription', adoption: 85 },
      { model: 'Freemium',     adoption: 70 },
    ],
    funding_landscape: {
      total_vc_2024: '$285B',
      avg_seed_round: '$2.1M',
      top_sectors: ['AI', 'Climate', 'Health', 'Fintech'],
    },
  })
})

export default router
