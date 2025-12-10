import { Link } from "react-router-dom";

export default function NonprofitSignup() {
  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Organization Setup</h1>

        <p style={styles.subheading}>
          Welcome. This portal is for nonprofits who want support from
          researchers. You'll share your mission, focus areas, who you serve,
          and what kind of help you’re looking for.
        </p>

        <p style={styles.note}>
          This info becomes your organization’s profile. Researchers will use
          it to understand your needs and decide if they’re a good fit to
          collaborate.
        </p>

        <div style={styles.section}>
          <h2 style={styles.sectionHeading}>What you'll be asked:</h2>
          <ul style={styles.list}>
            <li>Organization name & mission</li>
            <li>Focus areas / communities served</li>
            <li>What support you’re looking for (data, evaluation, etc.)</li>
            <li>Primary contact email</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionHeading}>Why we ask:</h2>
          <p style={styles.detail}>
            Researchers need context. They’re basically asking,
            “Where can I plug in and actually help?”. Your answers help us
            match you with the right people, not just anyone.
          </p>
        </div>

        <Link to="/signup/nonprofit/form" style={styles.button}>
          Start Setup →
        </Link>
      </div>
    </main>
  );
}

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
    maxWidth: "520px",
    borderRadius: "1rem",
    padding: "2rem",
    boxShadow:
      "0 20px 40px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.07)",
  },
  heading: {
    fontSize: "1.3rem",
    fontWeight: 600,
    color: "#fff",
    marginBottom: "0.5rem",
  },
  subheading: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    lineHeight: 1.4,
    marginBottom: "0.75rem",
  },
  note: {
    fontSize: "0.8rem",
    color: "#cbd5e1",
    lineHeight: 1.4,
    marginBottom: "1.5rem",
    fontStyle: "italic",
  },
  section: {
    backgroundColor: "#0f172a",
    borderRadius: "0.75rem",
    border: "1px solid rgba(255,255,255,0.07)",
    padding: "1rem 1rem 0.75rem",
    marginBottom: "1rem",
  },
  sectionHeading: {
    fontSize: "0.9rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    color: "#fff",
  },
  list: {
    margin: 0,
    paddingLeft: "1.25rem",
    color: "#cbd5e1",
    fontSize: "0.8rem",
    lineHeight: 1.5,
  },
  detail: {
    fontSize: "0.8rem",
    lineHeight: 1.5,
    color: "#cbd5e1",
    margin: 0,
  },
  button: {
    display: "inline-block",
    marginTop: "1.5rem",
    background:
      "linear-gradient(to right, #4f46e5, #6366f1 30%, #8b5cf6)",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    textDecoration: "none",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow:
      "0 20px 40px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)",
  },
};