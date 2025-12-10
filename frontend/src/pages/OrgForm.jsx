import { useState } from "react";

export default function OrgForm() {
  const [formData, setFormData] = useState({
    name: "",
    mission: "",
    focus_areas: "",
    needs: "",
    contact_email: "",
  });

  const [status, setStatus] = useState({ type: "idle", message: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "loading", message: "Saving..." });

    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Server error");
      }

      const data = await res.json();
      console.log("Created org:", data);

      setStatus({
        type: "success",
        message: `Saved! Org ID ${data.id} created.`,
      });

    
      // setFormData({ name: "", mission: "", focus_areas: "", needs: "", contact_email: "" });

    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.message || "Something went wrong.",
      });
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Create Organization Profile: Step 2</h1>
        <p style={styles.subheading}>
        Tell researchers who you are, who you serve, and what kind of support
        would actually help your work.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Organization Name *
            <input
              style={styles.input}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label style={styles.label}>
            Mission
            <textarea
              style={styles.textarea}
              name="mission"
              value={formData.mission}
              onChange={handleChange}
              placeholder="What is your mission?"
            />
          </label>

          <label style={styles.label}>
            Focus Areas
            <textarea
              style={styles.textarea}
              name="focus_areas"
              value={formData.focus_areas}
              onChange={handleChange}
              placeholder="e.g. education, housing equity, food security"
            />
          </label>

          <label style={styles.label}>
            Needs
            <textarea
              style={styles.textarea}
              name="needs"
              value={formData.needs}
              onChange={handleChange}
              placeholder="What kind of research or data would help you most?"
            />
          </label>

          <label style={styles.label}>
            Contact Email *
            <input
              style={styles.input}
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              required
            />
          </label>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(status.type === "loading" ? styles.buttonDisabled : {}),
            }}
            disabled={status.type === "loading"}
          >
            {status.type === "loading" ? "Saving..." : "Save Profile"}
          </button>

          {status.type === "success" && (
            <p style={{ color: "#15803d", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              {status.message}
            </p>
          )}
          {status.type === "error" && (
            <p style={{ color: "#dc2626", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              {status.message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

// Inline styles to keep it self-contained.
// You can refactor to Tailwind or CSS modules later.
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f172a", // slate-900
    color: "#fff",
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  card: {
    backgroundColor: "#1e293b", // slate-800
    width: "100%",
    maxWidth: "480px",
    borderRadius: "1rem",
    padding: "2rem",
    boxShadow:
      "0 20px 40px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  heading: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#fff",
    marginBottom: "0.25rem",
  },
  subheading: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    marginBottom: "1.5rem",
    lineHeight: 1.4,
  },
  form: {
    display: "grid",
    gap: "1rem",
  },
  label: {
    display: "grid",
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "#cbd5e1",
    gap: "0.4rem",
  },
  input: {
    width: "100%",
    backgroundColor: "#0f172a",
    border: "1px solid #475569",
    borderRadius: "0.5rem",
    padding: "0.6rem 0.75rem",
    color: "#fff",
    fontSize: "0.9rem",
  },
  textarea: {
    width: "100%",
    minHeight: "70px",
    backgroundColor: "#0f172a",
    border: "1px solid #475569",
    borderRadius: "0.5rem",
    padding: "0.6rem 0.75rem",
    color: "#fff",
    fontSize: "0.9rem",
    resize: "vertical",
  },
  button: {
    background:
      "linear-gradient(to right, #4f46e5, #6366f1 30%, #8b5cf6)",
    border: "none",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    textAlign: "center",
    transition: "opacity 0.15s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};