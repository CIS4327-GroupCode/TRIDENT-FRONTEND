import React from 'react';

export default function BulkActionToolbar({
  title,
  selectedCount,
  eligibleCount,
  skippedCount,
  action,
  actionOptions,
  onActionChange,
  onExecute,
  onClear,
  loading = false,
  disabled = false,
}) {
  if (!selectedCount) {
    return null;
  }

  return (
    <div className="alert alert-secondary d-flex flex-wrap align-items-center gap-2 mb-3" role="region" aria-label={`${title} bulk actions`}>
      <span className="fw-semibold me-1">{title}</span>
      <span className="badge bg-primary">Selected: {selectedCount}</span>
      <span className="badge bg-success">Eligible: {eligibleCount}</span>
      {skippedCount > 0 && <span className="badge bg-warning text-dark">Will skip: {skippedCount}</span>}

      <select
        className="form-select form-select-sm"
        style={{ width: '220px' }}
        value={action}
        onChange={(e) => onActionChange(e.target.value)}
        disabled={loading || disabled}
        aria-label="Bulk action"
      >
        {actionOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        className="btn btn-sm btn-primary"
        onClick={onExecute}
        disabled={loading || disabled || !action}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-1"></span>
            Processing...
          </>
        ) : (
          'Run Bulk Action'
        )}
      </button>

      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={onClear}
        disabled={loading}
      >
        Clear Selection
      </button>
    </div>
  );
}
