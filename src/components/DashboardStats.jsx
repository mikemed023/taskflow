import Icon from './Icon.jsx'

function StatCard({ label, value, icon, tone, detail, progress }) {
  return (
    <article className="stat-card">
      <div className="stat-heading">
        <span className={`icon-tile ${tone}`}><Icon name={icon} /></span>
        <h3>{label}</h3>
      </div>
      <strong className="stat-value">{value}</strong>
      {progress === undefined
        ? <p>{detail}</p>
        : <progress aria-label="Task completion rate" max="100" value={progress} />}
    </article>
  )
}

export default function DashboardStats({ total, completed }) {
  const rate = total ? Math.round((completed / total) * 100) : 0

  return (
    <section className="stats" aria-label="Task statistics">
      <StatCard label="Total tasks" value={total} icon="list" tone="blue" detail="In your workspace" />
      <StatCard label="Completed" value={completed} icon="circle" tone="green" detail="Marked as done" />
      <StatCard label="Pending" value={total - completed} icon="clock" tone="amber" detail="Still to do" />
      <StatCard label="Completion rate" value={`${rate}%`} icon="chart" tone="violet" progress={rate} />
    </section>
  )
}
