import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import RoleSidebar from '../components/RoleSidebar.jsx'

const links = [
  { label: 'Dashboard', to: '/recruiter', icon: 'D' },
  { label: 'Company', to: '/recruiter/company', icon: 'C' },
  { label: 'Post Job', to: '/recruiter/jobs/new', icon: '+' },
  { label: 'Manage Jobs', to: '/recruiter/jobs', icon: 'J' },
  { label: 'Applications', to: '/recruiter/applications', icon: 'A' },
  { label: 'Profile', to: '/recruiter/profile', icon: 'P' },
  { label: 'Logout', to: '/', icon: 'L' },
]

function RecruiterLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="workspace-shell">
    <header className="workspace-header">
      <button className="mobile-menu-toggle workspace-menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
      <Link className="brand" to="/"><span className="brand__mark">S</span><span>Seekers<span className="brand__accent">Stop</span></span></Link>
      <span className="workspace-header__role">Recruiter</span>
    </header>
    <div className="workspace-body">
      <RoleSidebar title="Recruiter" links={links} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <main className="workspace-main"><Outlet /></main>
    </div>
  </div>
}

export default RecruiterLayout
