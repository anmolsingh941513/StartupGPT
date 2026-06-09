/**
 * Centralised configuration — reads from environment variables.
 */
import 'dotenv/config'

export const config = {
  port:       parseInt(process.env.PORT ?? '5000', 10),
  nodeEnv:    process.env.NODE_ENV ?? 'development',
  mongoUri:   process.env.MONGO_URI ?? 'mongodb://localhost:27017/startupgpt',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map(s => s.trim()),

  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model:  process.env.GEMINI_MODEL  ?? 'gemini-2.5-flash-lite',
  },

  jwt: {
    secret:    process.env.JWT_SECRET    ?? 'jwt-dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
}
