import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Button from './Button.jsx'

function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Link className="brand" to="/" aria-label="SeekersStop home">
          <span className="brand__mark">S</span><span>Seekers<span className="brand__accent">Stop</span></span>
        </Link>
        <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
        <nav className={`public-nav${menuOpen ? ' public-nav--open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/jobs" onClick={() => setMenuOpen(false)}>Find Jobs</NavLink>
          <NavLink to="/how-it-works" onClick={() => setMenuOpen(false)}>How It Works</NavLink>
          <NavLink to="/help" onClick={() => setMenuOpen(false)}>Help</NavLink>
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
