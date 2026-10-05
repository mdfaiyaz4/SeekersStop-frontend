import './ui.css'

function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className={`field ${className}`.trim()}>
      {label && <label className="field__label" htmlFor={id}>{label}</label>}
      <input id={id} className={`field__input${error ? ' field__input--error' : ''}`} aria-invalid={Boolean(error)} aria-describedby={error && id ? `${id}-error` : undefined} {...props} />
      {error && <span className="field__error" id={id ? `${id}-error` : undefined}>{error}</span>}
    </div>
  )
}

export default Input
