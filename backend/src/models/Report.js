import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    type:   { type: String, required: true }, // swot | pitch | competitor | names
    input:  { type: mongoose.Schema.Types.Mixed },
    output: { type: mongoose.Schema.Types.Mixed },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

reportSchema.index({ createdAt: -1 })
reportSchema.index({ type: 1 })

export const Report = mongoose.model('Report', reportSchema)
