import './ui.css'

function LoadingSpinner({ label = 'Loading', size = 'medium' }) {
  return (
    <div className={`loading-state loading-state--${size}`} role="status" aria-label={label}>
      <span className="loading-spinner" aria-hidden="true" />
      <span className="loading-state__label">{label}</span>
    </div>
  )
}

export default LoadingSpinner
