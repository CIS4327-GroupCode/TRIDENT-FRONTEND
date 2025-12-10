import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getApiUrl } from "../config/api";
import "./messages.css";



export default function Messages() {


  const userId = 1;
  const otherUserId = 2;

  const [threadId, setThreadId] = useState(1);

  // Each thread stores its own messages
  const [threads, setThreads] = useState({
    1: [],
    2: []
  });

  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);

  const threadNames = {
    1: "Group 1",
    2: "Individual"
  };

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads, threadId]);

  // Load messages ONLY for the active thread
  useEffect(() => {
  fetch(getApiUrl(`/api/messages/thread/${threadId}`))
    .then(res => res.json())
    .then(data => {
      console.log("THREAD LOADED:", data);   // ADD THIS
      if (data.success) {
        setThreads(prev => ({
          ...prev,
          [threadId]: data.messages
        }));
      }
    });
}, [threadId]);


  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const payload = {
      thread_id: threadId,
      sender_id: userId,
      recipient_id: otherUserId,
      body: newMessage
    };

    try {
      await fetch(getApiUrl("/api/messages/send"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const newMsg = {
        sender_id: userId,
        body: newMessage,
        created_at: new Date().toISOString()
      };

      // Insert message only into this thread
      setThreads(prev => ({
        ...prev,
        [threadId]: [...prev[threadId], newMsg]
      }));

      setNewMessage("");
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  function ChatBubble({ msg }) {
    const isSelf = msg.sender_id === userId;
    const time = new Date(msg.created_at).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });

    return (
      <div className={isSelf ? "bubble-outgoing" : "bubble-incoming"}>
        <p className="bubble-text">{msg.body}</p>
        <p className="bubble-time">{time}</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <Link to="/" className="home-button">← Home</Link>
          <h2 className="sidebar-title">Messages</h2>
        </div>

        <div className="chat-list">
          <button
            className={threadId === 1 ? "chat-item selected" : "chat-item"}
            onClick={() => setThreadId(1)}
          >
            Group 1
          </button>

          <button
            className={threadId === 2 ? "chat-item selected" : "chat-item"}
            onClick={() => setThreadId(2)}
          >
            Individual
          </button>
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main className="chat-area">
        <header className="chat-header">
          <h2>{threadNames[threadId]}</h2>
        </header>

        <div className="chat-content">
          <div className="message-list">
            {threads[threadId]?.map((msg, index) => (
              <ChatBubble key={index} msg={msg} />
            ))}
            <div ref={bottomRef}></div>
          </div>
        </div>

        <footer className="chat-input-bar">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="chat-input"
          />

          <button className="send-button" onClick={sendMessage}>
            ➤
          </button>
        </footer>
      </main>
    </div>
  );
}
