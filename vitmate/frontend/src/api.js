import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create a dedicated axios instance for all API calls
const api = axios.create({ baseURL: API })

// Interceptor: attach token from localStorage on EVERY request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vitmate_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Groups
export const getGroups = (filters = {}) => api.get('/groups', { params: filters })
export const getGroup = (id) => api.get(`/groups/${id}`)
export const createGroup = (data) => api.post('/groups', data)
export const joinGroup = (id) => api.post(`/groups/${id}/join`)
export const leaveGroup = (id) => api.post(`/groups/${id}/leave`)
export const deleteGroup = (id) => api.delete(`/groups/${id}`)

// Messages
export const getMessages = (groupId) => api.get(`/messages/${groupId}`)
export const sendMessage = (groupId, text) => api.post(`/messages/${groupId}`, { text })

// Auth
export const updateProfile = (data) => api.put('/auth/profile', data)