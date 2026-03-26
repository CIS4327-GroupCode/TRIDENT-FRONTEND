import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import { AuthContext } from '../../src/auth/AuthContext';

function ProtectedComponent() {
  return <div>Protected Content</div>;
}

describe('ProtectedRoute', () => {
  it('shows loading state while auth context is loading', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthContext.Provider value={{ user: null, loading: true }}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <ProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders protected content when authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthContext.Provider value={{ user: { id: 1, role: 'researcher' }, loading: false }}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <ProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to home when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthContext.Provider value={{ user: null, loading: false }}>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <ProtectedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to role dashboard when requiredRole does not match', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthContext.Provider value={{ user: { id: 1, role: 'researcher' }, loading: false }}>
          <Routes>
            <Route path="/dashboard/researcher" element={<div>Researcher Dashboard</div>} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Researcher Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
