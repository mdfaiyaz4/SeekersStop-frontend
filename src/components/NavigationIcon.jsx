import Icon from './Icon.jsx'

export default function NavigationIcon({ name, className = '' }) {
  return <span className={className} aria-hidden="true"><Icon name={name} size={19} /></span>
}
