import React, { useState, useEffect } from 'react';
import NotificationList from './NotificationList';
import NotificationEmptyState from './NotificationEmptyState';
import { getNotifications, markAllAsRead } from '../../config/api';
import { useAuth } from '../../auth/AuthContext';

const NotificationDropdown = ({ onClose, onNotificationRead, onAllRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getNotifications({ limit: 20, offset: 0 }, token);
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(token);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      onAllRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Handle individual notification read
  const handleNotificationRead = (notificationId) => {
    setNotifications(
      notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    onNotificationRead();
  };

  // Handle notification delete
  const handleNotificationDelete = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-dropdown-header">
        <h6>Notifications</h6>
        <button
          onClick={onClose}
          aria-label="Close notifications"
          title="Close"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="notification-dropdown-body">
        {loading ? (
          <div className="notification-loading">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0 small">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger m-2" role="alert">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          <NotificationList
            notifications={notifications}
            onNotificationRead={handleNotificationRead}
            onNotificationDelete={handleNotificationDelete}
            onClose={onClose}
          />
        )}
      </div>

      {notifications.length > 0 && !loading && !error && (
        <div className="notification-dropdown-footer">
          <button onClick={handleMarkAllRead} title="Mark all as read">
            Mark All Read
          </button>
          <button onClick={onClose} title="Close">
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
