import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationItem from '../NotificationItem';
import { useAuth } from '../../../auth/AuthContext';
import { markNotificationAsRead, deleteNotification } from '../../../config/api';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
jest.mock('../../../auth/AuthContext');
jest.mock('../../../config/api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));
jest.mock('../../../utils/notificationHelpers', () => ({
  formatNotificationTime: jest.fn(() => '2 hours ago'),
  getNotificationIcon: jest.fn(() => 'bi-bell'),
  getNotificationColor: jest.fn(() => '#007bff')
}));

describe('NotificationItem', () => {
  const mockNavigate = jest.fn();
  const mockOnRead = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnClose = jest.fn();
  const mockToken = 'test-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ token: mockToken });
    useNavigate.mockReturnValue(mockNavigate);
    markNotificationAsRead.mockResolvedValue({});
    deleteNotification.mockResolvedValue({});
  });

  const renderNotificationItem = (notification) => {
    return render(
      <BrowserRouter>
        <NotificationItem
          notification={notification}
          onRead={mockOnRead}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      </BrowserRouter>
    );
  };

  describe('Link Normalization', () => {
    test('handles internal relative links correctly', async () => {
      const notification = {
        id: 1,
        title: 'New Application',
        message: 'You have a new application',
        link: '/projects/123/applications',
        is_read: false,
        type: 'application_received',
        created_at: new Date().toISOString()
      };

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      fireEvent.click(item);

      await waitFor(() => {
        expect(markNotificationAsRead).toHaveBeenCalledWith(1, mockToken);
        expect(mockNavigate).toHaveBeenCalledWith('/projects/123/applications');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('normalizes absolute URLs to internal paths', async () => {
      const notification = {
        id: 2,
        title: 'Project Update',
        message: 'Project status changed',
        link: 'https://trident.org/projects/456',
        is_read: false,
        type: 'project_status_changed',
        created_at: new Date().toISOString()
      };

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      fireEvent.click(item);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/projects/456');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('preserves query params and hash from absolute URLs', async () => {
      const notification = {
        id: 3,
        title: 'Milestone Alert',
        message: 'Milestone deadline approaching',
        link: 'https://trident.org/projects/789/milestones?tab=upcoming#milestone-5',
        is_read: true,
        type: 'milestone_deadline_approaching',
        created_at: new Date().toISOString()
      };

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      fireEvent.click(item);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/projects/789/milestones?tab=upcoming#milestone-5');
        expect(markNotificationAsRead).not.toHaveBeenCalled(); // Already read
      });
    });

    test('falls back to /notifications for missing links', async () => {
      const notification = {
        id: 4,
        title: 'System Announcement',
        message: 'General system message',
        link: null,
        is_read: false,
        type: 'system_announcement',
        created_at: new Date().toISOString()
      };

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      fireEvent.click(item);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/notifications');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('falls back to /notifications for invalid links', async () => {
      const notification = {
        id: 5,
        title: 'Broken Link',
        message: 'Has malformed link',
        link: 'ht!@#$%^&*()tp://invalid',
        is_read: false,
        type: 'system_announcement',
        created_at: new Date().toISOString()
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      fireEvent.click(item);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/notifications');
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Mark as Read Flow', () => {
    test('marks unread notification as read on click', async () => {
      const notification = {
        id: 6,
        title: 'New Message',
        message: 'You have a new message',
        link: '/messages',
        is_read: false,
        type: 'message_received',
        created_at: new Date().toISOString()
      };

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      expect(item).toHaveClass('unread');
      
      fireEvent.click(item);

      await waitFor(() => {
        expect(markNotificationAsRead).toHaveBeenCalledWith(6, mockToken);
        expect(mockOnRead).toHaveBeenCalledWith(6);
      });
    });

    test('does not mark already read notification', async () => {
      const notification = {
        id: 7,
        title: 'Old Notification',
        message: 'Already read',
        link: '/projects/999',
        is_read: true,
        type: 'project_created',
        created_at: new Date().toISOString()
      };

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      expect(item).not.toHaveClass('unread');
      
      fireEvent.click(item);

      await waitFor(() => {
        expect(markNotificationAsRead).not.toHaveBeenCalled();
        expect(mockOnRead).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/projects/999');
      });
    });

    test('handles mark as read API failure gracefully', async () => {
      const notification = {
        id: 8,
        title: 'Error Test',
        message: 'Should handle API error',
        link: '/projects/111',
        is_read: false,
        type: 'project_updated',
        created_at: new Date().toISOString()
      };

      markNotificationAsRead.mockRejectedValueOnce(new Error('API Error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      fireEvent.click(item);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/projects/111'); // Navigation still happens
        expect(mockOnClose).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Delete Flow', () => {
    test('deletes notification when delete button clicked', async () => {
      const notification = {
        id: 9,
        title: 'Delete Test',
        message: 'Will be deleted',
        link: '/projects/222',
        is_read: true,
        type: 'project_deleted',
        created_at: new Date().toISOString()
      };

      renderNotificationItem(notification);
      
      const deleteButton = screen.getByLabelText('Delete notification');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(deleteNotification).toHaveBeenCalledWith(9, mockToken);
        expect(mockOnDelete).toHaveBeenCalledWith(9);
      });
    });

    test('delete button stops event propagation', async () => {
      const notification = {
        id: 10,
        title: 'Propagation Test',
        message: 'Delete should not trigger navigation',
        link: '/projects/333',
        is_read: false,
        type: 'milestone_created',
        created_at: new Date().toISOString()
      };

      renderNotificationItem(notification);
      
      const deleteButton = screen.getByLabelText('Delete notification');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(deleteNotification).toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled(); // Navigation should NOT happen
        expect(mockOnClose).not.toHaveBeenCalled(); // Dropdown should NOT close
      });
    });

    test('handles delete API failure gracefully', async () => {
      const notification = {
        id: 11,
        title: 'Delete Error Test',
        message: 'Delete will fail',
        link: '/projects/444',
        is_read: false,
        type: 'application_accepted',
        created_at: new Date().toISOString()
      };

      deleteNotification.mockRejectedValueOnce(new Error('Delete failed'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      renderNotificationItem(notification);
      
      const deleteButton = screen.getByLabelText('Delete notification');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(mockOnDelete).not.toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Keyboard Accessibility', () => {
    test('handles Enter key press', async () => {
      const notification = {
        id: 12,
        title: 'Keyboard Test',
        message: 'Enter key should work',
        link: '/projects/555',
        is_read: false,
        type: 'rating_received',
        created_at: new Date().toISOString()
      };

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      fireEvent.keyPress(item, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(markNotificationAsRead).toHaveBeenCalledWith(12, mockToken);
        expect(mockNavigate).toHaveBeenCalledWith('/projects/555');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('handles Space key press', async () => {
      const notification = {
        id: 13,
        title: 'Space Key Test',
        message: 'Space key should work',
        link: '/messages',
        is_read: true,
        type: 'message_received',
        created_at: new Date().toISOString()
      };

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      fireEvent.keyPress(item, { key: ' ', code: 'Space', charCode: 32 });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/messages');
      });
    });
  });

  describe('Real-World Notification Scenarios', () => {
    test('application received notification flow', async () => {
      const notification = {
        id: 100,
        title: 'New Project Application',
        message: 'John Doe has applied to your project "Community Health Study".',
        link: '/projects/789/applications',
        is_read: false,
        type: 'application_received',
        created_at: new Date().toISOString(),
        metadata: {
          application_id: 42,
          project_id: 789,
          researcher_id: 55,
          researcher_name: 'John Doe'
        }
      };

      renderNotificationItem(notification);
      
      expect(screen.getByText('New Project Application')).toBeInTheDocument();
      expect(screen.getByText(/John Doe has applied/)).toBeInTheDocument();
      
      const item = screen.getByRole('button');
      fireEvent.click(item);

      await waitFor(() => {
        expect(markNotificationAsRead).toHaveBeenCalledWith(100, mockToken);
        expect(mockNavigate).toHaveBeenCalledWith('/projects/789/applications');
        expect(mockOnRead).toHaveBeenCalledWith(100);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('milestone deadline approaching notification flow', async () => {
      const notification = {
        id: 101,
        title: 'Milestone Deadline Approaching',
        message: 'The milestone "Initial Data Collection" is due in 3 days.',
        link: '/projects/456/milestones',
        is_read: false,
        type: 'milestone_deadline_approaching',
        created_at: new Date().toISOString(),
        metadata: {
          milestone_id: 12,
          project_id: 456,
          days_until_deadline: 3
        }
      };

      renderNotificationItem(notification);
      
      expect(screen.getByText('Milestone Deadline Approaching')).toBeInTheDocument();
      
      const item = screen.getByRole('button');
      fireEvent.click(item);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/projects/456/milestones');
      });
    });

    test('project status changed notification flow', async () => {
      const notification = {
        id: 102,
        title: 'Project Status Updated',
        message: 'Your project "Climate Impact Assessment" status changed to "In Progress".',
        link: '/projects/321',
        is_read: false,
        type: 'project_status_changed',
        created_at: new Date().toISOString(),
        metadata: {
          project_id: 321,
          old_status: 'pending',
          new_status: 'in_progress'
        }
      };

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      fireEvent.click(item);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/projects/321');
      });
    });

    test('message received notification flow', async () => {
      const notification = {
        id: 103,
        title: 'New Message',
        message: 'Jane Smith sent you a message about "Data Privacy Concerns".',
        link: '/messages',
        is_read: false,
        type: 'message_received',
        created_at: new Date().toISOString(),
        metadata: {
          sender_id: 88,
          sender_name: 'Jane Smith',
          thread_id: 25
        }
      };

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      fireEvent.click(item);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/messages');
      });
    });

    test('admin system announcement flow', async () => {
      const notification = {
        id: 104,
        title: 'System Maintenance Scheduled',
        message: 'Platform will be under maintenance on Feb 1st from 2-4 AM EST.',
        link: '/notifications',
        is_read: false,
        type: 'system_announcement',
        created_at: new Date().toISOString()
      };

      renderNotificationItem(notification);
      
      const item = screen.getByRole('button');
      fireEvent.click(item);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/notifications');
      });
    });
  });
});
