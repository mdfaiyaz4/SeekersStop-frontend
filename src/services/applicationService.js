import api from './api.js'

export async function getMyApplications() {
  const response = await api.get('/applications/my')
  return response.data
}

export async function getApplicationById(applicationId) {
  const response = await api.get(`/applications/${encodeURIComponent(applicationId)}`)
  return response.data
}

export async function applyForJob(jobId) {
  const response = await api.post('/applications', { jobId })
  return response.data
}

export async function getRecruiterApplications() {
  const response = await api.get('/applications/recruiter')
  return response.data
}

export async function getApplicationResume(applicationId) {
  const response = await api.get(`/applications/${encodeURIComponent(applicationId)}/resume`, {
    responseType: 'blob',
  })
  return response.data
}

export async function updateApplicationStatus(applicationId, applicationStatus) {
  const response = await api.patch(`/applications/${encodeURIComponent(applicationId)}/status`, {
    applicationStatus,
  })
  return response.data
}

export async function withdrawApplication(applicationId) {
  const response = await api.patch(`/applications/${encodeURIComponent(applicationId)}/withdraw`)
  return response.data
}
