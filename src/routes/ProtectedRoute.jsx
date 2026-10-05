import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import useAuth from '../hooks/useAuth.js'
import { getRouteAccessDecision } from './routeAccess.js'
import './routeGuards.css'

function RouteAccess({ requiredRole }) {
  const auth = useAuth()
  const location = useLocation()
  const decision = getRouteAccessDecision({ ...auth, requiredRole })

  if (decision.type === 'loading') {
    return <div className="route-loading"><LoadingSpinner label="Checking your session" size="large" /></div>
  }
  if (decision.type === 'login') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (decision.type === 'role-redirect') {
    return <Navigate to={decision.to} replace />
  }
  return <Outlet />
}

export function ProtectedRoute() {
  return <RouteAccess />
}

export function RoleRoute({ role }) {
  return <RouteAccess requiredRole={role} />
}
