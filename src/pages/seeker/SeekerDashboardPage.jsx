import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import Icon from '../../components/Icon.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { getMyApplications } from '../../services/applicationService.js'
import { getProfile } from '../../services/seekerService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './SeekerDashboardPage.css'

function formatAppliedAt(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
}

function getAppliedTimestamp(application) {
  const timestamp = Date.parse(application.appliedAt)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const quickActions = [
  {
    title: 'Find Jobs',
    description: 'Explore openings and find a role that fits your next step.',
    to: '/seeker/jobs',
    action: 'Browse jobs',
    icon: 'briefcase',
    tone: 'blue',
  },
  {
    title: 'My Applications',
    description: 'Keep up with the roles you have applied for.',
    to: '/seeker/applications',
    action: 'View applications',
    icon: 'application',
    tone: 'purple',
  },
  {
    title: 'Profile',
    description: 'Review the skills and experience on your profile.',
    to: '/seeker/profile',
    action: 'View profile',
    icon: 'user',
    tone: 'green',
  },
  {
    title: 'Resume',
    description: 'Keep your resume ready for your next opportunity.',
    to: '/seeker/resume',
    action: 'View resume',
    icon: 'resume',
    tone: 'amber',
  },
]

function SeekerDashboardPage() {
  const [profileState, setProfileState] = useState({ status: 'loading', profile: null })
  const [applications, setApplications] = useState([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [applicationsError, setApplicationsError] = useState('')
  const [applicationsRequest, setApplicationsRequest] = useState(0)

  useEffect(() => {
    let active = true
    getProfile()
      .then((profile) => { if (active) setProfileState({ status: 'ready', profile }) })
      .catch(() => { if (active) setProfileState({ status: 'error', profile: null }) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true

    async function loadApplications() {
      try {
        // GET /applications/my returns List<ApplicationResponseDto>, serialized as an array.
        const response = await getMyApplications()
        if (!Array.isArray(response)) {
          throw new Error('The applications response was not a list.')
        }

        const recentApplications = [...response]
          .sort((first, second) => getAppliedTimestamp(second) - getAppliedTimestamp(first))

        if (active) setApplications(recentApplications)
      } catch (error) {
        if (active) {
          setApplications([])
          setApplicationsError(getApiErrorMessage(
            error,
            'Your applications could not be loaded. Please try again.',
          ))
        }
      } finally {
        if (active) setApplicationsLoading(false)
      }
    }

    loadApplications()
    return () => { active = false }
  }, [applicationsRequest])

  function retryApplications() {
    setApplicationsLoading(true)
    setApplicationsError('')
    setApplicationsRequest((count) => count + 1)
  }

  return (
    <div className="seeker-dashboard">
      <header className="seeker-dashboard__header">
        <div>
          <span className="seeker-dashboard__eyebrow">JOB SEEKER DASHBOARD</span>
          <h1>Welcome back{profileState.status === 'ready' && profileState.profile?.name?.trim() ? `, ${profileState.profile.name.trim()}` : ''}</h1>
          <p>Ready to find your next opportunity?</p>
        </div>
        <Button as={Link} to="/seeker/jobs" className="seeker-dashboard__header-action">
          Find Jobs <span aria-hidden="true">→</span>
        </Button>
      </header>

      <section className="seeker-dashboard__actions" aria-labelledby="quick-actions-title">
        <div className="seeker-dashboard__section-heading">
          <div>
            <h2 id="quick-actions-title">Quick actions</h2>
            <p>Go straight to what you need.</p>
          </div>
        </div>
        <div className="seeker-action-grid">
          {quickActions.map((item) => (
            <Card className="seeker-action-card" key={item.title}>
              <span className={`seeker-action-card__icon seeker-action-card__icon--${item.tone}`} aria-hidden="true">
                <Icon name={item.icon} size={20} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Button as={Link} to={item.to} variant="tertiary" className="seeker-action-card__link">
                {item.action} <span aria-hidden="true">→</span>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <div className="seeker-dashboard__content-grid">
        <section className="seeker-dashboard__panel" aria-labelledby="recent-applications-title">
          <div className="seeker-dashboard__panel-heading">
            <div>
              <h2 id="recent-applications-title">Recent applications</h2>
              <p>{applications.length ? 'Your latest job application activity.' : 'Your application activity will show up here.'}</p>
            </div>
            <Link to="/seeker/applications">View all</Link>
          </div>
          {applicationsLoading && (
            <Card className="seeker-dashboard__applications-state">
              <LoadingSpinner label="Loading recent applications" />
            </Card>
          )}

          {!applicationsLoading && applicationsError && (
            <Card className="seeker-dashboard__applications-state seeker-dashboard__applications-state--error">
              <ErrorMessage title="Applications unavailable" message={applicationsError} />
              <Button type="button" variant="secondary" size="small" onClick={retryApplications}>
                Try again
              </Button>
            </Card>
          )}

          {!applicationsLoading && !applicationsError && applications.length === 0 && (
            <Card className="seeker-dashboard__empty-card">
              <EmptyState
                icon="application"
                title="Your applications will appear here."
                description="When you apply for a job, you can follow its status from this page."
                action={<Button as={Link} to="/seeker/jobs" variant="secondary" size="small">Explore jobs</Button>}
              />
            </Card>
          )}

          {!applicationsLoading && !applicationsError && applications.length > 0 && (
            <div className="seeker-recent-applications" aria-label="Recent applications">
              {applications.slice(0, 3).map((application) => {
                const appliedAt = formatAppliedAt(application.appliedAt)
                return (
                  <Card className="seeker-recent-application" key={application.applicationId}>
                    <div className="seeker-recent-application__heading">
                      <div>
                        <span>APPLICATION #{application.applicationId}</span>
                        <h3>{application.jobName || 'Job title unavailable'}</h3>
                      </div>
                      {application.applicationStatus && <StatusBadge status={application.applicationStatus} />}
                    </div>
                    <div className="seeker-recent-application__footer">
                      {appliedAt && <time dateTime={application.appliedAt}>Applied {appliedAt}</time>}
                      {application.jobId !== null && application.jobId !== undefined && (
                        <Link to={`/jobs/${encodeURIComponent(application.jobId)}`}>View job</Link>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        <section className="seeker-dashboard__panel" aria-labelledby="recommended-jobs-title">
          <div className="seeker-dashboard__panel-heading">
            <div>
              <h2 id="recommended-jobs-title">Recommended jobs</h2>
              <p>Find openings that match your goals.</p>
            </div>
          </div>
          <Card className="seeker-recommendation-card">
            <span className="seeker-recommendation-card__icon"><Icon name="search" size={22} /></span>
            <h3>Ready for something new?</h3>
            <p>Browse available jobs and explore your next opportunity.</p>
            <Button as={Link} to="/seeker/jobs">Find Jobs <span aria-hidden="true">→</span></Button>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default SeekerDashboardPage
