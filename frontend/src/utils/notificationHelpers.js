/**
 * Notification Helper Functions
 * Utilities for formatting and processing notification data
 */

/**
 * Format notification timestamp to relative time
 * @param {string} timestamp - ISO 8601 timestamp
 * @returns {string} - Formatted time (e.g., "2 hours ago")
 */
export const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const created = new Date(timestamp);
  const diffMs = now - created;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return created.toLocaleDateString();
  }
};

/**
 * Get notification icon based on type
 * @param {string} type - Notification type
 * @returns {string} - Bootstrap icon class
 */
export const getNotificationIcon = (type) => {
  const iconMap = {
    project_created: 'bi-folder-plus',
    project_updated: 'bi-folder-check',
    project_deleted: 'bi-folder-x',
    project_status_changed: 'bi-folder-check',
    project_submitted_for_review: 'bi-file-earmark-check',
    project_approved: 'bi-check-circle',
    project_rejected: 'bi-x-circle',
    milestone_created: 'bi-flag',
    milestone_updated: 'bi-flag-fill',
    milestone_completed: 'bi-check2-circle',
    milestone_deadline_approaching: 'bi-clock-history',
    milestone_overdue: 'bi-exclamation-triangle',
    message_received: 'bi-envelope',
    account_status_changed: 'bi-person-check',
    admin_message: 'bi-megaphone',
    application_received: 'bi-file-earmark-text',
    application_accepted: 'bi-hand-thumbs-up',
    application_rejected: 'bi-hand-thumbs-down',
    new_match_available: 'bi-stars',
    rating_received: 'bi-star-fill',
    system_announcement: 'bi-info-circle',
    account_verified: 'bi-patch-check'
  };

  return iconMap[type] || 'bi-bell';
};

/**
 * Truncate notification message
 * @param {string} message - Full message
 * @param {number} maxLength - Max length
 * @returns {string} - Truncated message
 */
export const truncateMessage = (message, maxLength = 60) => {
  if (!message || message.length <= maxLength) {
    return message;
  }
  return message.substring(0, maxLength) + '...';
};

/**
 * Get notification color based on type
 * @param {string} type - Notification type
 * @returns {string} - Color class or hex
 */
export const getNotificationColor = (type) => {
  if (type.includes('approved') || type.includes('completed') || type.includes('accepted')) {
    return '#28a745'; // Green
  }
  if (type.includes('rejected') || type.includes('deleted') || type.includes('overdue')) {
    return '#dc3545'; // Red
  }
  if (type.includes('approaching') || type.includes('pending')) {
    return '#ffc107'; // Yellow
  }
  return '#007bff'; // Blue (default)
};
