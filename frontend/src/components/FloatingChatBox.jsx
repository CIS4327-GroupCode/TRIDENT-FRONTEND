import React, { useState } from 'react';

export default function FloatingChatBox() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
      {open ? (
        <div
          style={{
            width: 320,
            height: 380,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              background: '#007bff',
              color: 'white',
              padding: '10px',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
            }}
          >
            Chat
            <button
              onClick={() => setOpen(false)}
              style={{
                float: 'right',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              ✕
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '10px',
              fontSize: '14px',
            }}
          >
            <p>No messages yet.</p>
          </div>
          <div style={{ padding: '10px' }}>
            <textarea
              placeholder="Type your message..."
              rows={2}
              style={{ width: '100%', resize: 'none' }}
            ></textarea>
            <button className="btn btn-primary w-100 mt-2">Send</button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-primary"
          onClick={() => setOpen(true)}
        >
          💬 Chat
        </button>
      )}
    </div>
  );
}