import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import RoleSidebar from '../components/RoleSidebar.jsx'

const links = [
  { label: 'Dashboard', to: '/seeker', icon: 'dashboard' },
  { label: 'Find Jobs', to: '/seeker/jobs', icon: 'search' },
  { label: 'My Applications', to: '/seeker/applications', icon: 'application' },
  { label: 'Profile', to: '/seeker/profile', icon: 'user' },
  { label: 'Resume', to: '/seeker/resume', icon: 'resume' },
  { label: 'Logout', to: '/', icon: 'logout' },
]

function SeekerLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="workspace-shell">
    <header className="workspace-header">
      <button className="mobile-menu-toggle workspace-menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="seeker-sidebar" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
      <Link className="brand" to="/"><span className="brand__mark">S</span><span>Seekers<span className="brand__accent">Stop</span></span></Link>
      <span className="workspace-header__role">Job seeker</span>
    </header>
    <div className="workspace-body">
      <RoleSidebar id="seeker-sidebar" title="Job seeker" links={links} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <main className="workspace-main"><Outlet /></main>
    </div>
  </div>
}

export default SeekerLayout
