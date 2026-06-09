/**
 * MongoDB connection via Mongoose.
 */
import mongoose from 'mongoose'
import { config } from '../config/index.js'

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri)
    console.log(`✅  MongoDB connected: ${mongoose.connection.host}`)
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message)
    process.exit(1)
  }
}
