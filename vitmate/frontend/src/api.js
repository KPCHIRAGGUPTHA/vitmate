import axios from 'axios'

const API = 'https://vitmate.onrender.com'

// ✅ GET GROUPS
export const getGroups = (params) => {
  return axios.get(`${API}/api/groups`, { params })
}

// ✅ CREATE GROUP
export const createGroup = (form) => {
  const payload = {
    title: form.title,
    roomType: form.roomType,
    preferredBlock: form.block,
    description: form.description
  }

  return axios.post(`${API}/api/groups`, payload)
}

// ✅ JOIN GROUP (🔥 ADD THIS)
export const joinGroup = (groupId) => {
  return axios.post(`${API}/api/groups/${groupId}/join`)
}