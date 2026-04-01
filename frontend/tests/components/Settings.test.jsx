import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../../src/pages/Settings';
import { AuthContext } from '../../src/auth/AuthContext';

jest.mock('../../src/components/TopBar', () => () => <div>TopBar</div>);
jest.mock('../../src/components/Footer', () => () => <div>Footer</div>);
jest.mock('../../src/components/settings/ProfileSettings', () => () => <div>Profile Content</div>);
jest.mock('../../src/components/settings/PasswordSettings', () => () => <div>Password Content</div>);
jest.mock('../../src/components/settings/PreferencesSettings', () => () => <div>Preferences Content</div>);
jest.mock('../../src/components/settings/OrganizationSettings', () => () => <div>Organization Content</div>);
jest.mock('../../src/components/settings/ResearcherSettings', () => () => <div>Researcher Content</div>);
jest.mock('../../src/components/settings/DangerZone', () => () => <div>Danger Content</div>);

describe('Settings page', () => {
  it('renders role-based tabs for nonprofit user', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: { id: 1, role: 'nonprofit', name: 'NP', email: 'np@example.com' } }}>
          <Settings />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.queryByText('Researcher Profile')).not.toBeInTheDocument();
  });

  it('switches tabs when navigation item clicked', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: { id: 2, role: 'researcher', name: 'R', email: 'r@example.com' } }}>
          <Settings />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Password'));
    expect(screen.getByText('Password Content')).toBeInTheDocument();
  });
});
