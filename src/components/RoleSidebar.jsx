import { NavLink } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

function RoleSidebar({ title, links, open, onNavigate }) {
  const { logout } = useAuth()

  function handleNavigate(label) {
    if (label === 'Logout') logout()
    onNavigate?.()
  }

  return (
    <>
      {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onNavigate} />}
      <aside className={`app-sidebar${open ? ' app-sidebar--open' : ''}`}>
        <div className="app-sidebar__heading">{title}</div>
        <nav className="sidebar-nav" aria-label={`${title} navigation`}>
          {links.map(({ label, to, icon }) => (
            <NavLink key={to} to={to} end={to === '/seeker' || to === '/recruiter'} onClick={() => handleNavigate(label)} className={({ isActive }) => `sidebar-nav__link${isActive ? ' sidebar-nav__link--active' : ''}`}>
              <span className="sidebar-nav__icon" aria-hidden="true">{icon}</span><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note"><span className="sidebar-note__dot" />Your next opportunity starts here.</div>
      </aside>
    </>
  )
}

export default RoleSidebar
