import { useEffect, useState } from 'react'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import Input from '../../components/Input.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import Icon from '../../components/Icon.jsx'
import { createProfile, getCV, getProfile, updateCV, updateProfile } from '../../services/seekerService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './ProfilePage.css'

const EMPTY_PROFILE = { name: '', skill: '', experience: '', contact: '' }
const CONTACT_PATTERN = /^[6-9]\d{9}$/
const MAX_CV_BYTES = 5 * 1024 * 1024

function profileFormValues(profile) {
  return {
    name: profile?.name ?? '',
    skill: profile?.skill ?? '',
    experience: profile?.experience ?? '',
    contact: profile?.contact ?? '',
  }
}

async function getResponseErrorMessage(error, fallback) {
  const responseData = error.response?.data
  if (responseData instanceof Blob) {
    const responseText = await responseData.text()
    try {
      const parsedError = { ...error, response: { ...error.response, data: JSON.parse(responseText) } }
      const backendMessage = getApiErrorMessage(parsedError, '')
      if (backendMessage) return backendMessage
    } catch {
      if (responseText.trim()) return responseText.trim()
    }
  }

  if (error.response?.status === 401) return 'Your session has expired. Please sign in again.'
  if (error.response?.status === 403) return 'You do not have permission to manage this resume.'
  if (error.response?.status === 413) return 'The selected file exceeds the 5 MB upload limit.'
  return getApiErrorMessage(error, fallback)
}

async function validatePdf(file) {
  if (!file) return 'Select a PDF CV.'
  if (file.size === 0) return 'The selected file is empty.'
  if (file.size > MAX_CV_BYTES) return 'The selected file must be 5 MB or smaller.'
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) {
    return 'Choose a PDF file.'
  }

  const header = new TextDecoder().decode(await file.slice(0, 1024).arrayBuffer())
  if (!header.includes('%PDF-')) return 'The selected file is not a valid PDF.'
  return ''
}

export default function ProfilePage() {
  const [pageState, setPageState] = useState({ status: 'loading', profile: null, error: '' })
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [selectedCv, setSelectedCv] = useState(null)
  const [fileError, setFileError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cvState, setCvState] = useState({ status: 'loading', error: '' })
  const [cvObjectUrl, setCvObjectUrl] = useState('')
  const [cvError, setCvError] = useState('')
  const [cvFeedback, setCvFeedback] = useState('')
  const [isUpdatingCv, setIsUpdatingCv] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let active = true

    getProfile()
      .then((loadedProfile) => {
        if (!active) return
        setProfile(profileFormValues(loadedProfile))
        setPageState({ status: 'ready', profile: loadedProfile, error: '' })

        if (!loadedProfile?.cv) {
          setCvObjectUrl('')
          setCvState({ status: 'missing', error: '' })
          return
        }

        setCvState({ status: 'loading', error: '' })
        getCV()
          .then((cvBlob) => {
            if (!active) return
            if (!(cvBlob instanceof Blob) || cvBlob.size === 0) {
              setCvState({ status: 'error', error: 'The server did not return a readable PDF resume.' })
              return
            }
            setCvObjectUrl(URL.createObjectURL(cvBlob))
            setCvState({ status: 'available', error: '' })
          })
          .catch(async (error) => {
            if (!active) return
            setCvState({
              status: 'error',
              error: await getResponseErrorMessage(error, 'Your resume could not be loaded. Please try again.'),
            })
          })
      })
      .catch(async (error) => {
        if (!active) return
        if (error.response?.status === 404) {
          setProfile({ ...EMPTY_PROFILE })
          setPageState({ status: 'new', profile: null, error: '' })
          return
        }
        setPageState({
          status: 'error',
          profile: null,
          error: await getResponseErrorMessage(error, 'Your profile could not be loaded. Please try again.'),
        })
      })

    return () => { active = false }
  }, [reloadCount])

  useEffect(() => () => {
    if (cvObjectUrl) URL.revokeObjectURL(cvObjectUrl)
  }, [cvObjectUrl])

  const hasProfile = pageState.status === 'ready' && Boolean(pageState.profile)

  function handleChange(event) {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
    setFeedback('')
  }

  function handleCvChange(event) {
    const file = event.target.files?.[0] ?? null
    setSelectedCv(file)
    setFileError('')
    setSubmitError('')
    setCvError('')
    setCvFeedback('')

    if (!file) return
    if (file.size === 0) setFileError('The selected file is empty.')
    else if (file.size > MAX_CV_BYTES) setFileError('The selected file must be 5 MB or smaller.')
    else if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) setFileError('Choose a PDF file.')
  }

  function validateProfile() {
    const nextErrors = {}
    for (const field of ['name', 'skill', 'experience', 'contact']) {
      if (!profile[field].trim()) nextErrors[field] = 'This field is required.'
    }
    if (profile.contact.trim() && !CONTACT_PATTERN.test(profile.contact.trim())) {
      nextErrors.contact = 'Enter a valid 10-digit contact number.'
    }
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFeedback('')
    setSubmitError('')

    if (!validateProfile()) return

    if (!hasProfile) {
      const validationMessage = await validatePdf(selectedCv)
      setFileError(validationMessage)
      if (validationMessage) return
    }

    const profilePayload = {
      skill: profile.skill.trim(),
      name: profile.name.trim(),
      experience: profile.experience.trim(),
      contact: profile.contact.trim(),
    }

    setIsSubmitting(true)
    try {
      const savedProfile = hasProfile
        ? await updateProfile(profilePayload)
        : await createProfile(profilePayload, selectedCv)
      setProfile(profileFormValues(savedProfile))
      setPageState({ status: 'ready', profile: savedProfile, error: '' })
      setSelectedCv(null)
      setFileError('')
      setFeedback(hasProfile ? 'Your profile has been updated.' : 'Your profile and CV have been created.')
      const fileInput = document.getElementById('profile-cv')
      if (fileInput) fileInput.value = ''
      if (!hasProfile) setReloadCount((count) => count + 1)
    } catch (error) {
      setSubmitError(await getResponseErrorMessage(error, 'Your profile could not be saved. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReplaceCv(event) {
    event.preventDefault()
    setCvError('')
    setCvFeedback('')

    const validationMessage = await validatePdf(selectedCv)
    setFileError(validationMessage)
    if (validationMessage || isUpdatingCv) return

    setIsUpdatingCv(true)
    try {
      await updateCV(selectedCv)
      setSelectedCv(null)
      setFileError('')
      setCvFeedback('Your resume has been replaced successfully.')
      setCvState({ status: 'loading', error: '' })
      const fileInput = document.getElementById('profile-cv-replacement')
      if (fileInput) fileInput.value = ''
      setReloadCount((count) => count + 1)
    } catch (error) {
      setCvError(await getResponseErrorMessage(error, 'Your resume could not be uploaded. Please try again.'))
    } finally {
      setIsUpdatingCv(false)
    }
  }

  function retryLoad() {
    setPageState({ status: 'loading', profile: null, error: '' })
    setReloadCount((count) => count + 1)
  }

  if (pageState.status === 'loading') {
    return <Card className="profile-loading-card"><LoadingSpinner label="Loading your profile" size="large" /></Card>
  }

  if (pageState.status === 'error') {
    return (
      <div className="profile-page">
        <header className="profile-page__header">
          <span className="profile-page__eyebrow">YOUR ACCOUNT</span>
          <h1>Job seeker profile</h1>
        </header>
        <Card className="profile-error-card">
          <ErrorMessage title="Profile unavailable" message={pageState.error} />
          <Button type="button" variant="secondary" onClick={retryLoad}>Try again</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <header className="profile-page__header">
        <span className="profile-page__eyebrow">YOUR ACCOUNT</span>
        <h1>Job seeker profile</h1>
        <p>Keep your profile information and CV ready for employers.</p>
      </header>

      <Card className="profile-form-card">
        <div className="profile-form-card__heading">
          <div>
            <h2>{hasProfile ? 'Profile information' : 'Create your profile'}</h2>
            <p>{hasProfile ? 'Update your details below.' : 'Add your details and a PDF CV to get started.'}</p>
          </div>
          {hasProfile && pageState.profile.jobSeekerId != null && (
            <span className="profile-id">Profile #{pageState.profile.jobSeekerId}</span>
          )}
        </div>

        {submitError && <ErrorMessage title="Unable to save profile" message={submitError} />}
        {feedback && <div className="profile-feedback" role="status">{feedback}</div>}

        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="profile-name"
            name="name"
            label="Name"
            autoComplete="name"
            value={profile.name}
            onChange={handleChange}
            error={fieldErrors.name}
            required
          />
          <Input
            id="profile-skill"
            name="skill"
            label="Skill"
            value={profile.skill}
            onChange={handleChange}
            error={fieldErrors.skill}
            required
          />
          <Input
            id="profile-experience"
            name="experience"
            label="Experience"
            value={profile.experience}
            onChange={handleChange}
            error={fieldErrors.experience}
            required
          />
          <Input
            id="profile-contact"
            name="contact"
            label="Contact number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            value={profile.contact}
            onChange={handleChange}
            error={fieldErrors.contact}
            required
          />

          {!hasProfile && (
            <div className="profile-cv-field">
              <Input
                id="profile-cv"
                name="cv"
                label="CV (PDF)"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleCvChange}
                error={fileError}
                required
              />
              <p>Choose a non-empty PDF file.</p>
              {selectedCv && !fileError && <span className="profile-cv-field__filename">{selectedCv.name}</span>}
            </div>
          )}

          <div className="profile-form__actions">
            <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting && <span className="button-spinner" aria-hidden="true" />}
              {isSubmitting ? 'Saving...' : hasProfile ? 'Save Changes' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="profile-cv-card profile-cv-card--managed">
        <div className="profile-cv-card__heading">
          <div>
            <h2><Icon name="resume" size={19} />Resume / CV</h2>
            <p>{hasProfile ? 'Manage the PDF resume saved to your profile.' : 'A PDF resume is required when creating your profile.'}</p>
          </div>
          {!hasProfile && <span className="profile-cv-card__format">PDF only · up to 5 MB</span>}
        </div>

        {!hasProfile && <p className="profile-cv-card__initial-note">Upload the required PDF in the profile creation form above.</p>}

        {hasProfile && cvState.status === 'loading' && <LoadingSpinner label="Loading your resume" size="small" />}

        {hasProfile && cvState.status === 'error' && (
          <div className="profile-cv-card__state">
            <ErrorMessage title="Resume unavailable" message={cvState.error} />
            <Button type="button" variant="secondary" onClick={() => setReloadCount((count) => count + 1)}>Try again</Button>
          </div>
        )}

        {hasProfile && cvState.status === 'missing' && (
          <p className="profile-cv-card__missing" role="status">No resume uploaded. Upload a PDF below.</p>
        )}

        {hasProfile && cvState.status === 'available' && (
          <div className="profile-cv-card__current">
            <div>
              <h3>Current Resume</h3>
              <p>PDF resume uploaded</p>
            </div>
            <div className="profile-cv-card__actions">
              <Button as="a" href={cvObjectUrl} target="_blank" rel="noopener noreferrer" variant="secondary"><Icon name="eye" size={16} />View Resume</Button>
              <Button as="a" href={cvObjectUrl} download="resume.pdf" variant="secondary"><Icon name="download" size={16} />Download Resume</Button>
            </div>
          </div>
        )}

        {hasProfile && (
          <div className="profile-cv-card__replace">
            {cvFeedback && <div className="profile-feedback" role="status">{cvFeedback}</div>}
            {cvError && <ErrorMessage title="Unable to upload resume" message={cvError} />}
            <form className="profile-cv-card__form" onSubmit={handleReplaceCv} noValidate>
              <Input
                id="profile-cv-replacement"
                name="cv"
                label={cvState.status === 'missing' ? 'Upload Resume (PDF)' : 'Replace Resume (PDF)'}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleCvChange}
                error={fileError}
                aria-describedby="profile-cv-replacement-help"
              />
              <p className="profile-cv-card__help" id="profile-cv-replacement-help">PDF only · maximum size 5 MB</p>
              {selectedCv && !fileError && <span className="profile-cv-field__filename">Selected: {selectedCv.name}</span>}
              <div className="profile-cv-card__submit">
                <Button type="submit" disabled={isUpdatingCv || Boolean(fileError)} aria-busy={isUpdatingCv}>
                  {isUpdatingCv && <span className="button-spinner" aria-hidden="true" />}
                  {isUpdatingCv ? 'Uploading...' : cvState.status === 'missing' ? 'Upload Resume' : 'Replace Resume'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </div>
  )
}
