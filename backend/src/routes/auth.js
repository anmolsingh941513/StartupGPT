/**
 * Auth Routes — /api/auth
 * register · login · profile (protected)
 */
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { config } from '../config/index.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, name: user.name, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  )
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {}

    if (!name?.trim() || !email?.trim() || !password)
      return res.status(400).json({ error: 'name, email and password are required' })

    const cleanName  = name.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!EMAIL_RE.test(cleanEmail))
      return res.status(400).json({ error: 'Invalid email format' })
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    if (cleanName.length < 2 || cleanName.length > 100)
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters' })

    const existing = await User.findOne({ email: cleanEmail })
    if (existing)
      return res.status(409).json({ error: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name: cleanName, email: cleanEmail, passwordHash })

    const token = signToken(user)
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {}

    if (!email?.trim() || !password)
      return res.status(400).json({ error: 'Email and password are required' })

    const cleanEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: cleanEmail })

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: 'Invalid email or password' })

    user.lastLogin = new Date()
    await user.save()

    const token = signToken(user)
    return res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /api/auth/profile (protected) ────────────────────────────────────────

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body ?? {}
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (name?.trim()) {
      if (name.trim().length < 2 || name.trim().length > 100)
        return res.status(400).json({ error: 'Name must be between 2 and 100 characters' })
      user.name = name.trim()
    }

    if (email?.trim()) {
      const cleanEmail = email.trim().toLowerCase()
      if (!EMAIL_RE.test(cleanEmail))
        return res.status(400).json({ error: 'Invalid email format' })
      const existing = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } })
      if (existing) return res.status(409).json({ error: 'Email already in use' })
      user.email = cleanEmail
    }

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ error: 'Current password is required to set a new one' })
      const valid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })
      if (newPassword.length < 8)
        return res.status(400).json({ error: 'New password must be at least 8 characters' })
      user.passwordHash = await bcrypt.hash(newPassword, 12)
    }

    await user.save()
    const token = signToken(user)
    return res.json({
      message: 'Profile updated',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/auth/profile (protected) ────────────────────────────────────────

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'User not found' })

    return res.json({
      id:               user._id,
      name:             user.name,
      email:            user.email,
      role:             user.role,
      createdAt:        user.createdAt,
      lastLogin:        user.lastLogin,
      ideasCount:       user.ideasCount,
      predictionsCount: user.predictionsCount,
    })
  } catch (err) {
    next(err)
  }
})

export default router
