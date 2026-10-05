import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService.js'
import { AUTH_UNAUTHORIZED_EVENT } from '../services/api.js'
import { decodeJwt } from '../utils/jwt.js'
import { clearStoredToken, getStoredToken } from '../utils/tokenStorage.js'

const AuthContext = createContext(null)

function readStoredAuth() {
  const storedToken = getStoredToken()
  const decodedUser = storedToken ? decodeJwt(storedToken) : null
  const valid = Boolean(storedToken && decodedUser?.username && decodedUser?.role)

  return {
    token: valid ? storedToken : null,
    user: valid ? decodedUser : null,
    invalidToken: Boolean(storedToken && !valid),
  }
}

export function AuthProvider({ children }) {
  const [initialAuth] = useState(readStoredAuth)
  const [token, setToken] = useState(initialAuth.token)
  const [user, setUser] = useState(initialAuth.user)
  const [loading] = useState(false)

  const clearAuthState = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (initialAuth.invalidToken) {
      clearStoredToken()
    }

    const handleUnauthorized = () => clearAuthState()
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [clearAuthState, initialAuth])

  const login = useCallback(async (username, password) => {
    const receivedToken = await authService.login(username, password)
    const decodedUser = decodeJwt(receivedToken)
    if (!decodedUser?.username || !decodedUser?.role) {
      authService.logout()
      throw new Error('The login token does not contain a username and role.')
    }
    setToken(receivedToken)
    setUser(decodedUser)
    return decodedUser
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    clearAuthState()
  }, [clearAuthState])

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    loading,
  }), [user, token, login, logout, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
