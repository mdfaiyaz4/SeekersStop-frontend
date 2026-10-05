import api from './api.js'

export async function createCompany(company) {
  const response = await api.post('/company', company)
  return response.data
}

export async function getCompany() {
  const response = await api.get('/company')
  return response.data
}

export async function updateCompany(company) {
  const response = await api.put('/company', company)
  return response.data
}
