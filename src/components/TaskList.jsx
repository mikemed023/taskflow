import Icon from './Icon.jsx'
import { TaskActions, TaskDueDate, TaskPriority } from './TaskDetails.jsx'

function TaskRow({ task, onToggle, onEdit, onDelete, today }) {
  const completed = task.status === 'done'

  return (
    <li className={`task-row${completed ? ' is-complete' : ''}`}>
      <label className="task-check">
        <input aria-label={`Complete: ${task.title}`} type="checkbox" checked={completed}
          onChange={() => onToggle(task.id)} />
        <Icon name="check" size={14} />
      </label>
      <div className="task-text">
        <strong>{task.title}</strong>
        {task.description && <p>{task.description}</p>}
      </div>
      <TaskPriority priority={task.priority} />
      <TaskDueDate task={task} today={today} />
      <TaskActions task={task} onEdit={onEdit} onDelete={onDelete} />
    </li>
  )
}

export default function TaskList({ tasks, onToggle, onEdit, onDelete, today }) {
  if (!tasks.length) return <p className="empty">No tasks match your filters.</p>

  return (
    <>
      <div className="task-columns" aria-hidden="true"><span>Task</span><span>Priority</span><span>Due date</span><span>Actions</span></div>
      <ul>{tasks.map((task) => <TaskRow key={task.id} task={task} today={today}
        onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />)}</ul>
    </>
  )
}
