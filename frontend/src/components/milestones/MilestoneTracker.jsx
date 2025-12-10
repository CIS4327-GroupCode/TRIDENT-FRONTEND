import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getApiUrl } from '../../config/api';
import MilestoneForm from './MilestoneForm';

const MilestoneTracker = ({ projectId }) => {
  const { token } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  useEffect(() => {
    fetchMilestones();
    fetchStats();
  }, [projectId, filter]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      let url = getApiUrl(`/api/projects/${projectId}/milestones`);
      
      if (filter !== 'all') {
        if (filter === 'overdue') {
          url += '?overdue=true';
        } else {
          url += `?status=${filter}`;
        }
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch milestones');

      const data = await response.json();
      setMilestones(data.milestones || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        getApiUrl(`/api/projects/${projectId}/milestones/stats`),
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const deleteMilestone = async (milestoneId) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;

    try {
      const response = await fetch(
        getApiUrl(`/api/projects/${projectId}/milestones/${milestoneId}`),
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to delete milestone');

      setMilestones(milestones.filter(m => m.id !== milestoneId));
      fetchStats();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (milestoneId, newStatus) => {
    try {
      const response = await fetch(
        getApiUrl(`/api/projects/${projectId}/milestones/${milestoneId}`),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      const data = await response.json();
      setMilestones(milestones.map(m => 
        m.id === milestoneId ? data.milestone : m
      ));
      fetchStats();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadge = (milestone) => {
    const status = milestone.computed_status || milestone.status;
    const badgeClasses = {
      pending: 'bg-secondary',
      in_progress: 'bg-primary',
      completed: 'bg-success',
      cancelled: 'bg-dark',
      overdue: 'bg-danger'
    };

    const statusLabels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      overdue: 'Overdue'
    };

    return (
      <span className={`badge ${badgeClasses[status] || 'bg-secondary'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const getDaysUntilBadge = (milestone) => {
    if (!milestone.due_date || milestone.status === 'completed') return null;

    const days = milestone.days_until_due;
    if (days === null) return null;

    if (days < 0) {
      return <span className="badge bg-danger ms-2">{Math.abs(days)} days overdue</span>;
    } else if (days === 0) {
      return <span className="badge bg-warning text-dark ms-2">Due today</span>;
    } else if (days <= 7) {
      return <span className="badge bg-warning text-dark ms-2">Due in {days} days</span>;
    } else {
      return <span className="badge bg-info ms-2">{days} days remaining</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
  
    // Ensure we only use the date part and force local midnight
    const datePart = dateString.slice(0, 10); // "YYYY-MM-DD"
    const date = new Date(`${datePart}T00:00:00`);
  
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && milestones.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="milestone-tracker">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body text-center">
                <h3 className="mb-0">{stats.total}</h3>
                <small className="text-muted">Total</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{stats.completion_rate}%</h3>
                <small>Completion Rate</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{stats.in_progress}</h3>
                <small>In Progress</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-danger text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{stats.overdue}</h3>
                <small>Overdue</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div className="btn-group" role="group">
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`btn btn-sm ${filter === 'in_progress' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('in_progress')}
          >
            In Progress
          </button>
          <button
            className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`btn btn-sm ${filter === 'overdue' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('overdue')}
          >
            Overdue
          </button>
        </div>

        <button 
          className="btn btn-success btn-sm"
          onClick={() => {
            setEditingMilestone(null);
            setShowForm(true);
          }}
        >
          + Add Milestone
        </button>
      </div>

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No milestones found for this filter.</p>
          {filter === 'all' && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Create Your First Milestone
            </button>
          )}
        </div>
      ) : (
        <div className="list-group">
          {milestones.map(milestone => (
            <div key={milestone.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <h6 className="mb-0 me-2">{milestone.name}</h6>
                    {getStatusBadge(milestone)}
                    {getDaysUntilBadge(milestone)}
                  </div>
                  
                  {milestone.description && (
                    <p className="mb-2 text-muted small">{milestone.description}</p>
                  )}
                  
                  <div className="small text-muted">
                    <span>Due: {formatDate(milestone.due_date)}</span>
                    {milestone.completed_at && (
                      <span className="ms-3">
                        Completed: {new Date(milestone.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 ms-3">
                  {milestone.status !== 'completed' && milestone.status !== 'cancelled' && (
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                        type="button" 
                        data-bs-toggle="dropdown"
                      >
                        Change Status
                      </button>
                      <ul className="dropdown-menu">
                        {milestone.status !== 'pending' && (
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => updateStatus(milestone.id, 'pending')}
                            >
                              Mark as Pending
                            </button>
                          </li>
                        )}
                        {milestone.status !== 'in_progress' && (
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => updateStatus(milestone.id, 'in_progress')}
                            >
                              Mark as In Progress
                            </button>
                          </li>
                        )}
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => updateStatus(milestone.id, 'completed')}
                          >
                            Mark as Completed
                          </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button 
                            className="dropdown-item text-danger"
                            onClick={() => updateStatus(milestone.id, 'cancelled')}
                          >
                            Cancel Milestone
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setEditingMilestone(milestone);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => deleteMilestone(milestone.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal/Form */}
      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingMilestone(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <MilestoneForm
                  projectId={projectId}
                  milestone={editingMilestone}
                  onSuccess={(updatedMilestone) => {
                    if (editingMilestone) {
                      setMilestones(milestones.map(m => 
                        m.id === updatedMilestone.id ? updatedMilestone : m
                      ));
                    } else {
                      setMilestones([updatedMilestone, ...milestones]);
                    }
                    fetchStats();
                    setShowForm(false);
                    setEditingMilestone(null);
                    setError('');
                  }}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingMilestone(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneTracker;
