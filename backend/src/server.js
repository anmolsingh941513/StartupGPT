/**
 * StartupGPT — Node.js/Express server entry point.
 */
import { createApp } from './app.js'
import { connectDB } from './db/connection.js'
import { config } from './config/index.js'

async function start() {
  await connectDB()

  const app = createApp()

  app.listen(config.port, () => {
    console.log(`🚀  StartupGPT API running on http://localhost:${config.port}`)
    console.log(`📡  Environment: ${config.nodeEnv}`)
    console.log(`🤖  Gemini model: ${config.gemini.model}`)
    console.log(`🔑  Gemini API key: ${config.gemini.apiKey ? '✅ loaded' : '❌ missing'}`)
  })
}

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
