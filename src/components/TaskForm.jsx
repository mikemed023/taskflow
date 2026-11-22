import { useState } from 'react'
import { isValidDueDate } from '../taskDates.js'
import Icon from './Icon.jsx'

export default function TaskForm({ task, onSubmit, onCancel, titleRef }) {
  const [errors, setErrors] = useState({})
  const initialDueDate = task?.dueDate

  function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const fields = new FormData(form)
    const title = fields.get('title').trim()
    const dueDate = fields.get('dueDate')
    const dateInput = form.elements.namedItem('dueDate')
    const nextErrors = {}

    if (!title) nextErrors.title = 'Enter a task name.'
    if (dateInput.validity.badInput || (dueDate && !isValidDueDate(dueDate))) {
      nextErrors.dueDate = 'Enter a valid calendar date or leave it blank.'
    }

    setErrors(nextErrors)
    if (nextErrors.title || nextErrors.dueDate) {
      const invalidField = nextErrors.title ? titleRef.current : dateInput
      invalidField.focus()
      return
    }

    onSubmit({
      title,
      description: fields.get('description').trim(),
      priority: fields.get('priority'),
      dueDate,
    })

    if (!task) {
      form.reset()
      titleRef.current.focus()
    }
  }

  function clearError(event) {
    const { name } = event.currentTarget
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
  }

  return (
    <section className="panel form-panel" aria-labelledby="create-heading">
      <div className="form-heading">
        <span className="icon-tile blue"><Icon name={task ? 'edit' : 'plus'} /></span>
        <div>
          <h2 id="create-heading">{task ? 'Edit task' : 'Create a task'}</h2>
          <p>{task ? 'Update the task details.' : 'Add a task to your workspace.'}</p>
        </div>
      </div>
      <form noValidate onSubmit={handleSubmit}>
        <div>
          <label>Task name
            <input name="title" ref={titleRef} defaultValue={task?.title}
              placeholder="e.g. Review sprint backlog" required maxLength={100} onInput={clearError}
              aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} />
          </label>
          {errors.title && <p id="title-error" className="field-error" role="alert">{errors.title}</p>}
        </div>
        <label>Description <span className="optional">Optional</span>
          <textarea name="description" defaultValue={task?.description} placeholder="Add a few details…" rows={3} maxLength={400} />
        </label>
        <div className="form-fields">
          <label>Priority
            <span className="select-wrap">
              <select name="priority" defaultValue={task?.priority ?? 'Medium'}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
              <Icon name="chevron" size={16} />
            </span>
          </label>
          <div>
            <label>Due date
              <input type="date" name="dueDate" defaultValue={isValidDueDate(initialDueDate) ? initialDueDate : ''}
                onInput={clearError} aria-invalid={Boolean(errors.dueDate)}
                aria-describedby={errors.dueDate ? 'date-error' : undefined} />
            </label>
            {errors.dueDate && <p id="date-error" className="field-error" role="alert">{errors.dueDate}</p>}
          </div>
        </div>
        {task ? (
          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={onCancel}>Cancel edit</button>
            <button className="primary-button" type="submit">Save changes</button>
          </div>
        ) : <button className="primary-button" type="submit"><Icon name="plus" size={18} /> Add task</button>}
      </form>
    </section>
  )
}
