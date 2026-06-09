/**
 * AuthContext — JWT auth state, persisted in localStorage.
 */
import { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

function loadAuth() {
  try {
    const token = localStorage.getItem('sgpt_token')
    const user  = JSON.parse(localStorage.getItem('sgpt_user') ?? 'null')
    return token && user ? { token, user } : null
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadAuth)

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token, user } = res.data
    localStorage.setItem('sgpt_token', token)
    localStorage.setItem('sgpt_user', JSON.stringify(user))
    setAuth({ token, user })
    return user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await authAPI.register({ name, email, password })
    const { token, user } = res.data
    localStorage.setItem('sgpt_token', token)
    localStorage.setItem('sgpt_user', JSON.stringify(user))
    setAuth({ token, user })
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sgpt_token')
    localStorage.removeItem('sgpt_user')
    setAuth(null)
  }, [])

  const updateUser = useCallback((updatedUser) => {
    localStorage.setItem('sgpt_user', JSON.stringify(updatedUser))
    setAuth(prev => ({ ...prev, user: updatedUser }))
  }, [])

  return (
    <AuthContext.Provider value={{ auth, user: auth?.user ?? null, token: auth?.token ?? null, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
