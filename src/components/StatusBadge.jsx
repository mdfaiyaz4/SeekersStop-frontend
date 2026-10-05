import './ui.css'

function StatusBadge({ status, className = '' }) {
  const normalized = String(status || 'unknown').toLowerCase()
  return (
    <span className={`status-badge status-badge--${normalized} ${className}`.trim()}>
      {status || 'Unknown'}
    </span>
  )
}

export default StatusBadge
