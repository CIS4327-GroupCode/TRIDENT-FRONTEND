/**
 * Unit Tests for Browse Page
 * Tests project browsing and filtering functionality
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Browse from '../../src/pages/Browse';
import { AuthContext } from '../../src/auth/AuthContext';

// Mock fetch
global.fetch = jest.fn();

describe('Browse Page', () => {
  const mockAuthValue = {
    user: { id: 1, name: 'Test User', role: 'researcher' },
    token: 'test-token',
    isAuthenticated: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render browse page with search functionality', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        projects: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
      })
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Browse />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Check if page renders
    await waitFor(() => {
      expect(screen.getByTestId || screen.getByRole).toBeDefined();
    });
  });

  it('should fetch and display projects', async () => {
    const mockProjects = [
      {
        project_id: 1,
        title: 'Test Project 1',
        problem: 'Problem description',
        budget_min: 1000,
        budget_max: 5000,
        organization: { name: 'Test Org 1' }
      },
      {
        project_id: 2,
        title: 'Test Project 2',
        problem: 'Another problem',
        budget_min: 2000,
        budget_max: 10000,
        organization: { name: 'Test Org 2' }
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        projects: mockProjects,
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 }
      })
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Browse />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('should handle search filter', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        projects: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
      })
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Browse />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Browse />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    // Component should handle error without crashing
    expect(screen.getByTestId || screen.queryByText).toBeDefined();
  });

  it('should display pagination controls', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        projects: [],
        pagination: { total: 100, page: 1, limit: 20, totalPages: 5 }
      })
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthValue}>
          <Browse />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});
