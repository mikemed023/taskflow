import Icon from './Icon.jsx'

const links = [
  ['all', 'grid', 'Overview'],
  ['pending', 'clock', 'Pending'],
  ['completed', 'circle', 'Completed'],
]

export default function Sidebar({ filter, onFilter, pending }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#overview" onClick={() => onFilter('all')}>
        <span className="brand-mark"><Icon name="logo" size={24} /></span>
        TaskFlow
      </a>
      <nav aria-label="Workspace">
        <p className="nav-label">Workspace</p>
        {links.map(([value, icon, label]) => (
          <button key={value} type="button" className="nav-item"
            aria-pressed={filter === value} onClick={() => onFilter(value)}>
            <Icon name={icon} size={18} />
            <span>{label}</span>
            {value === 'pending' && <span className="nav-count">{pending}</span>}
          </button>
        ))}
      </nav>
      <div className="workspace">
        <span className="avatar" aria-hidden="true">P</span>
        <div><strong>Personal workspace</strong><small>Local dashboard</small></div>
      </div>
    </aside>
  )
}
