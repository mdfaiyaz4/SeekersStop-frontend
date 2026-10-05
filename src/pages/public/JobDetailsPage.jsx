import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import useAuth from '../../hooks/useAuth.js'
import { applyForJob } from '../../services/applicationService.js'
import { getJobById } from '../../services/jobService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { ROLES } from '../../utils/roles.js'
import './JobDetailsPage.css'

function formatDeadline(value) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

function formatSalary(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value.toLocaleString()
  return value
}

function DetailItem({ label, value }) {
  if (value === null || value === undefined || String(value).trim() === '') return null
  return (
    <div className="job-detail-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export default function JobDetailsPage() {
  const { id } = useParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [request, setRequest] = useState({ id: null, status: 'loading', job: null, error: '' })
  const [retryCount, setRetryCount] = useState(0)
  const [isApplying, setIsApplying] = useState(false)
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [applicationError, setApplicationError] = useState('')

  useEffect(() => {
    let active = true

    getJobById(id)
      .then((job) => {
        if (active) setRequest({ id, status: 'success', job, error: '' })
      })
      .catch((error) => {
        if (active) {
          setRequest({
            id,
            status: 'error',
            job: null,
            error: getApiErrorMessage(error, 'Job details could not be loaded. Please try again.'),
          })
        }
      })

    return () => { active = false }
  }, [id, retryCount])

  const isLoading = request.id !== id || request.status === 'loading'

  function retry() {
    setRequest({ id, status: 'loading', job: null, error: '' })
    setRetryCount((count) => count + 1)
  }

  async function handleApply() {
    if (isApplying || applicationSuccess || authLoading || !isAuthenticated || user?.role !== ROLES.JOB_SEEKER) return

    setIsApplying(true)
    setApplicationError('')

    try {
      await applyForJob(request.job.id)
      setApplicationSuccess(true)
    } catch (error) {
      const status = error.response?.status
      const fallback = status === 401
        ? 'Please log in as a job seeker to apply.'
        : status === 403
          ? 'Your account is not allowed to apply for this job.'
          : status >= 500
            ? 'The server could not submit your application. Please try again.'
            : 'Your application could not be submitted. Please try again.'

      setApplicationError(getApiErrorMessage(error, fallback))
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="job-details-page">
      <Link className="job-details-back" to="/jobs">Back to jobs</Link>

      {isLoading && (
        <Card className="job-details-state-card">
          <LoadingSpinner label="Loading job details" size="large" />
        </Card>
      )}

      {!isLoading && request.status === 'error' && (
        <Card className="job-details-state-card job-details-error-card">
          <ErrorMessage title="Job details unavailable" message={request.error} />
          <div className="job-details-error-card__actions">
            <Button type="button" variant="secondary" onClick={retry}>Try again</Button>
            <Button as={Link} to="/jobs">Browse jobs</Button>
          </div>
        </Card>
      )}

      {!isLoading && request.status === 'success' && request.job && (
        <>
          <header className="job-details-header">
            <span className="job-details-header__eyebrow">JOB DETAILS</span>
            <h1>{request.job.title}</h1>
            {request.job.companyName && <p className="job-details-header__company">{request.job.companyName}</p>}
            <dl className="job-details-header__facts">
              <DetailItem label="Location" value={request.job.location} />
              <DetailItem label="Experience" value={request.job.experience} />
              <DetailItem label="Salary" value={formatSalary(request.job.salary)} />
              <DetailItem label="Deadline" value={formatDeadline(request.job.deadline)} />
            </dl>
          </header>

          <div className="job-details-content">
            <div className="job-details-content__main">
              {request.job.description && (
                <Card className="job-details-section">
                  <h2>Job description</h2>
                  <p className="job-details-section__body">{request.job.description}</p>
                </Card>
              )}

              {request.job.qualification && (
                <Card className="job-details-section">
                  <h2>Qualification</h2>
                  <p className="job-details-section__body">{request.job.qualification}</p>
                </Card>
              )}
            </div>

            <aside className="job-details-content__aside" aria-label="Application and recruiter information">
              <Card className="job-details-apply-card">
                <h2>Interested in this role?</h2>
                <p>Review the job details before applying.</p>

                {authLoading && <LoadingSpinner label="Checking account" size="small" />}

                {!authLoading && !isAuthenticated && (
                  <Button as={Link} to="/login">Login to Apply</Button>
                )}

                {!authLoading && isAuthenticated && user?.role === ROLES.RECRUITER && (
                  <p className="job-details-apply-card__notice" role="status">Recruiter accounts cannot apply for jobs.</p>
                )}

                {!authLoading && isAuthenticated && user?.role === ROLES.JOB_SEEKER && !applicationSuccess && (
                  <>
                    <Button type="button" onClick={handleApply} disabled={isApplying}>
                      {isApplying ? 'Submitting...' : 'Apply Now'}
                    </Button>
                    {isApplying && <LoadingSpinner label="Submitting your application" size="small" />}
                  </>
                )}

                {!authLoading && isAuthenticated && user?.role !== ROLES.RECRUITER && user?.role !== ROLES.JOB_SEEKER && (
                  <p className="job-details-apply-card__notice" role="status">Only job seeker accounts can apply.</p>
                )}

                {applicationError && <ErrorMessage title="Application not submitted" message={applicationError} />}

                {applicationSuccess && (
                  <div className="job-application-success" role="status">
                    <strong>Application submitted</strong>
                    <p>Your application was submitted. Its status is Pending.</p>
                    <Button as={Link} to="/seeker/applications" variant="secondary" size="small">My Applications</Button>
                  </div>
                )}
              </Card>

              {(request.job.companyName || request.job.recruiterName) && (
                <Card className="job-details-company-card">
                  <h2>Company and recruiter</h2>
                  <dl>
                    <DetailItem label="Company" value={request.job.companyName} />
                    <DetailItem label="Recruiter" value={request.job.recruiterName} />
                  </dl>
                </Card>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
