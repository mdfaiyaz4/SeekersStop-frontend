import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import JobForm from '../../components/JobForm.jsx'
import { createJob } from '../../services/jobService.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import './PostJobPage.css'

export default function PostJobPage() {
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formKey, setFormKey] = useState(0)

  async function handleSubmit(jobData) {
    setSubmitError('')
    setSuccess(false)

    setIsSubmitting(true)
    try {
      await createJob(jobData)
      setSuccess(true)
      setFormKey((key) => key + 1)
      return true
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'The job could not be created. Please try again.'))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-job-page">
      <header className="create-job-page__header">
        <span className="create-job-page__eyebrow">RECRUITER WORKSPACE</span>
        <h1>Post a job</h1>
        <p>Share the role details candidates need to decide if it is right for them.</p>
      </header>

      <Card className="create-job-card">
        <div className="create-job-card__heading">
          <h2>Job details</h2>
          <p>Complete each field to publish a new opening.</p>
        </div>

        {submitError && <ErrorMessage title="Unable to create job" message={submitError} />}
        {success && (
          <div className="create-job-feedback" role="status">
            <div>
              <strong>Job created successfully.</strong>
              <p>Your job is now available to view.</p>
            </div>
            <Button as={Link} to="/recruiter/jobs" variant="secondary" size="small">Manage Jobs</Button>
          </div>
        )}

        <JobForm key={formKey} submitLabel="Create Job" isSubmitting={isSubmitting} onSubmit={handleSubmit} />
      </Card>
    </div>
  )
}
