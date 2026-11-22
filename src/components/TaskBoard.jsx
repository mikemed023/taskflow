import { useEffect, useId, useRef, useState } from 'react'
import { taskStatuses } from '../taskStatus.js'
import Icon from './Icon.jsx'
import { TaskActions, TaskDueDate, TaskPriority } from './TaskDetails.jsx'

const dragType = 'application/x-taskflow-task'

function BoardCard({ task, today, selectId, onEdit, onDelete, onMove, onDragStart, onDragEnd }) {
  return (
    <li className="board-card" draggable onDragStart={(event) => onDragStart(event, task.id)}
      onDragEnd={onDragEnd}>
      <div className="board-card-heading">
        <h4>{task.title}</h4>
        <TaskActions task={task} onEdit={onEdit} onDelete={onDelete} />
      </div>
      {task.description && <p>{task.description}</p>}
      <div className="board-card-meta">
        <TaskPriority priority={task.priority} />
        <TaskDueDate task={task} today={today} />
      </div>
      <label className="board-status">
        Status
        <span className="select-wrap">
          <select id={selectId} aria-label={`Status: ${task.title}`} value={task.status}
            onChange={(event) => onMove(task.id, event.target.value, true)}>
            {taskStatuses.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
          <Icon name="chevron" size={16} />
        </span>
      </label>
    </li>
  )
}

export default function TaskBoard({ tasks, today, onEdit, onDelete, onStatusChange, headingRef }) {
  const boardId = useId()
  const draggedTask = useRef(null)
  const restoreFocus = useRef(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (restoreFocus.current === null) return
    const control = document.getElementById(`${boardId}-task-${restoreFocus.current}`)
    const focusTarget = control ?? headingRef.current
    focusTarget.focus()
    restoreFocus.current = null
  }, [tasks, boardId, headingRef])

  function moveTask(id, status, focusControl = false) {
    const task = tasks.find((item) => item.id === id)
    if (!task || task.status === status) return
    if (focusControl) restoreFocus.current = id
    onStatusChange(id, status)
    const destination = taskStatuses.find(({ value }) => value === status)
    setAnnouncement(`${task.title} moved to ${destination.label}.`)
  }

  function startDrag(event, id) {
    draggedTask.current = id
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData(dragType, id)
  }

  function endDrag() {
    draggedTask.current = null
    setDropTarget(null)
  }

  function dragOver(event, status) {
    if (draggedTask.current === null) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTarget(status)
  }

  function drop(event, status) {
    const id = event.dataTransfer.getData(dragType)
    if (draggedTask.current === null || id !== draggedTask.current) return
    event.preventDefault()
    endDrag()
    moveTask(id, status)
  }

  return (
    <>
      <div className="board-columns">
        {taskStatuses.map(({ value, label }) => {
          const columnTasks = tasks.filter((task) => task.status === value)
          const headingId = `${boardId}-${value}`

          return (
            <section className="board-column" key={value} aria-labelledby={headingId}
              data-drop-target={dropTarget === value}
              onDragOver={(event) => dragOver(event, value)}
              onDragLeave={(event) => {
                if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
                  setDropTarget((target) => target === value ? null : target)
                }
              }}
              onDrop={(event) => drop(event, value)}>
              <header className="board-column-heading">
                <h3 id={headingId}>{label}</h3><span>{columnTasks.length}</span>
              </header>
              {columnTasks.length ? (
                <ul>{columnTasks.map((task) => (
                  <BoardCard key={task.id} task={task} today={today} selectId={`${boardId}-task-${task.id}`}
                    onEdit={onEdit} onDelete={onDelete} onMove={moveTask}
                    onDragStart={startDrag} onDragEnd={endDrag} />
                ))}</ul>
              ) : <p className="board-empty">No tasks</p>}
            </section>
          )
        })}
      </div>
      <span className="sr-only" role="status">{announcement}</span>
    </>
  )
}
