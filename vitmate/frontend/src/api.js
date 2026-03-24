import axios from 'axios'

// ✅ BACKEND URL
const API = 'https://vitmate.onrender.com'

// ✅ CREATE AXIOS INSTANCE
const api = axios.create({
  baseURL: API
})

// ✅ ADD TOKEN TO EVERY REQUEST
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vitmate_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// =====================
// 🔐 AUTH APIs
// =====================

export const registerUser = (data) => {
  return api.post('/api/auth/register', data)
}

export const loginUser = (data) => {
  return api.post('/api/auth/login', data)
}

// =====================
// 👥 GROUP APIs
// =====================

export const getGroups = () => {
  return api.get('/api/groups')
}

export const createGroup = (form) => {
  return api.post('/api/groups', {
    title: form.title,
    roomType: form.roomType,
    block: form.block,
    description: form.description
  })
}

export const joinGroup = (groupId) => {
  return api.post(`/api/groups/${groupId}/join`)
}

export const leaveGroup = (groupId) => {
  return api.post(`/api/groups/${groupId}/leave`)
}

export const getGroup = (groupId) => {
  return api.get(`/api/groups/${groupId}`)
}

// =====================
// 💬 MESSAGE APIs
// =====================

export const getMessages = (groupId) => {
  return api.get(`/api/messages/${groupId}`)
}

export const sendMessage = (groupId, text) => {
  return api.post(`/api/messages/${groupId}`, { text })
}