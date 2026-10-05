import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import Input from '../../components/Input.jsx'
import { register as registerAccount } from '../../services/authService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './LoginPage.css'
import './RegisterPage.css'

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  const errors = {
    username: submitted && !username.trim() ? 'Enter a username.' : '',
    password: submitted && !password ? 'Enter a password.' : '',
    confirmPassword: submitted && !confirmPassword
      ? 'Confirm your password.'
      : submitted && password !== confirmPassword
        ? 'Passwords do not match.'
        : '',
    role: submitted && !role ? 'Choose a role.' : '',
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    if (!username.trim() || !password || !confirmPassword || password !== confirmPassword || !role) return

    setServerError('')
    setIsSubmitting(true)
    registerAccount(username.trim(), password, role)
      .then(() => navigate('/login', { replace: true, state: { registered: true } }))
      .catch((error) => setServerError(getApiErrorMessage(error, 'Unable to create your account. Please try again.')))
      .finally(() => setIsSubmitting(false))
  }

  return (
    <div className="login-page register-page">
      <Card className="login-card register-card">
        <div className="login-card__intro">
          <span className="login-card__symbol" aria-hidden="true">S</span>
          <span className="section-kicker">GET STARTED</span>
          <h1>Create your account</h1>
          <p>Join SeekersStop and take the next step in your career journey.</p>
        </div>

        {serverError && <ErrorMessage title="Registration failed" message={serverError} />}

        <form className="login-form register-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="register-username"
            name="username"
            label="Username"
            type="text"
            placeholder="Choose a username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={errors.username}
          />

          <div className="register-password-field">
            <Input
              id="register-password"
              name="password"
              label="Password"
              type={showPasswords ? 'text' : 'password'}
              placeholder="Create a password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
            />
            <button
              className="register-password-toggle"
              type="button"
              aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
              aria-pressed={showPasswords}
              onClick={() => setShowPasswords((visible) => !visible)}
            >
              {showPasswords ? 'Hide' : 'Show'}
            </button>
          </div>

          <Input
            id="register-confirm-password"
            label="Confirm password"
            type={showPasswords ? 'text' : 'password'}
            placeholder="Enter your password again"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={errors.confirmPassword}
          />

          <div className="field register-role-field">
            <label className="field__label" htmlFor="register-role">I am joining as</label>
            <select
              id="register-role"
              name="role"
              className={`field__input register-role-select${errors.role ? ' field__input--error' : ''}`}
              aria-invalid={Boolean(errors.role)}
              aria-describedby={errors.role ? 'register-role-error' : undefined}
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="">Select your role</option>
              <option value="JOB_SEEKER">Job Seeker</option>
              <option value="RECRUITER">Recruiter</option>
            </select>
            {errors.role && <span className="field__error" id="register-role-error">{errors.role}</span>}
          </div>

          <Button className="login-submit" type="submit" size="large" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <span className="button-spinner" aria-hidden="true" />}
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="login-register-prompt">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <Link className="login-home-link" to="/">&larr; Back to Home</Link>
      </Card>

      <p className="login-page__note">Start with a profile that reflects where you want to go.</p>
    </div>
  )
}

export default RegisterPage
