import React from 'react';

export default function StarRating({ value = 0, onChange, readOnly = true, size = 'md' }) {
  const normalizedValue = Math.max(0, Math.min(Number(value) || 0, 5));
  const iconSizeClass = size === 'sm' ? 'fs-6' : size === 'lg' ? 'fs-4' : 'fs-5';

  const handleClick = (starValue) => {
    if (readOnly || typeof onChange !== 'function') {
      return;
    }
    onChange(starValue);
  };

  return (
    <span className="d-inline-flex align-items-center gap-1" aria-label={`Rating ${normalizedValue} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = normalizedValue >= star;
        const className = filled ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted';
        return (
          <button
            key={star}
            type="button"
            className="btn btn-link p-0 border-0 text-decoration-none"
            onClick={() => handleClick(star)}
            disabled={readOnly}
            aria-label={`Set rating to ${star}`}
            style={{ lineHeight: 1, cursor: readOnly ? 'default' : 'pointer' }}
          >
            <i className={`${className} ${iconSizeClass}`}></i>
          </button>
        );
      })}
    </span>
  );
}
