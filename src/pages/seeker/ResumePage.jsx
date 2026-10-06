import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import Input from '../../components/Input.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import Icon from '../../components/Icon.jsx'
import { getCV, updateCV } from '../../services/seekerService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './ResumePage.css'

const MAX_CV_BYTES = 5 * 1024 * 1024

async function getResponseErrorMessage(error, fallback) {
  let errorWithParsedBody = error
  const responseData = error.response?.data
  if (responseData instanceof Blob) {
    const responseText = await responseData.text()
    if (responseText.trim()) {
      try {
        const parsedData = JSON.parse(responseText)
        errorWithParsedBody = { ...error, response: { ...error.response, data: parsedData } }
      } catch {
        return responseText.trim()
      }
      const backendMessage = getApiErrorMessage(errorWithParsedBody, '')
      if (backendMessage) return backendMessage
    }
  }

  const status = error.response?.status
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status === 403) return 'You do not have permission to access this resume.'
  if (status === 413) return 'The selected file exceeds the 5 MB upload limit.'
  return getApiErrorMessage(errorWithParsedBody, fallback)
}

function validateCv(file) {
  if (!file) return 'Select a PDF resume to continue.'
  if (file.size === 0) return 'The selected file is empty.'
  if (!/\.pdf$/i.test(file.name)) return 'Choose a file with a .pdf extension.'
  if (file.type && file.type !== 'application/pdf') return 'The selected file must be a PDF.'
  if (file.size > MAX_CV_BYTES) return 'The selected file must be 5 MB or smaller.'
  return ''
}

export default function ResumePage() {
  const [loadState, setLoadState] = useState('loading')
  const [resumeUrl, setResumeUrl] = useState('')
  const [loadError, setLoadError] = useState('')
  const [selectedCv, setSelectedCv] = useState(null)
  const [fileError, setFileError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    getCV()
      .then((pdf) => {
        if (!active) return
        if (!(pdf instanceof Blob) || pdf.size === 0) {
          setLoadState('error')
          setLoadError('The server did not return a readable PDF resume.')
          return
        }

        setResumeUrl(URL.createObjectURL(pdf))
        setLoadState('ready')
      })
      .catch(async (error) => {
        if (!active) return
        if (error.response?.status === 404) {
          setResumeUrl('')
          setLoadState('missing')
          return
        }

        setLoadState('error')
        setLoadError(await getResponseErrorMessage(error, 'Your resume could not be loaded. Please try again.'))
      })

    return () => { active = false }
  }, [reloadKey])

  useEffect(() => () => {
    if (resumeUrl) URL.revokeObjectURL(resumeUrl)
  }, [resumeUrl])

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null
    setSelectedCv(file)
    setFileError(file ? validateCv(file) : '')
    setUploadError('')
    setFeedback('')
  }

  async function handleReplace(event) {
    event.preventDefault()
    setUploadError('')
    setFeedback('')

    const validationMessage = validateCv(selectedCv)
    setFileError(validationMessage)
    if (validationMessage || isUploading) return

    setIsUploading(true)
    try {
      await updateCV(selectedCv)
      setFeedback('Your resume has been replaced successfully.')
      setSelectedCv(null)
      setFileError('')
      const fileInput = document.getElementById('resume-file')
      if (fileInput) fileInput.value = ''
      setLoadError('')
      setLoadState('loading')
      setReloadKey((key) => key + 1)
    } catch (error) {
      setUploadError(await getResponseErrorMessage(error, 'Your resume could not be replaced. Please try again.'))
    } finally {
      setIsUploading(false)
    }
  }

  function retryLoad() {
    setLoadError('')
    setLoadState('loading')
    setReloadKey((key) => key + 1)
  }

  return (
    <div className="resume-page">
      <header className="resume-page__header">
        <span className="resume-page__eyebrow">YOUR ACCOUNT</span>
        <h1>Resume</h1>
        <p>View, download, or replace the PDF resume saved to your seeker profile.</p>
      </header>

      {loadState === 'loading' && (
        <Card className="resume-page__loading">
          <LoadingSpinner label="Loading your resume" size="large" />
        </Card>
      )}

      {loadState === 'error' && (
        <Card className="resume-page__error">
          <ErrorMessage title="Resume unavailable" message={loadError} />
          <Button type="button" variant="secondary" onClick={retryLoad}>Try again</Button>
        </Card>
      )}

      {loadState === 'missing' && (
        <Card className="resume-page__empty-card">
          <EmptyState
            title="No resume uploaded"
            description="Create your seeker profile and upload a PDF resume from the Profile page."
            icon="resume"
            action={<Button as={Link} to="/seeker/profile">Go to Profile</Button>}
          />
        </Card>
      )}

      {loadState === 'ready' && (
        <>
          <Card className="resume-page__document">
            <div className="resume-page__document-copy">
              <span className="resume-page__document-icon"><Icon name="resume" size={25} /><small>PDF</small></span>
              <div>
                <h2>Current resume</h2>
                <p>Your stored resume is available as a PDF document.</p>
              </div>
            </div>
            <div className="resume-page__document-actions">
              <Button as="a" href={resumeUrl} target="_blank" rel="noopener noreferrer" variant="secondary">
                <Icon name="eye" size={17} />View Resume
              </Button>
              <Button as="a" href={resumeUrl} download="resume.pdf">
                <Icon name="download" size={17} />Download Resume
              </Button>
            </div>
          </Card>

          <Card className="resume-page__replace-card">
            <div className="resume-page__section-heading">
              <h2>Replace resume</h2>
              <p>Choose a PDF file up to 5 MB. Replacing it updates the resume on your profile.</p>
            </div>

            {feedback && <div className="resume-page__feedback" role="status">{feedback}</div>}
            {uploadError && <ErrorMessage title="Unable to replace resume" message={uploadError} />}

            <form className="resume-page__form" onSubmit={handleReplace} noValidate>
              <Input
                id="resume-file"
                name="cv"
                label="Resume file (PDF)"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                error={fileError}
                aria-describedby="resume-file-help"
              />
              <p className="resume-page__file-help" id="resume-file-help">PDF only · maximum size 5 MB</p>
              {selectedCv && !fileError && <p className="resume-page__filename">Selected: {selectedCv.name}</p>}
              <div className="resume-page__submit">
                <Button type="submit" disabled={isUploading || Boolean(fileError)} aria-busy={isUploading}>
                  {isUploading && <span className="button-spinner" aria-hidden="true" />}
                  {!isUploading && <Icon name="upload" size={17} />}{isUploading ? 'Uploading...' : 'Replace Resume'}
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </div>
  )
}
