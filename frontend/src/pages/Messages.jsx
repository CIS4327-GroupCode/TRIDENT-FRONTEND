import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./messages.css";
import { useAuth } from "../auth/AuthContext";
import {
  getThreads,
  getThreadMessages,
  sendThreadMessage,
  markThreadRead,
  createDirectThread,
  createGroupThread,
  getUnreadTotal,
  uploadMessageFile,
  searchChatUsers,
} from "../utils/messages";
import { getApiUrl } from "../config/api";

function getCurrentUser() {
  const storedUser = localStorage.getItem("trident_user");

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch (err) {
    console.error("Failed to parse trident_user:", err);
    return null;
  }
}

function emitUnreadCountUpdate(count) {
  window.dispatchEvent(
    new CustomEvent("messages-unread-updated", {
      detail: { unreadTotal: Number(count) || 0 },
    })
  );
}

function resolveAttachmentUrl(fileUrl) {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return getApiUrl(fileUrl);
}

function getThreadDisplayName(thread) {
  if (!thread) return "Select a conversation";

  if (thread.display_name && thread.display_name.trim()) {
    return thread.display_name;
  }

  if (thread.thread_type === "group") {
    return thread.name?.trim() || `Group #${thread.id}`;
  }

  return thread.name?.trim() || `Direct chat #${thread.id}`;
}

export default function Messages() {
  const { logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);

  const [showComposer, setShowComposer] = useState(false);
  const [composerMode, setComposerMode] = useState("direct");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [isSensitive, setIsSensitive] = useState(false);

  const bottomRef = useRef(null);

  const currentUser = getCurrentUser();
  const currentUserId = Number(currentUser?.id);
  const token = localStorage.getItem("trident_token");
  const requestedThreadId = useMemo(() => {
    const rawThreadId = searchParams.get("thread");
    const parsed = Number(rawThreadId);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const safeMessages = Array.isArray(messages) ? messages : [];
  const selectedThread = threads.find((t) => t.id === threadId) || null;

  const localUnreadTotal = useMemo(() => {
    return threads.reduce((sum, thread) => sum + (Number(thread.unread_count) || 0), 0);
  }, [threads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [safeMessages]);

  useEffect(() => {
    setUnreadTotal(localUnreadTotal);
    emitUnreadCountUpdate(localUnreadTotal);
  }, [localUnreadTotal]);

  useEffect(() => {
    async function loadInitialData() {
      if (!token || !currentUser?.id) {
        setError("Authentication required");
        setLoadingThreads(false);
        return;
      }

      try {
        setLoadingThreads(true);
        setError("");

        const [threadsData, unreadData] = await Promise.all([
          getThreads(),
          getUnreadTotal(),
        ]);

        const threadList = Array.isArray(threadsData?.threads) ? threadsData.threads : [];
        const totalUnread = Number(unreadData?.unreadTotal) || 0;

        setThreads(threadList);
        setUnreadTotal(totalUnread);
        emitUnreadCountUpdate(totalUnread);

        if (threadList.length > 0) {
          const requestedThreadExists = requestedThreadId
            ? threadList.some((thread) => Number(thread.id) === requestedThreadId)
            : false;

          setThreadId((prev) => {
            if (prev) return prev;
            if (requestedThreadExists) return requestedThreadId;
            return threadList[0].id;
          });
        } else {
          setThreadId(null);
          setMessages([]);
          setNextCursor(null);
          setHasMoreMessages(false);
        }
      } catch (err) {
        console.error("Load threads error:", err);
        setError(err.message || "Failed to load threads");
      } finally {
        setLoadingThreads(false);
      }
    }

    loadInitialData();
  }, [token, currentUser?.id, requestedThreadId]);

  useEffect(() => {
    if (!requestedThreadId || loadingThreads || threads.length === 0) {
      return;
    }

    const requestedThreadExists = threads.some(
      (thread) => Number(thread.id) === requestedThreadId
    );

    if (requestedThreadExists && threadId !== requestedThreadId) {
      setThreadId(requestedThreadId);
    }
  }, [requestedThreadId, loadingThreads, threads, threadId]);

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      setNextCursor(null);
      setHasMoreMessages(false);
      return;
    }

    loadMessagesForThread(threadId);
  }, [threadId]);

  useEffect(() => {
    let active = true;

    async function runSearch() {
      const trimmed = searchQuery.trim();

      if (!showComposer || trimmed.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchingUsers(true);
        const data = await searchChatUsers(trimmed);

        if (!active) return;

        const users = Array.isArray(data?.users) ? data.users : [];
        setSearchResults(users);
      } catch (err) {
        console.error("User search error:", err);

        const errorMessage = String(err?.message || "").toLowerCase();
        const isAuthError =
          errorMessage.includes("invalid token") ||
          errorMessage.includes("token expired") ||
          errorMessage.includes("authentication required");

        if (isAuthError) {
          if (active) {
            setError("Your session has expired. Please sign in again.");
            setSearchResults([]);
          }
          logout();
          return;
        }

        if (active) {
          setSearchResults([]);
        }
      } finally {
        if (active) {
          setSearchingUsers(false);
        }
      }
    }

    const timeout = setTimeout(runSearch, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [searchQuery, showComposer]);

  function resetComposer() {
    setShowComposer(false);
    setComposerMode("direct");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName("");
    setIsSensitive(false);
    setCreatingThread(false);
  }

  function toggleSelectedUser(user) {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => Number(u.id) === Number(user.id));
      if (exists) {
        return prev.filter((u) => Number(u.id) !== Number(user.id));
      }
      return [...prev, user];
    });
  }

  async function refreshUnreadTotal() {
    try {
      const unreadData = await getUnreadTotal();
      const totalUnread = Number(unreadData?.unreadTotal) || 0;
      setUnreadTotal(totalUnread);
      emitUnreadCountUpdate(totalUnread);
    } catch (err) {
      console.error("Refresh unread total error:", err);
    }
  }

  async function refreshThreadsAndOpen(threadIdToOpen = null) {
    const threadData = await getThreads();
    const refreshedThreads = Array.isArray(threadData?.threads) ? threadData.threads : [];
    setThreads(refreshedThreads);

    if (threadIdToOpen) {
      setThreadId(threadIdToOpen);
    } else if (refreshedThreads.length > 0) {
      setThreadId(refreshedThreads[0].id);
    }
  }

  async function loadMessagesForThread(selectedThreadId) {
    try {
      setLoadingMessages(true);
      setError("");

      const data = await getThreadMessages(selectedThreadId, 30, null);
      const messageList = Array.isArray(data?.messages) ? data.messages : [];

      setMessages(messageList);
      setNextCursor(data?.nextCursor || null);
      setHasMoreMessages(Boolean(data?.nextCursor));

      const openedThread = threads.find((thread) => thread.id === selectedThreadId);
      const hadUnread = Number(openedThread?.unread_count) > 0;

      await markThreadRead(selectedThreadId);

      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === selectedThreadId
            ? { ...thread, unread_count: 0 }
            : thread
        )
      );

      if (hadUnread) {
        await refreshUnreadTotal();
      }
    } catch (err) {
      console.error("Load messages error:", err);
      setError(err.message || "Failed to load messages");
      setMessages([]);
      setNextCursor(null);
      setHasMoreMessages(false);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function loadOlderMessages() {
    if (!threadId || !nextCursor) return;

    try {
      setLoadingOlder(true);
      setError("");

      const data = await getThreadMessages(threadId, 30, nextCursor);
      const olderMessages = Array.isArray(data?.messages) ? data.messages : [];

      setMessages((prev) => [
        ...olderMessages,
        ...(Array.isArray(prev) ? prev : []),
      ]);

      setNextCursor(data?.nextCursor || null);
      setHasMoreMessages(Boolean(data?.nextCursor));
    } catch (err) {
      console.error("Load older messages error:", err);
      setError(err.message || "Failed to load older messages");
    } finally {
      setLoadingOlder(false);
    }
  }

  async function handleCreateDirectThread(user) {
    if (!user?.id) {
      setError("Select a valid user.");
      return;
    }

    if (Number(user.id) === currentUserId) {
      setError("You cannot create a thread with yourself.");
      return;
    }

    try {
      setCreatingThread(true);
      setError("");

      const result = await createDirectThread(user.id, isSensitive);
      const createdThread = result?.thread || null;

      await refreshThreadsAndOpen(createdThread?.id || null);
      await refreshUnreadTotal();
      resetComposer();
    } catch (err) {
      console.error("Create direct thread error:", err);
      setError(err.message || "Failed to create direct thread");
    } finally {
      setCreatingThread(false);
    }
  }

  async function handleCreateGroupThread() {
    if (selectedUsers.length < 2) {
      setError("Select at least 2 other users for a group chat.");
      return;
    }

    try {
      setCreatingThread(true);
      setError("");

      const result = await createGroupThread(
        groupName.trim(),
        selectedUsers.map((user) => user.id),
        isSensitive
      );

      const createdThread = result?.thread || null;

      await refreshThreadsAndOpen(createdThread?.id || null);
      await refreshUnreadTotal();
      resetComposer();
    } catch (err) {
      console.error("Create group thread error:", err);
      setError(err.message || "Failed to create group thread");
    } finally {
      setCreatingThread(false);
    }
  }

  async function handleSendMessage() {
    if (!threadId || (!newMessage.trim() && selectedFiles.length === 0)) return;

    try {
      setSending(true);
      setError("");

      const uploadedAttachments = [];

      for (const file of selectedFiles) {
        const uploaded = await uploadMessageFile(file);

        uploadedAttachments.push({
          file_name: uploaded.file_name,
          file_url: uploaded.file_url,
        });
      }

      const result = await sendThreadMessage(
        threadId,
        newMessage.trim(),
        uploadedAttachments
      );

      const actualMessage = result?.message || result;

      if (!actualMessage || typeof actualMessage !== "object") {
        throw new Error("Invalid message response");
      }

      setMessages((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        actualMessage,
      ]);

      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                unread_count: 0,
                last_message: {
                  body: actualMessage.body || (uploadedAttachments.length > 0 ? "Attachment" : ""),
                  created_at: actualMessage.created_at,
                },
                last_message_at: actualMessage.created_at,
              }
            : thread
        )
      );

      setNewMessage("");
      setSelectedFiles([]);
      await refreshUnreadTotal();
    } catch (err) {
      console.error("Send error:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function ChatBubble({ msg }) {
    const isSelf = Number(msg.sender_id) === currentUserId;

    const time = new Date(msg.created_at).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    return (
      <div className={isSelf ? "bubble-outgoing" : "bubble-incoming"}>
        <p className="bubble-text">{msg.body || ""}</p>
        <p className="bubble-time">{time}</p>

        {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
          <div className="bubble-attachments">
            {msg.attachments.map((file) => (
              <div key={file.id || file.file_url}>
                {file.file_url ? (
                  <a
                    href={resolveAttachmentUrl(file.file_url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {file.file_name}
                  </a>
                ) : (
                  <span>{file.file_name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="messages-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Link to="/" className="home-button">← Home</Link>

          <div className="sidebar-heading-row">
            <h2 className="sidebar-title">Messages</h2>

            <div className="sidebar-actions">
              {unreadTotal > 0 && (
                <span className="sidebar-total-badge">{unreadTotal}</span>
              )}

              <button
                className="new-chat-button"
                onClick={() => setShowComposer((prev) => !prev)}
                type="button"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {showComposer && (
          <div className="composer-panel">
            <div className="composer-mode-tabs">
              <button
                type="button"
                className={composerMode === "direct" ? "composer-tab active" : "composer-tab"}
                onClick={() => {
                  setComposerMode("direct");
                  setSelectedUsers([]);
                  setGroupName("");
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                Direct
              </button>

              <button
                type="button"
                className={composerMode === "group" ? "composer-tab active" : "composer-tab"}
                onClick={() => {
                  setComposerMode("group");
                  setSelectedUsers([]);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                Group
              </button>
            </div>

            {composerMode === "group" && (
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Optional group name"
                className="direct-chat-input"
              />
            )}

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email"
              className="direct-chat-input"
            />

            <label className="sensitive-toggle">
              <input
                type="checkbox"
                checked={isSensitive}
                onChange={(e) => setIsSensitive(e.target.checked)}
              />
              <span>Mark as sensitive</span>
            </label>

            {selectedUsers.length > 0 && (
              <div className="selected-users-list">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="selected-user-chip">
                    <span>{user.name || user.email}</span>
                    <button type="button" onClick={() => toggleSelectedUser(user)}>×</button>
                  </div>
                ))}
              </div>
            )}

            {searchingUsers ? (
              <p className="composer-status-text">Searching...</p>
            ) : searchResults.length > 0 ? (
              <div className="search-results-list">
                {searchResults.map((user) => {
                  const isSelected = selectedUsers.some((u) => Number(u.id) === Number(user.id));

                  return (
                    <button
                      key={user.id}
                      type="button"
                      className={isSelected ? "search-result-item selected" : "search-result-item"}
                      onClick={() => {
                        if (composerMode === "direct") {
                          handleCreateDirectThread(user);
                        } else {
                          toggleSelectedUser(user);
                        }
                      }}
                      disabled={creatingThread}
                    >
                      <div className="search-result-name">{user.name || "Unnamed User"}</div>
                      <div className="search-result-email">{user.email}</div>
                    </button>
                  );
                })}
              </div>
            ) : searchQuery.trim().length >= 2 ? (
              <p className="composer-status-text">No users found.</p>
            ) : (
              <p className="composer-status-text">
                {composerMode === "direct"
                  ? "Search for one user to start a direct message."
                  : "Search and select multiple users to create a group chat."}
              </p>
            )}

            <div className="composer-actions">
              <button type="button" className="composer-secondary-button" onClick={resetComposer}>
                Cancel
              </button>

              {composerMode === "group" && (
                <button
                  type="button"
                  className="composer-primary-button"
                  onClick={handleCreateGroupThread}
                  disabled={creatingThread}
                >
                  {creatingThread ? "Creating..." : "Create group"}
                </button>
              )}
            </div>
          </div>
        )}

        {loadingThreads ? (
          <p>Loading threads...</p>
        ) : threads.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          <div className="chat-list">
            {threads.map((thread) => {
              const isSelected = threadId === thread.id;
              const unreadCount = Number(thread.unread_count) || 0;

              return (
                <button
                  key={thread.id}
                  className={isSelected ? "chat-item selected" : "chat-item"}
                  onClick={() => setThreadId(thread.id)}
                >
                  <div className="chat-item-top">
                    <div className="chat-item-title">
                      {getThreadDisplayName(thread)}
                    </div>

                    {unreadCount > 0 && (
                      <span className="thread-unread-badge">{unreadCount}</span>
                    )}
                  </div>

                  <div className="thread-meta-row">
                    {thread.is_sensitive && (
                      <span className="sensitive-badge">Sensitive</span>
                    )}
                  </div>

                  {thread.last_message?.body && (
                    <div className="chat-item-preview">
                      {thread.last_message.body}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </aside>

      <main className="chat-area">
        <header className="chat-header">
          <div className="chat-header-content">
            <h2>{getThreadDisplayName(selectedThread)}</h2>

            {selectedThread?.is_sensitive && (
              <span className="sensitive-badge header-sensitive-badge">Sensitive</span>
            )}
          </div>
        </header>

        <div className="chat-content">
          <div className="message-list">
            {error && <p className="messages-error">{error}</p>}

            {!threadId ? (
              <p>Select a conversation to begin, or create a new one from the sidebar.</p>
            ) : loadingMessages ? (
              <p>Loading messages...</p>
            ) : (
              <>
                {hasMoreMessages && (
                  <button
                    onClick={loadOlderMessages}
                    disabled={loadingOlder}
                    className="load-older-button"
                  >
                    {loadingOlder ? "Loading..." : "Load older messages"}
                  </button>
                )}

                {safeMessages.length === 0 ? (
                  <p>No messages yet.</p>
                ) : (
                  safeMessages.map((msg) => (
                    <ChatBubble key={msg.id} msg={msg} />
                  ))
                )}
              </>
            )}

            <div ref={bottomRef}></div>
          </div>
        </div>

        {threadId && (
          <footer className="chat-input-bar">
            <div className="message-composer">
              <input
                type="file"
                multiple
                onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              />

              {selectedFiles.length > 0 && (
                <div className="selected-files-text">
                  {selectedFiles.map((file) => file.name).join(", ")}
                </div>
              )}

              <div className="message-input-row">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="chat-input"
                  disabled={sending}
                />

                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}
                >
                  {sending ? "..." : "➤"}
                </button>
              </div>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}