import mongoose from 'mongoose'

const startupIdeaSchema = new mongoose.Schema(
  {
    type:   { type: String, default: 'idea_generation' },
    input:  { type: mongoose.Schema.Types.Mixed },
    output: { type: mongoose.Schema.Types.Mixed },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

startupIdeaSchema.index({ createdAt: -1 })
startupIdeaSchema.index({ 'input.industry': 1 })

export const StartupIdea = mongoose.model('StartupIdea', startupIdeaSchema)
