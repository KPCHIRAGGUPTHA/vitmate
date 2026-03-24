import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const API = 'https://vitmate.onrender.com'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('vitmate_token'))

  // ✅ REGISTER
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

    localStorage.setItem('vitmate_token', data.token)
    setToken(data.token)
    setUser(data.user)

    return data
  }

  // ✅ LOGIN
  const login = async (regNo, password) => {
    const { data } = await axios.post(`${API}/api/auth/login`, {
      registerNumber: regNo,
      password
    })

    localStorage.setItem('vitmate_token', data.token)
    setToken(data.token)
    setUser(data.user)

    return data
  }

  const logout = () => {
    localStorage.removeItem('vitmate_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)