import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import Input from '../../components/Input.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import Pagination from '../../components/Pagination.jsx'
import { getJobs } from '../../services/jobService.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './JobsPage.css'

const EMPTY_FILTERS = { title: '', location: '', experience: '' }
const JOBS_PAGE_SIZE = 5

function formatDeadline(value) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

function JobCard({ job }) {
  const primaryDetails = [
    ['Location', job.location],
    ['Experience', job.experience],
    ['Salary', job.salary],
  ].filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')

  const secondaryDetails = [
    ['Qualification', job.qualification],
    ['Application deadline', formatDeadline(job.deadline)],
  ].filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')

  return (
    <Card className="job-listing-card" aria-labelledby={`job-${job.id}-title`}>
      <div className="job-listing-card__header">
        <div className="job-listing-card__identity">
          <h2 id={`job-${job.id}-title`}>
            <Link to={`/jobs/${encodeURIComponent(job.id)}`}>{job.title || 'Job title unavailable'}</Link>
          </h2>
          {job.companyName && <p className="job-listing-card__company">{job.companyName}</p>}
        </div>
        {!job.companyName && job.recruiterName && (
          <span className="job-listing-card__recruiter">Posted by {job.recruiterName}</span>
        )}
      </div>

      {primaryDetails.length > 0 && (
        <dl className="job-listing-card__highlights">
          {primaryDetails.map(([label, value]) => (
            <div className="job-listing-card__highlight" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {job.description && <p className="job-listing-card__description">{job.description}</p>}

      {secondaryDetails.length > 0 && (
        <dl className="job-listing-card__details">
          {secondaryDetails.map(([label, value]) => (
            <div className="job-listing-card__detail" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="job-listing-card__actions">
        {job.recruiterName && job.companyName && (
          <span className="job-listing-card__recruiter">Posted by {job.recruiterName}</span>
        )}
        <Button as={Link} to={`/jobs/${encodeURIComponent(job.id)}`} size="small">
          View Job <span aria-hidden="true">→</span>
        </Button>
      </div>
    </Card>
  )
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [initialFilters] = useState(() => ({
    title: searchParams.get('title')?.trim() ?? '',
    location: searchParams.get('location')?.trim() ?? '',
    experience: searchParams.get('experience')?.trim() ?? '',
  }))
  const [filters, setFilters] = useState(initialFilters)
  const [search, setSearch] = useState(initialFilters)
  const [page, setPage] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)
  useDocumentTitle('Jobs')

  useEffect(() => {
    let active = true

    getJobs({ ...search, page, size: JOBS_PAGE_SIZE })
      .then((response) => {
        if (active) setResult(response)
      })
      .catch((requestError) => {
        if (active) {
          setResult(null)
          setError(getApiErrorMessage(requestError, 'Jobs could not be loaded. Please try again.'))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [search, page, requestVersion])

  const jobs = Array.isArray(result?.content) ? result.content : []
  const totalPages = Number.isFinite(result?.totalPages) ? result.totalPages : 0
  const currentPage = Number.isFinite(result?.number) ? result.number : page
  const totalElements = Number.isFinite(result?.totalElements) ? result.totalElements : null
  const firstVisibleJob = jobs.length > 0 ? currentPage * JOBS_PAGE_SIZE + 1 : 0
  const lastVisibleJob = jobs.length > 0 ? firstVisibleJob + jobs.length - 1 : 0

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleSearch(event) {
    event.preventDefault()
    const nextSearch = Object.fromEntries(
      Object.entries(filters).map(([key, value]) => [key, value.trim()]),
    )
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(nextSearch)) {
      if (value) params.set(key, value)
    }
    setSearchParams(params)
    setLoading(true)
    setError('')
    setPage(0)
    setSearch(nextSearch)
  }

  function handleClear() {
    setSearchParams(new URLSearchParams())
    setLoading(true)
    setError('')
    setFilters({ ...EMPTY_FILTERS })
    setPage(0)
    setSearch({ ...EMPTY_FILTERS })
  }

  function retry() {
    setLoading(true)
    setError('')
    setRequestVersion((version) => version + 1)
  }

  function changePage(nextPage) {
    setLoading(true)
    setError('')
    setPage(nextPage)
  }

  return (
    <div className="jobs-page">
      <header className="jobs-page__header">
        <span className="jobs-page__eyebrow">JOB OPPORTUNITIES</span>
        <h1>Find your next opportunity</h1>
        <p>Search current openings by job title, location, and experience.</p>
      </header>

      <Card className="jobs-search-card">
        <div className="jobs-search-card__heading">
          <div>
            <h2>Search jobs</h2>
            <p>Use one or more filters to narrow the current openings.</p>
          </div>
        </div>
        <form className="jobs-filter-form" onSubmit={handleSearch}>
          <Input
            id="job-title"
            name="title"
            label="Job title or keyword"
            placeholder="e.g. Software Engineer"
            autoComplete="off"
            value={filters.title}
            onChange={handleFilterChange}
          />
          <Input
            id="job-location"
            name="location"
            label="Location"
            placeholder="e.g. Bengaluru"
            autoComplete="off"
            value={filters.location}
            onChange={handleFilterChange}
          />
          <Input
            id="job-experience"
            name="experience"
            label="Experience"
            placeholder="e.g. 2 years"
            autoComplete="off"
            value={filters.experience}
            onChange={handleFilterChange}
          />
          <div className="jobs-filter-form__actions">
            <Button type="submit">Search jobs</Button>
            <Button type="button" variant="secondary" onClick={handleClear}>Clear</Button>
          </div>
        </form>
      </Card>

      <section className="jobs-results" aria-labelledby="jobs-results-title" aria-busy={loading}>
        <div className="jobs-results__heading">
          <div>
            <h2 id="jobs-results-title">Available jobs</h2>
            {!loading && !error && totalElements !== null && (
              <p>
                {totalElements === 0
                  ? 'No matching jobs'
                  : `Showing ${firstVisibleJob}–${lastVisibleJob} of ${totalElements} ${totalElements === 1 ? 'job' : 'jobs'}`}
              </p>
            )}
          </div>
        </div>

        {loading && (
          <Card className="jobs-results__state">
            <LoadingSpinner label="Loading jobs" size="medium" />
          </Card>
        )}

        {!loading && error && (
          <Card className="jobs-results__error">
            <ErrorMessage title="Unable to load jobs" message={error} />
            <Button type="button" variant="secondary" onClick={retry}>Try again</Button>
          </Card>
        )}

        {!loading && !error && jobs.length === 0 && (
          <Card className="jobs-results__empty">
            <EmptyState
              icon="briefcase"
              title="No jobs found"
              description="Try changing your search criteria or removing some filters."
              action={<Button type="button" variant="secondary" onClick={handleClear}>Clear filters</Button>}
            />
          </Card>
        )}

        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="jobs-results__list">
              {jobs.map((job) => <JobCard job={job} key={job.id} />)}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={changePage} label="Job listing pages" />
          </>
        )}
      </section>
    </div>
  )
}
