import React from 'react';
import { useNavigate } from 'react-router-dom';
import { markNotificationAsRead, deleteNotification } from '../../config/api';
import { formatNotificationTime, getNotificationIcon, getNotificationColor } from '../../utils/notificationHelpers';
import { useAuth } from '../../auth/AuthContext';

const NotificationItem = ({ notification, onRead, onDelete, onClose }) => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Handle notification click
  const handleClick = async () => {
    // Mark as read if unread
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id, token);
        onRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate if link exists
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  // Handle delete
  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent triggering click
    try {
      await deleteNotification(notification.id, token);
      onDelete(notification.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle keyboard interaction
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);
  const timeAgo = formatNotificationTime(notification.created_at);

  return (
    <div
      className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={handleKeyPress}
      aria-label={`${notification.title}. ${notification.message}`}
    >
      <div className="notification-icon" style={{ color }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-message">{notification.message}</div>
        <div className="notification-time">{timeAgo}</div>
      </div>
      <button
        className="notification-delete"
        onClick={handleDelete}
        aria-label="Delete notification"
        title="Delete notification"
      >
        <i className="bi bi-x"></i>
      </button>
    </div>
  );
};

export default NotificationItem;
