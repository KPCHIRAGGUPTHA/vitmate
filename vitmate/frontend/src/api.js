import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Groups
export const getGroups = (filters = {}) => axios.get(`${API}/groups`, { params: filters })
export const getGroup = (id) => axios.get(`${API}/groups/${id}`)
export const createGroup = (data) => axios.post(`${API}/groups`, data)
export const joinGroup = (id) => axios.post(`${API}/groups/${id}/join`)
export const leaveGroup = (id) => axios.post(`${API}/groups/${id}/leave`)
export const deleteGroup = (id) => axios.delete(`${API}/groups/${id}`)

// Messages
export const getMessages = (groupId) => axios.get(`${API}/messages/${groupId}`)
export const sendMessage = (groupId, text) => axios.post(`${API}/messages/${groupId}`, { text })

// Auth
export const updateProfile = (data) => axios.put(`${API}/auth/profile`, data)
