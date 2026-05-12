import React from 'react';
import Modal from './Modal';

export default function BulkConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  actionLabel,
  selectedCount,
  eligibleCount,
  skippedCount,
  requiresReason = false,
  reason = '',
  onReasonChange,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Provide context for this bulk action',
  destructive = false,
  loading = false,
}) {
  const reasonMissing = requiresReason && !String(reason || '').trim();

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose}>
      <div className={`card border-${destructive ? 'danger' : 'primary'} border-2`}>
        <div className={`card-header ${destructive ? 'bg-danger text-white' : 'bg-primary text-white'}`}>
          <h6 className="mb-0">{title}</h6>
        </div>
        <div className="card-body">
          <p className="mb-3">
            Action: <strong>{actionLabel}</strong>
          </p>

          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="badge bg-primary">Selected: {selectedCount}</span>
            <span className="badge bg-success">Eligible: {eligibleCount}</span>
            <span className="badge bg-warning text-dark">Will skip: {skippedCount}</span>
          </div>

          {requiresReason && (
            <div className="mb-3">
              <label className="form-label fw-semibold">{reasonLabel}</label>
              <textarea
                className="form-control"
                rows="3"
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder={reasonPlaceholder}
                disabled={loading}
              />
              {reasonMissing && (
                <div className="text-danger small mt-1">Reason is required for this action.</div>
              )}
            </div>
          )}

          {destructive && (
            <div className="alert alert-danger py-2 mb-0">
              This operation may be destructive and cannot be automatically undone.
            </div>
          )}
        </div>
        <div className="card-footer d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn ${destructive ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading || reasonMissing || eligibleCount <= 0}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                Running...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
