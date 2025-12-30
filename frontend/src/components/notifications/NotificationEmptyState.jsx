import React from 'react';

const NotificationEmptyState = () => {
  return (
    <div className="notification-empty-state">
      <i className="bi bi-inbox"></i>
      <p className="text-muted mt-3">No notifications</p>
      <p className="text-muted small">You're all caught up!</p>
    </div>
  );
};

export default NotificationEmptyState;
