export const taskStatuses = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export function isTaskStatus(status) {
  return taskStatuses.some(({ value }) => value === status)
}

export function updateTaskStatus(task, status) {
  return { ...task, status, completed: status === 'done' }
}
