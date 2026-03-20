import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tabunganqu_user')
    const token = localStorage.getItem('tabunganqu_token')
    return saved && token ? JSON.parse(saved) : null
  })

  const login = useCallback(async (email, password, captchaToken) => {
    try {
      console.log('Login attempt:', { email })
      
      const response = await api.post('/auth/login', { email, password, captchaToken })
      console.log('Login response:', response.data)
      
      const { user, token } = response.data.data
      
      localStorage.setItem('tabunganqu_user', JSON.stringify(user))
      localStorage.setItem('tabunganqu_token', token)
      setUser(user)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      
      // Tangani berbagai jenis error
      if (error.response) {
        // Server merespon dengan error
        const status = error.response.status
        const message = error.response.data?.message || 'Login gagal'
        const errors = error.response.data?.errors
        
        if (status === 401) {
          return { 
            success: false, 
            message: 'Email atau password salah' 
          }
        } else if (status === 404) {
          return { 
            success: false, 
            message: 'Email tidak terdaftar' 
          }
        } else if (errors) {
          // Validation errors
          const errorMessages = errors.map(err => err.message).join(', ')
          return { success: false, message: errorMessages }
        } else {
          return { success: false, message }
        }
      } else if (error.request) {
        // Request dibuat tapi tidak ada response
        return { 
          success: false, 
          message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' 
        }
      } else {
        // Error lainnya
        return { 
          success: false, 
          message: 'Terjadi kesalahan. Silakan coba lagi.' 
        }
      }
    }
  }, [])

  // FUNGSI REGISTER
  const register = useCallback(async (name, email, password, captchaToken) => {
    try {
      console.log('Register attempt:', { name, email })
      
      const response = await api.post('/auth/register', { name, email, password, captchaToken })
      console.log('Register response:', response.data)
      
      const { user, token } = response.data.data
      
      localStorage.setItem('tabunganqu_user', JSON.stringify(user))
      localStorage.setItem('tabunganqu_token', token)
      setUser(user)
      
      return { success: true }
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message)
      
      if (error.response?.data?.errors) {
        const messages = error.response.data.errors.map(err => err.message).join(', ')
        return { success: false, message: messages }
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.' 
      }
    }
  }, [])

  // FUNGSI GOOGLE LOGIN
  const googleLogin = useCallback(async (credentialResponse) => {
    try {
      const response = await api.post('/auth/google', { credential: credentialResponse.credential })
      const { user, token } = response.data.data

      localStorage.setItem('tabunganqu_user', JSON.stringify(user))
      localStorage.setItem('tabunganqu_token', token)
      setUser(user)

      return { success: true }
    } catch (error) {
      console.error('Google login error:', error.response?.data || error.message)
      return {
        success: false,
        message: error.response?.data?.message || 'Login dengan Google gagal. Silakan coba lagi.'
      }
    }
  }, [])

  // FUNGSI LOGOUT
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('tabunganqu_user')
    localStorage.removeItem('tabunganqu_token')
  }, [])

  // FUNGSI UPDATE PROFILE
  const updateProfile = useCallback(async (updates) => {
    try {
      const response = await api.put('/auth/profile', updates)
      const updatedUser = response.data.data.user
      
      localStorage.setItem('tabunganqu_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message)
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update profil gagal.' 
      }
    }
  }, [])

  // FUNGSI DELETE ACCOUNT
  const deleteAccount = useCallback(async () => {
    try {
      await api.delete('/auth/account')
      logout() // Panggil fungsi logout
      return { success: true }
    } catch (error) {
      console.error('Delete account error:', error.response?.data || error.message)
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Hapus akun gagal.' 
      }
    }
  }, [logout]) // Tambah dependency logout

  // Value yang akan di-provide ke seluruh app
  const value = {
    user,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    deleteAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}