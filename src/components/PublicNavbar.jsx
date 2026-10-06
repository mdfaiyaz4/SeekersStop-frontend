import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Button from './Button.jsx'
import NavigationIcon from './NavigationIcon.jsx'

function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return undefined

    function closeOnEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Link className="brand brand--public" to="/">
          <img src="/assets/branding/seekersstop-logo.png" alt="SeekersStop" />
        </Link>
        <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
        <nav id="public-navigation" className={`public-nav${menuOpen ? ' public-nav--open' : ''}`} aria-label="Main navigation">
          <NavLink className={({ isActive }) => `public-nav__link${isActive ? ' active' : ''}`} to="/jobs" onClick={() => setMenuOpen(false)}>
            <NavigationIcon name="search" className="public-nav__icon" />Find Jobs
          </NavLink>
          <NavLink className={({ isActive }) => `public-nav__link${isActive ? ' active' : ''}`} to="/how-it-works" onClick={() => setMenuOpen(false)}>
            <NavigationIcon name="steps" className="public-nav__icon" />How It Works
          </NavLink>
          <NavLink className={({ isActive }) => `public-nav__link${isActive ? ' active' : ''}`} to="/about" onClick={() => setMenuOpen(false)}>
            <NavigationIcon name="info" className="public-nav__icon" />About
          </NavLink>
          <NavLink className={({ isActive }) => `public-nav__link${isActive ? ' active' : ''}`} to="/help" onClick={() => setMenuOpen(false)}>
            <NavigationIcon name="help" className="public-nav__icon" />Help
          </NavLink>
          <div className="public-nav__actions">
            <Link className="public-nav__login" to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Button as={Link} to="/register" size="small" onClick={() => setMenuOpen(false)}>Register</Button>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default PublicNavbar
