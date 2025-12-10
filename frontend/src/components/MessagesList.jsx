export default function MessageList({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, maxHeight: 400, overflowY: "auto", border: "1px solid #ddd", borderRadius: 8 }}>
      {items.length === 0 && <div style={{ color: "#888" }}>No messages yet</div>}
      {items.map(m => (
        <div key={m.id} style={{ background: "#f9f9f9", padding: 8, borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: "#666" }}>
            <strong>{m.userId}</strong> • {new Date(m.createdAt).toLocaleTimeString()}
          </div>
          <div style={{ marginTop: 4 }}>{m.text}</div>
        </div>
      ))}
    </div>
  );
}
