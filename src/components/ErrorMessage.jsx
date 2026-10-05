import './ui.css'

function ErrorMessage({ title = 'Something went wrong', message, children, className = '' }) {
  return (
    <div className={`error-message ${className}`.trim()} role="alert">
      <strong className="error-message__title">{title}</strong>
      {(message || children) && <div className="error-message__body">{message || children}</div>}
    </div>
  )
}

export default ErrorMessage
