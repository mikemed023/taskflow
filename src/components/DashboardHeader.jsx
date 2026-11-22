import Icon from './Icon.jsx'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

export default function DashboardHeader({ onNewTask }) {
  return (
    <header id="overview">
      <div className="topbar">
        <span>Workspace <span className="breadcrumb-divider">/</span> <strong>Overview</strong></span>
        <time><Icon name="calendar" size={16} />{dateFormat.format(new Date())}</time>
      </div>
      <div className="hero">
        <div className="hero-art" aria-hidden="true"><span /></div>
        <div className="hero-content">
          <h1>Task overview</h1>
          <p>See what’s on your plate and track what you’ve finished.</p>
          <button className="primary-button" type="button" onClick={onNewTask}>
            <Icon name="plus" size={18} /> New task
          </button>
        </div>
      </div>
    </header>
  )
}
