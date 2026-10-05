import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getApplicationById } from '../../services/applicationService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './ApplicationDetailsPage.css'

function formatAppliedAt(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function getLoadError(error) {
  const fallbackByStatus = {
    401: 'Your session has expired. Please log in again.',
    403: 'You are not allowed to view this application.',
    404: 'Application not found.',
  }
  return getApiErrorMessage(error, fallbackByStatus[error.response?.status] || 'Application details could not be loaded. Check your connection and try again.')
}

function Detail({ label, value, dateTime }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="application-details__item">
      <dt>{label}</dt>
      <dd>{dateTime ? <time dateTime={dateTime}>{value}</time> : value}</dd>
    </div>
  )
}

export default function ApplicationDetailsPage() {
  const { applicationId } = useParams()
  const [state, setState] = useState({ status: 'loading', application: null, error: '' })
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let active = true
    getApplicationById(applicationId)
      .then((application) => {
        if (active) setState({ status: 'success', application, error: '' })
      })
      .catch((error) => {
        if (active) setState({ status: 'error', application: null, error: getLoadError(error) })
      })
    return () => { active = false }
  }, [applicationId, reloadCount])

  function retry() {
    setState({ status: 'loading', application: null, error: '' })
    setReloadCount((count) => count + 1)
  }

  const application = state.application
  const appliedAt = formatAppliedAt(application?.appliedAt)

  return (
    <div className="application-details-page">
      <nav className="application-details-page__nav" aria-label="Application navigation">
        <Button as={Link} to="/seeker/applications" variant="secondary" size="small">Back to Applications</Button>
        {application?.jobId !== null && application?.jobId !== undefined && (
          <Button as={Link} to={`/jobs/${encodeURIComponent(application.jobId)}`} size="small">View Job</Button>
        )}
      </nav>

      <header className="application-details-page__header">
        <span className="application-details-page__eyebrow">YOUR JOB SEARCH</span>
        <h1>Application details</h1>
        <p>Review the details returned for this application.</p>
      </header>

      {state.status === 'loading' && (
        <Card className="application-details-page__state"><LoadingSpinner label="Loading application details" size="large" /></Card>
      )}

      {state.status === 'error' && (
        <Card className="application-details-page__error">
          <ErrorMessage title="Application unavailable" message={state.error} />
          <Button type="button" variant="secondary" onClick={retry}>Try again</Button>
        </Card>
      )}

      {state.status === 'success' && (
        <Card className="application-details">
          <div className="application-details__heading">
            <div>
              <span className="application-details__eyebrow">APPLICATION #{application.applicationId ?? applicationId}</span>
              <h2>{application.jobName || 'Job title unavailable'}</h2>
            </div>
            {application.applicationStatus && <StatusBadge status={application.applicationStatus} />}
          </div>
          <dl className="application-details__list">
            <Detail label="Application ID" value={application.applicationId} />
            <Detail label="Job name" value={application.jobName} />
            <Detail label="Job ID" value={application.jobId} />
            <Detail label="Job seeker" value={application.jobSeeker} />
            <Detail label="Applied date" value={appliedAt} dateTime={application.appliedAt} />
            <Detail label="Application status" value={application.applicationStatus} />
          </dl>
        </Card>
      )}
    </div>
  )
}
