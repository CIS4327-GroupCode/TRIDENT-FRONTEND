export const NOTIFICATION_SYNC_EVENT = 'trident:notifications-sync';

export const emitNotificationSync = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(NOTIFICATION_SYNC_EVENT));
};