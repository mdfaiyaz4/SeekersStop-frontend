import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import RoleSidebar from '../components/RoleSidebar.jsx'

const links = [
  { label: 'Dashboard', to: '/recruiter', icon: 'dashboard' },
  { label: 'Company', to: '/recruiter/company', icon: 'company' },
  { label: 'Post Job', to: '/recruiter/jobs/new', icon: 'plus' },
  { label: 'Jobs', to: '/recruiter/jobs', icon: 'briefcase' },
  { label: 'Applications', to: '/recruiter/applications', icon: 'application' },
  { label: 'Profile', to: '/recruiter/profile', icon: 'user' },
  { label: 'Logout', to: '/', icon: 'logout' },
]

function RecruiterLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="workspace-shell">
    <header className="workspace-header">
      <button className="mobile-menu-toggle workspace-menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="recruiter-sidebar" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
      <Link className="brand" to="/"><span className="brand__mark">S</span><span>Seekers<span className="brand__accent">Stop</span></span></Link>
      <span className="workspace-header__role">Recruiter</span>
    </header>
    <div className="workspace-body">
      <RoleSidebar id="recruiter-sidebar" title="Recruiter" links={links} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <main className="workspace-main"><Outlet /></main>
    </div>
  </div>
}

export default RecruiterLayout
