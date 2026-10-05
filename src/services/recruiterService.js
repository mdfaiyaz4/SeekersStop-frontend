import api from './api.js'

export async function createRecruiterProfile(profile) {
  const response = await api.post('/recruiter/profile', profile)
  return response.data
}

export async function getRecruiterProfile() {
  const response = await api.get('/recruiter/profile')
  return response.data
}

export async function updateRecruiterProfile(profile) {
  const response = await api.put('/recruiter/profile', profile)
  return response.data
}
