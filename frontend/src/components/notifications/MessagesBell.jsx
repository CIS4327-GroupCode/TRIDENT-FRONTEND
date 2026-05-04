import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getThreads, markThreadRead } from '../../utils/messagesUtil';
import './notifications.css';

function getThreadName(thread) {
  if (!thread) return 'Conversation';

  if (typeof thread.display_name === 'string' && thread.display_name.trim()) {
    return thread.display_name.trim();
  }

  if (typeof thread.name === 'string' && thread.name.trim()) {
    return thread.name.trim();
  }

  return `Thread #${thread.id}`;
}

function getThreadPreview(thread) {
  const preview = thread?.last_message?.body;

  if (typeof preview === 'string' && preview.trim()) {
    return preview.trim();
  }

  return 'No messages yet';
}

function sortThreadsByUnreadAndRecent(threadList) {
  const safeThreads = Array.isArray(threadList) ? threadList : [];

  return safeThreads
    .slice()
    .sort((left, right) => {
      const leftUnread = Number(left?.unread_count) || 0;
      const rightUnread = Number(right?.unread_count) || 0;

      const leftHasUnread = leftUnread > 0 ? 1 : 0;
      const rightHasUnread = rightUnread > 0 ? 1 : 0;

      if (leftHasUnread !== rightHasUnread) {
        return rightHasUnread - leftHasUnread;
      }

      const leftTime = left?.last_message_at ? new Date(left.last_message_at).getTime() : 0;
      const rightTime = right?.last_message_at ? new Date(right.last_message_at).getTime() : 0;

      return rightTime - leftTime;
    });
}

function emitUnreadCountUpdate(unreadTotal) {
  window.dispatchEvent(
    new CustomEvent('messages-unread-updated', {
      detail: { unreadTotal: Number(unreadTotal) || 0 },
    })
  );
}

const MessagesBell = ({ unreadCount = 0 }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState([]);

  const dropdownRef = useRef(null);

  const totalUnread = useMemo(() => {
    return Number(unreadCount) > 0 ? Number(unreadCount) : 0;
  }, [unreadCount]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    async function loadThreads() {
      setLoading(true);

      try {
        const data = await getThreads();
        const nextThreads = sortThreadsByUnreadAndRecent(data?.threads);
        setThreads(nextThreads);
      } catch (error) {
        console.error('Error fetching message threads:', error);
        setThreads([]);
      } finally {
        setLoading(false);
      }
    }

    loadThreads();

    return undefined;
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!user) {
    return null;
  }

  async function handleThreadClick(thread) {
    const selectedThreadId = Number(thread?.id);

    if (!selectedThreadId) {
      return;
    }

    const selectedThreadUnread = Number(thread?.unread_count) || 0;

    setIsOpen(false);

    if (selectedThreadUnread > 0) {
      const nextThreads = sortThreadsByUnreadAndRecent(
        threads.map((currentThread) => {
          if (Number(currentThread.id) !== selectedThreadId) {
            return currentThread;
          }

          return {
            ...currentThread,
            unread_count: 0,
          };
        })
      );

      setThreads(nextThreads);
      emitUnreadCountUpdate(Math.max(0, totalUnread - selectedThreadUnread));

      try {
        await markThreadRead(selectedThreadId);
      } catch (error) {
        console.error('Error marking thread as read from navbar:', error);
      }
    }

    navigate(`/messages?thread=${selectedThreadId}`);
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Messages${totalUnread > 0 ? `, ${totalUnread} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`Messages${totalUnread > 0 ? ` (${totalUnread} unread)` : ''}`}
      >
        <i className="bi bi-envelope"></i>
        {totalUnread > 0 && (
          <span className="notification-badge" aria-label={`${totalUnread} unread messages`}>
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown messages-bell-dropdown">
          <div className="notification-dropdown-header">
            <h6>Messages</h6>
            <button onClick={() => setIsOpen(false)} aria-label="Close messages" title="Close">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="notification-dropdown-body">
            {loading ? (
              <div className="notification-loading">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 mb-0 small">Loading conversations...</p>
              </div>
            ) : threads.length === 0 ? (
              <div className="notification-empty-state">
                <i className="bi bi-envelope-open"></i>
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="notification-list">
                {threads.map((thread) => {
                  const unreadForThread = Number(thread?.unread_count) || 0;

                  return (
                    <button
                      key={thread.id}
                      type="button"
                      className={`messages-thread-item${unreadForThread > 0 ? ' has-unread' : ''}`}
                      onClick={() => handleThreadClick(thread)}
                    >
                      <div className="messages-thread-item-header">
                        <span className="messages-thread-name">{getThreadName(thread)}</span>
                        {unreadForThread > 0 && (
                          <span className="messages-thread-unread-badge">{unreadForThread}</span>
                        )}
                      </div>

                      <div className="messages-thread-preview">{getThreadPreview(thread)}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="notification-dropdown-footer">
            <Link to="/messages" onClick={() => setIsOpen(false)}>
              Open Messages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesBell;
