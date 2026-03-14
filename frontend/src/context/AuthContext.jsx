import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

// Mock user for development
const MOCK_USER = {
  id: 1,
  name: 'Azka Mortaza',
  email: 'azka@email.com',
  avatar: null,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tabunganqu_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback((email, password) => {
    // Mock login — replace with real API
    if (email && password) {
      const userData = { ...MOCK_USER, email }
      setUser(userData)
      localStorage.setItem('tabunganqu_user', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, message: 'Email dan password harus diisi' }
  }, [])

  const register = useCallback((name, email, password) => {
    // Mock register — replace with real API
    if (name && email && password) {
      const userData = { ...MOCK_USER, name, email }
      setUser(userData)
      localStorage.setItem('tabunganqu_user', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, message: 'Semua field harus diisi' }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('tabunganqu_user')
  }, [])

  const deleteAccount = useCallback(() => {
    setUser(null)
    localStorage.removeItem('tabunganqu_user')
  }, [])

  const updateProfile = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('tabunganqu_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
