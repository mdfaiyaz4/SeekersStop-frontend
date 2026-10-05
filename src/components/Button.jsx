import './ui.css'

function Button({ as: Component = 'button', children, variant = 'primary', size = 'medium', className = '', ...props }) {
  return (
    <Component className={`ui-button ui-button--${variant} ui-button--${size} ${className}`.trim()} {...props}>
      {children}
    </Component>
  )
}

export default Button
