import { useEffect, useRef, useState } from 'react'
import ConfirmDelete from './components/ConfirmDelete.jsx'
import DashboardHeader from './components/DashboardHeader.jsx'
import DashboardStats from './components/DashboardStats.jsx'
import Sidebar from './components/Sidebar.jsx'
import TaskForm from './components/TaskForm.jsx'
import TaskPanel from './components/TaskPanel.jsx'
import { localDateKey } from './taskDates.js'
import { isTaskStatus, updateTaskStatus } from './taskStatus.js'
import { loadTasks, saveTasks } from './tasks.js'
import './App.css'

export default function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [view, setView] = useState('list')
  const [filter, setFilter] = useState('all')
  const [priority, setPriority] = useState('all')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [today, setToday] = useState(() => localDateKey())
  const titleRef = useRef(null)
  const listHeadingRef = useRef(null)
  const deleteTrigger = useRef(null)
  const editTrigger = useRef(null)
  const focusAfterFormChange = useRef(null)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  useEffect(() => {
    const timer = window.setInterval(() => setToday(localDateKey()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const target = focusAfterFormChange.current
    focusAfterFormChange.current = null
    if (target === 'title') titleRef.current.focus()
    if (target === 'list') {
      const trigger = editTrigger.current
      const focusTarget = trigger?.isConnected ? trigger : listHeadingRef.current
      focusTarget.focus()
    }
  }, [editingId])

  const editingTask = tasks.find((task) => task.id === editingId)
  const completed = tasks.filter((task) => task.status === 'done').length
  const searchTerm = query.trim().toLowerCase()
  const visibleTasks = tasks.filter((task) => {
    const matchesStatus = filter === 'all' || (task.status === 'done') === (filter === 'completed')
    const matchesSearch = `${task.title} ${task.description}`.toLowerCase().includes(searchTerm)
    const matchesPriority = priority === 'all' || task.priority === priority
      
      return matchesStatus && matchesSearch && matchesPriority
  })

  function openCreateForm() {
    if (editingId === null) {
      titleRef.current.focus()
      return
    }

    focusAfterFormChange.current = 'title'
    setEditingId(null)
  }

  function editTask(id, trigger) {
    editTrigger.current = trigger
    if (editingId === id) {
      titleRef.current.focus()
      return
    }

    focusAfterFormChange.current = 'title'
    setEditingId(id)
  }

  function closeEditor() {
    focusAfterFormChange.current = 'list'
    setEditingId(null)
  }

  function submitTask(fields) {
    if (editingTask) {
      setTasks((current) => current.map((task) =>
        task.id === editingId ? { ...task, ...fields } : task,
      ))
      closeEditor()
      return
    }

    const task = updateTaskStatus({ ...fields, id: crypto.randomUUID() }, 'todo')
    setTasks((current) => [task, ...current])
    setFilter('all')
    setQuery('')
  }

  function requestDelete(task, trigger) {
    deleteTrigger.current = trigger
    setDeletingTask(task)
  }

  function cancelDelete() {
    setDeletingTask(null)
    deleteTrigger.current.focus()
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id))
    if (editingId === id) setEditingId(null)
    setDeletingTask(null)
    listHeadingRef.current.focus()
  }

  function changeStatus(id, status) {
    if (!isTaskStatus(status)) return
    setTasks((current) => current.map((task) =>
      task.id === id && task.status !== status ? updateTaskStatus(task, status) : task,
    ))
  }

  function clearCompleted() {
    const confirmed = window.confirm(
      'Are you sure you want to delete all completed tasks?'
    )

    if (!confirmed) return

    setTasks((current) =>
      current.filter((task) => task.status !== 'done')
    ) 
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) =>
      task.id === id ? updateTaskStatus(task, task.status === 'done' ? 'todo' : 'done') : task,
    ))
  }

  return (
    <div className="app-shell">
      <Sidebar filter={filter} onFilter={setFilter} pending={tasks.length - completed} />
      <main>
        <DashboardHeader onNewTask={openCreateForm} />
        <DashboardStats total={tasks.length} completed={completed} />
        <div className="priority-filter">
          <label htmlFor="priorityFilter">Filter by priority:</label>

          <select
            id="priorityFilter"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="all">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        {completed > 0 && (
          <button
            type="button"
            onClick={clearCompleted}
            className="clear-completed-btn"
          >
            Clear Completed ({completed})
          </button>
        )}        
        <div className={view === 'board' ? 'dashboard-grid board-layout' : 'dashboard-grid'}>
          <TaskPanel tasks={visibleTasks} view={view} onViewChange={setView} onStatusChange={changeStatus} filter={filter} onFilter={setFilter}
            query={query} onSearch={setQuery} onToggle={toggleTask} today={today}
            onEdit={editTask} onDelete={requestDelete} headingRef={listHeadingRef} />
          <TaskForm key={editingId} task={editingTask} titleRef={titleRef}
            onSubmit={submitTask} onCancel={closeEditor} />
        </div>
      </main>
      {deletingTask && <ConfirmDelete task={deletingTask}
        onCancel={cancelDelete} onConfirm={deleteTask} />}
    </div>
  )
}
