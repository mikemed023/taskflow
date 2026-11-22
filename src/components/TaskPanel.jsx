import Icon from './Icon.jsx'
import TaskBoard from './TaskBoard.jsx'
import TaskList from './TaskList.jsx'

const filters = [
  ['all', 'All tasks'],
  ['pending', 'Pending'],
  ['completed', 'Completed'],
]
const views = [
  ['list', 'List View', 'list'],
  ['board', 'Board View', 'grid'],
]

export default function TaskPanel({
  tasks, filter, onFilter, query, onSearch, onToggle, onEdit, onDelete,
  today, headingRef, view, onViewChange, onStatusChange,
}) {
  const isBoard = view === 'board'

  return (
    <section className="panel task-panel" aria-labelledby="tasks-heading">
      <div className="list-heading">
        <div>
          <h2 id="tasks-heading" ref={headingRef} tabIndex={-1}>My tasks</h2>
          <p>{isBoard ? 'Drag tasks between columns or change their status.' : 'Manage your work and mark tasks complete.'}</p>
        </div>
        <label className="search">
          <Icon name="search" size={17} />
          <input type="search" aria-label="Search tasks" placeholder="Search tasks…" value={query}
            onChange={(event) => onSearch(event.target.value)} />
        </label>
      </div>
      <div className="task-toolbar">
        <div className="filters" role="group" aria-label="Filter by status">
          {filters.map(([value, label]) => (
            <button key={value} type="button" aria-pressed={filter === value}
              onClick={() => onFilter(value)}>{label}</button>
          ))}
        </div>
        <div className="view-switch" role="group" aria-label="Task view">
          {views.map(([value, label, icon]) => (
            <button key={value} type="button" aria-pressed={view === value} onClick={() => onViewChange(value)}>
              <Icon name={icon} size={15} />{label}
            </button>
          ))}
        </div>
      </div>
      {isBoard
        ? <TaskBoard tasks={tasks} today={today} onEdit={onEdit} onDelete={onDelete}
          onStatusChange={onStatusChange} headingRef={headingRef} />
        : <TaskList tasks={tasks} today={today} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />}
      <footer aria-live="polite">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} shown</footer>
    </section>
  )
}
