/**
 * Express application factory.
 */
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { config } from './config/index.js'
import { errorHandler } from './middleware/errorHandler.js'

import authRoutes      from './routes/auth.js'
import aiRoutes        from './routes/ai.js'
import mlRoutes        from './routes/ml.js'
import analyticsRoutes from './routes/analytics.js'

export function createApp() {
  const app = express()

  // ── Security & Parsing ──────────────────────────────────────────────────────
  app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))

  // ── Logging ─────────────────────────────────────────────────────────────────
  if (config.nodeEnv !== 'test') {
    app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'))
  }

  // ── Rate Limiting ────────────────────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  })
  app.use('/api/', limiter)

  // ── Health Check ─────────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'StartupGPT API is running', version: '1.0.0' })
  })

  // ── Routes ───────────────────────────────────────────────────────────────────
  app.use('/api/auth',      authRoutes)
  app.use('/api/ai',        aiRoutes)
  app.use('/api/ml',        mlRoutes)
  app.use('/api/analytics', analyticsRoutes)

  // ── 404 ──────────────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' })
  })

  // ── Error Handler ─────────────────────────────────────────────────────────────
  app.use(errorHandler)

  return app
}
