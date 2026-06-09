/**
 * ML Routes — /api/ml
 * Startup success prediction using weighted scoring model.
 */
import { Router } from 'express'
import { predictSuccess, getModelInfo } from '../services/predictionService.js'
import { Prediction } from '../models/Prediction.js'

const router = Router()

const REQUIRED_FIELDS = [
  'industry', 'business_model', 'budget', 'team_size',
  'market_size_score', 'innovation_score', 'founder_experience',
  'has_mvp', 'has_traction', 'competition_level',
]

// ── POST /api/ml/predict ──────────────────────────────────────────────────────

router.post('/predict', async (req, res, next) => {
  try {
    const missing = REQUIRED_FIELDS.filter(f => req.body?.[f] === undefined)
    if (missing.length)
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` })

    const result = predictSuccess(req.body)

    await Prediction.create({
      input:       req.body,
      output:      result,
      riskLevel:   result.risk_level,
      probability: result.probability,
    })

    return res.json(result)
  } catch (err) {
    next(err)
  }
})

// ── GET /api/ml/model-info ────────────────────────────────────────────────────

router.get('/model-info', (req, res) => {
  res.json(getModelInfo())
})

// ── GET /api/ml/predictions ───────────────────────────────────────────────────

router.get('/predictions', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? '20', 10), 100)
    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(limit).lean()
    return res.json({ predictions, total: predictions.length })
  } catch (err) {
    next(err)
  }
})

export default router
