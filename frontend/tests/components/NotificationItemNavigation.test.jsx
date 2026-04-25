import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationItem from '../../src/components/notifications/NotificationItem';
import { useAuth } from '../../src/auth/AuthContext';
import { markNotificationAsRead, deleteNotification } from '../../src/config/api';
import { useNavigate } from 'react-router-dom';

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: jest.fn()
}));
jest.mock('../../src/config/api', () => ({
  markNotificationAsRead: jest.fn(),
  deleteNotification: jest.fn()
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

jest.mock('../../src/utils/notificationHelpers', () => ({
  formatNotificationTime: jest.fn(() => 'Just now'),
  getNotificationIcon: jest.fn(() => 'bi-bell'),
  getNotificationColor: jest.fn(() => '#007bff')
}));

describe('NotificationItem navigation resolution', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue({
      token: 'token-1',
      user: { id: 10, role: 'researcher' }
    });
    markNotificationAsRead.mockResolvedValue({});
    deleteNotification.mockResolvedValue({});
  });

  const renderItem = (notification) =>
    render(
      <BrowserRouter>
        <NotificationItem
          notification={notification}
          onRead={jest.fn()}
          onDelete={jest.fn()}
          onClose={jest.fn()}
        />
      </BrowserRouter>
    );

  it('rewrites legacy dashboard links to role-specific dashboard route', async () => {
    renderItem({
      id: 1,
      title: 'New Project Match',
      message: 'You have a match',
      type: 'new_match_available',
      link: '/dashboard?tab=tentative',
      is_read: false,
      created_at: new Date().toISOString()
    });

    fireEvent.click(document.querySelector('.notification-item'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/researcher?tab=tentative');
    });
  });

  it('routes malformed links to notifications center', async () => {
    renderItem({
      id: 2,
      title: 'System Announcement',
      message: 'Maintenance window',
      type: 'system_announcement',
      link: 'not a valid url',
      is_read: false,
      created_at: new Date().toISOString()
    });

    fireEvent.click(document.querySelector('.notification-item'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/notifications');
    });
  });
});
