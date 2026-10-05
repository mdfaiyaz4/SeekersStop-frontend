import { useEffect, useState } from 'react'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import Input from '../../components/Input.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import { createRecruiterProfile, getRecruiterProfile, updateRecruiterProfile } from '../../services/recruiterService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './ProfilePage.css'

const EMPTY_PROFILE = { name: '', contact: '' }
const CONTACT_PATTERN = /^[6-9]\d{9}$/

function toFormValues(profile) {
  return { name: profile?.name ?? '', contact: profile?.contact ?? '' }
}

export default function ProfilePage() {
  const [state, setState] = useState({ status: 'loading', profile: null, error: '' })
  const [form, setForm] = useState(EMPTY_PROFILE)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let active = true
    getRecruiterProfile()
      .then((profile) => {
        if (!active) return
        setForm(toFormValues(profile))
        setState({ status: 'ready', profile, error: '' })
      })
      .catch((error) => {
        if (!active) return
        if (error.response?.status === 404) {
          setForm({ ...EMPTY_PROFILE })
          setState({ status: 'new', profile: null, error: '' })
          return
        }
        setState({ status: 'error', profile: null, error: getApiErrorMessage(error, 'Your recruiter profile could not be loaded. Please try again.') })
      })
    return () => { active = false }
  }, [reloadCount])

  const hasProfile = state.status === 'ready' && Boolean(state.profile)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setFeedback('')
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.contact.trim()) next.contact = 'Contact is required.'
    else if (!CONTACT_PATTERN.test(form.contact.trim())) next.contact = 'Enter a valid 10-digit contact number.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')
    setFeedback('')
    if (!validate()) return

    const payload = { name: form.name.trim(), contact: form.contact.trim() }
    setIsSubmitting(true)
    try {
      const saved = hasProfile ? await updateRecruiterProfile(payload) : await createRecruiterProfile(payload)
      setForm(toFormValues(saved))
      setState({ status: 'ready', profile: saved, error: '' })
      setFeedback(hasProfile ? 'Your recruiter profile has been updated.' : 'Your recruiter profile has been created.')
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Your recruiter profile could not be saved. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (state.status === 'loading') {
    return <Card className="recruiter-form-state"><LoadingSpinner label="Loading your recruiter profile" size="large" /></Card>
  }

  if (state.status === 'error') {
    return (
      <div className="recruiter-form-page">
        <header className="recruiter-form-page__header"><span className="recruiter-form-page__eyebrow">YOUR ACCOUNT</span><h1>Recruiter profile</h1></header>
        <Card className="recruiter-form-state recruiter-form-state--error">
          <ErrorMessage title="Profile unavailable" message={state.error} />
          <Button type="button" variant="secondary" onClick={() => setReloadCount((count) => count + 1)}>Try again</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="recruiter-form-page">
      <header className="recruiter-form-page__header">
        <span className="recruiter-form-page__eyebrow">YOUR ACCOUNT</span>
        <h1>Recruiter profile</h1>
        <p>Keep your contact information up to date.</p>
      </header>
      <Card className="recruiter-form-card">
        <div className="recruiter-form-card__heading">
          <h2>{hasProfile ? 'Profile information' : 'Create your profile'}</h2>
          <p>{hasProfile ? 'Update the name and contact information on your profile.' : 'Add your name and contact information to get started.'}</p>
        </div>
        {submitError && <ErrorMessage title="Unable to save profile" message={submitError} />}
        {feedback && <div className="recruiter-form-feedback" role="status">{feedback}</div>}
        <form className="recruiter-form" onSubmit={handleSubmit} noValidate>
          <Input id="recruiter-name" name="name" label="Name" autoComplete="name" value={form.name} onChange={handleChange} error={errors.name} required />
          <Input id="recruiter-contact" name="contact" label="Contact number" type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} value={form.contact} onChange={handleChange} error={errors.contact} required />
          <div className="recruiter-form__actions">
            <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting && <span className="button-spinner" aria-hidden="true" />}
              {isSubmitting ? 'Saving...' : hasProfile ? 'Save Changes' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
