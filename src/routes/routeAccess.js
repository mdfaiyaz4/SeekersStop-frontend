import { getRoleHome } from '../utils/roles.js'

export function getRouteAccessDecision({ loading, isAuthenticated, user, requiredRole }) {
  if (loading) return { type: 'loading' }
  if (!isAuthenticated || !user) return { type: 'login' }
  if (requiredRole && user.role !== requiredRole) {
    return { type: 'role-redirect', to: getRoleHome(user.role) ?? '/' }
  }
  return { type: 'allow' }
}

export function getPostLoginDestination(role, requestedLocation) {
  const roleHome = getRoleHome(role)
  if (!roleHome) return null

  const requestedPath = requestedLocation?.pathname
  if (requestedPath === roleHome || requestedPath?.startsWith(`${roleHome}/`)) {
    return {
      pathname: requestedPath,
      search: requestedLocation.search || '',
      hash: requestedLocation.hash || '',
    }
  }
  return roleHome
}
