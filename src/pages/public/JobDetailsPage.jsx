import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import useAuth from '../../hooks/useAuth.js'
import { applyForJob, getMyApplications } from '../../services/applicationService.js'
import { getJobById } from '../../services/jobService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { ROLES } from '../../utils/roles.js'
import './JobDetailsPage.css'

function displayValue(value) {
  if (value === null || value === undefined || String(value).trim() === '') return 'Not specified'
  return value
}

function formatDeadline(value) {
  if (value === null || value === undefined || String(value).trim() === '') return 'Not specified'
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function DetailItem({ label, value }) {
  return (
    <div className="job-detail-item">
      <dt>{label}</dt>
      <dd>{displayValue(value)}</dd>
    </div>
  )
}

function OverviewItem({ label, value }) {
  return (
    <div className="job-details-overview__item">
      <dt>{label}</dt>
      <dd>{displayValue(value)}</dd>
    </div>
  )
}

function applicationForJob(applications, jobId) {
  if (!Array.isArray(applications)) {
    throw new Error('Applications response was not a list.')
  }
  return applications.find((application) => String(application?.jobId) === String(jobId)) || null
}

export default function JobDetailsPage() {
  const { id } = useParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [request, setRequest] = useState({ id: null, retryCount: -1, status: 'loading', job: null })
  const [applicationState, setApplicationState] = useState({ key: '', status: 'checking', application: null })
  const [retryCount, setRetryCount] = useState(0)
  const [isApplying, setIsApplying] = useState(false)
  const [applicationError, setApplicationError] = useState('')

  useEffect(() => {
    let active = true

    getJobById(id)
      .then((job) => {
        if (active) setRequest({ id, retryCount, status: 'success', job })
      })
      .catch((error) => {
        if (active) {
          setRequest({
            id,
            retryCount,
            status: error.response?.status === 404 ? 'not-found' : 'error',
            job: null,
          })
        }
      })

    return () => { active = false }
  }, [id, retryCount])

  const applicationLookupKey = `${id}:${user?.username ?? ''}:${retryCount}`

  useEffect(() => {
    let active = true

    if (authLoading || !isAuthenticated || user?.role !== ROLES.JOB_SEEKER) {
      return () => { active = false }
    }

    getMyApplications()
      .then((applications) => {
        const application = applicationForJob(applications, id)
        if (active) setApplicationState({
          key: applicationLookupKey,
          status: application ? 'applied' : 'none',
          application,
        })
      })
      .catch(() => {
        if (active) setApplicationState({ key: applicationLookupKey, status: 'error', application: null })
      })

    return () => { active = false }
  }, [id, isAuthenticated, authLoading, user?.role, applicationLookupKey])

  const isLoading = request.id !== id || request.retryCount !== retryCount || request.status === 'loading'
  const currentApplicationState = applicationState.key === applicationLookupKey
    ? applicationState
    : { status: 'checking', application: null }

  function retry() {
    setApplicationError('')
    setRetryCount((count) => count + 1)
  }

  async function handleApply() {
    if (
      isApplying || authLoading || !isAuthenticated || user?.role !== ROLES.JOB_SEEKER
      || currentApplicationState.status === 'checking' || currentApplicationState.status === 'applied'
    ) return

    setIsApplying(true)
    setApplicationError('')

    try {
      const application = await applyForJob(request.job.id)
      setApplicationState({ key: applicationLookupKey, status: 'applied', application })
    } catch (error) {
      const status = error.response?.status
      const fallback = status === 401
        ? 'Please log in as a job seeker to apply.'
        : status === 403
          ? 'Your account or this job is not eligible for an application.'
          : status >= 500
            ? 'The server could not submit your application. Please try again.'
            : 'Your application could not be submitted. Please try again.'

      setApplicationError(getApiErrorMessage(error, fallback))
    } finally {
      setIsApplying(false)
    }
  }

  const job = request.job
  const applicationStatus = currentApplicationState.application?.applicationStatus

  return (
    <div className="job-details-page">
      <Link className="job-details-back" to="/jobs">
        <span aria-hidden="true">←</span> Back to jobs
      </Link>

      {isLoading && (
        <Card className="job-details-state-card" aria-busy="true">
          <LoadingSpinner label="Loading job details" size="large" />
        </Card>
      )}

      {!isLoading && request.status === 'not-found' && (
        <Card className="job-details-state-card job-details-message-card">
          <span className="job-details-header__eyebrow">JOB DETAILS</span>
          <h1>Job not found</h1>
          <p>The job may have been removed or is no longer available.</p>
          <Button as={Link} to="/jobs">Browse jobs</Button>
        </Card>
      )}

      {!isLoading && request.status === 'error' && (
        <Card className="job-details-state-card job-details-message-card">
          <ErrorMessage title="Unable to load this job" message="Please check your connection and try again." />
          <div className="job-details-error-card__actions">
            <Button type="button" variant="secondary" onClick={retry}>Try again</Button>
            <Button as={Link} to="/jobs">Browse jobs</Button>
          </div>
        </Card>
      )}

      {!isLoading && request.status === 'success' && job && (
        <>
          <header className="job-details-header">
            <span className="job-details-header__eyebrow">JOB DETAILS</span>
            <h1>{displayValue(job.title)}</h1>
            {job.companyName && <p className="job-details-header__company">{job.companyName}</p>}
            <dl className="job-details-header__facts">
              <DetailItem label="Location" value={job.location} />
              <DetailItem label="Experience" value={job.experience} />
              <DetailItem label="Salary" value={job.salary} />
              <DetailItem label="Qualification" value={job.qualification} />
            </dl>
          </header>

          <div className="job-details-content">
            <div className="job-details-content__main">
              <Card className="job-details-section">
                <h2>Job description</h2>
                <p className="job-details-section__body">{displayValue(job.description)}</p>
              </Card>

              <Card className="job-details-section">
                <h2>Requirements</h2>
                <dl className="job-details-requirements">
                  <OverviewItem label="Experience" value={job.experience} />
                  <OverviewItem label="Qualification" value={job.qualification} />
                </dl>
              </Card>

              {(job.companyName || job.recruiterName) && (
                <Card className="job-details-company-card">
                  <h2>About the company</h2>
                  {job.companyName && (
                    <div className="job-details-company-card__identity">
                      <span className="job-details-company-card__initial" aria-hidden="true">
                        {job.companyName.trim().charAt(0).toUpperCase() || 'C'}
                      </span>
                      <p>{job.companyName}</p>
                    </div>
                  )}
                  {job.recruiterName && (
                    <p className="job-details-company-card__recruiter">
                      Posted by <span>{job.recruiterName}</span>
                    </p>
                  )}
                </Card>
              )}
            </div>

            <aside className="job-details-content__aside" aria-label="Apply and job overview">
              <Card className="job-details-apply-card">
                <h2>Interested in this role?</h2>
                <p>Review the details and apply for this position.</p>

                {authLoading && <LoadingSpinner label="Checking account" size="small" />}

                {!authLoading && !isAuthenticated && (
                  <Button as={Link} to="/login">Login to apply</Button>
                )}

                {!authLoading && isAuthenticated && user?.role === ROLES.RECRUITER && (
                  <p className="job-details-apply-card__notice" role="status">
                    Recruiter accounts cannot apply for jobs.
                  </p>
                )}

                {!authLoading && isAuthenticated && user?.role === ROLES.JOB_SEEKER && currentApplicationState.status === 'checking' && (
                  <LoadingSpinner label="Checking your application status" size="small" />
                )}

                {!authLoading && isAuthenticated && user?.role === ROLES.JOB_SEEKER && currentApplicationState.status === 'applied' && (
                  <div className="job-application-success" role="status">
                    <strong>{applicationStatus === 'WITHDRAWN' ? 'Application withdrawn' : 'Application submitted'}</strong>
                    {applicationStatus && (
                      <div className="job-application-success__status">
                        <span>Application status</span>
                        <StatusBadge status={applicationStatus} />
                      </div>
                    )}
                    <Button as={Link} to="/seeker/applications" variant="secondary" size="small">
                      My applications
                    </Button>
                  </div>
                )}

                {!authLoading && isAuthenticated && user?.role === ROLES.JOB_SEEKER && currentApplicationState.status === 'error' && (
                  <ErrorMessage
                    title="Application status unavailable"
                    message="We could not check your application history. The server will verify eligibility when you apply."
                  />
                )}

                {!authLoading && isAuthenticated && user?.role === ROLES.JOB_SEEKER && currentApplicationState.status !== 'checking' && currentApplicationState.status !== 'applied' && (
                  <Button type="button" onClick={handleApply} disabled={isApplying} aria-busy={isApplying}>
                    {isApplying ? 'Submitting…' : 'Apply now'}
                  </Button>
                )}

                {!authLoading && isAuthenticated && user?.role !== ROLES.RECRUITER && user?.role !== ROLES.JOB_SEEKER && (
                  <p className="job-details-apply-card__notice" role="status">Only job seeker accounts can apply.</p>
                )}

                {isApplying && <LoadingSpinner label="Submitting your application" size="small" />}
                {applicationError && <ErrorMessage title="Application not submitted" message={applicationError} />}
              </Card>

              <Card className="job-details-overview">
                <h2>Job overview</h2>
                <dl>
                  <OverviewItem label="Location" value={job.location} />
                  <OverviewItem label="Experience" value={job.experience} />
                  <OverviewItem label="Salary" value={job.salary} />
                  <OverviewItem label="Qualification" value={job.qualification} />
                  <OverviewItem label="Application deadline" value={formatDeadline(job.deadline)} />
                </dl>
              </Card>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
