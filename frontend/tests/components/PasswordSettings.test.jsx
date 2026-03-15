import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PasswordSettings from '../../src/components/settings/PasswordSettings';
import { AuthContext } from '../../src/auth/AuthContext';

jest.mock('../../src/config/api', () => ({
  getApiUrl: (path) => path,
}));

describe('PasswordSettings', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
    localStorage.getItem.mockImplementation((key) => (key === 'trident_token' ? 'token' : null));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows complexity indicators and updates as password changes', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ logout: jest.fn() }}>
          <PasswordSettings />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'Abc123!x' } });

    expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/One uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/One special character/i)).toBeInTheDocument();
  });

  it('logs out user after successful password change when requireReLogin is true', async () => {
    const logout = jest.fn();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Password changed successfully', requireReLogin: true })
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ logout }}>
          <PasswordSettings />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'OldPass123!' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPass123!' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'NewPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    jest.advanceTimersByTime(900);
    expect(logout).toHaveBeenCalled();
  });
});
