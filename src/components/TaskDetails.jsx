import { isValidDueDate } from '../taskDates.js'
import Icon from './Icon.jsx'

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

export function TaskPriority({ priority }) {
  return <span className={`priority priority-${priority.toLowerCase()}`}>{priority}</span>
}

export function TaskDueDate({ task, today }) {
  const hasDueDate = isValidDueDate(task.dueDate)
  const overdue = task.status !== 'done' && hasDueDate && task.dueDate < today

  return (
    <span className={overdue ? 'task-date is-overdue' : 'task-date'}>
      {hasDueDate && <><Icon name="calendar" size={15} />
        <time dateTime={task.dueDate}>{dateFormat.format(new Date(task.dueDate))}</time></>}
      {overdue && <small>Overdue</small>}
    </span>
  )
}

export function TaskActions({ task, onEdit, onDelete }) {
  return (
    <div className="task-actions">
      <button className="icon-button" type="button" aria-label={`Edit: ${task.title}`}
        onClick={(event) => onEdit(task.id, event.currentTarget)}><Icon name="edit" size={16} /></button>
      <button className="icon-button delete-action" type="button" aria-label={`Delete: ${task.title}`}
        onClick={(event) => onDelete(task, event.currentTarget)}><Icon name="trash" size={16} /></button>
    </div>
  )
}
