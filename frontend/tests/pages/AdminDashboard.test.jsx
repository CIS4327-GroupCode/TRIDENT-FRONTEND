/**
 * Unit Tests for AdminDashboard — UC12 features
 * Tests alerts tab, kanban board view, and CSV export buttons
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/auth/AuthContext';

const mockGetAdminAlerts = jest.fn();
const mockExportAdminData = jest.fn();
const mockGetAdminAttachments = jest.fn().mockResolvedValue({ attachments: [], pagination: { total: 0, totalPages: 0, limit: 20 } });
const mockGetAdminAttachmentStats = jest.fn().mockResolvedValue({ stats: null });
const mockAdminForceDeleteAttachment = jest.fn();
const mockAdminBulkUsers = jest.fn();
const mockAdminBulkProjects = jest.fn();
const mockAdminBulkMilestones = jest.fn();
const mockAdminBulkOrganizations = jest.fn();
const mockAdminBulkAttachments = jest.fn();
const mockGetAdminRatings = jest.fn().mockResolvedValue({ ratings: [], pagination: { total: 0, totalPages: 0, limit: 20 } });
const mockGetAdminRatingStats = jest.fn().mockResolvedValue({ stats: null });
const mockModerateAdminRating = jest.fn();
const mockAdminBulkModerateRatings = jest.fn();
const mockGetAdminBulkJobStatus = jest.fn();

jest.mock('../../src/config/api', () => ({
  getApiUrl: (endpoint) => `http://localhost:5000${endpoint}`,
  getAdminAlerts: (...args) => mockGetAdminAlerts(...args),
  exportAdminData: (...args) => mockExportAdminData(...args),
  getAdminAttachments: (...args) => mockGetAdminAttachments(...args),
  getAdminAttachmentStats: (...args) => mockGetAdminAttachmentStats(...args),
  adminForceDeleteAttachment: (...args) => mockAdminForceDeleteAttachment(...args),
  adminBulkUsers: (...args) => mockAdminBulkUsers(...args),
  adminBulkProjects: (...args) => mockAdminBulkProjects(...args),
  adminBulkMilestones: (...args) => mockAdminBulkMilestones(...args),
  adminBulkOrganizations: (...args) => mockAdminBulkOrganizations(...args),
  adminBulkAttachments: (...args) => mockAdminBulkAttachments(...args),
  getAdminRatings: (...args) => mockGetAdminRatings(...args),
  getAdminRatingStats: (...args) => mockGetAdminRatingStats(...args),
  moderateAdminRating: (...args) => mockModerateAdminRating(...args),
  adminBulkModerateRatings: (...args) => mockAdminBulkModerateRatings(...args),
  getAdminBulkJobStatus: (...args) => mockGetAdminBulkJobStatus(...args),
  getUnreadCount: jest.fn().mockResolvedValue({ unreadCount: 0 })
}));

jest.mock('../../src/auth/usePermissions', () => ({
  usePermissions: () => ({
    role: 'admin',
    can: (perm) => perm === 'canViewAdminPanel' || perm === 'canCreateAdmin',
    isAdmin: true
  })
}));

jest.mock('../../src/context/ToastContext', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  })
}));

import AdminDashboard from '../../src/pages/AdminDashboard';

global.fetch = jest.fn();

describe('AdminDashboard — UC12 Features', () => {
  const mockAuthValue = {
    user: { id: 1, name: 'Admin User', role: 'admin' },
    token: 'test-admin-token',
    isAuthenticated: true
  };

  const renderDashboard = (tab = 'overview') => {
    return render(
      <MemoryRouter initialEntries={[`/admin?tab=${tab}`]}>
        <AuthContext.Provider value={mockAuthValue}>
          <AdminDashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock dashboard stats fetch
    fetch.mockImplementation((url) => {
      if (url.includes('/admin/dashboard/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            stats: {
              total_users: 10,
              nonprofit_users: 4,
              researcher_users: 5,
              admin_users: 1,
              suspended_users: 0,
              pending_approval: 0,
              total_organizations: 3,
              total_projects: 8,
              open_projects: 3,
              draft_projects: 2,
              total_milestones: 12,
              pending_milestones: 2,
              active_milestones: 5,
              completed_milestones: 5
            }
          })
        });
      }
      if (url.includes('/admin/projects')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            projects: [
              { project_id: 1, title: 'P1', status: 'open', organization: { name: 'Org1' }, budget_min: 1000, timeline: '3mo' },
              { project_id: 2, title: 'P2', status: 'in_progress', organization: { name: 'Org2' }, budget_min: 2000, timeline: '6mo' }
            ],
            pagination: { total: 2, page: 1, limit: 20, totalPages: 1 }
          })
        });
      }
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            users: [],
            pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
          })
        });
      }
      if (url.includes('/admin/milestones')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ milestones: [] })
        });
      }
      if (url.includes('/admin/organizations')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ organizations: [] })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });
  });

  describe('Alerts Tab', () => {
    it('should render alerts tab with summary cards', async () => {
      mockGetAdminAlerts.mockResolvedValue({
        overdue: [
          { id: 1, name: 'Late Milestone', status: 'pending', due_date: '2026-03-01', days_overdue: 36, days_until_due: 0, project: { project_id: 1, title: 'Test Project', status: 'in_progress', organization: 'Test Org' } }
        ],
        approaching: [],
        atRisk: [],
        summary: { overdueCount: 1, approachingCount: 0, atRiskCount: 0 }
      });

      renderDashboard('alerts');

      await waitFor(() => {
        expect(mockGetAdminAlerts).toHaveBeenCalledWith('test-admin-token');
      });

      await waitFor(() => {
        expect(screen.getByText('Overdue Milestones')).toBeInTheDocument();
        expect(screen.getByText('Approaching Deadlines')).toBeInTheDocument();
        expect(screen.getByText('At-Risk Projects')).toBeInTheDocument();
      });
    });

    it('should display overdue milestones table', async () => {
      mockGetAdminAlerts.mockResolvedValue({
        overdue: [
          { id: 1, name: 'Late Milestone', status: 'pending', due_date: '2026-03-01', days_overdue: 36, days_until_due: 0, project: { project_id: 1, title: 'Test Project', status: 'in_progress', organization: 'Test Org' } }
        ],
        approaching: [],
        atRisk: [],
        summary: { overdueCount: 1, approachingCount: 0, atRiskCount: 0 }
      });

      renderDashboard('alerts');

      await waitFor(() => {
        expect(screen.getByText('Late Milestone')).toBeInTheDocument();
        expect(screen.getByText('36 days')).toBeInTheDocument();
      });
    });

    it('should show success message when no alerts', async () => {
      mockGetAdminAlerts.mockResolvedValue({
        overdue: [],
        approaching: [],
        atRisk: [],
        summary: { overdueCount: 0, approachingCount: 0, atRiskCount: 0 }
      });

      renderDashboard('alerts');

      await waitFor(() => {
        expect(screen.getByText(/No active alerts/)).toBeInTheDocument();
      });
    });
  });

  describe('Kanban Board View', () => {
    it('should toggle between list and board view in projects tab', async () => {
      renderDashboard('projects');

      await waitFor(() => {
        expect(screen.getByText('List')).toBeInTheDocument();
        expect(screen.getByText('Board')).toBeInTheDocument();
      });
    });

    it('should fetch projects for all statuses when board view is selected', async () => {
      renderDashboard('projects');

      await waitFor(() => {
        expect(screen.getByText('Board')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Board'));

      await waitFor(() => {
        // Should render column headers for each status
        expect(screen.getByText('Draft')).toBeInTheDocument();
        expect(screen.getByText('Open')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
      });
    });
  });

  describe('CSV Export', () => {
    it('should render export button on projects tab', async () => {
      renderDashboard('projects');

      await waitFor(() => {
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
      });
    });

    it('should call exportAdminData when export button is clicked', async () => {
      mockExportAdminData.mockResolvedValue('ID,Title\n1,Test');

      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:test');
      global.URL.revokeObjectURL = jest.fn();

      renderDashboard('projects');

      await waitFor(() => {
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export CSV'));

      await waitFor(() => {
        expect(mockExportAdminData).toHaveBeenCalledWith(
          'projects',
          expect.any(Object),
          'test-admin-token'
        );
      });
    });
  });

  describe('Bulk Actions', () => {
    it('shows users bulk toolbar when a row is selected', async () => {
      fetch.mockImplementation((url) => {
        if (url.includes('/admin/dashboard/stats')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              stats: {
                total_users: 1,
                nonprofit_users: 0,
                researcher_users: 1,
                admin_users: 0,
                suspended_users: 0,
                pending_approval: 1,
                total_organizations: 0,
                total_projects: 0,
                open_projects: 0,
                draft_projects: 0,
                total_milestones: 0,
                pending_milestones: 0,
                active_milestones: 0,
                completed_milestones: 0
              }
            })
          });
        }

        if (url.includes('/admin/users')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              users: [
                {
                  id: 1,
                  name: 'Pending User',
                  email: 'pending@test.com',
                  role: 'researcher',
                  account_status: 'pending',
                  created_at: new Date().toISOString(),
                  deleted_at: null
                }
              ],
              pagination: { total: 1, page: 1, limit: 20, totalPages: 1 }
            })
          });
        }

        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderDashboard('users');

      await waitFor(() => {
        expect(screen.getByText('Pending User')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Select user 1'));

      await waitFor(() => {
        expect(screen.getByText('Users Bulk Actions')).toBeInTheDocument();
        expect(screen.getByText('Run Bulk Action')).toBeInTheDocument();
      });
    });
  });
});
