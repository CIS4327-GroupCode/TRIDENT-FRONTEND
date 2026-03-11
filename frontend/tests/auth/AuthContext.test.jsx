import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../src/auth/AuthContext';

function TestComponent() {
  const { user, token, loading, isAuthenticated, login, logout, isProfileComplete } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user">{user ? user.name : 'null'}</div>
      <div data-testid="token">{token || 'null'}</div>
      <div data-testid="complete-nonprofit">
        {String(isProfileComplete({ role: 'nonprofit', organization: { name: 'Org', mission: 'Mission' } }))}
      </div>
      <div data-testid="incomplete-nonprofit">
        {String(isProfileComplete({ role: 'nonprofit', organization: { name: 'Org' } }))}
      </div>
      <div data-testid="complete-researcher">
        {String(isProfileComplete({ role: 'researcher', researcherProfile: { affiliation: 'Uni', domains: ['health'] } }))}
      </div>
      <div data-testid="incomplete-researcher">
        {String(isProfileComplete({ role: 'researcher', researcherProfile: { affiliation: 'Uni' } }))}
      </div>
      <button onClick={() => login({ user: { id: 1, name: 'Test User', role: 'researcher' }, token: 'test-token' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.getItem.mockImplementation(() => null);
    jest.clearAllMocks();
    window.location.href = '';
  });

  it('starts in loading state then resolves auth state', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('restores auth from localStorage on mount', async () => {
    const mockUser = { id: 1, name: 'Saved User', role: 'researcher' };
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'trident_user') return JSON.stringify(mockUser);
      if (key === 'trident_token') return 'saved-token';
      return null;
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('Saved User');
      expect(screen.getByTestId('token')).toHaveTextContent('saved-token');
    });
  });

  it('persists data on login and clears on logout', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(localStorage.setItem).toHaveBeenCalledWith('trident_token', 'test-token');
    });

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('trident_user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('trident_token');
      expect(window.location.href).toBe('/');
    });
  });

  it('evaluates profile completeness with backend-aligned fields', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('complete-nonprofit')).toHaveTextContent('true');
      expect(screen.getByTestId('incomplete-nonprofit')).toHaveTextContent('false');
      expect(screen.getByTestId('complete-researcher')).toHaveTextContent('true');
      expect(screen.getByTestId('incomplete-researcher')).toHaveTextContent('false');
    });
  });
});
