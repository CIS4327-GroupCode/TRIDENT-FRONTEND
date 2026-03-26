import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';
import { AuthContext } from '../../src/auth/AuthContext';

jest.mock('../../src/pages/Home', () => () => <div>Home Page</div>);
jest.mock('../../src/pages/Dashboard', () => () => <div>Dashboard Page</div>);
jest.mock('../../src/pages/Settings', () => () => <div>Settings Page</div>);
jest.mock('../../src/pages/Browse', () => () => <div>Browse Page</div>);
jest.mock('../../src/pages/AdminDashboard', () => () => <div>Admin Dashboard</div>);
jest.mock('../../src/pages/Messages', () => () => <div>Messages Page</div>);
jest.mock('../../src/pages/VerifyEmail', () => () => <div>Verify Email</div>);
jest.mock('../../src/pages/ForgotPassword', () => () => <div>Forgot Password</div>);
jest.mock('../../src/pages/ResetPassword', () => () => <div>Reset Password</div>);
jest.mock('../../src/pages/Contact', () => () => <div>Contact Page</div>);
jest.mock('../../src/pages/FAQ', () => () => <div>FAQ Page</div>);
jest.mock('../../src/pages/ResearcherProfilePage', () => () => <div>Researcher Profile</div>);

describe('App route wiring', () => {
  it('renders admin dashboard when admin is authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthContext.Provider value={{ user: { id: 1, role: 'admin' }, loading: false }}>
          <App />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('redirects admin route for non-admin users', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthContext.Provider value={{ user: { id: 2, role: 'researcher' }, loading: false }}>
          <App />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('protects messages route and sends unauthenticated users home', () => {
    render(
      <MemoryRouter initialEntries={['/messages']}>
        <AuthContext.Provider value={{ user: null, loading: false }}>
          <App />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Messages Page')).not.toBeInTheDocument();
  });
});
