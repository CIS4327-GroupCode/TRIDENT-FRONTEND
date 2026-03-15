import React, { useEffect, useMemo, useState } from 'react';
import StarRating from './StarRating';

const statusBadgeClass = {
  active: 'bg-success',
  flagged: 'bg-warning text-dark',
  removed: 'bg-danger'
};

export default function ReviewList({
  reviews = [],
  loading = false,
  emptyMessage = 'No reviews yet.',
  itemsPerPage = 5,
  enablePagination = true,
  showStatus = true
}) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [reviews.length]);

  const totalPages = useMemo(() => {
    const effectiveSize = Math.max(itemsPerPage, 1);
    return Math.max(1, Math.ceil(reviews.length / effectiveSize));
  }, [itemsPerPage, reviews.length]);

  const visibleReviews = useMemo(() => {
    if (!enablePagination) {
      return reviews;
    }
    const effectiveSize = Math.max(itemsPerPage, 1);
    const start = (page - 1) * effectiveSize;
    return reviews.slice(start, start + effectiveSize);
  }, [enablePagination, itemsPerPage, page, reviews]);

  if (loading) {
    return <p className="text-muted mb-0">Loading reviews...</p>;
  }

  if (!reviews.length) {
    return <p className="text-muted mb-0">{emptyMessage}</p>;
  }

  return (
    <div className="d-flex flex-column gap-2">
      {visibleReviews.map((review) => (
        <div key={review.id} className="border rounded p-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center gap-2">
              <strong className="small">{review.reviewer?.name || 'Anonymous'}</strong>
              {showStatus && review.status && (
                <span className={`badge ${statusBadgeClass[review.status] || 'bg-secondary'}`}>
                  {review.status}
                </span>
              )}
            </div>
            <small className="text-muted">{new Date(review.created_at || Date.now()).toLocaleDateString()}</small>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <StarRating value={review?.scores?.overall || 0} readOnly size="sm" />
            <small className="text-muted">Overall {(review?.scores?.overall || 0).toFixed(1)}/5</small>
          </div>
          <p className="mb-0 small">{review.comments}</p>
        </div>
      ))}

      {enablePagination && totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center pt-2">
          <small className="text-muted">Page {page} of {totalPages}</small>
          <div className="btn-group btn-group-sm" role="group" aria-label="Review pagination">
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
