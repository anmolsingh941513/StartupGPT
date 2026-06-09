import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:     { type: String, required: true },
    role:             { type: String, enum: ['user', 'admin'], default: 'user' },
    lastLogin:        { type: Date, default: null },
    ideasCount:       { type: Number, default: 0 },
    predictionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const User = mongoose.model('User', userSchema)
