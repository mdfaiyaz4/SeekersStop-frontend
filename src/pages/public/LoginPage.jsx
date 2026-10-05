import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import Input from '../../components/Input.jsx'
import useAuth from '../../hooks/useAuth.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { getPostLoginDestination } from '../../routes/routeAccess.js'
import './LoginPage.css'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const errors = {
    username: submitted && !username.trim() ? 'Enter your username.' : '',
    password: submitted && !password ? 'Enter your password.' : '',
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    if (!username.trim() || !password) return

    setServerError('')
    setIsSubmitting(true)
    login(username.trim(), password)
      .then((user) => {
        const destination = getPostLoginDestination(user.role, location.state?.from)
        if (!destination) {
          setServerError('Your account has an unrecognized role. Please contact support.')
          return
        }
        navigate(destination, { replace: true })
      })
      .catch((error) => setServerError(getApiErrorMessage(error, 'Unable to log in. Check your details and try again.')))
      .finally(() => setIsSubmitting(false))
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-card__intro">
          <span className="login-card__symbol" aria-hidden="true">S</span>
          <span className="section-kicker">WELCOME BACK</span>
          <h1>Log in to SeekersStop</h1>
          <p>Continue your journey toward the right opportunity.</p>
        </div>

        {serverError && <ErrorMessage title="Login failed" message={serverError} />}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="username"
            name="username"
            label="Username"
            type="text"
            placeholder="Enter your username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={errors.username}
          />

          <div className="login-password-field">
            <Input
              id="password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
            />
            <button
              className="login-password-toggle"
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <Button className="login-submit" type="submit" size="large" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <span className="button-spinner" aria-hidden="true" />}
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <p className="login-register-prompt">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
        <Link className="login-home-link" to="/">&larr; Back to Home</Link>
      </Card>

      <p className="login-page__note">A thoughtful next step can make all the difference.</p>
    </div>
  )
}

export default LoginPage
