import './ui.css'
import Icon from './Icon.jsx'

const STATUS_ICONS = {
  pending: 'clock', shortlisted: 'usersCheck', accepted: 'checkCircle',
  rejected: 'xCircle', withdrawn: 'undo', active: 'checkCircle', inactive: 'pause',
}

function StatusBadge({ status, className = '' }) {
  const normalized = String(status || 'unknown').toLowerCase()
  return (
    <span className={`status-badge status-badge--${normalized} ${className}`.trim()}>
      {STATUS_ICONS[normalized] && <Icon name={STATUS_ICONS[normalized]} size={15} />}
      {status || 'Unknown'}
    </span>
  )
}

export default StatusBadge
