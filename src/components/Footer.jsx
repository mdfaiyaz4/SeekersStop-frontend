import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link className="brand brand--footer" to="/">
          <span className="brand__mark">S</span><span>Seekers<span className="brand__accent">Stop</span></span>
        </Link>
        <nav className="footer-nav" aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/jobs">Find Jobs</Link>
          <Link to="/about">About</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/help">Help</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
        <span className="site-footer__copyright">&copy; {new Date().getFullYear()} SeekersStop</span>
      </div>
    </footer>
  )
}

export default Footer
