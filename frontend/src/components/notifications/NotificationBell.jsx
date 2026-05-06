import React, { useState, useEffect, useRef } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { getUnreadCount } from '../../config/api';
import { useAuth } from '../../auth/AuthContext';
import { NOTIFICATION_SYNC_EVENT } from '../../utils/notificationEvents';
import './notifications.css';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { token, user } = useAuth();

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await getUnreadCount(token);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when user/token changes
  useEffect(() => {
    if (user && token) {
      fetchUnreadCount();
    }
  }, [user, token]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user || !token) return;

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, token]);

  useEffect(() => {
    if (!user || !token) return;

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    };

    const handleSync = () => {
      fetchUnreadCount();
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener(NOTIFICATION_SYNC_EVENT, handleSync);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener(NOTIFICATION_SYNC_EVENT, handleSync);
    };
  }, [user, token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Callback when notification is read
  const handleNotificationRead = () => {
    fetchUnreadCount();
  };

  // Callback when all marked as read
  const handleAllRead = () => {
    fetchUnreadCount();
  };

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={toggleDropdown}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <span 
            className="notification-badge" 
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          onNotificationRead={handleNotificationRead}
          onAllRead={handleAllRead}
        />
      )}
    </div>
  );
};

export default NotificationBell;
