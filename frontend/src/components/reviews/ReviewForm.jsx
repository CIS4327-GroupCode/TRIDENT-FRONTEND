import React, { useState } from 'react';
import { createProjectRating } from '../../config/api';
import StarRating from './StarRating';

const DEFAULT_SCORES = {
  overall: 5
};

export default function ReviewForm({
  projectId,
  token,
  onSubmitted,
  reviewTargets = [],
  reviewedUserId = null,
  onReviewedUserChange,
  requireReviewedUser = false
}) {
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateScore = (key, value) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmedComments = comments.trim();

    if (!token) {
      setError('Authentication is required to submit a rating.');
      return;
    }

    const normalizedReviewedUserId = reviewedUserId ? Number.parseInt(reviewedUserId, 10) : null;
    if (requireReviewedUser && !Number.isInteger(normalizedReviewedUserId)) {
      setError('Please select which researcher this rating is for.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        scores,
        ...(trimmedComments ? { comments: trimmedComments } : {}),
        ...(Number.isInteger(normalizedReviewedUserId)
          ? { reviewed_user_id: normalizedReviewedUserId }
          : {})
      };

      await createProjectRating(projectId, payload, token);
      setSuccess('Rating submitted successfully.');
      setComments('');
      setScores(DEFAULT_SCORES);
      if (typeof onSubmitted === 'function') {
        onSubmitted();
      }
    } catch (submitError) {
      setError(submitError.message || 'Failed to submit rating.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded p-3 bg-light">
      <h6 className="mb-3">Rate Collaboration</h6>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      {reviewTargets.length > 0 && (
        <div className="mb-3">
          <label className="form-label small">Select Researcher</label>
          <select
            className="form-select form-select-sm"
            value={reviewedUserId || ''}
            onChange={(event) => {
              if (typeof onReviewedUserChange === 'function') {
                onReviewedUserChange(event.target.value ? Number.parseInt(event.target.value, 10) : null);
              }
            }}
          >
            <option value="">Choose a researcher...</option>
            {reviewTargets.map((target) => (
              <option key={target.id} value={target.id}>
                {target.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="row g-2 mb-3">
        <div className="col-md-12">
          <label className="form-label small mb-1">Overall</label>
          <StarRating value={scores.overall} onChange={(value) => updateScore('overall', value)} readOnly={false} />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label small">Feedback (Optional)</label>
        <textarea
          className="form-control"
          rows={3}
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Share context for your rating (optional)..."
          maxLength={2000}
        ></textarea>
      </div>

      <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
        {saving ? 'Submitting...' : 'Submit Rating'}
      </button>
    </form>
  );
}
