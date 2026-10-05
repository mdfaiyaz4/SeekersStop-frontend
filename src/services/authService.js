import api from './api.js'
import { clearStoredToken, storeToken } from '../utils/tokenStorage.js'

export async function login(username, password) {
  const response = await api.post('/auth/login', { username, password })
  const { token } = response.data
  if (typeof token !== 'string' || !token) {
    throw new Error('The login response did not include a token.')
  }
  storeToken(token)
  return token
}

export async function register(username, password, role) {
  const response = await api.post('/auth/register', { username, password, role })
  return response.data
}

export function logout() {
  clearStoredToken()
}
