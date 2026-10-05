import { Outlet } from 'react-router-dom'
import PublicNavbar from '../components/PublicNavbar.jsx'
import Footer from '../components/Footer.jsx'

function PublicLayout() {
  return <div className="public-shell">
    <PublicNavbar />
    <main className="public-main"><Outlet /></main>
    <Footer />
  </div>
}

export default PublicLayout
