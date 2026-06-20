import { useState } from 'react'

export default function DecisionModal({ recId, decision, rec, onConfirm, onCancel }) {
  const [note, setNote] = useState('')

  const TITLES = {
    approved: 'Approve Recommendation',
    overridden: 'Override Recommendation',
    escalated: 'Escalate to Human Review',
    dismissed: 'Dismiss Recommendation',
  }

  const BTN_CLASSES = {
    approved: 'btn-success',
    overridden: 'btn-warning',
    escalated: 'btn-danger',
    dismissed: 'btn-ghost',
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{TITLES[decision]}</h3>
        <p>You are about to mark <strong>{rec?.action}</strong> as {decision}. This action will be logged in the audit trail.</p>

        <textarea
          placeholder="Add an optional note explaining your decision (required for compliance overrides)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
        />

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            className={`btn ${BTN_CLASSES[decision]}`}
            onClick={() => onConfirm(recId, decision, note)}
          >
            Confirm Decision
          </button>
        </div>
      </div>
    </div>
  )
}
