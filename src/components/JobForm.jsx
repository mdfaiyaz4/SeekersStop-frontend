import { useState } from 'react'
import Button from './Button.jsx'
import Input from './Input.jsx'
import './JobForm.css'

const EMPTY_JOB = { title: '', description: '', experience: '', qualification: '', salary: '', location: '', deadline: '' }

function todayLocal() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getFormValues(job) {
  return Object.fromEntries(Object.keys(EMPTY_JOB).map((field) => [field, job?.[field] == null ? '' : String(job[field])]))
}

function TextAreaField({ id, name, label, value, onChange, error }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      <textarea id={id} name={name} className={`job-form__textarea${error ? ' field__input--error' : ''}`} value={value} onChange={onChange} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} required />
      {error && <span className="field__error" id={`${id}-error`}>{error}</span>}
    </div>
  )
}

function JobForm({ initialValues = EMPTY_JOB, submitLabel = 'Save Job', isSubmitting = false, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => getFormValues(initialValues))
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function validate() {
    const next = {}
    for (const field of Object.keys(EMPTY_JOB)) {
      if (!form[field].trim()) next[field] = 'This field is required.'
    }
    if (form.salary.trim()) {
      const salary = Number(form.salary)
      if (!Number.isFinite(salary) || salary <= 0) next.salary = 'Salary must be greater than 0.'
    }
    if (form.deadline && form.deadline < todayLocal()) next.deadline = 'Deadline cannot be before today.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      experience: form.experience.trim(),
      qualification: form.qualification.trim(),
      salary: Number(form.salary),
      location: form.location.trim(),
      deadline: form.deadline,
    })
  }

  return (
    <form className="job-form" onSubmit={handleSubmit} noValidate>
      <Input id="job-title" name="title" label="Job title" value={form.title} onChange={handleChange} error={errors.title} required />
      <Input id="job-location" name="location" label="Location" value={form.location} onChange={handleChange} error={errors.location} required />
      <Input id="job-experience" name="experience" label="Experience" value={form.experience} onChange={handleChange} error={errors.experience} required />
      <Input id="job-salary" name="salary" label="Salary" type="number" inputMode="decimal" min="0" step="any" value={form.salary} onChange={handleChange} error={errors.salary} required />
      <Input id="job-deadline" name="deadline" label="Application deadline" type="date" min={todayLocal()} value={form.deadline} onChange={handleChange} error={errors.deadline} required />
      <TextAreaField id="job-qualification" name="qualification" label="Qualification" value={form.qualification} onChange={handleChange} error={errors.qualification} />
      <TextAreaField id="job-description" name="description" label="Description" value={form.description} onChange={handleChange} error={errors.description} />
      <div className="job-form__actions">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting && <span className="button-spinner" aria-hidden="true" />}
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default JobForm
