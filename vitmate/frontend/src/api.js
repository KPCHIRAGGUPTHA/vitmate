import axios from 'axios'

const API = 'https://vitmate.onrender.com'

// ✅ GET GROUPS
export const getGroups = (params) => {
  return axios.get(`${API}/api/groups`, { params })
}

// ✅ CREATE GROUP (FIXED PAYLOAD)
export const createGroup = (form) => {
  const payload = {
    title: form.title,
    roomType: form.roomType,
    preferredBlock: form.block, // 🔥 FIX NAME
    description: form.description
  }

  return axios.post(`${API}/api/groups`, payload)
}