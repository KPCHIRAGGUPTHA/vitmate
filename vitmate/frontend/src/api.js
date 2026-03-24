
import axios from 'axios'

// ✅ BACKEND URL
const API = 'https://vitmate.onrender.com'

// =====================
// 🔐 AUTH APIs
// =====================

// Register
export const registerUser = (data) => {
  return axios.post(`${API}/api/auth/register`, data)
}

// Login
export const loginUser = (data) => {
  return axios.post(`${API}/api/auth/login`, data)
}

// Get current user
export const getMe = () => {
  return axios.get(`${API}/api/auth/me`)
}

// =====================
// 👥 GROUP APIs
// =====================

// Get all groups
export const getGroups = () => {
  return axios.get(`${API}/api/groups`)
}

// Create group
export const createGroup = (form) => {
  return axios.post(`${API}/api/groups`, {
    title: form.title,
    roomType: form.roomType,
    block: form.block,
    description: form.description
  })
}

// Join group
export const joinGroup = (groupId) => {
  return axios.post(`${API}/api/groups/${groupId}/join`)
}

// Leave group
export const leaveGroup = (groupId) => {
  return axios.post(`${API}/api/groups/${groupId}/leave`)
}

// Get single group
export const getGroup = (groupId) => {
  return axios.get(`${API}/api/groups/${groupId}`)
}

// =====================
// 💬 MESSAGE APIs
// =====================

export const getMessages = (groupId) => {
  return axios.get(`${API}/api/messages/${groupId}`)
}

export const sendMessage = (groupId, text) => {
  return axios.post(`${API}/api/messages/${groupId}`, { text })
}