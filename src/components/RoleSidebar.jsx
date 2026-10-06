import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import NavigationIcon from './NavigationIcon.jsx'

function RoleSidebar({ title, id, links, open, onNavigate }) {
  const { logout } = useAuth()

  useEffect(() => {
    if (!open) return undefined

    function closeOnEscape(event) {
      if (event.key === 'Escape') onNavigate?.()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onNavigate, open])

  function handleNavigate(label) {
    if (label === 'Logout') logout()
    onNavigate?.()
  }

  return (
    <>
      {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onNavigate} />}
      <aside id={id} className={`app-sidebar${open ? ' app-sidebar--open' : ''}`} aria-label={`${title} workspace navigation`}>
        <div className="app-sidebar__heading">{title}</div>
        <nav className="sidebar-nav" aria-label={`${title} navigation`}>
          {links.map(({ label, to, icon }) => (
            <NavLink key={to} to={to} end={to === '/seeker' || to === '/recruiter'} onClick={() => handleNavigate(label)} className={({ isActive }) => `sidebar-nav__link${isActive ? ' sidebar-nav__link--active' : ''}`}>
              <NavigationIcon name={icon} className="sidebar-nav__icon" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note"><span className="sidebar-note__dot" />Your next opportunity starts here.</div>
      </aside>
    </>
  )
}

export default RoleSidebar
