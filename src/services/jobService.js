import api from './api.js'

export async function createJob(jobData) {
  const response = await api.post('/jobs', jobData)
  return response.data
}

export async function updateJob(id, jobData) {
  const response = await api.put(`/jobs/${encodeURIComponent(id)}`, jobData)
  return response.data
}

export async function deactivateJob(id) {
  const response = await api.delete(`/jobs/deactive/${encodeURIComponent(id)}`)
  return response.data
}

export async function activateJob(id) {
  const response = await api.put(`/jobs/active/${encodeURIComponent(id)}`)
  return response.data
}

export async function getJobs({ title, location, experience, page = 0, size, sort } = {}) {
  const params = { page }
  if (Number.isInteger(size) && size > 0) params.size = size

  for (const [key, value] of Object.entries({ title, location, experience, sort })) {
    if (typeof value === 'string' && value.trim()) params[key] = value.trim()
  }

  const response = await api.get('/jobs', { params })
  return response.data
}

export async function getMyJobs({ page = 0, size, sort } = {}) {
  const params = { page }
  if (Number.isInteger(size) && size > 0) params.size = size
  if (typeof sort === 'string' && sort.trim()) params.sort = sort.trim()

  const response = await api.get('/jobs/my', { params })
  return response.data
}

export async function getAllMyJobs() {
  const pageSize = 100
  const firstPage = await getMyJobs({ page: 0, size: pageSize })
  if (!Array.isArray(firstPage?.content)) {
    throw new Error('The recruiter jobs response was not a paginated list.')
  }

  const totalPages = Number.isInteger(firstPage.totalPages) ? firstPage.totalPages : 1
  if (totalPages <= 1) return firstPage.content

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => getMyJobs({ page: index + 1, size: pageSize })),
  )
  if (remainingPages.some((page) => !Array.isArray(page?.content))) {
    throw new Error('A recruiter jobs page did not contain a valid list.')
  }

  return [firstPage, ...remainingPages].flatMap((page) => page.content)
}

export async function getJobById(id) {
  const response = await api.get(`/jobs/${encodeURIComponent(id)}`)
  return response.data
}
