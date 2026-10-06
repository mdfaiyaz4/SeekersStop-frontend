import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import Icon from '../../components/Icon.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getMyApplications, withdrawApplication } from '../../services/applicationService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './ApplicationsPage.css'

function formatAppliedAt(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function normalizeApplicationStatus(status) {
  return typeof status === 'string' ? status.trim().toUpperCase() : ''
}

function ApplicationsPage() {
  const [state, setState] = useState({ status: 'loading', applications: [], error: '', requestId: -1 })
  const [reloadCount, setReloadCount] = useState(0)
  const [confirmingApplicationId, setConfirmingApplicationId] = useState(null)
  const [withdrawingId, setWithdrawingId] = useState(null)
  const [withdrawalFeedback, setWithdrawalFeedback] = useState({ applicationId: null, error: '', message: '' })
  const withdrawalDialogRef = useRef(null)

  const loadApplications = useCallback(async (isActive, requestId) => {
    try {
      const applications = await getMyApplications()
      if (isActive()) {
        setState({ status: 'success', applications, error: '', requestId })
      }
    } catch (error) {
      if (isActive()) {
        setState({
          status: 'error',
          applications: [],
          error: getApiErrorMessage(error, 'Your applications could not be loaded. Please try again.'),
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

  function retry() {
    setReloadCount((count) => count + 1)
  }

  function handleWithdrawalDialogKeyDown(event) {
    if (event.key === 'Escape' && withdrawingId === null) {
      setConfirmingApplicationId(null)
      return
    }

    if (event.key !== 'Tab') return
    const focusable = withdrawalDialogRef.current?.querySelectorAll('button:not([disabled])')
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  async function confirmWithdrawal(application) {
    if (withdrawingId !== null || normalizeApplicationStatus(application.applicationStatus) !== 'PENDING') return

    const { applicationId } = application
    setWithdrawingId(applicationId)
    setWithdrawalFeedback({ applicationId, error: '', message: '' })
    try {
      const updatedApplication = await withdrawApplication(applicationId)
      setState((current) => ({
        ...current,
        applications: current.applications.map((item) => (
          item.applicationId === applicationId ? { ...item, ...updatedApplication } : item
        )),
      }))
      setConfirmingApplicationId(null)
      setWithdrawalFeedback({
        applicationId,
        error: '',
        message: 'Application withdrawn. It remains in your application history.',
      })
    } catch (error) {
      setWithdrawalFeedback({
        applicationId,
        error: getApiErrorMessage(error, 'The application could not be withdrawn. Please try again.'),
        message: '',
      })
    } finally {
      setWithdrawingId(null)
    }
  }

  const confirmingApplication = viewState.applications.find(
    (application) => application.applicationId === confirmingApplicationId,
  )

  return (
    <div className="applications-page">
      <header className="applications-page__header">
        <div>
          <span className="applications-page__eyebrow">YOUR JOB SEARCH</span>
          <h1>My applications</h1>
          <p>Review the applications you have submitted and check their current status.</p>
        </div>
        {viewState.status === 'success' && viewState.applications.length > 0 && (
          <span className="applications-page__count">
            {viewState.applications.length} {viewState.applications.length === 1 ? 'application' : 'applications'}
          </span>
        )}
      </header>

      {viewState.status === 'loading' && (
        <Card className="applications-state-card">
          <LoadingSpinner label="Loading your applications" size="large" />
        </Card>
      )}

      {viewState.status === 'error' && (
        <Card className="applications-state-card applications-state-card--error">
          <ErrorMessage title="Applications unavailable" message={viewState.error} />
          <Button type="button" variant="secondary" onClick={retry}>Try again</Button>
        </Card>
      )}

      {viewState.status === 'success' && viewState.applications.length === 0 && (
        <Card className="applications-empty-card">
          <EmptyState
            title="No applications yet"
            description="When you apply for a job, it will appear here so you can keep track of its status."
            icon="application"
            action={<Button as={Link} to="/jobs">Find jobs</Button>}
          />
        </Card>
      )}

      {viewState.status === 'success' && viewState.applications.length > 0 && (
        <section className="applications-list" aria-label="Submitted applications">
          {viewState.applications.map((application) => {
            const date = formatAppliedAt(application.appliedAt)
            const applicationStatus = normalizeApplicationStatus(application.applicationStatus)
            return (
              <Card className="application-card" key={application.applicationId}>
                <div className="application-card__main">
                  <div className="application-card__heading">
                    <div>
                      <span className="application-card__eyebrow">APPLICATION #{application.applicationId}</span>
                      <h2>{application.jobName || 'Job title unavailable'}</h2>
                    </div>
                    {application.applicationStatus && <StatusBadge status={application.applicationStatus} />}
                  </div>
                  <dl className="application-card__details">
                    {date && (
                      <div>
                        <dt>Applied</dt>
                        <dd><time dateTime={application.appliedAt}>{date}</time></dd>
                      </div>
                    )}
                    {application.jobId !== null && application.jobId !== undefined && (
                      <div>
                        <dt>Job ID</dt>
                        <dd>{application.jobId}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div className="application-card__actions">
                  <Button as={Link} to={`/seeker/applications/${encodeURIComponent(application.applicationId)}`} variant="secondary" size="small">
                    <Icon name="application" size={16} />View Application
                  </Button>
                  {application.jobId !== null && application.jobId !== undefined && (
                    <Button as={Link} to={`/jobs/${encodeURIComponent(application.jobId)}`} variant="secondary" size="small">
                      <Icon name="briefcase" size={16} />View Job
                    </Button>
                  )}
                  {applicationStatus === 'PENDING' && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      disabled={withdrawingId !== null}
                      onClick={() => {
                        setWithdrawalFeedback({ applicationId: null, error: '', message: '' })
                        setConfirmingApplicationId(application.applicationId)
                      }}
                    >
                      <Icon name="undo" size={16} />Withdraw Application
                    </Button>
                  )}
                  {withdrawalFeedback.applicationId === application.applicationId && withdrawalFeedback.message && (
                    <p className="application-card__withdrawal-feedback" role="status">
                      {withdrawalFeedback.message}
                    </p>
                  )}
                </div>
              </Card>
            )
          })}
        </section>
      )}

      {confirmingApplication && (
        <div className="withdraw-confirm-backdrop">
          <section
            ref={withdrawalDialogRef}
            className="withdraw-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="withdraw-confirm-title"
            aria-describedby="withdraw-confirm-description"
            onKeyDown={handleWithdrawalDialogKeyDown}
          >
            <h2 id="withdraw-confirm-title">Withdraw application?</h2>
            <p id="withdraw-confirm-description">
              Are you sure you want to withdraw your application for {confirmingApplication.jobName || 'this job'}? This action cannot be undone.
            </p>
            {withdrawalFeedback.applicationId === confirmingApplication.applicationId && withdrawalFeedback.error && (
              <ErrorMessage title="Application not withdrawn" message={withdrawalFeedback.error} />
            )}
            <div className="withdraw-confirm__actions">
              <Button
                type="button"
                variant="secondary"
                autoFocus
                disabled={withdrawingId !== null}
                onClick={() => setConfirmingApplicationId(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={withdrawingId !== null}
                aria-busy={withdrawingId === confirmingApplication.applicationId}
                onClick={() => confirmWithdrawal(confirmingApplication)}
              >
                {withdrawingId === confirmingApplication.applicationId ? 'Withdrawing…' : 'Withdraw Application'}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default ApplicationsPage
