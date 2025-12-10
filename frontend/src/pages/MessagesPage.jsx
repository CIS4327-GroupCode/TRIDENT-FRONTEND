import { useState } from "react";

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState("group1");

  const chats = {
    group1: [
      { id: 1, sender: "Alex", text: "Hey everyone, how’s the project coming along?" },
      { id: 2, sender: "You", text: "It’s going well! Just finishing the frontend fixes." },
      { id: 3, sender: "Maya", text: "Nice! I’ll review the database schema later today." },
    ],
    bot: [
      { id: 1, sender: "Bot", text: "Hello Kenneth!" },
      { id: 2, sender: "You", text: "Hey Bot!" },
    ],
  };

  return (
    <div
      className="d-flex justify-content-center align-items-start p-4"
      style={{ minHeight: "calc(100vh - 120px)", background: "#f8f9fa" }}
    >
      {/* Outer chat square */}
      <div
        style={{
          width: 900,
          height: 550,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Left column – chat list */}
        <aside
          style={{
            width: "30%",
            borderRight: "1px solid #eaeaea",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="p-3 border-bottom fw-semibold">Chats</div>

          <button
            onClick={() => setActiveChat("group1")}
            className={`btn w-100 text-start ${
              activeChat === "group1" ? "btn-primary text-white" : "btn-light"
            }`}
            style={{ border: "none", borderRadius: 0 }}
          >
            Group 1
          </button>

          <button
            onClick={() => setActiveChat("bot")}
            className={`btn w-100 text-start ${
              activeChat === "bot" ? "btn-primary text-white" : "btn-light"
            }`}
            style={{ border: "none", borderRadius: 0 }}
          >
            Bot DM
          </button>
        </aside>

        {/* Right column – messages */}
        <section
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#fdfdfd",
          }}
        >
          <div className="p-3 border-bottom fw-semibold">
            {activeChat === "group1" ? "Group 1" : "Bot DM"}
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              background: "#fafafa",
            }}
          >
            {chats[activeChat].map((msg) => (
              <div key={msg.id} className="mb-3">
                <div className="small text-muted mb-1">
                  <strong>{msg.sender}</strong>
                </div>
                <div
                  className={`p-2 rounded ${
                    msg.sender === "You"
                      ? "bg-primary text-white"
                      : "bg-light border"
                  }`}
                  style={{ maxWidth: "70%" }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Message input bar */}
          <div
            className="p-3 border-top bg-white"
            style={{ display: "flex", gap: 8 }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
            />
            <button className="btn btn-primary">Send</button>
          </div>
        </section>
      </div>
    </div>
  );
}