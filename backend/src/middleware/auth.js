/**
 * JWT authentication middleware.
 * Attaches decoded payload to req.user.
 */
import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' })
  }

  const token = authHeader.slice(7)
  try {
    req.user = jwt.verify(token, config.jwt.secret)
    next()
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token'
    return res.status(401).json({ error: message })
  }
}
