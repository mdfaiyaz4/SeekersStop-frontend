import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import useAuth from '../../hooks/useAuth.js'
import { getRecruiterApplications } from '../../services/applicationService.js'
import { getCompany } from '../../services/companyService.js'
import { getRecruiterProfile } from '../../services/recruiterService.js'
import { getAllMyJobs } from '../../services/jobService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './RecruiterDashboardPage.css'

const APPLICATION_STATUSES = ['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']
const EMPTY_SECTION = { status: 'loading', value: null, error: '' }
const QUICK_LINKS = [
  { label: 'Post Job', description: 'Create a job listing.', to: '/recruiter/jobs/new', icon: '+' },
  { label: 'Manage Jobs', description: 'View and manage your active and inactive jobs.', to: '/recruiter/jobs', icon: 'J' },
  { label: 'Applications', description: 'Review applications for your jobs.', to: '/recruiter/applications', icon: 'A' },
  { label: 'Recruiter Profile', description: 'Update your contact details.', to: '/recruiter/profile', icon: 'P' },
  { label: 'Company', description: 'Manage your company information.', to: '/recruiter/company', icon: 'C' },
]

function createInitialData() {
  return {
    profile: { ...EMPTY_SECTION },
    company: { ...EMPTY_SECTION },
    jobs: { ...EMPTY_SECTION },
    applications: { ...EMPTY_SECTION },
  }
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
}

function SummaryValue({ label, value }) {
  return (
    <div className="recruiter-dashboard-summary__item">
      <dt>{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  )
}

function MetricCard({ label, value, tone = '' }) {
  return (
    <Card className={`recruiter-dashboard-metric${tone ? ` recruiter-dashboard-metric--${tone}` : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </Card>
  )
}

function SetupCard({ title, description, to, action }) {
  return (
    <Card className="recruiter-dashboard-setup-card">
      <div><h3>{title}</h3><p>{description}</p></div>
      <Button as={Link} to={to} variant="secondary" size="small">{action}</Button>
    </Card>
  )
}

function SectionState({ section, label, onRetry }) {
  if (section.status === 'loading') return <Card className="recruiter-dashboard-state"><LoadingSpinner label={`Loading ${label}`} /></Card>
  if (section.status === 'error') {
    return (
      <Card className="recruiter-dashboard-state">
        <ErrorMessage title={`${label} unavailable`} message={section.error} />
        <Button type="button" variant="secondary" size="small" onClick={onRetry}>Try again</Button>
      </Card>
    )
  }
  return null
}

function ApplicationRow({ application }) {
  return (
    <li className="recruiter-dashboard-application">
      <div className="recruiter-dashboard-application__main">
        <h3>{application.jobName}</h3>
        <dl>
          {application.jobSeeker && <div><dt>Applicant</dt><dd>{application.jobSeeker}</dd></div>}
          {application.applicationId !== null && application.applicationId !== undefined && <div><dt>Application</dt><dd>#{application.applicationId}</dd></div>}
          {application.jobId !== null && application.jobId !== undefined && <div><dt>Job</dt><dd>#{application.jobId}</dd></div>}
          {application.appliedAt && <div><dt>Applied</dt><dd><time dateTime={application.appliedAt}>{formatDate(application.appliedAt)}</time></dd></div>}
        </dl>
      </div>
      {application.applicationStatus && <StatusBadge status={application.applicationStatus} />}
    </li>
  )
}

function JobRow({ job }) {
  const active = job.active === true
  return (
    <li className="recruiter-dashboard-job">
      <div className="recruiter-dashboard-job__copy">
        <h3>{job.title}</h3>
        <p>{[job.companyName, job.location].filter(Boolean).join(' · ')}</p>
      </div>
      <StatusBadge status={active ? 'Active' : 'Inactive'} />
    </li>
  )
}

export default function RecruiterDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(createInitialData)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let active = true

    getRecruiterProfile()
      .then((profile) => { if (active) setData((current) => ({ ...current, profile: { status: 'ready', value: profile, error: '' } })) })
      .catch((error) => {
        if (!active) return
        const missing = error.response?.status === 404
        setData((current) => ({ ...current, profile: { status: missing ? 'missing' : 'error', value: null, error: missing ? '' : getApiErrorMessage(error, 'Recruiter profile could not be loaded.') } }))
      })

    getCompany()
      .then((company) => { if (active) setData((current) => ({ ...current, company: { status: 'ready', value: company, error: '' } })) })
      .catch((error) => {
        if (!active) return
        const missing = error.response?.status === 404
        setData((current) => ({ ...current, company: { status: missing ? 'missing' : 'error', value: null, error: missing ? '' : getApiErrorMessage(error, 'Company information could not be loaded.') } }))
      })

    getAllMyJobs()
      .then((jobs) => { if (active) setData((current) => ({ ...current, jobs: { status: 'ready', value: jobs, error: '' } })) })
      .catch((error) => { if (active) setData((current) => ({ ...current, jobs: { status: 'error', value: null, error: getApiErrorMessage(error, 'Your jobs could not be loaded.') } })) })

    getRecruiterApplications()
      .then((applications) => {
        if (!active) return
        if (!Array.isArray(applications)) throw new Error('The applications response was not a list.')
        setData((current) => ({ ...current, applications: { status: 'ready', value: applications, error: '' } }))
      })
      .catch((error) => { if (active) setData((current) => ({ ...current, applications: { status: 'error', value: null, error: getApiErrorMessage(error, 'Applications could not be loaded.') } })) })

    return () => { active = false }
  }, [reloadCount])

  function retry() {
    setData(createInitialData())
    setReloadCount((count) => count + 1)
  }

  const jobs = data.jobs.status === 'ready' ? data.jobs.value : []
  const applications = data.applications.status === 'ready' ? data.applications.value : []
  const jobCounts = {
    total: jobs.length,
    active: jobs.filter((job) => job.active === true).length,
    inactive: jobs.filter((job) => job.active === false).length,
  }
  const applicationCounts = Object.fromEntries(
    APPLICATION_STATUSES.map((status) => [status, applications.filter((application) => application.applicationStatus === status).length]),
  )
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5)

  return (
    <div className="recruiter-dashboard">
      <header className="recruiter-dashboard__welcome">
        <div>
          <span className="recruiter-dashboard__eyebrow">RECRUITER WORKSPACE</span>
          <h1>Welcome back, {user?.username || 'Recruiter'}</h1>
          <p>Manage your jobs, company information, and applications from one place.</p>
        </div>
        <Button as={Link} to="/recruiter/jobs/new">Post a Job</Button>
      </header>

      <section className="recruiter-dashboard__section" aria-labelledby="recruiter-account-heading">
        <div className="recruiter-dashboard__section-heading"><div><h2 id="recruiter-account-heading">Recruiter profile and company</h2><p>Information loaded from your recruiter account.</p></div></div>
        <div className="recruiter-dashboard__summary-grid">
          {data.profile.status === 'loading' || data.profile.status === 'error' ? (
            <SectionState section={data.profile} label="recruiter profile" onRetry={retry} />
          ) : data.profile.status === 'missing' ? (
            <SetupCard title="Complete your recruiter profile" description="Add your name and contact details to set up your recruiter account." to="/recruiter/profile" action="Set up profile" />
          ) : (
            <Card className="recruiter-dashboard-summary">
              <div className="recruiter-dashboard-summary__heading"><span className="recruiter-dashboard-summary__icon" aria-hidden="true">P</span><h3>Recruiter profile</h3></div>
              <dl><SummaryValue label="Name" value={data.profile.value?.name} /><SummaryValue label="Contact" value={data.profile.value?.contact} /></dl>
              <Link className="recruiter-dashboard-summary__link" to="/recruiter/profile">View profile</Link>
            </Card>
          )}
          {data.company.status === 'loading' || data.company.status === 'error' ? (
            <SectionState section={data.company} label="company information" onRetry={retry} />
          ) : data.company.status === 'missing' ? (
            <SetupCard title="Set up your company" description="Add your company information to complete your recruiter workspace." to="/recruiter/company" action="Set up company" />
          ) : (
            <Card className="recruiter-dashboard-summary">
              <div className="recruiter-dashboard-summary__heading"><span className="recruiter-dashboard-summary__icon" aria-hidden="true">C</span><h3>{data.company.value?.name || 'Company'}</h3></div>
              <dl><SummaryValue label="Location" value={data.company.value?.location} /><SummaryValue label="Website" value={data.company.value?.website} /></dl>
              <Link className="recruiter-dashboard-summary__link" to="/recruiter/company">View company</Link>
            </Card>
          )}
        </div>
      </section>

      <section className="recruiter-dashboard__section" aria-labelledby="recruiter-jobs-heading">
        <div className="recruiter-dashboard__section-heading"><div><h2 id="recruiter-jobs-heading">My Jobs</h2><p>Counts are calculated from all jobs returned by your recruiter jobs endpoint.</p></div><Button as={Link} to="/recruiter/jobs" variant="secondary" size="small">Manage Jobs</Button></div>
        {data.jobs.status === 'loading' || data.jobs.status === 'error' ? (
          <SectionState section={data.jobs} label="your jobs" onRetry={retry} />
        ) : (
          <>
            <div className="recruiter-dashboard__metrics">
              <MetricCard label="Total Jobs" value={jobCounts.total} />
              <MetricCard label="Active Jobs" value={jobCounts.active} tone="active" />
              <MetricCard label="Inactive Jobs" value={jobCounts.inactive} tone="inactive" />
            </div>
            {jobs.length === 0 ? (
              <Card className="recruiter-dashboard__empty"><EmptyState title="No jobs yet" description="Jobs created for your recruiter account will appear here." icon="J" action={<Button as={Link} to="/recruiter/jobs/new">Post a Job</Button>} /></Card>
            ) : (
              <Card className="recruiter-dashboard__list-card">
                <ul className="recruiter-dashboard__job-list">{jobs.map((job) => <JobRow key={job.id} job={job} />)}</ul>
                <Link className="recruiter-dashboard__all-link" to="/recruiter/jobs">Manage all jobs</Link>
              </Card>
            )}
          </>
        )}
      </section>

      <section className="recruiter-dashboard__section" aria-labelledby="recruiter-applications-heading">
        <div className="recruiter-dashboard__section-heading"><div><h2 id="recruiter-applications-heading">Applications</h2><p>Application status counts are calculated from the recruiter applications response.</p></div><Button as={Link} to="/recruiter/applications" variant="secondary" size="small">View Applications</Button></div>
        {data.applications.status === 'loading' || data.applications.status === 'error' ? (
          <SectionState section={data.applications} label="applications" onRetry={retry} />
        ) : applications.length === 0 ? (
          <Card className="recruiter-dashboard__empty"><EmptyState title="No applications yet" description="Applications for your jobs will appear here." icon="A" /></Card>
        ) : (
          <>
            <div className="recruiter-dashboard__metrics recruiter-dashboard__metrics--applications">
              {APPLICATION_STATUSES.map((status) => <MetricCard key={status} label={status} value={applicationCounts[status]} />)}
            </div>
            <Card className="recruiter-dashboard__list-card">
              <h3 className="recruiter-dashboard__list-title">Recent applications</h3>
              <ul className="recruiter-dashboard__application-list">{recentApplications.map((application) => <ApplicationRow key={application.applicationId} application={application} />)}</ul>
            </Card>
          </>
        )}
      </section>

      <section className="recruiter-dashboard__section" aria-labelledby="recruiter-actions-heading">
        <div className="recruiter-dashboard__section-heading"><div><h2 id="recruiter-actions-heading">Quick actions</h2><p>Go directly to a recruiter workspace section.</p></div></div>
        <div className="recruiter-dashboard__actions">
          {QUICK_LINKS.map((item) => (
            <Link className="recruiter-dashboard-action" to={item.to} key={item.to}>
              <span className="recruiter-dashboard-action__icon" aria-hidden="true">{item.icon}</span>
              <span className="recruiter-dashboard-action__copy"><strong>{item.label}</strong><span>{item.description}</span></span>
              <span className="recruiter-dashboard-action__arrow" aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
