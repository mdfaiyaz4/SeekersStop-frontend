import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getApplicationResume, getRecruiterApplications, updateApplicationStatus } from '../../services/applicationService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './ApplicationsPage.css'

const NEXT_STATUSES = {
  PENDING: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
}

const STATUS_ACTION_LABELS = {
  SHORTLISTED: 'Shortlist',
  ACCEPTED: 'Accept',
  REJECTED: 'Reject',
}

function formatAppliedAt(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function ApplicationCard({ application, onUpdate, isUpdating, feedback, error, onViewResume, resumeState }) {
  const appliedAt = formatAppliedAt(application.appliedAt)
  const hasStatus = Object.prototype.hasOwnProperty.call(NEXT_STATUSES, application.applicationStatus)
  const nextStatuses = NEXT_STATUSES[application.applicationStatus] ?? []

  return (
    <Card className="recruiter-application-card">
      <div className="recruiter-application-card__main">
        <div className="recruiter-application-card__heading">
          <div>
            <span className="recruiter-application-card__eyebrow">
              APPLICATION #{application.applicationId}
            </span>
            <h2>{application.jobName || 'Job title unavailable'}</h2>
          </div>
          {application.applicationStatus && <StatusBadge status={application.applicationStatus} />}
        </div>

        <dl className="recruiter-application-card__details">
          {application.jobId !== null && application.jobId !== undefined && (
            <div><dt>Job ID</dt><dd>{application.jobId}</dd></div>
          )}
          {application.jobSeeker && (
            <div><dt>Applicant</dt><dd>{application.jobSeeker}</dd></div>
          )}
          {appliedAt && (
            <div><dt>Applied</dt><dd><time dateTime={application.appliedAt}>{appliedAt}</time></dd></div>
          )}
        </dl>

        <div className="recruiter-application-card__resume">
          {resumeState?.status === 'unavailable' ? (
            <span className="recruiter-application-card__resume-unavailable">Resume not available</span>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => onViewResume(application)}
              disabled={resumeState?.status === 'loading'}
              aria-busy={resumeState?.status === 'loading'}
            >
              {resumeState?.status === 'loading' ? 'Opening resume…' : 'View Resume'}
            </Button>
          )}
          {resumeState?.error && <ErrorMessage title="Resume unavailable" message={resumeState.error} />}
        </div>
      </div>

      <div className="recruiter-application-card__management">
        {nextStatuses.length > 0 && <p className="recruiter-application-card__label">Next actions</p>}
        {hasStatus && nextStatuses.length === 0 && (
          <p className="recruiter-application-card__label">No further status changes</p>
        )}
        {nextStatuses.length > 0 && (
          <div className="recruiter-application-card__controls" aria-label="Available status actions">
            {nextStatuses.map((status) => (
              <Button
                key={status}
                type="button"
                size="small"
                variant={status === 'REJECTED' ? 'secondary' : 'primary'}
                onClick={() => onUpdate(application, status)}
                disabled={isUpdating}
                aria-busy={isUpdating}
              >
                {isUpdating ? 'Updating…' : STATUS_ACTION_LABELS[status]}
              </Button>
            ))}
          </div>
        )}
        {isUpdating && <LoadingSpinner label="Updating application status" size="small" />}
        {error && <ErrorMessage title="Status not updated" message={error} />}
        {feedback && <p className="recruiter-application-card__feedback" role="status">{feedback}</p>}
      </div>
    </Card>
  )
}

export default function ApplicationsPage() {
  const [state, setState] = useState({ status: 'loading', applications: [], error: '', requestId: -1 })
  const [updatingId, setUpdatingId] = useState(null)
  const [actionState, setActionState] = useState({ id: null, error: '', feedback: '' })
  const [resumeStates, setResumeStates] = useState({})
  const [reloadCount, setReloadCount] = useState(0)
  const resumeUrls = useRef(new Set())

  useEffect(() => () => {
    resumeUrls.current.forEach((url) => URL.revokeObjectURL(url))
    resumeUrls.current.clear()
  }, [])

  const loadApplications = useCallback(async (isActive, requestId) => {
    try {
      const applications = await getRecruiterApplications()
      if (!Array.isArray(applications)) {
        throw new Error('The applications response was not a list.')
      }
      if (isActive()) {
        setState({ status: 'success', applications, error: '', requestId })
      }
    } catch (error) {
      if (isActive()) {
        setState({
          status: 'error',
          applications: [],
          error: getApiErrorMessage(error, 'Recruiter applications could not be loaded. Please try again.'),
          requestId,
        })
      }
    }
  }, [])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) loadApplications(() => active, reloadCount)
    })
    return () => { active = false }
  }, [loadApplications, reloadCount])

  const viewState = state.requestId === reloadCount
    ? state
    : { status: 'loading', applications: [], error: '' }

  async function handleStatusUpdate(application, applicationStatus) {
    const { applicationId } = application
    if (updatingId !== null || !NEXT_STATUSES[application.applicationStatus]?.includes(applicationStatus)) return

    setUpdatingId(applicationId)
    setActionState({ id: applicationId, error: '', feedback: '' })
    try {
      await updateApplicationStatus(applicationId, applicationStatus)
      setState((current) => ({
        ...current,
        applications: current.applications.map((item) => (
          item.applicationId === applicationId ? { ...item, applicationStatus } : item
        )),
      }))
      setActionState({ id: applicationId, error: '', feedback: 'Application status updated.' })
    } catch (error) {
      setActionState({
        id: applicationId,
        error: getApiErrorMessage(error, 'The application status could not be updated. Please try again.'),
        feedback: '',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleViewResume(application) {
    const { applicationId } = application
    if (resumeStates[applicationId]?.status === 'loading') return

    const resumeTab = window.open('about:blank', '_blank')
    if (!resumeTab) {
      setResumeStates((current) => ({
        ...current,
        [applicationId]: { status: 'error', error: 'Allow pop-ups in your browser to view the resume.' },
      }))
      return
    }
    resumeTab.opener = null
    setResumeStates((current) => ({ ...current, [applicationId]: { status: 'loading', error: '' } }))

    try {
      const cvBlob = await getApplicationResume(applicationId)
      const pdfBlob = new Blob([cvBlob], { type: 'application/pdf' })
      const objectUrl = URL.createObjectURL(pdfBlob)
      resumeUrls.current.add(objectUrl)
      resumeTab.location.href = objectUrl
      setResumeStates((current) => ({ ...current, [applicationId]: { status: 'available', error: '' } }))
    } catch (requestError) {
      resumeTab.close()
      if (requestError.response?.status === 404) {
        setResumeStates((current) => ({ ...current, [applicationId]: { status: 'unavailable', error: '' } }))
      } else {
        const error = requestError.response?.status === 401 || requestError.response?.status === 403
          ? 'You are not authorized to view this resume.'
          : getApiErrorMessage(requestError, 'The resume could not be opened. Please try again.')
        setResumeStates((current) => ({ ...current, [applicationId]: { status: 'error', error } }))
      }
    }
  }

  return (
    <div className="recruiter-applications-page">
      <header className="recruiter-applications-page__header">
        <div>
          <span className="recruiter-applications-page__eyebrow">RECRUITER WORKSPACE</span>
          <h1>Applications</h1>
          <p>Review applications submitted for your jobs and manage their current status.</p>
        </div>
        {viewState.status === 'success' && viewState.applications.length > 0 && (
          <span className="recruiter-applications-page__count">
            {viewState.applications.length} {viewState.applications.length === 1 ? 'application' : 'applications'}
          </span>
        )}
      </header>

      {viewState.status === 'loading' && (
        <Card className="recruiter-applications-state">
          <LoadingSpinner label="Loading recruiter applications" size="large" />
        </Card>
      )}

      {viewState.status === 'error' && (
        <Card className="recruiter-applications-state recruiter-applications-state--error">
          <ErrorMessage title="Applications unavailable" message={viewState.error} />
          <Button type="button" variant="secondary" onClick={() => setReloadCount((count) => count + 1)}>Try again</Button>
        </Card>
      )}

      {viewState.status === 'success' && viewState.applications.length === 0 && (
        <Card className="recruiter-applications-empty">
          <EmptyState
            title="No applications yet"
            description="Applications submitted for your jobs will appear here."
            icon="A"
          />
        </Card>
      )}

      {viewState.status === 'success' && viewState.applications.length > 0 && (
        <section className="recruiter-applications-list" aria-label="Recruiter applications">
          {viewState.applications.map((application) => (
            <ApplicationCard
              key={application.applicationId}
              application={application}
              onUpdate={handleStatusUpdate}
              isUpdating={updatingId === application.applicationId}
              error={actionState.id === application.applicationId ? actionState.error : ''}
              feedback={actionState.id === application.applicationId ? actionState.feedback : ''}
              onViewResume={handleViewResume}
              resumeState={resumeStates[application.applicationId]}
            />
          ))}
        </section>
      )}
    </div>
  )
}
