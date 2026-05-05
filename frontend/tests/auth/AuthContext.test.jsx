import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../src/auth/AuthContext';
import ToastContext from '../../src/context/ToastContext';

const AUTO_LOGOUT_MESSAGE = 'Your session token expired and you were logged out automatically.';

function toBase64Url(value) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createJwt({ exp }) {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64Url(JSON.stringify({ exp }));
  const signature = 'signature';
  return `${header}.${payload}.${signature}`;
}

function createValidJwt() {
  return createJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
}

function createExpiredJwt() {
  return createJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
}

function withStoredAuth(mockUser, mockToken) {
  localStorage.getItem.mockImplementation((key) => {
    if (key === 'trident_user') return JSON.stringify(mockUser);
    if (key === 'trident_token') return mockToken;
    return null;
  });
}

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
    global.fetch = jest.fn();
    jest.clearAllMocks();
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
    const cachedUser = { id: 1, name: 'Saved User', role: 'researcher' };
    const freshUser = { ...cachedUser, name: 'Fresh User' };
    const token = createValidJwt();
    withStoredAuth(cachedUser, token);
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: freshUser })
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
      expect(screen.getByTestId('user')).toHaveTextContent('Fresh User');
      expect(screen.getByTestId('token')).toHaveTextContent(token);
      expect(fetch).toHaveBeenCalledTimes(1);
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
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('auto-logs out and shows a toast when a stored token is already expired', async () => {
    const warning = jest.fn();
    withStoredAuth({ id: 7, name: 'Expired User', role: 'researcher' }, createExpiredJwt());

    render(
      <MemoryRouter>
        <ToastContext.Provider value={{ warning }}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </ToastContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(localStorage.removeItem).toHaveBeenCalledWith('trident_user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('trident_token');
      expect(warning).toHaveBeenCalledWith(AUTO_LOGOUT_MESSAGE);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  it('auto-logs out and shows a toast when backend marks the token invalid', async () => {
    const warning = jest.fn();
    const token = createValidJwt();
    withStoredAuth({ id: 8, name: 'Invalid User', role: 'researcher' }, token);

    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Token expired' })
    });

    render(
      <MemoryRouter>
        <ToastContext.Provider value={{ warning }}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </ToastContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(localStorage.removeItem).toHaveBeenCalledWith('trident_user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('trident_token');
      expect(warning).toHaveBeenCalledWith(AUTO_LOGOUT_MESSAGE);
    });
  });

  it('keeps cached session when startup verification fails for non-auth reasons', async () => {
    const warning = jest.fn();
    const cachedUser = { id: 9, name: 'Offline User', role: 'researcher' };
    const token = createValidJwt();
    withStoredAuth(cachedUser, token);
    fetch.mockRejectedValue(new Error('Network Error'));

    render(
      <MemoryRouter>
        <ToastContext.Provider value={{ warning }}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </ToastContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('Offline User');
      expect(warning).not.toHaveBeenCalled();
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('trident_user');
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('trident_token');
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
