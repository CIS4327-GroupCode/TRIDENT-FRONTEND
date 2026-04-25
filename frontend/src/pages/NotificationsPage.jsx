import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import NotificationList from '../components/notifications/NotificationList';
import NotificationEmptyState from '../components/notifications/NotificationEmptyState';
import { useAuth } from '../auth/AuthContext';
import { getNotifications, markAllAsRead, deleteAllRead } from '../config/api';

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications({ limit: 100, offset: 0 }, token);
      setNotifications(data.notifications || []);
    } catch (loadError) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [token]);

  const handleNotificationRead = (notificationId) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, is_read: true } : notification
      )
    );
  };

  const handleNotificationDelete = (notificationId) => {
    setNotifications((current) => current.filter((notification) => notification.id !== notificationId));
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(token);
      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
    } catch (markError) {
      setError('Failed to mark all notifications as read');
    }
  };

  const handleDeleteRead = async () => {
    try {
      await deleteAllRead(token);
      setNotifications((current) => current.filter((notification) => !notification.is_read));
    } catch (deleteError) {
      setError('Failed to delete read notifications');
    }
  };

  return (
    <div className="page-root">
      <TopBar />
      <main id="main-content" className="page-content container-center py-5" style={{ maxWidth: '920px', margin: '0 auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h1 className="page-heading mb-1">Notifications</h1>
            <p className="page-subheading mb-0">Review updates and open related resources.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={handleDeleteRead}>
              Delete Read
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleMarkAllRead}>
              Mark All Read
            </button>
          </div>
        </div>

        {loading && (
          <div className="d-flex justify-content-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && <NotificationEmptyState />}

        {!loading && !error && notifications.length > 0 && (
          <div className="card p-0 overflow-hidden">
            <NotificationList
              notifications={notifications}
              onNotificationRead={handleNotificationRead}
              onNotificationDelete={handleNotificationDelete}
              onClose={() => {}}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
