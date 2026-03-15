import React from 'react';
import StarRating from './StarRating';

export default function ReviewSummary({ summary, loading = false, compact = false }) {
  if (loading) {
    return <p className="text-muted mb-0">Loading rating summary...</p>;
  }

  const count = summary?.count || 0;
  const averages = summary?.averages || {
    overall: 0,
    quality: 0,
    communication: 0,
    timeliness: 0
  };

  if (!count) {
    return <p className="text-muted mb-0">No reviews yet.</p>;
  }

  if (compact) {
    return (
      <div className="d-flex align-items-center gap-2">
        <StarRating value={averages.overall} readOnly size="sm" />
        <small className="text-muted">{averages.overall.toFixed(1)} ({count})</small>
      </div>
    );
  }

  return (
    <div className="border rounded p-3 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Review Summary</h6>
        <span className="small text-muted">{count} review{count === 1 ? '' : 's'}</span>
      </div>
      <div className="d-flex align-items-center gap-2 mb-2">
        <StarRating value={averages.overall} readOnly />
        <strong>{averages.overall.toFixed(1)}/5</strong>
      </div>
      <div className="small text-muted">
        <div>Quality: {averages.quality.toFixed(1)}/5</div>
        <div>Communication: {averages.communication.toFixed(1)}/5</div>
        <div>Timeliness: {averages.timeliness.toFixed(1)}/5</div>
      </div>
    </div>
  );
}
