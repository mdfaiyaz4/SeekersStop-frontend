import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import RoleSidebar from '../components/RoleSidebar.jsx'

const links = [
  { label: 'Dashboard', to: '/seeker', icon: 'D' },
  { label: 'Find Jobs', to: '/seeker/jobs', icon: 'J' },
  { label: 'My Applications', to: '/seeker/applications', icon: 'A' },
  { label: 'Profile', to: '/seeker/profile', icon: 'P' },
  { label: 'Resume', to: '/seeker/resume', icon: 'R' },
  { label: 'Logout', to: '/', icon: 'L' },
]

function SeekerLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="workspace-shell">
    <header className="workspace-header">
      <button className="mobile-menu-toggle workspace-menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
      <Link className="brand" to="/"><span className="brand__mark">S</span><span>Seekers<span className="brand__accent">Stop</span></span></Link>
      <span className="workspace-header__role">Job seeker</span>
    </header>
    <div className="workspace-body">
      <RoleSidebar title="Job seeker" links={links} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <main className="workspace-main"><Outlet /></main>
    </div>
  </div>
}

export default SeekerLayout
