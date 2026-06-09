/**
 * AI Routes — /api/ai
 * Gemini-powered: ideas · swot · pitch · competitor · names · history
 */
import { Router } from 'express'
import {
  generateStartupIdeas,
  generateSwotAnalysis,
  generateInvestorPitch,
  generateCompetitorAnalysis,
  generateBusinessNames,
  generateStartupRoadmap,
  generateMarketTrends,
} from '../services/geminiService.js'
import { StartupIdea } from '../models/StartupIdea.js'
import { Report } from '../models/Report.js'

const router = Router()

// ── POST /api/ai/generate-ideas ───────────────────────────────────────────────

router.post('/generate-ideas', async (req, res, next) => {
  try {
    const { interests, skills, budget, industry } = req.body ?? {}
    const missing = ['interests', 'skills', 'budget', 'industry'].filter(f => !req.body?.[f])
    if (missing.length)
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` })

    const result = await generateStartupIdeas({ interests, skills, budget, industry })

    await StartupIdea.create({ type: 'idea_generation', input: req.body, output: result })

    return res.json(result)
  } catch (err) {
    next(err)
  }
})

// ── POST /api/ai/swot-analysis ────────────────────────────────────────────────

router.post('/swot-analysis', async (req, res, next) => {
  try {
    const required = ['startup_idea', 'industry', 'target_market', 'business_model']
    const missing = required.filter(f => !req.body?.[f])
    if (missing.length)
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` })

    const result = await generateSwotAnalysis(req.body)

    await Report.create({ type: 'swot', input: req.body, output: result })

    return res.json(result)
  } catch (err) {
    next(err)
  }
})

// ── POST /api/ai/investor-pitch ───────────────────────────────────────────────

router.post('/investor-pitch', async (req, res, next) => {
  try {
    const required = ['startup_name', 'problem', 'solution', 'target_market', 'business_model', 'funding_needed']
    const missing = required.filter(f => !req.body?.[f])
    if (missing.length)
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` })

    const result = await generateInvestorPitch(req.body)

    await Report.create({ type: 'pitch', input: req.body, output: result })

    return res.json(result)
  } catch (err) {
    next(err)
  }
})

// ── POST /api/ai/competitor-analysis ─────────────────────────────────────────

router.post('/competitor-analysis', async (req, res, next) => {
  try {
    const required = ['startup_idea', 'industry', 'target_market', 'unique_features']
    const missing = required.filter(f => !req.body?.[f])
    if (missing.length)
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` })

    const result = await generateCompetitorAnalysis(req.body)

    await Report.create({ type: 'competitor', input: req.body, output: result })

    return res.json(result)
  } catch (err) {
    next(err)
  }
})

// ── POST /api/ai/business-names ───────────────────────────────────────────────

router.post('/business-names', async (req, res, next) => {
  try {
    const required = ['industry', 'description', 'target_audience', 'style']
    const missing = required.filter(f => !req.body?.[f])
    if (missing.length)
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` })

    const result = await generateBusinessNames(req.body)

    await Report.create({ type: 'names', input: req.body, output: result })

    return res.json(result)
  } catch (err) {
    next(err)
  }
})

// ── POST /api/ai/roadmap ──────────────────────────────────────────────────────

router.post('/roadmap', async (req, res, next) => {
  try {
    const required = ['startup_idea', 'industry', 'budget', 'team_size', 'timeline']
    const missing = required.filter(f => !req.body?.[f])
    if (missing.length)
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` })

    const result = await generateStartupRoadmap(req.body)
    await Report.create({ type: 'roadmap', input: req.body, output: result })
    return res.json(result)
  } catch (err) {
    next(err)
  }
})

// ── POST /api/ai/market-trends ────────────────────────────────────────────────

router.post('/market-trends', async (req, res, next) => {
  try {
    const required = ['industry', 'region', 'focus']
    const missing = required.filter(f => !req.body?.[f])
    if (missing.length)
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` })

    const result = await generateMarketTrends(req.body)
    await Report.create({ type: 'market_trends', input: req.body, output: result })
    return res.json(result)
  } catch (err) {
    next(err)
  }
})

// ── GET /api/ai/history ───────────────────────────────────────────────────────

router.get('/history', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? '20', 10), 100)
    const ideas = await StartupIdea.find().sort({ createdAt: -1 }).limit(limit).lean()
    return res.json({ ideas, total: ideas.length })
  } catch (err) {
    next(err)
  }
})

export default router
