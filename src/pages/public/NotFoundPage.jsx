import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import './NotFoundPage.css'

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <Card className="not-found-card">
        <span className="not-found-card__code" aria-hidden="true">404</span>
        <p className="not-found-card__eyebrow">PAGE NOT FOUND</p>
        <h1>Page Not Found</h1>
        <p className="not-found-card__message">
          We couldn’t find the page you’re looking for. Check the address or choose where to go next.
        </p>
        <div className="not-found-card__actions">
          <Button as={Link} to="/">Go to Home</Button>
          <Button as={Link} to="/jobs" variant="secondary">Browse Jobs</Button>
        </div>
      </Card>
    </div>
  )
}

export default NotFoundPage
