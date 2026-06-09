import mongoose from 'mongoose'

const predictionSchema = new mongoose.Schema(
  {
    input:       { type: mongoose.Schema.Types.Mixed },
    output:      { type: mongoose.Schema.Types.Mixed },
    riskLevel:   { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    probability: { type: Number, default: 0 },
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

predictionSchema.index({ createdAt: -1 })
predictionSchema.index({ riskLevel: 1 })

export const Prediction = mongoose.model('Prediction', predictionSchema)
