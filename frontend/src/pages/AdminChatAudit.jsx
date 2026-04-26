import React, { useEffect, useRef, useState } from "react";
import { getApiUrl } from "../config/api";
import {
  searchAdminAuditThreads,
  getAdminAuditThreadMessages,
} from "../utils/adminChatAuditUtil";
import "./messages.css";

export default function AdminChatAudit() {
  const [search, setSearch] = useState("");
  const [sensitiveFilter, setSensitiveFilter] = useState("all");
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    loadThreads();
  }, []);

  async function loadThreads() {
    try {
      setThreadsLoading(true);
      setError("");

      const data = await searchAdminAuditThreads(search, sensitiveFilter, 50, 0);
      setThreads(data.threads || []);
    } catch (err) {
      console.error("ADMIN THREAD SEARCH ERROR:", err);
      setError(err.message || "Failed to load audit threads.");
    } finally {
      setThreadsLoading(false);
    }
  }

  async function openThread(threadId) {
    try {
      setMessagesLoading(true);
      setError("");
      setNotice("");
      setSelectedThreadId(threadId);

      const data = await getAdminAuditThreadMessages(threadId, 50);

      setSelectedThread(data.thread || null);
      setParticipants(data.participants || []);
      setMessages(data.messages || []);

      if (data.sensitiveAccessLogged) {
        setNotice("Sensitive thread access has been logged.");
      }
    } catch (err) {
      console.error("ADMIN THREAD LOAD ERROR:", err);
      setError(err.message || "Failed to load thread messages.");
    } finally {
      setMessagesLoading(false);
    }
  }

  function renderAttachment(file) {
    return (
      <div key={file.id} style={{ marginTop: "0.35rem" }}>
        <a href={getApiUrl(file.file_url)} target="_blank" rel="noreferrer">
          {file.file_name}
        </a>
      </div>
    );
  }

  function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString();
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 120px)" }}>
      <div
        style={{
          width: "360px",
          borderRight: "1px solid #ddd",
          padding: "1rem",
          overflowY: "auto",
          background: "#fafafa",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Admin Chat Audit</h2>

        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search by name, email, thread name, or thread id"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={sensitiveFilter}
            onChange={(e) => setSensitiveFilter(e.target.value)}
          >
            <option value="all">All Threads</option>
            <option value="true">Sensitive Only</option>
            <option value="false">Non-Sensitive Only</option>
          </select>

          <button onClick={loadThreads}>Search</button>
        </div>

        {threadsLoading ? (
          <p>Loading threads...</p>
        ) : threads.length === 0 ? (
          <p>No matching threads found.</p>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => openThread(thread.id)}
              style={{
                border: selectedThreadId === thread.id ? "2px solid #2563eb" : "1px solid #ddd",
                borderRadius: "10px",
                padding: "0.85rem",
                marginBottom: "0.75rem",
                cursor: "pointer",
                background: thread.is_sensitive ? "#fff7ed" : "#fff",
              }}
            >
              <div style={{ fontWeight: 700 }}>{thread.display_name}</div>
              <div>Type: {thread.thread_type}</div>
              <div>Sensitive: {thread.is_sensitive ? "Yes" : "No"}</div>
              <div>Participants: {thread.participant_count}</div>
              <div style={{ marginTop: "0.35rem", fontSize: "0.9rem", color: "#555" }}>
                Last activity: {formatDate(thread.last_message_at)}
              </div>

              {thread.participants?.length > 0 && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                  <strong>People:</strong>{" "}
                  {thread.participants.map((p) => p.email ? `${p.name} (${p.email})` : p.name).join(", ")}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
          <h2 style={{ margin: 0 }}>
            {selectedThread ? selectedThread.display_name : "Select a thread"}
          </h2>

          {selectedThread && (
            <div style={{ marginTop: "0.6rem", fontSize: "0.95rem" }}>
              <div><strong>Thread ID:</strong> {selectedThread.id}</div>
              <div><strong>Type:</strong> {selectedThread.thread_type}</div>
              <div><strong>Sensitive:</strong> {selectedThread.is_sensitive ? "Yes" : "No"}</div>
              <div><strong>Last activity:</strong> {formatDate(selectedThread.last_message_at)}</div>
              <div style={{ marginTop: "0.45rem" }}>
                <strong>Participants:</strong>{" "}
                {participants.map((p) => (p.email ? `${p.name} (${p.email})` : p.name)).join(", ")}
              </div>
            </div>
          )}

          {notice && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                borderRadius: "8px",
                background: "#fff7ed",
                border: "1px solid #fdba74",
              }}
            >
              {notice}
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                borderRadius: "8px",
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {messagesLoading ? (
            <p>Loading messages...</p>
          ) : !selectedThread ? (
            <p>Choose a thread from the left to inspect messages.</p>
          ) : messages.length === 0 ? (
            <p>No messages found in this thread.</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "0.85rem",
                  marginBottom: "0.85rem",
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
                  {message.sender?.name || `User #${message.sender_id}`}
                </div>

                {message.sender?.email && (
                  <div style={{ fontSize: "0.9rem", color: "#555", marginBottom: "0.5rem" }}>
                    {message.sender.email}
                  </div>
                )}

                <div style={{ whiteSpace: "pre-wrap" }}>{message.body}</div>

                {message.attachments?.length > 0 && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <strong>Attachments:</strong>
                    {message.attachments.map(renderAttachment)}
                  </div>
                )}

                <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#666" }}>
                  {formatDate(message.created_at)}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}