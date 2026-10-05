import api from './api.js'

export async function createProfile(profile, cv) {
  const formData = new FormData()
  formData.append('profile', new Blob([JSON.stringify(profile)], { type: 'application/json' }))
  formData.append('cv', cv)

  const response = await api.post('/jobseeker/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function getProfile() {
  const response = await api.get('/jobseeker/profile')
  return response.data
}

export async function updateProfile(profile) {
  const response = await api.put('/jobseeker/profile', profile)
  return response.data
}

export async function getCV() {
  const response = await api.get('/jobseeker/cv', { responseType: 'blob' })
  return response.data
}

export async function updateCV(cv) {
  const formData = new FormData()
  formData.append('cv', cv)

  // Leave Content-Type unset so Axios/the browser can add the multipart boundary.
  const response = await api.put('/jobseeker/cv', formData, {
    headers: { 'Content-Type': undefined },
  })
  return response.data
}
