import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

// ✅ FIXED API URL (NO localhost, NO /api)
const API = 'https://vitmate.onrender.com'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('vitmate_token'))

  // ✅ Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // ✅ Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await axios.get(`${API}/me`) // adjust if needed
        setUser(data)
      } catch (err) {
        localStorage.removeItem('vitmate_token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [token])

  // ✅ REGISTER (FIXED ROUTE)
  const register = async (formData) => {
    const { data } = await axios.post(`${API}/register`, formData)
    localStorage.setItem('vitmate_token', data.token)
    setToken(data.token)
    setUser(data)
    return data
  }

  // ✅ LOGIN (FIXED ROUTE)
  const login = async (regNo, password) => {
    const { data } = await axios.post(`${API}/login`, { regNo, password })
    localStorage.setItem('vitmate_token', data.token)
    setToken(data.token)
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('vitmate_token')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, token, register, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)