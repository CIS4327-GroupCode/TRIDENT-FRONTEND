import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DangerZone from '../../src/components/settings/DangerZone';
import { AuthContext } from '../../src/auth/AuthContext';

jest.mock('../../src/config/api', () => ({
  getApiUrl: (path) => path,
}));

describe('DangerZone', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.getItem.mockImplementation((key) => (key === 'trident_token' ? 'token' : null));
    window.alert = jest.fn();
  });

  it('requires DELETE confirmation text before allowing delete', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ logout: jest.fn() }}>
          <DangerZone />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Delete My Account'));
    const confirmButton = screen.getByText('I understand, delete my account');
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('DELETE'), { target: { value: 'DELETE' } });
    expect(confirmButton).not.toBeDisabled();
  });

  it('deletes account and calls logout when confirmed', async () => {
    const logout = jest.fn();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Account deleted successfully' })
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ logout }}>
          <DangerZone />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Delete My Account'));
    fireEvent.change(screen.getByPlaceholderText('DELETE'), { target: { value: 'DELETE' } });
    fireEvent.click(screen.getByText('I understand, delete my account'));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(logout).toHaveBeenCalled();
  });
});
