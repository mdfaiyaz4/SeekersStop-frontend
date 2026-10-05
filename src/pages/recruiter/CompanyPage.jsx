import { useEffect, useState } from 'react'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import Input from '../../components/Input.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import { createCompany, getCompany, updateCompany } from '../../services/companyService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './CompanyPage.css'

const EMPTY_COMPANY = { name: '', description: '', location: '', contact: '', website: '' }
const CONTACT_PATTERN = /^[6-9]\d{9}$/

function toFormValues(company) {
  return Object.fromEntries(Object.keys(EMPTY_COMPANY).map((field) => [field, company?.[field] ?? '']))
}

function TextAreaField({ id, name, label, value, onChange, error, required }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      <textarea id={id} name={name} className={`field__input company-form__textarea${error ? ' field__input--error' : ''}`} value={value} onChange={onChange} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} required={required} />
      {error && <span className="field__error" id={`${id}-error`}>{error}</span>}
    </div>
  )
}

export default function CompanyPage() {
  const [state, setState] = useState({ status: 'loading', company: null, error: '' })
  const [form, setForm] = useState(EMPTY_COMPANY)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let active = true
    getCompany()
      .then((company) => {
        if (!active) return
        setForm(toFormValues(company))
        setState({ status: 'ready', company, error: '' })
      })
      .catch((error) => {
        if (!active) return
        if (error.response?.status === 404) {
          setForm({ ...EMPTY_COMPANY })
          setState({ status: 'new', company: null, error: '' })
          return
        }
        setState({ status: 'error', company: null, error: getApiErrorMessage(error, 'Company information could not be loaded. Please try again.') })
      })
    return () => { active = false }
  }, [reloadCount])

  const hasCompany = state.status === 'ready' && Boolean(state.company)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setFeedback('')
  }

  function validate() {
    const next = {}
    for (const field of ['name', 'description', 'location', 'contact', 'website']) {
      if (!form[field].trim()) next[field] = 'This field is required.'
    }
    if (form.contact.trim() && !CONTACT_PATTERN.test(form.contact.trim())) {
      next.contact = 'Enter a valid 10-digit contact number.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')
    setFeedback('')
    if (!validate()) return

    const payload = Object.fromEntries(Object.keys(EMPTY_COMPANY).map((field) => [field, form[field].trim()]))
    setIsSubmitting(true)
    try {
      const saved = hasCompany ? await updateCompany(payload) : await createCompany(payload)
      setForm(toFormValues(saved))
      setState({ status: 'ready', company: saved, error: '' })
      setFeedback(hasCompany ? 'Company information has been updated.' : 'Company information has been created.')
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Company information could not be saved. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (state.status === 'loading') {
    return <Card className="company-form-state"><LoadingSpinner label="Loading company information" size="large" /></Card>
  }

  if (state.status === 'error') {
    return (
      <div className="company-form-page">
        <header className="company-form-page__header"><span className="company-form-page__eyebrow">RECRUITER WORKSPACE</span><h1>Company</h1></header>
        <Card className="company-form-state company-form-state--error">
          <ErrorMessage title="Company unavailable" message={state.error} />
          <Button type="button" variant="secondary" onClick={() => setReloadCount((count) => count + 1)}>Try again</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="company-form-page">
      <header className="company-form-page__header">
        <span className="company-form-page__eyebrow">RECRUITER WORKSPACE</span>
        <h1>Company</h1>
        <p>Share the company details candidates need to learn about your organization.</p>
      </header>
      <Card className="company-form-card">
        <div className="company-form-card__heading">
          <h2>{hasCompany ? 'Company information' : 'Set up your company'}</h2>
          <p>{hasCompany ? 'Keep your company details current.' : 'Add your company information to complete your recruiter workspace.'}</p>
        </div>
        {submitError && <ErrorMessage title="Unable to save company" message={submitError} />}
        {feedback && <div className="company-form-feedback" role="status">{feedback}</div>}
        <form className="company-form" onSubmit={handleSubmit} noValidate>
          <Input id="company-name" name="name" label="Company name" value={form.name} onChange={handleChange} error={errors.name} required />
          <Input id="company-location" name="location" label="Location" value={form.location} onChange={handleChange} error={errors.location} required />
          <Input id="company-contact" name="contact" label="Contact number" type="tel" inputMode="numeric" maxLength={10} value={form.contact} onChange={handleChange} error={errors.contact} required />
          <Input id="company-website" name="website" label="Website" value={form.website} onChange={handleChange} error={errors.website} required />
          <TextAreaField id="company-description" name="description" label="Description" value={form.description} onChange={handleChange} error={errors.description} required />
          <div className="company-form__actions">
            <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting && <span className="button-spinner" aria-hidden="true" />}
              {isSubmitting ? 'Saving...' : hasCompany ? 'Save Changes' : 'Create Company'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
