import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getApiUrl } from '../config/api';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);
  
  // Filters
  const [userFilters, setUserFilters] = useState({ role: '', status: '', search: '' });
  const [projectFilters, setProjectFilters] = useState({ status: '', search: '' });
  
  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);

  // Check admin access
  useEffect(() => {
    if (!token) {
      setError('Not authenticated. Please log in as admin.');
      setLoading(false);
      return;
    }
    if (user && user.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
  }, [token, user]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'projects') fetchProjects();
    if (activeTab === 'pending-review') fetchPendingProjects();
    if (activeTab === 'milestones') fetchMilestones();
    if (activeTab === 'organizations') fetchOrganizations();
  }, [activeTab, userFilters, projectFilters, userPage, projectPage]);

  const fetchDashboardStats = async () => {
    try {
      if (!token) {
        setError('Not authenticated. Please log in as admin.');
        return;
      }
      
      const res = await fetch(getApiUrl('/api/admin/dashboard/stats'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
      } else {
        if (res.status === 401) {
          setError('Unauthorized. Please log in as admin.');
        } else if (res.status === 403) {
          setError('Forbidden. Admin access required.');
        } else {
          setError(data.error || 'Failed to fetch stats');
        }
      }
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError('Failed to fetch dashboard stats');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: userPage,
        limit: 20,
        ...userFilters,
        includeSuspended: 'true'
      });
      const res = await fetch(getApiUrl(`/api/admin/users?${params}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data.users);
      else setError(data.error);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: projectPage,
        limit: 20,
        ...projectFilters
      });
      const res = await fetch(getApiUrl(`/api/admin/projects?${params}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setProjects(data.projects);
      else setError(data.error);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/milestones?limit=50'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMilestones(data.milestones);
      else setError(data.error);
    } catch (err) {
      setError('Failed to fetch milestones');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/organizations?limit=50'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOrganizations(data.organizations);
      else setError(data.error);
    } catch (err) {
      setError('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    if (!confirm('Approve this user account?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${userId}/approve`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchUsers();
        fetchDashboardStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to approve user');
    }
  };

  const suspendUser = async (userId, userName) => {
    const reason = prompt(`Suspend user "${userName}"?\n\nEnter reason (optional):`);
    if (reason === null) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${userId}/suspend`), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchUsers();
        fetchDashboardStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to suspend user');
    }
  };

  const unsuspendUser = async (userId) => {
    if (!confirm('Unsuspend this user account?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${userId}/unsuspend`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchUsers();
        fetchDashboardStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to unsuspend user');
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!confirm(`PERMANENTLY DELETE user "${userName}"?\n\nThis action CANNOT be undone!`)) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${userId}/permanent`), {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirmation: 'DELETE' })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchUsers();
        fetchDashboardStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const deleteProject = async (projectId, projectTitle) => {
    const reason = prompt(`Delete project "${projectTitle}"?\n\nEnter reason (optional):`);
    if (reason === null) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/projects/${projectId}`), {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchProjects();
        fetchDashboardStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const updateProjectStatus = async (projectId, currentStatus) => {
    const newStatus = prompt(
      `Change project status from "${currentStatus}"?\n\nEnter new status:\n- draft\n- open\n- in_progress\n- completed\n- cancelled`
    );
    if (!newStatus) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/projects/${projectId}/status`), {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchProjects();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to update project status');
    }
  };

  const deleteMilestone = async (milestoneId, milestoneName) => {
    const reason = prompt(`Delete milestone "${milestoneName}"?\n\nEnter reason (optional):`);
    if (reason === null) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/milestones/${milestoneId}`), {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchMilestones();
        fetchDashboardStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to delete milestone');
    }
  };

  const fetchPendingProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/projects/pending?limit=50'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPendingProjects(data.projects);
      else setError(data.error);
    } catch (err) {
      setError('Failed to fetch pending projects');
    } finally {
      setLoading(false);
    }
  };

  const approveProject = async (projectId, projectTitle) => {
    const feedback = prompt(`Approve project "${projectTitle}"?\n\nOptional feedback (leave blank for none):`);
    if (feedback === null) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/projects/${projectId}/approve`), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feedback: feedback || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchPendingProjects();
        fetchDashboardStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to approve project');
    }
  };

  const rejectProject = async (projectId, projectTitle) => {
    const rejection_reason = prompt(`Reject project "${projectTitle}"?\n\nRejection reason (required):`);
    if (!rejection_reason) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/projects/${projectId}/reject`), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejection_reason })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchPendingProjects();
        fetchDashboardStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to reject project');
    }
  };

  const requestChanges = async (projectId, projectTitle) => {
    const changes_requested = prompt(`Request changes for project "${projectTitle}"?\n\nSpecify required changes:`);
    if (!changes_requested) return;
    const feedback = prompt('Additional feedback (optional):');
    if (feedback === null) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/projects/${projectId}/request-changes`), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          changes_requested,
          feedback: feedback || undefined 
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchPendingProjects();
        fetchDashboardStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to request changes');
    }
  };

  const deleteOrganization = async (orgId, orgName) => {
    if (!confirm(`PERMANENTLY DELETE organization "${orgName}" and ALL associated projects?\n\nThis action CANNOT be undone!`)) return;
    try {
      const res = await fetch(getApiUrl(`/api/admin/organizations/${orgId}`), {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirmation: 'DELETE' })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchOrganizations();
        fetchDashboardStats();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to delete organization');
    }
  };

  const fetchProjectDetails = async (projectId) => {
    setLoadingProjectDetails(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/projects/${projectId}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProjectDetails(data.project);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch project details');
    } finally {
      setLoadingProjectDetails(false);
    }
  };

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    fetchProjectDetails(project.project_id);
  };

  return (
    <div className="page-root">
      <TopBar />
      <main className="page-content container-fluid py-4">
        <h1 className="mb-4">
          <i className="bi bi-shield-check me-2"></i>
          Admin Dashboard
        </h1>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-bar-chart me-1"></i> Overview
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people me-1"></i> Users
            {stats?.pending_approval > 0 && (
              <span className="badge bg-danger ms-2">{stats.pending_approval}</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <i className="bi bi-folder me-1"></i> Projects
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'pending-review' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending-review')}
          >
            <i className="bi bi-clipboard-check me-1"></i> Pending Review
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setActiveTab('milestones')}
          >
            <i className="bi bi-flag me-1"></i> Milestones
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'organizations' ? 'active' : ''}`}
            onClick={() => setActiveTab('organizations')}
          >
            <i className="bi bi-building me-1"></i> Organizations
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          {/* Stats Cards */}
          <div className="col-12">
            <h5 className="mb-3">Platform Statistics</h5>
          </div>
          
          <div className="col-md-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="card-title">Total Users</h6>
                    <h2 className="mb-2">{stats?.total_users || 0}</h2>
                    <small>
                      {stats?.nonprofit_users || 0} nonprofits<br/>
                      {stats?.researcher_users || 0} researchers
                    </small>
                  </div>
                  <i className="bi bi-people fs-1 opacity-50"></i>
                </div>
              </div>
              <div className="card-footer bg-transparent border-0">
                <button 
                  className="btn btn-light btn-sm w-100"
                  onClick={() => setActiveTab('users')}
                >
                  View All Users
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="card-title">Organizations</h6>
                    <h2 className="mb-2">{stats?.total_organizations || 0}</h2>
                    <small>Registered nonprofits</small>
                  </div>
                  <i className="bi bi-building fs-1 opacity-50"></i>
                </div>
              </div>
              <div className="card-footer bg-transparent border-0">
                <button 
                  className="btn btn-light btn-sm w-100"
                  onClick={() => setActiveTab('organizations')}
                >
                  View Organizations
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-info text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="card-title">Projects</h6>
                    <h2 className="mb-2">{stats?.total_projects || 0}</h2>
                    <small>
                      {stats?.open_projects || 0} open<br/>
                      {stats?.draft_projects || 0} drafts
                    </small>
                  </div>
                  <i className="bi bi-folder fs-1 opacity-50"></i>
                </div>
              </div>
              <div className="card-footer bg-transparent border-0">
                <button 
                  className="btn btn-light btn-sm w-100"
                  onClick={() => setActiveTab('projects')}
                >
                  View All Projects
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-secondary text-white h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="card-title">Milestones</h6>
                    <h2 className="mb-2">{stats?.total_milestones || 0}</h2>
                    <small>
                      {stats?.active_milestones || 0} in progress<br/>
                      {stats?.completed_milestones || 0} completed
                    </small>
                  </div>
                  <i className="bi bi-flag fs-1 opacity-50"></i>
                </div>
              </div>
              <div className="card-footer bg-transparent border-0">
                <button 
                  className="btn btn-light btn-sm w-100"
                  onClick={() => setActiveTab('milestones')}
                >
                  View Milestones
                </button>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="col-12 mt-4">
            <h5 className="mb-3">Action Items</h5>
          </div>

          <div className="col-md-6">
            <div className="card border-warning">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Pending Approvals
                </h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fs-5">New User Accounts</span>
                  <span className="badge bg-warning fs-6">{stats?.pending_approval || 0}</span>
                </div>
                <button 
                  className="btn btn-warning w-100"
                  onClick={() => setActiveTab('users')}
                  disabled={!stats?.pending_approval}
                >
                  Review Pending Users
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-danger">
              <div className="card-header bg-danger text-white">
                <h6 className="mb-0">
                  <i className="bi bi-ban me-2"></i>
                  Suspended Accounts
                </h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fs-5">Suspended Users</span>
                  <span className="badge bg-danger fs-6">{stats?.suspended_users || 0}</span>
                </div>
                <button 
                  className="btn btn-danger w-100"
                  onClick={() => setActiveTab('users')}
                  disabled={!stats?.suspended_users}
                >
                  View Suspended Users
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div className="col-12 mt-4">
            <h5 className="mb-3">Quick Summary</h5>
          </div>

          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-graph-up me-2"></i>
                  Platform Overview
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="border-start border-primary border-4 ps-3">
                      <div className="text-muted small">Total Users</div>
                      <div className="h4 mb-0">{stats?.total_users || 0}</div>
                      <div className="small text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        {stats?.total_users - (stats?.pending_approval || 0) - (stats?.suspended_users || 0) || 0} active
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border-start border-success border-4 ps-3">
                      <div className="text-muted small">Organizations</div>
                      <div className="h4 mb-0">{stats?.total_organizations || 0}</div>
                      <div className="small">Nonprofits registered</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border-start border-info border-4 ps-3">
                      <div className="text-muted small">Projects</div>
                      <div className="h4 mb-0">{stats?.total_projects || 0}</div>
                      <div className="small">
                        <span className="text-success me-2">{stats?.open_projects || 0} open</span>
                        <span className="text-muted">{stats?.draft_projects || 0} drafts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="col-12 mt-4">
            <div className="card bg-light">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h6 className="mb-2">
                      <i className="bi bi-info-circle me-2"></i>
                      System Status
                    </h6>
                    <p className="mb-0 small text-muted">
                      All systems operational. Database connected. Last update: {new Date().toLocaleString()}
                    </p>
                  </div>
                  <div className="col-md-4 text-end">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => fetchDashboardStats()}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Refresh Stats
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Filters */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or email..."
                    value={userFilters.search}
                    onChange={(e) => setUserFilters({...userFilters, search: e.target.value})}
                  />
                </div>
                <div className="col-md-2">
                  <select 
                    className="form-select"
                    value={userFilters.role}
                    onChange={(e) => setUserFilters({...userFilters, role: e.target.value})}
                  >
                    <option value="">All Roles</option>
                    <option value="nonprofit">Nonprofit</option>
                    <option value="researcher">Researcher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <select 
                    className="form-select"
                    value={userFilters.status}
                    onChange={(e) => setUserFilters({...userFilters, status: e.target.value})}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Affiliation</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="text-center py-4">Loading...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-4">No users found</td></tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className={user.deleted_at ? 'table-danger' : ''}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td><span className={`badge bg-${user.role === 'admin' ? 'danger' : user.role === 'nonprofit' ? 'primary' : 'info'}`}>{user.role}</span></td>
                        <td>
                          {user.deleted_at ? (
                            <span className="badge bg-danger">Suspended</span>
                          ) : (
                            <span className={`badge bg-${user.account_status === 'active' ? 'success' : user.account_status === 'pending' ? 'warning' : 'secondary'}`}>
                              {user.account_status}
                            </span>
                          )}
                        </td>
                        <td>{user.researcherProfile?.affiliation || '-'}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => setSelectedUser(user)}
                              title="View Details"
                            >
                              Details
                            </button>
                            {user.account_status === 'pending' && (
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => approveUser(user.id)}
                                title="Approve"
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
                            )}
                            {!user.deleted_at && user.role !== 'admin' && (
                              <button 
                                className="btn btn-warning btn-sm"
                                onClick={() => suspendUser(user.id, user.name)}
                                title="Suspend"
                              >
                                <i className="bi bi-pause-circle"></i>
                              </button>
                            )}
                            {user.deleted_at && (
                              <button 
                                className="btn btn-info btn-sm"
                                onClick={() => unsuspendUser(user.id)}
                                title="Unsuspend"
                              >
                                <i className="bi bi-play-circle"></i>
                              </button>
                            )}
                            {user.role !== 'admin' && (
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteUser(user.id, user.name)}
                                title="Delete Permanently"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div>
          {/* Filters */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search projects..."
                    value={projectFilters.search}
                    onChange={(e) => setProjectFilters({...projectFilters, search: e.target.value})}
                  />
                </div>
                <div className="col-md-3">
                  <select 
                    className="form-select"
                    value={projectFilters.status}
                    onChange={(e) => setProjectFilters({...projectFilters, status: e.target.value})}
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Organization</th>
                    <th>Status</th>
                    <th>Budget</th>
                    <th>Timeline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                  ) : projects.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-4">No projects found</td></tr>
                  ) : (
                    projects.map(project => (
                      <tr key={project.project_id}>
                        <td>{project.project_id}</td>
                        <td>{project.title}</td>
                        <td>{project.organization?.name || '-'}</td>
                        <td>
                          <span className={`badge bg-${
                            project.status === 'open' ? 'success' : 
                            project.status === 'in_progress' ? 'info' : 
                            project.status === 'completed' ? 'primary' : 
                            'secondary'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td>${project.budget_min?.toLocaleString() || 'N/A'}</td>
                        <td>{project.timeline || 'N/A'}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-info btn-sm"
                              onClick={() => viewProjectDetails(project)}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i> Details
                            </button>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => updateProjectStatus(project.project_id, project.status)}
                              title="Change Status"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteProject(project.project_id, project.title)}
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Project</th>
                  <th>Organization</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                ) : milestones.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4">No milestones found</td></tr>
                ) : (
                  milestones.map(milestone => (
                    <tr key={milestone.id}>
                      <td>{milestone.id}</td>
                      <td>{milestone.name}</td>
                      <td>{milestone.project?.title || '-'}</td>
                      <td>{milestone.project?.organization?.name || '-'}</td>
                      <td>{new Date(milestone.due_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge bg-${
                          milestone.status === 'completed' ? 'success' : 
                          milestone.status === 'in_progress' ? 'info' : 
                          milestone.status === 'cancelled' ? 'danger' : 
                          'secondary'
                        }`}>
                          {milestone.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteMilestone(milestone.id, milestone.name)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Review Tab */}
      {activeTab === 'pending-review' && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="bi bi-clipboard-check me-2"></i>
              Projects Pending Review
            </h5>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : pendingProjects.length === 0 ? (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                No projects pending review
              </div>
            ) : (
              <div className="row">
                {pendingProjects.map(project => (
                  <div key={project.project_id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-warning text-dark">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="mb-0">{project.title}</h6>
                          <span className={`badge bg-${project.status === 'pending_review' ? 'primary' : 'warning'}`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="text-muted small mb-2">
                          <i className="bi bi-building me-1"></i>
                          <strong>{project.organization?.name || 'Unknown'}</strong>
                        </p>
                        {project.problem && (
                          <p className="small mb-2">
                            <strong>Problem:</strong> {project.problem.substring(0, 100)}{project.problem.length > 100 && '...'}
                          </p>
                        )}
                        {project.outcomes && (
                          <p className="small mb-2">
                            <strong>Outcomes:</strong> {project.outcomes.substring(0, 100)}{project.outcomes.length > 100 && '...'}
                          </p>
                        )}
                        <div className="small text-muted">
                          {project.methods_required && (
                            <div><i className="bi bi-tools me-1"></i>{project.methods_required}</div>
                          )}
                          {project.timeline && (
                            <div><i className="bi bi-clock me-1"></i>{project.timeline}</div>
                          )}
                          {project.budget_min && (
                            <div><i className="bi bi-currency-dollar me-1"></i>${parseFloat(project.budget_min).toLocaleString()}</div>
                          )}
                        </div>
                        {project.reviews && project.reviews.length > 0 && (
                          <div className="mt-3 pt-3 border-top">
                            <small className="text-muted d-block mb-2">
                              <i className="bi bi-clock-history me-1"></i>
                              Review History ({project.reviews.length})
                            </small>
                            {project.reviews.slice(0, 2).map((review, idx) => (
                              <div key={idx} className="small mb-1">
                                <span className="badge bg-secondary me-1">{review.action}</span>
                                {review.reviewer && `by ${review.reviewer.name}`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="card-footer bg-transparent">
                        {project.status === 'pending_review' ? (
                          <div className="d-grid gap-2">
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => approveProject(project.project_id, project.title)}
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Approve
                            </button>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-warning"
                                onClick={() => requestChanges(project.project_id, project.title)}
                              >
                                <i className="bi bi-pencil-square me-1"></i>
                                Request Changes
                              </button>
                              <button 
                                className="btn btn-danger"
                                onClick={() => rejectProject(project.project_id, project.title)}
                              >
                                <i className="bi bi-x-circle me-1"></i>
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="alert alert-warning alert-sm mb-0">
                            <small>Awaiting nonprofit revisions</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>EIN</th>
                  <th>Contacts</th>
                  <th>Focus Areas</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                ) : organizations.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4">No organizations found</td></tr>
                ) : (
                  organizations.map(org => (
                    <tr key={org.id}>
                      <td>{org.id}</td>
                      <td>{org.name}</td>
                      <td>{org.EIN}</td>
                      <td>{org.contacts || '-'}</td>
                      <td>{org.focus_tags || '-'}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => setSelectedOrg(org)}
                            title="View Details"
                          >
                            Details
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteOrganization(org.id, org.name)}
                            title="Delete Organization & All Projects"
                          >
                            <i className="bi bi-trash"></i> Delete All
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-circle me-2"></i>
                  User Details
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedUser(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">User ID</label>
                    <p className="form-control-plaintext">{selectedUser.id}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Name</label>
                    <p className="form-control-plaintext">{selectedUser.name}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Email</label>
                    <p className="form-control-plaintext">{selectedUser.email}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Role</label>
                    <p className="form-control-plaintext">
                      <span className={`badge bg-${selectedUser.role === 'admin' ? 'danger' : selectedUser.role === 'nonprofit' ? 'primary' : 'info'}`}>
                        {selectedUser.role}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Account Status</label>
                    <p className="form-control-plaintext">
                      {selectedUser.deleted_at ? (
                        <span className="badge bg-danger">Suspended</span>
                      ) : (
                        <span className={`badge bg-${selectedUser.account_status === 'active' ? 'success' : selectedUser.account_status === 'pending' ? 'warning' : 'secondary'}`}>
                          {selectedUser.account_status}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Created At</label>
                    <p className="form-control-plaintext">{new Date(selectedUser.created_at).toLocaleString()}</p>
                  </div>
                  {selectedUser.updated_at && (
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Last Updated</label>
                      <p className="form-control-plaintext">{new Date(selectedUser.updated_at).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedUser.deleted_at && (
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Suspended At</label>
                      <p className="form-control-plaintext text-danger">{new Date(selectedUser.deleted_at).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedUser.researcherProfile && (
                    <>
                      <div className="col-12">
                        <hr />
                        <h6 className="text-primary">
                          <i className="bi bi-mortarboard me-2"></i>
                          Researcher Profile
                        </h6>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Affiliation</label>
                        <p className="form-control-plaintext">{selectedUser.researcherProfile.affiliation || 'N/A'}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Domains</label>
                        <p className="form-control-plaintext">{selectedUser.researcherProfile.domains || 'N/A'}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Methods</label>
                        <p className="form-control-plaintext">{selectedUser.researcherProfile.methods || 'N/A'}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Tools</label>
                        <p className="form-control-plaintext">{selectedUser.researcherProfile.tools || 'N/A'}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Hourly Rate</label>
                        <p className="form-control-plaintext">
                          ${selectedUser.researcherProfile.rate_min || 0} - ${selectedUser.researcherProfile.rate_max || 0}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Availability</label>
                        <p className="form-control-plaintext">{selectedUser.researcherProfile.availability || 'N/A'}</p>
                      </div>
                    </>
                  )}
                  {selectedUser.organization && (
                    <>
                      <div className="col-12">
                        <hr />
                        <h6 className="text-primary">
                          <i className="bi bi-building me-2"></i>
                          Organization
                        </h6>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Organization Name</label>
                        <p className="form-control-plaintext">{selectedUser.organization.name}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">EIN</label>
                        <p className="form-control-plaintext">{selectedUser.organization.EIN || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Details Modal */}
      {selectedOrg && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-building me-2"></i>
                  Organization Details
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedOrg(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Organization ID</label>
                    <p className="form-control-plaintext">{selectedOrg.id}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Name</label>
                    <p className="form-control-plaintext">{selectedOrg.name}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">EIN</label>
                    <p className="form-control-plaintext">{selectedOrg.EIN || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Website</label>
                    <p className="form-control-plaintext">
                      {selectedOrg.website ? (
                        <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer">
                          {selectedOrg.website}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                  {selectedOrg.mission && (
                    <div className="col-12">
                      <label className="form-label fw-bold">Mission</label>
                      <p className="form-control-plaintext">{selectedOrg.mission}</p>
                    </div>
                  )}
                  {selectedOrg.description && (
                    <div className="col-12">
                      <label className="form-label fw-bold">Description</label>
                      <p className="form-control-plaintext">{selectedOrg.description}</p>
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Contacts</label>
                    <p className="form-control-plaintext">{selectedOrg.contacts || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Focus Areas</label>
                    <p className="form-control-plaintext">{selectedOrg.focus_tags || 'N/A'}</p>
                  </div>
                  {selectedOrg.address && (
                    <div className="col-12">
                      <label className="form-label fw-bold">Address</label>
                      <p className="form-control-plaintext">{selectedOrg.address}</p>
                    </div>
                  )}
                  {selectedOrg.created_at && (
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Created At</label>
                      <p className="form-control-plaintext">{new Date(selectedOrg.created_at).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedOrg.updated_at && (
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Last Updated</label>
                      <p className="form-control-plaintext">{new Date(selectedOrg.updated_at).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedOrg.users && selectedOrg.users.length > 0 && (
                    <>
                      <div className="col-12">
                        <hr />
                        <h6 className="text-primary">
                          <i className="bi bi-people me-2"></i>
                          Associated Users ({selectedOrg.users.length})
                        </h6>
                      </div>
                      <div className="col-12">
                        <ul className="list-group">
                          {selectedOrg.users.map(user => (
                            <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{user.name}</strong>
                                <br />
                                <small className="text-muted">{user.email}</small>
                              </div>
                              <span className={`badge bg-${user.account_status === 'active' ? 'success' : 'warning'}`}>
                                {user.account_status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrg(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-folder me-2"></i>
                  Project Details
                </h5>
                <button type="button" className="btn-close" onClick={() => {
                  setSelectedProject(null);
                  setProjectDetails(null);
                }}></button>
              </div>
              <div className="modal-body">
                {loadingProjectDetails ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading project details...</p>
                  </div>
                ) : projectDetails ? (
                  <div className="row g-4">
                    {/* Basic Information */}
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header bg-primary text-white">
                          <h6 className="mb-0">
                            <i className="bi bi-info-circle me-2"></i>
                            Basic Information
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Project ID</label>
                              <p className="form-control-plaintext">{projectDetails.project_id}</p>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Status</label>
                              <p className="form-control-plaintext">
                                <span className={`badge bg-${
                                  projectDetails.status === 'open' ? 'success' : 
                                  projectDetails.status === 'in_progress' ? 'info' : 
                                  projectDetails.status === 'completed' ? 'primary' : 
                                  'secondary'
                                }`}>
                                  {projectDetails.status}
                                </span>
                              </p>
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-bold">Title</label>
                              <p className="form-control-plaintext">{projectDetails.title}</p>
                            </div>
                            {projectDetails.problem && (
                              <div className="col-12">
                                <label className="form-label fw-bold">Problem Statement</label>
                                <p className="form-control-plaintext">{projectDetails.problem}</p>
                              </div>
                            )}
                            {projectDetails.outcomes && (
                              <div className="col-12">
                                <label className="form-label fw-bold">Expected Outcomes</label>
                                <p className="form-control-plaintext">{projectDetails.outcomes}</p>
                              </div>
                            )}
                            {projectDetails.description && (
                              <div className="col-12">
                                <label className="form-label fw-bold">Description</label>
                                <p className="form-control-plaintext">{projectDetails.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Organization Information */}
                    {projectDetails.organization && (
                      <div className="col-12">
                        <div className="card">
                          <div className="card-header bg-success text-white">
                            <h6 className="mb-0">
                              <i className="bi bi-building me-2"></i>
                              Organization
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Organization Name</label>
                                <p className="form-control-plaintext">{projectDetails.organization.name}</p>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-bold">EIN</label>
                                <p className="form-control-plaintext">{projectDetails.organization.EIN || 'N/A'}</p>
                              </div>
                              {projectDetails.organization.mission && (
                                <div className="col-12">
                                  <label className="form-label fw-bold">Mission</label>
                                  <p className="form-control-plaintext">{projectDetails.organization.mission}</p>
                                </div>
                              )}
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Focus Areas</label>
                                <p className="form-control-plaintext">{projectDetails.organization.focus_tags || 'N/A'}</p>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Contacts</label>
                                <p className="form-control-plaintext">{projectDetails.organization.contacts || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Project Details */}
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header bg-info text-white">
                          <h6 className="mb-0">
                            <i className="bi bi-clipboard-data me-2"></i>
                            Project Requirements & Details
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            {projectDetails.methods_required && (
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Methods Required</label>
                                <p className="form-control-plaintext">{projectDetails.methods_required}</p>
                              </div>
                            )}
                            {projectDetails.timeline && (
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Timeline</label>
                                <p className="form-control-plaintext">
                                  <i className="bi bi-clock me-1"></i>
                                  {projectDetails.timeline}
                                </p>
                              </div>
                            )}
                            {(projectDetails.budget_min || projectDetails.budget_max) && (
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Budget Range</label>
                                <p className="form-control-plaintext">
                                  <i className="bi bi-currency-dollar me-1"></i>
                                  ${parseFloat(projectDetails.budget_min || 0).toLocaleString()} - 
                                  ${parseFloat(projectDetails.budget_max || 0).toLocaleString()}
                                </p>
                              </div>
                            )}
                            {projectDetails.expertise_required && (
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Expertise Required</label>
                                <p className="form-control-plaintext">{projectDetails.expertise_required}</p>
                              </div>
                            )}
                            {projectDetails.domains && (
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Domains</label>
                                <p className="form-control-plaintext">{projectDetails.domains}</p>
                              </div>
                            )}
                            {projectDetails.tools && (
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Tools</label>
                                <p className="form-control-plaintext">{projectDetails.tools}</p>
                              </div>
                            )}
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Created</label>
                              <p className="form-control-plaintext">
                                {new Date(projectDetails.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Last Updated</label>
                              <p className="form-control-plaintext">
                                {new Date(projectDetails.updated_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Milestones */}
                    {projectDetails.milestones && projectDetails.milestones.length > 0 && (
                      <div className="col-12">
                        <div className="card">
                          <div className="card-header bg-warning text-dark">
                            <h6 className="mb-0">
                              <i className="bi bi-flag me-2"></i>
                              Milestones ({projectDetails.milestones.length})
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="table-responsive">
                              <table className="table table-sm table-hover mb-0">
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Completed</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {projectDetails.milestones.map(milestone => (
                                    <tr key={milestone.id}>
                                      <td><strong>{milestone.name}</strong></td>
                                      <td>{milestone.description || '-'}</td>
                                      <td>
                                        <i className="bi bi-calendar3 me-1"></i>
                                        {new Date(milestone.due_date).toLocaleDateString()}
                                      </td>
                                      <td>
                                        <span className={`badge bg-${
                                          milestone.status === 'completed' ? 'success' : 
                                          milestone.status === 'in_progress' ? 'info' : 
                                          milestone.status === 'cancelled' ? 'danger' : 
                                          'secondary'
                                        }`}>
                                          {milestone.status}
                                        </span>
                                      </td>
                                      <td>
                                        {milestone.completed_at ? (
                                          <span className="text-success">
                                            <i className="bi bi-check-circle me-1"></i>
                                            {new Date(milestone.completed_at).toLocaleDateString()}
                                          </span>
                                        ) : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Failed to load project details
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSelectedProject(null);
                    setProjectDetails(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
}
