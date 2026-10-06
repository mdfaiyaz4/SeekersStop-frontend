import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import JobForm from '../../components/JobForm.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import Icon from '../../components/Icon.jsx'
import Pagination from '../../components/Pagination.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { activateJob, deactivateJob, getMyJobs, updateJob } from '../../services/jobService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './JobsPage.css'

const PAGE_SIZE = 5

function formatDeadline(value) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

function formatSalary(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : value
}

function JobItem({ job, onEdit, onStateChange, isBusy }) {
  const isActive = job.active === true

  return (
    <Card className="manage-job-card">
      <div className="manage-job-card__content">
        <div className="manage-job-card__heading">
          <div>
            <span className="manage-job-card__id">JOB #{job.id}</span>
            <h2>{job.title}</h2>
            {job.companyName && <p className="manage-job-card__company">{job.companyName}</p>}
          </div>
          <StatusBadge status={isActive ? 'Active' : 'Inactive'} />
        </div>
        <dl className="manage-job-card__details">
          {job.location && <div><dt>Location</dt><dd>{job.location}</dd></div>}
          {job.experience && <div><dt>Experience</dt><dd>{job.experience}</dd></div>}
          {job.salary !== null && job.salary !== undefined && <div><dt>Salary</dt><dd>{formatSalary(job.salary)}</dd></div>}
          {job.deadline && <div><dt>Deadline</dt><dd>{formatDeadline(job.deadline)}</dd></div>}
          {job.recruiterName && <div><dt>Recruiter</dt><dd>{job.recruiterName}</dd></div>}
        </dl>
      </div>
      <div className="manage-job-card__actions">
        {isActive && <Button as={Link} to={`/jobs/${encodeURIComponent(job.id)}`} variant="secondary" size="small"><Icon name="eye" size={16} />View Job</Button>}
        <Button type="button" variant="secondary" size="small" onClick={() => onEdit(job)} disabled={isBusy}><Icon name="edit" size={16} />Edit</Button>
        <Button type="button" variant={isActive ? 'tertiary' : 'primary'} size="small" onClick={() => onStateChange(job, isActive ? 'deactivate' : 'activate')} disabled={isBusy}>
          {isBusy ? 'Saving...' : isActive ? 'Deactivate' : 'Activate'}
        </Button>
      </div>
    </Card>
  )
}

export default function JobsPage() {
  const [page, setPage] = useState(0)
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ status: 'loading', jobs: [], totalElements: 0, totalPages: 0, error: '' })
  const [editingJob, setEditingJob] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [busyJobId, setBusyJobId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let active = true
    getMyJobs({ page, size: PAGE_SIZE })
      .then((response) => {
        if (!active) return
        if (!Array.isArray(response?.content)) throw new Error('The recruiter jobs response was not a paginated list.')
        setResult({
          status: 'success',
          jobs: response.content,
          totalElements: response.totalElements ?? response.content.length,
          totalPages: response.totalPages ?? 1,
          error: '',
        })
      })
      .catch((error) => {
        if (!active) return
        setResult({ status: 'error', jobs: [], totalElements: 0, totalPages: 0, error: getApiErrorMessage(error, 'Your jobs could not be loaded. Please try again.') })
      })
    return () => { active = false }
  }, [page, reloadCount])

  function refreshJobs() {
    setResult((current) => ({ ...current, status: 'loading', error: '' }))
    setReloadCount((count) => count + 1)
  }

  async function handleEdit(jobData) {
    setBusyJobId(editingJob.id)
    setActionError('')
    setFeedback('')
    try {
      await updateJob(editingJob.id, jobData)
      setEditingJob(null)
      setFeedback('Job updated successfully.')
      refreshJobs()
      return true
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'This job could not be updated.'))
      return false
    } finally {
      setBusyJobId(null)
    }
  }

  async function confirmStateChange() {
    if (!pendingAction) return
    const { job, action } = pendingAction
    setBusyJobId(job.id)
    setPendingAction(null)
    setActionError('')
    setFeedback('')
    try {
      if (action === 'deactivate') {
        await deactivateJob(job.id)
        setFeedback('The job was deactivated.')
      } else {
        await activateJob(job.id)
        setFeedback('The job was activated.')
      }
      refreshJobs()
    } catch (error) {
      setActionError(getApiErrorMessage(error, `This job could not be ${action}d.`))
    } finally {
      setBusyJobId(null)
    }
  }

  return (
    <div className="manage-jobs-page">
      <header className="manage-jobs-page__header">
        <div>
          <span className="manage-jobs-page__eyebrow">RECRUITER WORKSPACE</span>
          <h1>My Jobs</h1>
          <p>Manage the active and inactive jobs returned for your recruiter account.</p>
        </div>
        <Button as={Link} to="/recruiter/jobs/new"><Icon name="plus" size={17} />Post a Job</Button>
      </header>

      {actionError && <ErrorMessage title="Job action failed" message={actionError} />}
      {feedback && <div className="manage-jobs-feedback" role="status">{feedback}</div>}

      {editingJob && (
        <Card className="manage-job-edit-card">
          <div className="manage-job-edit-card__heading">
            <div><span className="manage-job-card__id">JOB #{editingJob.id}</span><h2>Edit job</h2></div>
            <Button type="button" variant="tertiary" size="small" onClick={() => { setEditingJob(null); setActionError('') }}>Close</Button>
          </div>
          <JobForm
            key={editingJob.id}
            initialValues={editingJob}
            submitLabel="Save Changes"
            isSubmitting={busyJobId === editingJob.id}
            onSubmit={handleEdit}
            onCancel={() => { setEditingJob(null); setActionError('') }}
          />
        </Card>
      )}

      <section className="manage-jobs-results" aria-labelledby="manage-jobs-results-title">
        <div className="manage-jobs-results__heading">
          <div>
            <h2 id="manage-jobs-results-title">Jobs returned for your account</h2>
            {result.status === 'success' && <p>{result.totalElements} {result.totalElements === 1 ? 'job' : 'jobs'} (active and inactive)</p>}
          </div>
          {result.status === 'error' && <Button type="button" variant="secondary" onClick={refreshJobs}>Retry</Button>}
        </div>
        {result.status === 'loading' && <Card className="manage-jobs-state"><LoadingSpinner label="Loading your jobs" size="large" /></Card>}
        {result.status === 'error' && <ErrorMessage title="Jobs unavailable" message={result.error} />}
        {result.status === 'success' && result.jobs.length === 0 && (
          <Card className="manage-jobs-empty"><EmptyState title="No jobs yet" description="Create a listing to start receiving applications." icon="briefcase" action={<Button as={Link} to="/recruiter/jobs/new"><Icon name="plus" size={17} />Post a Job</Button>} /></Card>
        )}
        {result.status === 'success' && result.jobs.length > 0 && (
          <div className="manage-jobs-list">
            {result.jobs.map((job) => (
              <JobItem key={job.id} job={job} onEdit={(selected) => { setEditingJob(selected); setActionError(''); setFeedback('') }} onStateChange={(selected, action) => setPendingAction({ job: selected, action })} isBusy={busyJobId === job.id} />
            ))}
          </div>
        )}
        {result.status === 'success' && <Pagination currentPage={page} totalPages={result.totalPages} onPageChange={(nextPage) => { setResult((current) => ({ ...current, status: 'loading' })); setPage(nextPage) }} label="My jobs pages" />}
      </section>

      {pendingAction && (
        <div className="manage-job-confirm-backdrop">
          <section className="manage-job-confirm" role="alertdialog" aria-modal="true" aria-labelledby="manage-job-confirm-title" aria-describedby="manage-job-confirm-description">
            <h2 id="manage-job-confirm-title">{pendingAction.action === 'deactivate' ? 'Deactivate this job?' : 'Activate this job?'}</h2>
            <p id="manage-job-confirm-description">{pendingAction.job.title} (Job #{pendingAction.job.id})</p>
            <div className="manage-job-confirm__actions">
              <Button type="button" variant="secondary" onClick={() => setPendingAction(null)}>Cancel</Button>
              <Button type="button" onClick={confirmStateChange}>{pendingAction.action === 'deactivate' ? 'Confirm Deactivate' : 'Confirm Activate'}</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
