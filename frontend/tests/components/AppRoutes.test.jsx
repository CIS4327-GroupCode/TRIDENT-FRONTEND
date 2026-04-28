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
jest.mock('../../src/pages/Privacy', () => () => <div>Privacy Page</div>);
jest.mock('../../src/pages/Terms', () => () => <div>Terms Page</div>);
jest.mock('../../src/pages/Accessibility', () => () => <div>Accessibility Page</div>);
jest.mock('../../src/pages/Press', () => () => <div>Press Page</div>);
jest.mock('../../src/pages/ProjectDetailPage', () => () => <div>Project Detail Page</div>);
jest.mock('../../src/pages/ProjectMilestonesPage', () => () => <div>Project Milestones Page</div>);
jest.mock('../../src/pages/ProjectApplicationsPage', () => () => <div>Project Applications Page</div>);
jest.mock('../../src/pages/NotificationsPage', () => () => <div>Notifications Page</div>);
jest.mock('../../src/pages/ResearcherProfilePage', () => () => <div>Researcher Profile</div>);
jest.mock('../../src/pages/Agreements', () => () => <div>Agreements Page</div>);
jest.mock('../../src/pages/AgreementDetail', () => () => <div>Agreement Detail Page</div>);
jest.mock('../../src/pages/NotFound', () => () => <div>Not Found Page</div>);

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

  it('renders public project detail route for a dynamic id', () => {
    render(
      <MemoryRouter initialEntries={['/projects/42']}>
        <AuthContext.Provider value={{ user: null, loading: false }}>
          <App />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Project Detail Page')).toBeInTheDocument();
  });

  it('renders project milestones route for authenticated researcher', () => {
    render(
      <MemoryRouter initialEntries={['/projects/42/milestones']}>
        <AuthContext.Provider value={{ user: { id: 9, role: 'researcher' }, loading: false }}>
          <App />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Project Milestones Page')).toBeInTheDocument();
  });

  it('renders project applications route for authenticated nonprofit', () => {
    render(
      <MemoryRouter initialEntries={['/projects/42/applications']}>
        <AuthContext.Provider value={{ user: { id: 10, role: 'nonprofit' }, loading: false }}>
          <App />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Project Applications Page')).toBeInTheDocument();
  });

  it.each([
    ['/contact', 'Contact Page'],
    ['/faq', 'FAQ Page'],
    ['/privacy', 'Privacy Page'],
    ['/terms', 'Terms Page'],
    ['/accessibility', 'Accessibility Page'],
    ['/press', 'Press Page']
  ])('renders public informational route %s', (path, pageText) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AuthContext.Provider value={{ user: null, loading: false }}>
          <App />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText(pageText)).toBeInTheDocument();
  });
});
