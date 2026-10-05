import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import Input from '../../components/Input.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
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
  const details = [
    ['Location', job.location],
    ['Experience', job.experience],
    ['Qualification', job.qualification],
    ['Salary', job.salary],
    ['Deadline', formatDeadline(job.deadline)],
  ].filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')

  return (
    <Card className="job-listing-card">
      <div className="job-listing-card__main">
        <div>
          <h2>{job.title}</h2>
          {job.companyName && <p className="job-listing-card__company">{job.companyName}</p>}
        </div>
        {job.recruiterName && <span className="job-listing-card__recruiter">Posted by {job.recruiterName}</span>}
      </div>

      {job.description && <p className="job-listing-card__description">{job.description}</p>}

      {details.length > 0 && (
        <dl className="job-listing-card__details">
          {details.map(([label, value]) => (
            <div className="job-listing-card__detail" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="job-listing-card__actions">
        <Button as={Link} to={`/jobs/${job.id}`} variant="secondary" size="small">View Details</Button>
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

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value.trim()) params.set(key, value.trim())
    }
    setSearchParams(params)
    setLoading(true)
    setError('')
    setPage(0)
    setSearch({ ...filters })
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
        <div>
          <span className="jobs-page__eyebrow">OPPORTUNITIES</span>
          <h1>Find your next job</h1>
          <p>Search current openings by title, location, or experience.</p>
        </div>
      </header>

      <Card className="jobs-filter-card">
        <form className="jobs-filter-form" onSubmit={handleSearch}>
          <Input
            id="job-title"
            name="title"
            label="Job title"
            placeholder="e.g. Software Engineer"
            value={filters.title}
            onChange={handleFilterChange}
          />
          <Input
            id="job-location"
            name="location"
            label="Location"
            placeholder="e.g. Bengaluru"
            value={filters.location}
            onChange={handleFilterChange}
          />
          <Input
            id="job-experience"
            name="experience"
            label="Experience"
            placeholder="e.g. 2 years"
            value={filters.experience}
            onChange={handleFilterChange}
          />
          <div className="jobs-filter-form__actions">
            <Button type="submit">Search jobs</Button>
            <Button type="button" variant="secondary" onClick={handleClear}>Clear</Button>
          </div>
        </form>
      </Card>

      <section className="jobs-results" aria-labelledby="jobs-results-title">
        <div className="jobs-results__heading">
          <div>
            <h2 id="jobs-results-title">Available jobs</h2>
            {!loading && !error && totalElements !== null && (
              <p>{totalElements} {totalElements === 1 ? 'job' : 'jobs'} found</p>
            )}
          </div>
        </div>

        {loading && <LoadingSpinner label="Loading jobs" size="large" />}

        {!loading && error && (
          <div className="jobs-results__error">
            <ErrorMessage title="Unable to load jobs" message={error} />
            <Button type="button" variant="secondary" onClick={retry}>Try again</Button>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <Card className="jobs-results__empty">
            <EmptyState
              icon="J"
              title="No jobs found"
              description="Try changing or clearing your search filters to see available jobs."
              action={<Button type="button" variant="secondary" onClick={handleClear}>Clear filters</Button>}
            />
          </Card>
        )}

        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="jobs-results__list">
              {jobs.map((job) => <JobCard job={job} key={job.id} />)}
            </div>

            {totalPages > 1 && (
              <nav className="jobs-pagination" aria-label="Job listing pages">
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={currentPage <= 0}
                  onClick={() => changePage(currentPage - 1)}
                >Previous</Button>
                <span>Page {currentPage + 1} of {totalPages}</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => changePage(currentPage + 1)}
                >Next</Button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  )
}
