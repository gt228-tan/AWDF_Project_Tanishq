import { useState, useEffect } from "react";
import { submitContact } from "../api";
import ErrorMessage from "./ErrorMessage";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);
  const [dbConfirmation, setDbConfirmation] = useState(null);

  // Auto-fill email if user is logged in
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.email) setEmail(parsed.email);
        if (parsed?.email) setName(parsed.email.split("@")[0]);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setDbConfirmation(null);

    if (!message.trim()) {
      setError("Validation Error: Please enter your message before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitContact({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        message: message.trim()
      });

      setSuccessMsg(res.message || "Entry successfully saved to database!");
      setDbConfirmation(res.contact);
      setMessage(""); // Clear message field
    } catch (err) {
      setError(err.message || "Failed to submit message to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px", textAlign: "left" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ margin: "0 0 12px 0", fontSize: 42, color: "var(--text-h)" }}>Contact</h1>
        <p style={{ color: "var(--text)", fontSize: 16 }}>
          Send a message to save an entry directly into the MongoDB database.
        </p>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div
          style={{
            padding: "16px 20px",
            marginBottom: 24,
            borderRadius: 10,
            background: "rgba(34, 197, 94, 0.12)",
            border: "1px solid rgba(34, 197, 94, 0.4)",
            color: "#16a34a",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 16 }}>
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
          {dbConfirmation && (
            <div style={{ fontSize: 13, color: "var(--text)", paddingLeft: 24 }}>
              <strong>MongoDB Document ID:</strong>{" "}
              <code style={{ background: "rgba(0,0,0,0.06)", padding: "2px 6px", borderRadius: 4 }}>
                {dbConfirmation.id || dbConfirmation._id}
              </code>
              <br />
              <strong>Timestamp:</strong> {new Date(dbConfirmation.createdAt || Date.now()).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Error Notification */}
      {error && <ErrorMessage message={error} />}

      {/* Contact Form Card */}
      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "32px",
          boxShadow: "var(--shadow)",
          marginBottom: 40,
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-h)",
                  marginBottom: 8,
                }}
              >
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Tanishq Mehta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--code-bg)",
                  color: "var(--text-h)",
                  fontSize: 15,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-h)",
                  marginBottom: 8,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--code-bg)",
                  color: "var(--text-h)",
                  fontSize: 15,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-h)",
                marginBottom: 8,
              }}
            >
              Message <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--code-bg)",
                color: "var(--text-h)",
                fontSize: 15,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* Live Message Display (Maintains original feature) */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 6,
              background: "var(--social-bg)",
              border: "1px dashed var(--border)",
              fontSize: 14,
              color: "var(--text)",
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Your Message:</strong> {message ? message : <span style={{ opacity: 0.6 }}>(empty)</span>}
            </p>
          </div>

          {/* Help Toggle & Help text (Maintains original feature) */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "6px 14px",
                color: "var(--text)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                transition: "all 0.2s ease",
              }}
            >
              {showHelp ? "Hide Help" : "Show Help"}
            </button>

            {showHelp && (
              <p style={{ color: "blue", margin: 0, fontSize: 14, fontWeight: 500 }}>
                Enter your message and click submit.
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              style={{
                flex: 1,
                padding: "14px 24px",
                borderRadius: 8,
                border: "none",
                background: isSubmitting || !message.trim() ? "var(--border)" : "var(--accent)",
                color: isSubmitting || !message.trim() ? "var(--text)" : "#ffffff",
                fontSize: 16,
                fontWeight: 600,
                cursor: isSubmitting || !message.trim() ? "not-allowed" : "pointer",
                transition: "background 0.2s ease, transform 0.1s ease",
                boxShadow: isSubmitting || !message.trim() ? "none" : "0 4px 12px rgba(170, 59, 255, 0.3)",
              }}
            >
              {isSubmitting ? "Saving to Database..." : "Submit Message ✉️"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Contact;