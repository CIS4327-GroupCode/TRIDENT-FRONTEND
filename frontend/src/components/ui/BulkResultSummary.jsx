import React from 'react';

export default function BulkResultSummary({ result, onDismiss }) {
  if (!result) {
    return null;
  }

  const hasFailures = (result.summary?.failed || 0) > 0;
  const hasSkips = (result.summary?.skipped || 0) > 0;
  const variant = hasFailures ? 'danger' : hasSkips ? 'warning' : 'success';

  const skippedItems = (result.skipped || []).slice(0, 10);
  const failedItems = (result.failed || []).slice(0, 10);

  return (
    <div className={`alert alert-${variant} alert-dismissible fade show`} role="alert">
      <div className="fw-semibold mb-1">Bulk Action Result ({result.action})</div>
      <div className="d-flex flex-wrap gap-2 mb-2">
        <span className="badge bg-primary">Requested: {result.summary?.requested || 0}</span>
        <span className="badge bg-success">Processed: {result.summary?.processed || 0}</span>
        <span className="badge bg-warning text-dark">Skipped: {result.summary?.skipped || 0}</span>
        <span className="badge bg-danger">Failed: {result.summary?.failed || 0}</span>
        {(result.summary?.queued || 0) > 0 && (
          <span className="badge bg-info">Queued: {result.summary.queued}</span>
        )}
      </div>

      {result.queued?.jobId && (
        <div className="small mb-2">Queued Job ID: {result.queued.jobId}</div>
      )}

      {skippedItems.length > 0 && (
        <div className="small mb-2">
          <strong>Skipped items:</strong>
          <ul className="mb-0 mt-1">
            {skippedItems.map((item) => (
              <li key={`skip-${item.id}`}>#{item.id}: {item.reason}</li>
            ))}
          </ul>
        </div>
      )}

      {failedItems.length > 0 && (
        <div className="small mb-1">
          <strong>Failed items:</strong>
          <ul className="mb-0 mt-1">
            {failedItems.map((item) => (
              <li key={`fail-${item.id}`}>#{item.id}: {item.error}</li>
            ))}
          </ul>
        </div>
      )}

      {onDismiss && (
        <button type="button" className="btn-close" aria-label="Close" onClick={onDismiss}></button>
      )}
    </div>
  );
}
