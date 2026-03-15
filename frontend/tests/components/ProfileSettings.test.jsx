import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileSettings from '../../src/components/settings/ProfileSettings';
import { AuthContext } from '../../src/auth/AuthContext';

jest.mock('../../src/config/api', () => ({
  getApiUrl: (path) => path,
  fetchApiWithAuth: jest.fn(),
}));

const user = { id: 1, name: 'Test User', email: 'old@example.com', role: 'researcher' };

describe('ProfileSettings', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.getItem.mockImplementation((key) => (key === 'trident_token' ? 'token' : null));
  });

  it('shows re-verification success message when email changes', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { ...user }, emailVerificationSent: true })
    });

    render(
      <AuthContext.Provider value={{ setUser: jest.fn() }}>
        <ProfileSettings user={user} />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Profile updated. Verification email sent to your new address.')).toBeInTheDocument();
    });
  });
});
