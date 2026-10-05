import axios from 'axios'
import { clearStoredToken, getStoredToken } from '../utils/tokenStorage.js'

export const AUTH_UNAUTHORIZED_EVENT = 'seekersstop:unauthorized'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required. Set it in the frontend environment before starting the app.')
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    config._hadAuthToken = true
  } else {
    delete config.headers.Authorization
    config._hadAuthToken = false
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?._hadAuthToken) {
      clearStoredToken()
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)

export default api
