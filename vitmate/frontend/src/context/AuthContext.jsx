import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

// ✅ Production backend URL
const API = 'https://vitmate.onrender.com'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('vitmate_token'))

  // ✅ Set axios auth header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // ✅ Load user
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await axios.get(`${API}/me`) // adjust if needed
        setUser(data)
      } catch {
        localStorage.removeItem('vitmate_token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [token])

  // ✅ REGISTER (FIXED FIELD NAMES)
  const register = async (formData) => {
    const payload = {
      name: formData.name,
      registerNumber: formData.regNo,   // 🔥 FIX HERE
      branch: formData.branch,
      year: formData.year,
      rank: formData.rank,
      password: formData.password
    }

    const { data } = await axios.post(`${API}/register`, payload)

    localStorage.setItem('vitmate_token', data.token)
    setToken(data.token)
    setUser(data)

    return data
  }

  // ✅ LOGIN
  const login = async (regNo, password) => {
    const { data } = await axios.post(`${API}/login`, {
      registerNumber: regNo,  // optional: match backend
      password
    })

    localStorage.setItem('vitmate_token', data.token)
    setToken(data.token)
    setUser(data)

    return data
  }

  // ✅ LOGOUT
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