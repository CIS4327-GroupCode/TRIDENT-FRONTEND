import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProjectDetailPage from '../../src/pages/ProjectDetailPage';
import { AuthContext } from '../../src/auth/AuthContext';

jest.mock('../../src/components/TopBar', () => () => <div>Top Bar</div>);
jest.mock('../../src/components/Footer', () => () => <div>Footer</div>);
jest.mock('../../src/config/api', () => ({
  getApiUrl: (endpoint) => `http://localhost:4000${endpoint}`
}));

function renderWithRouter(initialPath) {
  return render(
    <AuthContext.Provider value={{ user: null, token: null, isAuthenticated: false, loading: false }}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('renders project details for a valid project id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        project: {
          project_id: 42,
          title: 'Community Health Outcomes Study',
          status: 'open',
          problem: 'Track intervention impact in underserved areas.',
          outcomes: 'Generate policy-ready evidence.',
          methods_required: 'Mixed methods, survey design',
          timeline: '6 months',
          budget_min: '15000',
          budget_max: '25000',
          estimated_hours: 120,
          data_sensitivity: 'Medium',
          organization: {
            name: 'Impact Lab',
            mission: 'Evidence-driven social change',
            location: 'Austin, TX',
            focus_areas: ['Health', 'Equity']
          }
        }
      })
    });

    renderWithRouter('/projects/42');

    expect(await screen.findByText('Community Health Outcomes Study')).toBeInTheDocument();
    expect(screen.getByText('Impact Lab')).toBeInTheDocument();
    expect(screen.getByText('Project Description')).toBeInTheDocument();
    expect(screen.getByText('Methods & Requirements')).toBeInTheDocument();
  });

  it('shows not found state and redirects home after 3 seconds for invalid id', async () => {
    renderWithRouter('/projects/abc');

    expect(await screen.findByText('Project Not Found')).toBeInTheDocument();
    expect(screen.getByText(/Redirecting to Home in 3 seconds/i)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('shows not found and redirects home when project does not exist', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Project not found' })
    });

    renderWithRouter('/projects/999999');

    expect(await screen.findByText('Project Not Found')).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });
});
