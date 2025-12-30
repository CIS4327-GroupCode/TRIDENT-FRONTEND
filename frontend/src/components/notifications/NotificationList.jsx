import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, onNotificationRead, onNotificationDelete, onClose }) => {
  return (
    <div className="notification-list">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onNotificationRead}
          onDelete={onNotificationDelete}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default NotificationList;
