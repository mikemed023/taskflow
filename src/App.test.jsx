// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { localDateKey } from './taskDates.js'

const storageKey = 'taskflow.tasks.v1'
const completedTask = {
  id: 'done', title: 'Publish release notes', description: 'Share with support.',
  dueDate: '2000-02-29', priority: 'Low', completed: true,
}
const pendingTask = {
  id: 'todo', title: 'Review wireframes', description: 'Check the new signup flow.',
  dueDate: '2000-02-29', priority: 'High', completed: false,
}

function getStoredTasks() {
  return JSON.parse(localStorage.getItem(storageKey))
}

function stats(label) {
  return screen.getByRole('heading', { name: label }).closest('article')
}

describe('TaskFlow', () => {
  const dialogPrototype = HTMLDialogElement.prototype
  const needsDialogShim = typeof dialogPrototype.showModal !== 'function'

  beforeAll(() => {
    if (!needsDialogShim) return
    // jsdom lacks native modal behavior. Reflect the open state for interaction assertions.
    Object.defineProperties(dialogPrototype, {
      showModal: { configurable: true, value() { this.open = true } },
      close: { configurable: true, value() { this.open = false } },
    })
  })

  afterAll(() => {
    if (!needsDialogShim) return
    delete dialogPrototype.showModal
    delete dialogPrototype.close
  })
  beforeEach(() => {
    localStorage.setItem(storageKey, JSON.stringify([completedTask, pendingTask]))
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('creates a trimmed task and reloads it from storage', () => {
    const { unmount } = render(<App />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Task name' }), { target: { value: '  Prepare demo  ' } })
    fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '2030-05-10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByText('Prepare demo')).toBeTruthy()
    expect(stats('Total tasks').textContent).toContain('3')
    expect(getStoredTasks()[0]).toMatchObject({ title: 'Prepare demo', dueDate: '2030-05-10', completed: false })

    unmount()
    render(<App />)
    expect(screen.getByText('Prepare demo')).toBeTruthy()
  })

  it('keeps cancelled edits and saves changes without changing completion', () => {
    render(<App />)
    const edit = screen.getByRole('button', { name: 'Edit: Publish release notes' })
    fireEvent.click(edit)
    const title = screen.getByRole('textbox', { name: 'Task name' })
    expect(document.activeElement).toBe(title)
    expect(title.value).toBe('Publish release notes')
    fireEvent.change(title, { target: { value: 'Discard this' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel edit' }))
    expect(document.activeElement).toBe(edit)
    expect(screen.getByText('Publish release notes')).toBeTruthy()

    fireEvent.click(edit)
    fireEvent.change(screen.getByRole('textbox', { name: 'Task name' }), { target: { value: 'Publish product updates' } })
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'High' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('checkbox', { name: 'Complete: Publish product updates' }).checked).toBe(true)
    expect(getStoredTasks()[0]).toEqual({ ...completedTask, title: 'Publish product updates', priority: 'High', status: 'done' })
    expect(stats('Completion rate').textContent).toContain('50%')
  })

  it('leaves tasks intact on cancel and removes them only after confirmation', () => {
    render(<App />)
    const remove = screen.getByRole('button', { name: 'Delete: Publish release notes' })
    fireEvent.click(remove)
    const dialog = screen.getByRole('dialog', { name: 'Delete task?' })
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(dialog.textContent).toContain('Publish release notes')
    expect(getStoredTasks()).toHaveLength(2)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(remove)
    expect(screen.getByText('Publish release notes')).toBeTruthy()

    fireEvent.click(remove)
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete task' }))
    expect(screen.queryByText('Publish release notes')).toBeNull()
    expect(getStoredTasks()).toEqual([{ ...pendingTask, status: 'todo' }])
    expect(stats('Total tasks').textContent).toContain('1')
    expect(stats('Completion rate').textContent).toContain('0%')
  })

  it('updates completion, statistics, persistence, and the overdue indicator', () => {
    render(<App />)
    expect(screen.getAllByText('Overdue')).toHaveLength(1)
    const checkbox = screen.getByRole('checkbox', { name: 'Complete: Review wireframes' })
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
    expect(stats('Completion rate').textContent).toContain('100%')
    expect(getStoredTasks()[1].completed).toBe(true)
    expect(screen.queryByText('Overdue')).toBeNull()

    fireEvent.click(checkbox)
    expect(stats('Completion rate').textContent).toContain('50%')
    expect(screen.getByText('Overdue')).toBeTruthy()
  })

  it('combines status filtering and search without changing dashboard totals', () => {
    render(<App />)
    const filters = within(screen.getByRole('group', { name: 'Filter by status' }))
    fireEvent.click(filters.getByRole('button', { name: 'Pending' }))
    expect(screen.getByText('Review wireframes')).toBeTruthy()
    expect(screen.queryByText('Publish release notes')).toBeNull()

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'support' } })
    expect(screen.getByText('No tasks match your filters.')).toBeTruthy()
    fireEvent.click(filters.getByRole('button', { name: 'Completed' }))
    expect(screen.getByText('Publish release notes')).toBeTruthy()
    expect(stats('Total tasks').textContent).toContain('2')
  })

  it('rejects whitespace titles and invalid dates and accepts a blank due date', () => {
    render(<App />)
    const title = screen.getByRole('textbox', { name: 'Task name' })
    const date = screen.getByLabelText('Due date')
    const submit = screen.getByRole('button', { name: 'Add task' })
    fireEvent.change(title, { target: { value: '   ' } })
    fireEvent.click(submit)
    expect(screen.getByRole('alert').textContent).toBe('Enter a task name.')

    fireEvent.input(title, { target: { value: 'Test validation' } })
    fireEvent.input(date, { target: { value: '10000-01-01' } })
    fireEvent.click(submit)
    expect(screen.getByRole('alert').textContent).toBe('Enter a valid calendar date or leave it blank.')
    expect(getStoredTasks()).toHaveLength(2)

    fireEvent.input(date, { target: { value: '' } })
    fireEvent.click(submit)
    expect(screen.getByText('Test validation')).toBeTruthy()
    expect(getStoredTasks()[0].dueDate).toBe('')
  })

  it('does not mark tasks due today as overdue and tolerates invalid stored dates', () => {
    localStorage.setItem(storageKey, JSON.stringify([
      { ...pendingTask, dueDate: localDateKey() },
      { ...completedTask, dueDate: '2025-02-29', completed: false },
    ]))
    render(<App />)
    expect(screen.queryByText('Overdue')).toBeNull()
    expect(screen.getByText('Publish release notes')).toBeTruthy()
  })

  it('migrates legacy tasks to board columns without losing their fields', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'List View' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Board View' }))

    expect(within(screen.getByRole('region', { name: 'To Do' })).getByText(pendingTask.title)).toBeTruthy()
    expect(within(screen.getByRole('region', { name: 'In Progress' })).getByText('No tasks')).toBeTruthy()
    expect(within(screen.getByRole('region', { name: 'Done' })).getByText(completedTask.title)).toBeTruthy()
    expect(getStoredTasks()).toEqual([{ ...completedTask, status: 'done' }, { ...pendingTask, status: 'todo' }])
  })

  it('changes status with the picker, restores focus, and keeps moves after reload', () => {
    const { unmount } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Board View' }))
    const statusName = { name: 'Status: Review wireframes' }

    fireEvent.change(screen.getByRole('combobox', statusName), { target: { value: 'in-progress' } })
    const inProgress = screen.getByRole('region', { name: 'In Progress' })
    expect(document.activeElement).toBe(within(inProgress).getByRole('combobox', statusName))
    expect(screen.getByRole('status').textContent).toBe('Review wireframes moved to In Progress.')
    expect(stats('Pending').querySelector('strong').textContent).toBe('1')
    expect(stats('Completed').querySelector('strong').textContent).toBe('1')
    expect(getStoredTasks()[1]).toEqual({ ...pendingTask, status: 'in-progress' })

    unmount()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Board View' }))
    expect(within(screen.getByRole('region', { name: 'In Progress' })).getByText(pendingTask.title)).toBeTruthy()
    fireEvent.change(screen.getByRole('combobox', statusName), { target: { value: 'done' } })
    expect(stats('Pending').querySelector('strong').textContent).toBe('0')
    expect(stats('Completed').querySelector('strong').textContent).toBe('2')
    expect(stats('Completion rate').querySelector('strong').textContent).toBe('100%')
    expect(getStoredTasks()[1]).toMatchObject({ status: 'done', completed: true })

    fireEvent.click(screen.getByRole('button', { name: 'List View' }))
    expect(screen.getByRole('checkbox', { name: 'Complete: Review wireframes' }).checked).toBe(true)
  })

  it('moves tasks with native drag events and updates the list and statistics', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Board View' }))
    const card = screen.getByRole('heading', { name: completedTask.title }).closest('li')
    const destination = screen.getByRole('region', { name: 'In Progress' })
    const payload = new Map()
    const dataTransfer = {
      setData: (type, data) => payload.set(type, data),
      getData: (type) => payload.get(type) ?? '',
    }

    fireEvent.dragStart(card, { dataTransfer })
    expect(dataTransfer.effectAllowed).toBe('move')
    expect(fireEvent.dragOver(destination, { dataTransfer })).toBe(false)
    expect(destination.dataset.dropTarget).toBe('true')
    fireEvent.drop(destination, { dataTransfer })

    expect(within(destination).getByText(completedTask.title)).toBeTruthy()
    expect(destination.dataset.dropTarget).toBe('false')
    expect(stats('Completion rate').querySelector('strong').textContent).toBe('0%')
    expect(getStoredTasks()[0]).toMatchObject({ status: 'in-progress', completed: false })

    fireEvent.click(screen.getByRole('button', { name: 'List View' }))
    expect(screen.getByRole('checkbox', { name: 'Complete: Publish release notes' }).checked).toBe(false)
  })

  it('uses the shared editor and delete confirmation from the board', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Board View' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit: Review wireframes' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Task name' }), { target: { value: 'Review prototypes' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(within(screen.getByRole('region', { name: 'To Do' })).getByText('Review prototypes')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Delete: Review prototypes' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete task' }))
    expect(screen.queryByText('Review prototypes')).toBeNull()
    expect(getStoredTasks()).toEqual([{ ...completedTask, status: 'done' }])
  })

  it('clears completed tasks and updates dashboard statistics', () => {
    render(<App />)

    // Verify the initial task counts
    expect(stats('Total tasks').textContent).toContain('2')
    expect(stats('Completed').textContent).toContain('1')

    // Find the Clear Completed button
    const clearButton = screen.getByRole('button', {
      name: 'Clear Completed (1)'
    })

    // Simulate confirming the deletion
    const confirmSpy = vi.spyOn(window, 'confirm')
      .mockReturnValue(true)

    fireEvent.click(clearButton)

    // Verify the completed task was removed
    expect(screen.queryByText('Publish release notes')).toBeNull()

    // Verify the pending task remains
    expect(screen.getByText('Review wireframes')).toBeTruthy()

    // Verify the statistics
    expect(stats('Total tasks').textContent).toContain('1')
    expect(stats('Completed').textContent).toContain('0')
    expect(stats('Completion rate').textContent).toContain('0%')

    // Verify localStorage
    expect(getStoredTasks()).toHaveLength(1)

    // Verify the button disappears
    expect(screen.queryByRole('button', {
      name: /Clear Completed/
    })).toBeNull()

    confirmSpy.mockRestore()
  })

  it('keeps completed tasks when clearing is cancelled', () => {
    render(<App />)

    const confirmSpy = vi.spyOn(window, 'confirm')
      .mockReturnValue(false)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Clear Completed (1)'
      })
    )

    expect(screen.getByText('Publish release notes')).toBeTruthy()

    expect(stats('Total tasks').textContent).toContain('2')
    expect(stats('Completed').textContent).toContain('1')

    expect(getStoredTasks()).toHaveLength(2)

    confirmSpy.mockRestore()
  })

  it('filters tasks by priority without changing dashboard totals', () => {
    render(<App />)

    const priorityFilter = screen.getByLabelText('Filter by priority:')

    // Select High priority
    fireEvent.change(priorityFilter, {
      target: { value: 'High' }
    })

    expect(screen.getByText('Review wireframes')).toBeTruthy()
    expect(screen.queryByText('Publish release notes')).toBeNull()

    // Select Low priority
    fireEvent.change(priorityFilter, {
      target: { value: 'Low' }
    })

    expect(screen.getByText('Publish release notes')).toBeTruthy()
    expect(screen.queryByText('Review wireframes')).toBeNull()

    // Select All priorities
    fireEvent.change(priorityFilter, {
      target: { value: 'all' }
    })

    expect(screen.getByText('Review wireframes')).toBeTruthy()
    expect(screen.getByText('Publish release notes')).toBeTruthy()

    // Verify dashboard statistics remain unchanged
    expect(stats('Total tasks').querySelector('strong').textContent).toBe('2')
    expect(stats('Completed').querySelector('strong').textContent).toBe('1')
    expect(stats('Completion rate').querySelector('strong').textContent).toBe('50%')
  })
})
