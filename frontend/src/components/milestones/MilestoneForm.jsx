import { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';

const MilestoneForm = ({ projectId, milestone, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    due_date: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (milestone) {
      setFormData({
        name: milestone.name || '',
        description: milestone.description || '',
        due_date: milestone.due_date || '',
        status: milestone.status || 'pending'
      });
    }
  }, [milestone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem("trident_token");
      const url = milestone
        ? getApiUrl(`/api/projects/${projectId}/milestones/${milestone.id}`)
        : getApiUrl(`/api/projects/${projectId}/milestones`);

      const method = milestone ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save milestone');
      }

      onSuccess(data.milestone);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Milestone Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Complete User Research"
          required
          maxLength={255}
          disabled={loading}
        />
        <div className="form-text">
          Clear, action-oriented name for this milestone
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          placeholder="Detailed description of what needs to be accomplished..."
          disabled={loading}
        ></textarea>
      </div>

      <div className="mb-3">
        <label htmlFor="due_date" className="form-label">
          Due Date
        </label>
        <input
          type="date"
          className="form-control"
          id="due_date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
          min={!milestone ? today : undefined}
          disabled={loading}
        />
        <div className="form-text">
          {!milestone && 'Due date must be today or in the future'}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="status" className="form-label">
          Status
        </label>
        <select
          className="form-select"
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            milestone ? 'Update Milestone' : 'Create Milestone'
          )}
        </button>
      </div>
    </form>
  );
};

export default MilestoneForm;
