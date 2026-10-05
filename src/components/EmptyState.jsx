import './ui.css'

function EmptyState({ title = 'Nothing here yet', description, action, icon = '+' }) {
  return (
    <section className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">{icon}</span>
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </section>
  )
}

export default EmptyState
