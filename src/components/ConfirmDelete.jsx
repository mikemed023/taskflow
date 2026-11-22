import { useEffect, useRef } from 'react'

export default function ConfirmDelete({ task, onCancel, onConfirm }) {
  const ref = useRef(null)
  const cancelRef = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    dialog.showModal()
    cancelRef.current.focus()
    return () => {
      dialog.close()
    }
  }, [])

  function dismiss(event) {
    event?.preventDefault()
    ref.current.close()
    onCancel()
  }

  function confirm() {
    ref.current.close()
    onConfirm(task.id)
  }

  return (
    <dialog ref={ref} className="panel delete-dialog" aria-labelledby="delete-heading"
      aria-describedby="delete-description" onCancel={dismiss}>
      <h2 id="delete-heading">Delete task?</h2>
      <p id="delete-description">“{task.title}” will be permanently removed from your workspace.</p>
      <div className="form-actions">
        <button className="secondary-button" type="button" ref={cancelRef} onClick={dismiss}>Cancel</button>
        <button className="danger-button" type="button" onClick={confirm}>Delete task</button>
      </div>
    </dialog>
  )
}
