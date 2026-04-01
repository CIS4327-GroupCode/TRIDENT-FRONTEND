import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PreferencesSettings from '../../src/components/settings/PreferencesSettings';

jest.mock('../../src/config/api', () => ({
  getApiUrl: (path) => path,
}));

describe('PreferencesSettings', () => {
  beforeEach(() => {
    localStorage.getItem.mockImplementation((key) => (key === 'trident_token' ? 'token' : null));
  });

  it('loads and persists toggles', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          preferences: {
            email_notifications: true,
            email_messages: true,
            email_matches: true,
            email_milestones: true,
            email_project_updates: true,
            inapp_notifications: true,
            inapp_messages: true,
            inapp_matches: true,
            weekly_digest: false,
            monthly_report: false,
            marketing_emails: false,
          }
        })
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<PreferencesSettings />);

    await waitFor(() => expect(screen.getByText('Notification Preferences')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Enable email notifications'));
    expect(screen.getByLabelText('New messages', { selector: '#email_messages' })).toBeDisabled();

    fireEvent.click(screen.getByText('Save Preferences'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });
});
