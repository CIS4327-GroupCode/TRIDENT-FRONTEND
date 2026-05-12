import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import {
  approveMilestoneRequest,
  approveMilestoneRevisionRequest,
  createMilestoneRequest,
  deleteProjectMilestone,
  getProjectMilestoneStats,
  listMilestoneRequests,
  listMilestoneRevisionRequests,
  listProjectMilestones,
  listProjectResearcherAccess,
  rejectMilestoneRequest,
  rejectMilestoneRevisionRequest,
  requestMilestoneRevision,
  setMilestoneAssignments,
  setProjectResearcherAccess,
  updateProjectMilestone
} from '../../config/api';
import MilestoneForm from './MilestoneForm';

const EMPTY_REQUEST_FORM = {
  name: '',
  description: '',
  due_date: '',
  justification: ''
};

const FILTERS = ['all', 'pending', 'in_progress', 'revision_requested', 'revision_in_progress', 'completed', 'overdue'];

function statusLabel(status) {
  const map = {
    pending: 'Pending',
    in_progress: 'In Progress',
    revision_requested: 'Revision Requested',
    revision_in_progress: 'Revision In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    overdue: 'Overdue'
  };
  return map[status] || status;
}

export default function MilestoneTracker({ projectId, mode = 'nonprofit' }) {
  const { token, user } = useAuth();
  const roleMode = mode || user?.role || 'nonprofit';
  const isNonprofitMode = roleMode === 'nonprofit';
  const isResearcherMode = roleMode === 'researcher';

  const [milestones, setMilestones] = useState([]);
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [revisionRequestsByMilestone, setRevisionRequestsByMilestone] = useState({});
  const [researcherAccess, setResearcherAccess] = useState([]);

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState(EMPTY_REQUEST_FORM);

  const [expandedAssignments, setExpandedAssignments] = useState({});
  const [assignmentDrafts, setAssignmentDrafts] = useState({});

  const [expandedRevisions, setExpandedRevisions] = useState({});
  const [accessDrafts, setAccessDrafts] = useState({});

  const refreshMainData = async () => {
    if (!token || !projectId) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const milestoneFilters =
        filter === 'all'
          ? {}
          : filter === 'overdue'
            ? { overdue: true }
            : { status: filter };

      const [milestoneRes, statsRes] = await Promise.all([
        listProjectMilestones(projectId, token, milestoneFilters),
        getProjectMilestoneStats(projectId, token)
      ]);

      setMilestones(milestoneRes.milestones || []);
      setStats(statsRes.stats || null);

      if (isNonprofitMode || isResearcherMode) {
        const reqRes = await listMilestoneRequests(projectId, token);
        setRequests(reqRes.milestone_requests || []);
      }

      if (isNonprofitMode) {
        const accessRes = await listProjectResearcherAccess(projectId, token);
        const researchers = accessRes.researchers || [];
        setResearcherAccess(researchers);
        setAccessDrafts(
          Object.fromEntries(
            researchers.map((entry) => [
              entry.researcher.id,
              {
                whole_project: Boolean(entry.whole_project),
                milestone_ids: [...(entry.milestone_ids || [])]
              }
            ])
          )
        );
      }
    } catch (requestError) {
      setError(requestError.message || 'Failed to load milestone data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMainData();
  }, [token, projectId, filter, roleMode]);

  const milestoneAssignmentsMap = useMemo(() => {
    const map = {};
    for (const entry of researcherAccess) {
      for (const milestoneId of entry.milestone_ids || []) {
        if (!map[milestoneId]) {
          map[milestoneId] = [];
        }
        map[milestoneId].push(entry.researcher.id);
      }
    }
    return map;
  }, [researcherAccess]);

  const availableResearchers = useMemo(
    () => researcherAccess.map((entry) => entry.researcher),
    [researcherAccess]
  );

  const dismissMessages = () => {
    setError('');
    setSuccess('');
  };

  const runAction = async (action, successMessage) => {
    setWorking(true);
    setError('');
    setSuccess('');

    try {
      await action();
      setSuccess(successMessage);
      await refreshMainData();
    } catch (requestError) {
      setError(requestError.message || 'Action failed');
    } finally {
      setWorking(false);
    }
  };

  const onDeleteMilestone = (milestoneId) => {
    if (!window.confirm('Delete this milestone? This cannot be undone.')) {
      return;
    }

    runAction(
      () => deleteProjectMilestone(projectId, milestoneId, token),
      'Milestone deleted successfully.'
    );
  };

  const onStatusChange = (milestoneId, nextStatus) => {
    runAction(
      () => updateProjectMilestone(projectId, milestoneId, { status: nextStatus }, token),
      `Milestone updated to ${statusLabel(nextStatus)}.`
    );
  };

  const onCreateRequest = (event) => {
    event.preventDefault();

    runAction(
      async () => {
        await createMilestoneRequest(projectId, requestForm, token);
        setRequestForm(EMPTY_REQUEST_FORM);
        setShowRequestForm(false);
      },
      'Milestone request submitted.'
    );
  };

  const onRequestRevision = (milestoneId) => {
    const reason = window.prompt('Describe why this completed milestone needs revision:');
    if (!reason || !reason.trim()) {
      return;
    }

    runAction(
      () => requestMilestoneRevision(projectId, milestoneId, reason.trim(), token),
      'Revision request submitted.'
    );
  };

  const toggleAssignmentsEditor = (milestoneId) => {
    setExpandedAssignments((prev) => ({ ...prev, [milestoneId]: !prev[milestoneId] }));
    setAssignmentDrafts((prev) => {
      if (prev[milestoneId]) {
        return prev;
      }
      return {
        ...prev,
        [milestoneId]: [...(milestoneAssignmentsMap[milestoneId] || [])]
      };
    });
  };

  const toggleAssignmentDraftResearcher = (milestoneId, researcherId) => {
    setAssignmentDrafts((prev) => {
      const current = prev[milestoneId] || [];
      const exists = current.includes(researcherId);
      const next = exists
        ? current.filter((id) => id !== researcherId)
        : [...current, researcherId];

      return {
        ...prev,
        [milestoneId]: next
      };
    });
  };

  const saveAssignments = (milestoneId) => {
    const researcherIds = assignmentDrafts[milestoneId] || [];
    runAction(
      () => setMilestoneAssignments(projectId, milestoneId, researcherIds, token),
      'Milestone assignments updated.'
    );
  };

  const saveProjectAccess = (researcherId) => {
    const draft = accessDrafts[researcherId] || { whole_project: false, milestone_ids: [] };
    runAction(
      () => setProjectResearcherAccess(projectId, researcherId, draft, token),
      'Researcher project access updated.'
    );
  };

  const toggleWholeProjectAccessDraft = (researcherId) => {
    setAccessDrafts((prev) => {
      const current = prev[researcherId] || { whole_project: false, milestone_ids: [] };
      return {
        ...prev,
        [researcherId]: {
          ...current,
          whole_project: !current.whole_project
        }
      };
    });
  };

  const toggleRevisionPanel = async (milestoneId) => {
    const isOpen = Boolean(expandedRevisions[milestoneId]);
    setExpandedRevisions((prev) => ({ ...prev, [milestoneId]: !isOpen }));

    if (isOpen) {
      return;
    }

    try {
      const response = await listMilestoneRevisionRequests(projectId, milestoneId, token);
      setRevisionRequestsByMilestone((prev) => ({
        ...prev,
        [milestoneId]: response.revision_requests || []
      }));
    } catch (requestError) {
      setError(requestError.message || 'Failed to load revision requests');
    }
  };

  const reviewMilestoneRequest = (requestId, approve) => {
    const feedbackPrompt = approve
      ? 'Optional approval note:'
      : 'Optional rejection reason:';
    const feedback = window.prompt(feedbackPrompt) || '';

    runAction(
      () =>
        approve
          ? approveMilestoneRequest(projectId, requestId, feedback, token)
          : rejectMilestoneRequest(projectId, requestId, feedback, token),
      approve ? 'Milestone request approved.' : 'Milestone request rejected.'
    );
  };

  const reviewRevisionRequest = (milestoneId, revisionId, approve) => {
    const feedbackPrompt = approve
      ? 'Optional approval note:'
      : 'Optional rejection reason:';
    const feedback = window.prompt(feedbackPrompt) || '';

    runAction(
      () =>
        approve
          ? approveMilestoneRevisionRequest(projectId, milestoneId, revisionId, feedback, token)
          : rejectMilestoneRevisionRequest(projectId, milestoneId, revisionId, feedback, token),
      approve ? 'Revision request approved.' : 'Revision request rejected.'
    );
  };

  const badgeClass = (status) => {
    const map = {
      pending: 'bg-secondary',
      in_progress: 'bg-primary',
      revision_requested: 'bg-warning text-dark',
      revision_in_progress: 'bg-info text-dark',
      completed: 'bg-success',
      cancelled: 'bg-dark',
      overdue: 'bg-danger'
    };
    return map[status] || 'bg-secondary';
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'No due date';
    }
    const date = new Date(`${dateString.slice(0, 10)}T00:00:00`);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      {error ? (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={dismissMessages}></button>
        </div>
      ) : null}
      {success ? (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={dismissMessages}></button>
        </div>
      ) : null}

      {stats ? (
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
      ) : null}

      {isNonprofitMode ? (
        <section className="card mb-3">
          <div className="card-body">
            <h6 className="mb-3">Researcher Access Scope</h6>
            {researcherAccess.length === 0 ? (
              <p className="text-muted mb-0 small">No accepted researchers found for this project yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Researcher</th>
                      <th>Whole Project Access</th>
                      <th>Assigned Milestones</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {researcherAccess.map((entry) => {
                      const draft = accessDrafts[entry.researcher.id] || {
                        whole_project: Boolean(entry.whole_project),
                        milestone_ids: [...(entry.milestone_ids || [])]
                      };

                      return (
                        <tr key={entry.researcher.id}>
                          <td>
                            <div className="fw-semibold">{entry.researcher.name}</div>
                            <div className="text-muted small">{entry.researcher.email}</div>
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              checked={Boolean(draft.whole_project)}
                              onChange={() => toggleWholeProjectAccessDraft(entry.researcher.id)}
                              disabled={working}
                            />
                          </td>
                          <td className="small text-muted">
                            {entry.milestone_ids?.length
                              ? `${entry.milestone_ids.length} milestone(s)`
                              : 'No direct milestone assignments'}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => saveProjectAccess(entry.researcher.id)}
                              disabled={working}
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="btn-group" role="group">
          {FILTERS.map((value) => (
            <button
              key={value}
              className={`btn btn-sm ${filter === value ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter(value)}
              type="button"
            >
              {value === 'all' ? 'All' : statusLabel(value)}
            </button>
          ))}
        </div>

        <div className="d-flex gap-2">
          {isResearcherMode ? (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowRequestForm((prev) => !prev)}
            >
              Request Milestone
            </button>
          ) : null}
          {isNonprofitMode ? (
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => {
                setEditingMilestone(null);
                setShowForm(true);
              }}
            >
              + Add Milestone
            </button>
          ) : null}
        </div>
      </div>

      {showRequestForm ? (
        <section className="card mb-3">
          <div className="card-body">
            <h6 className="mb-3">Request New Milestone</h6>
            <form onSubmit={onCreateRequest} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  required
                  value={requestForm.name}
                  onChange={(event) => setRequestForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={requestForm.due_date}
                  onChange={(event) => setRequestForm((prev) => ({ ...prev, due_date: event.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={requestForm.description}
                  onChange={(event) => setRequestForm((prev) => ({ ...prev, description: event.target.value }))}
                ></textarea>
              </div>
              <div className="col-12">
                <label className="form-label">Justification</label>
                <textarea
                  className="form-control"
                  rows="2"
                  required
                  value={requestForm.justification}
                  onChange={(event) => setRequestForm((prev) => ({ ...prev, justification: event.target.value }))}
                ></textarea>
              </div>
              <div className="col-12 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowRequestForm(false);
                    setRequestForm(EMPTY_REQUEST_FORM);
                  }}
                  disabled={working}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={working}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : null}

      {requests.length > 0 ? (
        <section className="card mb-3">
          <div className="card-body">
            <h6 className="mb-3">Milestone Requests</h6>
            <div className="list-group">
              {requests.map((request) => (
                <div key={request.id} className="list-group-item d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <div className="fw-semibold">{request.name}</div>
                    <div className="small text-muted">{request.justification}</div>
                    <div className="small text-muted">
                      Requested by {request.requester?.name || `User ${request.requested_by}`} | Status: {statusLabel(request.status)}
                    </div>
                  </div>
                  {isNonprofitMode && request.status === 'pending' ? (
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={() => reviewMilestoneRequest(request.id, true)}
                        disabled={working}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => reviewMilestoneRequest(request.id, false)}
                        disabled={working}
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {milestones.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No milestones found for this filter.</p>
        </div>
      ) : (
        <div className="list-group">
          {milestones.map((milestone) => {
            const computedStatus = milestone.computed_status || milestone.status;
            const assignmentDraft = assignmentDrafts[milestone.id] || milestoneAssignmentsMap[milestone.id] || [];
            const revisionRequests = revisionRequestsByMilestone[milestone.id] || [];

            return (
              <div key={milestone.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2 gap-2 flex-wrap">
                      <h6 className="mb-0">{milestone.name}</h6>
                      <span className={`badge ${badgeClass(computedStatus)}`}>{statusLabel(computedStatus)}</span>
                    </div>

                    {milestone.description ? <p className="small text-muted mb-2">{milestone.description}</p> : null}
                    <div className="small text-muted">Due: {formatDate(milestone.due_date)}</div>

                    {isNonprofitMode && availableResearchers.length > 0 ? (
                      <div className="mt-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => toggleAssignmentsEditor(milestone.id)}
                        >
                          {expandedAssignments[milestone.id] ? 'Hide Assignments' : 'Manage Assignments'}
                        </button>

                        {expandedAssignments[milestone.id] ? (
                          <div className="mt-2 border rounded p-2">
                            <div className="small text-muted mb-2">Assigned researchers:</div>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {availableResearchers.map((researcher) => (
                                <label key={researcher.id} className="form-check form-check-inline small">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={assignmentDraft.includes(researcher.id)}
                                    onChange={() => toggleAssignmentDraftResearcher(milestone.id, researcher.id)}
                                  />
                                  <span className="form-check-label">{researcher.name}</span>
                                </label>
                              ))}
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => saveAssignments(milestone.id)}
                              disabled={working}
                            >
                              Save Assignments
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info"
                        onClick={() => toggleRevisionPanel(milestone.id)}
                      >
                        {expandedRevisions[milestone.id] ? 'Hide Revision Requests' : 'View Revision Requests'}
                      </button>

                      {expandedRevisions[milestone.id] ? (
                        <div className="mt-2 border rounded p-2">
                          {revisionRequests.length === 0 ? (
                            <p className="small text-muted mb-0">No revision requests for this milestone.</p>
                          ) : (
                            <div className="list-group list-group-flush">
                              {revisionRequests.map((revision) => (
                                <div key={revision.id} className="list-group-item px-0 d-flex justify-content-between align-items-start gap-2">
                                  <div>
                                    <div className="small mb-1">{revision.reason}</div>
                                    <div className="small text-muted">
                                      {revision.requester?.name || `User ${revision.requested_by}`} | {statusLabel(revision.status)}
                                    </div>
                                  </div>
                                  {isNonprofitMode && revision.status === 'pending' ? (
                                    <div className="d-flex gap-2">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-success"
                                        onClick={() => reviewRevisionRequest(milestone.id, revision.id, true)}
                                        disabled={working}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => reviewRevisionRequest(milestone.id, revision.id, false)}
                                        disabled={working}
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {isResearcherMode && ['completed', 'revision_requested'].includes(milestone.status) ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => onRequestRevision(milestone.id)}
                        disabled={working}
                      >
                        Request Revision
                      </button>
                    ) : null}

                    {isNonprofitMode ? (
                      <>
                        {milestone.status !== 'cancelled' ? (
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-outline-secondary dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              Change Status
                            </button>
                            <ul className="dropdown-menu">
                              {['pending', 'in_progress', 'revision_requested', 'revision_in_progress', 'completed', 'cancelled'].map((value) => (
                                <li key={value}>
                                  <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => onStatusChange(milestone.id, value)}
                                  >
                                    {statusLabel(value)}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => {
                              setEditingMilestone(milestone);
                              setShowForm(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => onDeleteMilestone(milestone.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm ? (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}</h5>
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
                  token={token}
                  milestone={editingMilestone}
                  availableMilestones={milestones}
                  onSuccess={() => {
                    setShowForm(false);
                    setEditingMilestone(null);
                    refreshMainData();
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
      ) : null}
    </div>
  );
}
