import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()

// ✅ BACKEND URL
const API = 'https://vitmate.onrender.com'

// ✅ LOAD TOKEN ON START (VERY IMPORTANT)
const token = localStorage.getItem('vitmate_token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [tokenState, setToken] = useState(token)

  // =========================
  // 🔐 REGISTER
  // =========================
  const register = async (formData) => {
    const payload = {
      name: formData.name,
      registerNumber: formData.regNo,
      branch: formData.branch,
      year: formData.year,
      rank: formData.rank,
      password: formData.password
    }

    const { data } = await axios.post(`${API}/api/auth/register`, payload)

    // ✅ SAVE TOKEN
    localStorage.setItem('vitmate_token', data.token)

    // ✅ SET GLOBAL HEADER
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

    setToken(data.token)
    setUser(data.user)

    return data
  }

  // =========================
  // 🔐 LOGIN
  // =========================
  const login = async (regNo, password) => {
    const { data } = await axios.post(`${API}/api/auth/login`, {
      registerNumber: regNo,
      password
    })

    // ✅ SAVE TOKEN
    localStorage.setItem('vitmate_token', data.token)

    // ✅ SET GLOBAL HEADER
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

    setToken(data.token)
    setUser(data.user)

    return data
  }

  // =========================
  // 🚪 LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem('vitmate_token')

    // ❌ REMOVE HEADER
    delete axios.defaults.headers.common['Authorization']

    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token: tokenState, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)