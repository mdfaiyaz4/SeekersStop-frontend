import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import './HomePage.css'

const steps = [
  {
    number: '01',
    title: 'Set up your profile',
    description: 'Share your skills and experience, or introduce your company as a recruiter.',
  },
  {
    number: '02',
    title: 'Explore opportunities',
    description: 'Discover job openings by role, location, and experience level.',
  },
  {
    number: '03',
    title: 'Make your next move',
    description: 'Apply for a role or review applications for the opportunities you post.',
  },
]

function HomePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [searchError, setSearchError] = useState('')
  useDocumentTitle('Home')

  function handleJobSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (title.trim()) params.set('title', title.trim())
    if (location.trim()) params.set('location', location.trim())
    if (!params.toString()) {
      setSearchError('Enter a job title or location to search.')
      return
    }
    setSearchError('')
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__content">
          <span className="eyebrow"><span className="eyebrow__dot" />A clearer path to your next role</span>
          <h1 id="home-hero-title">Find work that fits <span>your next chapter.</span></h1>
          <p className="home-hero__description">
            SeekersStop brings job seekers and recruiters together to make finding the right opportunity feel simpler.
          </p>

          <form className="job-search" role="search" aria-label="Search jobs" onSubmit={handleJobSearch}>
            <label className="job-search__field">
              <span className="job-search__icon" aria-hidden="true">⌕</span>
              <span className="sr-only">Job title or keyword</span>
              <input type="search" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Job title or keyword" />
            </label>
            <span className="job-search__divider" aria-hidden="true" />
            <label className="job-search__field job-search__field--location">
              <span className="job-search__icon job-search__icon--pin" aria-hidden="true">⌖</span>
              <span className="sr-only">Location</span>
              <input type="search" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or location" />
            </label>
            <Button type="submit" className="job-search__button">Search jobs</Button>
          </form>
          {searchError
            ? <p className="home-hero__search-note home-hero__search-note--error" role="alert">{searchError}</p>
            : <p className="home-hero__search-note">Search current openings by title or location.</p>}
        </div>

        <div className="home-hero__visual" aria-label="A simple guide to getting started">
          <div className="hero-orbit hero-orbit--outer" />
          <div className="hero-orbit hero-orbit--inner" />
          <Card className="hero-panel">
            <div className="hero-panel__topline">
              <span className="hero-panel__label">YOUR CAREER, IN MOTION</span>
              <span className="hero-panel__menu" aria-hidden="true">•••</span>
            </div>
            <div className="hero-panel__welcome">
              <div className="hero-panel__avatar" aria-hidden="true">S</div>
              <div><span className="hero-panel__muted">A fresh start begins here</span><strong>Make your next move</strong></div>
            </div>
            <div className="hero-panel__progress">
              <div className="hero-panel__progress-head"><span>Build your profile</span><span>Get started</span></div>
              <div className="hero-panel__progress-track"><span /></div>
            </div>
            <div className="hero-panel__next-label">A FEW GOOD NEXT STEPS</div>
            <div className="hero-panel__task"><span className="hero-panel__task-icon">01</span><span><strong>Add your experience</strong><small>Help employers get to know you</small></span><span className="hero-panel__arrow">→</span></div>
            <div className="hero-panel__task"><span className="hero-panel__task-icon hero-panel__task-icon--blue">02</span><span><strong>Explore job openings</strong><small>Find a role that fits your goals</small></span><span className="hero-panel__arrow">→</span></div>
          </Card>
          <div className="hero-tip"><span className="hero-tip__check">✓</span><span><strong>Your next chapter</strong><small>Starts with one step</small></span></div>
        </div>
      </section>

      <section className="how-section" aria-labelledby="how-title">
        <div className="section-heading">
          <span className="section-kicker">HOW IT WORKS</span>
          <h2 id="how-title">A straightforward way to move forward</h2>
          <p>Whether you are looking for a role or looking for your next teammate, start with a few simple steps.</p>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <Card className="step-card" key={step.number}>
              <span className="step-card__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="audiences-section" aria-label="For job seekers and recruiters">
        <Card className="audience-card audience-card--seeker">
          <span className="audience-card__icon audience-card__icon--blue" aria-hidden="true">↗</span>
          <span className="section-kicker">FOR JOB SEEKERS</span>
          <h2>Your skills deserve the right opportunity.</h2>
          <p>Create a profile, share your experience, and keep track of the roles you apply for.</p>
          <ul className="audience-list">
            <li><span>✓</span> Show your skills and experience</li>
            <li><span>✓</span> Keep your resume close to your profile</li>
            <li><span>✓</span> Follow your application status</li>
          </ul>
          <Button as={Link} to="/register" variant="secondary">Get started as a job seeker <span aria-hidden="true">→</span></Button>
        </Card>

        <Card className="audience-card audience-card--recruiter">
          <span className="audience-card__icon audience-card__icon--navy" aria-hidden="true">＋</span>
          <span className="section-kicker">FOR RECRUITERS</span>
          <h2>Meet people ready for their next challenge.</h2>
          <p>Set up your company profile, share an opening, and review applications in one place.</p>
          <ul className="audience-list">
            <li><span>✓</span> Present your company to candidates</li>
            <li><span>✓</span> Create and manage job openings</li>
            <li><span>✓</span> Review candidate applications</li>
          </ul>
          <Button as={Link} to="/register" variant="secondary">Get started as a recruiter <span aria-hidden="true">→</span></Button>
        </Card>
      </section>

      <section className="home-cta" aria-labelledby="cta-title">
        <div>
          <span className="section-kicker">YOUR NEXT STEP STARTS HERE</span>
          <h2 id="cta-title">Ready to see where it leads?</h2>
          <p>Create your SeekersStop account and take the first step today.</p>
        </div>
        <div className="home-cta__actions">
          <Button as={Link} to="/register" variant="secondary">Create an account <span aria-hidden="true">→</span></Button>
          <Link to="/login">Already have an account? Log in</Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
