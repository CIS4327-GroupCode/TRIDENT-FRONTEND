import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import NotificationBell from '../../src/components/notifications/NotificationBell';
import { useAuth } from '../../src/auth/AuthContext';
import { getUnreadCount } from '../../src/config/api';
import { NOTIFICATION_SYNC_EVENT } from '../../src/utils/notificationEvents';

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../src/config/api', () => ({
  getUnreadCount: jest.fn(),
}));

jest.mock('../../src/components/notifications/NotificationDropdown', () => () => (
  <div data-testid="notification-dropdown">dropdown</div>
));

describe('NotificationBell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      token: 'token-1',
      user: { id: 1, role: 'researcher' },
    });
    getUnreadCount.mockResolvedValue({ unreadCount: 3 });
  });

  it('refreshes unread count when the custom sync event fires', async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(getUnreadCount).toHaveBeenCalledTimes(1);
      expect(screen.getByLabelText('3 unread notifications')).toBeInTheDocument();
    });

    getUnreadCount.mockResolvedValueOnce({ unreadCount: 7 });

    await act(async () => {
      window.dispatchEvent(new Event(NOTIFICATION_SYNC_EVENT));
    });

    await waitFor(() => {
      expect(getUnreadCount).toHaveBeenCalledTimes(2);
      expect(screen.getByLabelText('7 unread notifications')).toBeInTheDocument();
    });
  });

  it('refreshes unread count when the window regains focus', async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(getUnreadCount).toHaveBeenCalledTimes(1);
    });

    getUnreadCount.mockResolvedValueOnce({ unreadCount: 5 });

    await act(async () => {
      fireEvent.focus(window);
    });

    await waitFor(() => {
      expect(getUnreadCount).toHaveBeenCalledTimes(2);
      expect(screen.getByLabelText('5 unread notifications')).toBeInTheDocument();
    });
  });
});