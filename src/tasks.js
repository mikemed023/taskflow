import { isTaskStatus, updateTaskStatus } from './taskStatus.js'

const storageKey = 'taskflow.tasks.v1'

const sampleTasks = [
  { id: 'brief', title: 'Finalize Q4 campaign brief', description: 'Incorporate feedback from the marketing team.', priority: 'High', dueDate: '2026-11-23', completed: false },
  { id: 'onboarding', title: 'Review onboarding wireframes', description: 'Leave comments on the new account setup flow.', priority: 'High', dueDate: '2026-11-24', completed: false },
  { id: 'report', title: 'Prepare the weekly metrics report', description: 'Summarize activation, retention, and signups.', priority: 'Medium', dueDate: '2026-11-25', completed: false },
  { id: 'docs', title: 'Update the release checklist', description: 'Add the new accessibility review steps.', priority: 'Low', dueDate: '2026-11-27', completed: false },
  { id: 'sprint', title: 'Set up the next sprint board', description: 'Move agreed priorities into the sprint.', priority: 'Medium', dueDate: '2026-11-19', completed: true },
  { id: 'feedback', title: 'Summarize customer interviews', description: 'Share recurring themes with the product team.', priority: 'Low', dueDate: '2026-11-18', completed: true },
]

function migrateTasks(tasks) {
  return tasks.map((task) => {
    const status = isTaskStatus(task.status) ? task.status : (task.completed ? 'done' : 'todo')
    return updateTaskStatus(task, status)
  })
}

export function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey))
    return migrateTasks(Array.isArray(stored) ? stored : sampleTasks)
  } catch {
    return migrateTasks(sampleTasks)
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks))
  } catch {
    // The current session still works when browser storage is unavailable.
  }
}
