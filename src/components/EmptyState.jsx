import './ui.css'
import Icon from './Icon.jsx'

function EmptyState({ title = 'Nothing here yet', description, action, icon = 'briefcase' }) {
  return (
    <section className="empty-state">
      <span className="empty-state__icon"><Icon name={icon} size={26} /></span>
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </section>
  )
}

export default EmptyState
