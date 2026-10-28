import { useState, useEffect, useCallback } from "react";
import Spinner from "./Spinner";
import ErrorMessage from "./ErrorMessage";
import CacheMonitor from "./CacheMonitor";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  loginUser,
  registerUser,
  getMe,
  getToken,
  setToken,
  generateTaskDescription,
  logout
} from "../api";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState(null);

  // Authentication states
  const [token, setAuthToken] = useState(getToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Creation form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState(null);

  // Edit task states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchTasks = useCallback(() => {
    setLoading(true);
    setError(null);
    getTasks()
      .then((data) => setTasks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const fetchUserProfile = useCallback(() => {
    getMe()
      .then((userData) => setCurrentUser(userData))
      .catch((err) => {
        console.error("Failed to fetch profile:", err.message);
      });
  }, []);

  // Listen to auth changes (e.g. 401 automatic logout or token update)
  useEffect(() => {
    const handleAuthChange = () => {
      const currentToken = getToken();
      setAuthToken(currentToken);
      if (!currentToken) {
        setCurrentUser(null);
        setTasks([]);
      }
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  // When token exists, fetch profile and tasks
  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchTasks();
    } else {
      setCurrentUser(null);
      setTasks([]);
    }
  }, [token, fetchUserProfile, fetchTasks]);

  // Handle Login / Register submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!authEmail.trim() || !authPassword) {
      setAuthError("Email and password are required.");
      return;
    }
    if (authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (!isLoginMode && authPassword !== authConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    setAuthLoading(true);

    try {
      if (isLoginMode) {
        const res = await loginUser({ email: authEmail, password: authPassword });
        setToken(res.token);
        setAuthToken(res.token);
        setCurrentUser(res.user);
        setAuthEmail("");
        setAuthPassword("");
        setAuthConfirmPassword("");
      } else {
        await registerUser({ email: authEmail, password: authPassword });
        setAuthSuccess("Account created — please log in");
        setIsLoginMode(true);
        setAuthPassword("");
        setAuthConfirmPassword("");
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setAuthToken(null);
    setCurrentUser(null);
    setTasks([]);
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      setFormError("Please enter a task title first to generate a description.");
      return;
    }

    setFormError(null);
    setAiStatusMsg(null);
    setIsGeneratingAI(true);

    try {
      const res = await generateTaskDescription(title);
      if (res.fallback || !res.description) {
        const detail = res.error || res.message;
        setAiStatusMsg(detail ? `⚠️ AI: ${detail}` : "⚠️ AI unavailable: please enter description manually.");
      } else {
        // Fills the editable description field — the student can accept or modify it
        setDescription(res.description);
        setAiStatusMsg("✨ Description suggested! You can modify or keep it.");
      }
    } catch (err) {
      setAiStatusMsg("⚠️ Could not generate description: " + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Task title is required");
      return;
    }
    setFormError(null);
    createTask({ title, description })
      .then((newTask) => {
        setTasks((prev) => [newTask, ...prev]);
        setTitle("");
        setDescription("");
      })
      .catch((err) => setError(err.message));
  };

  const handleToggleComplete = (task) => {
    updateTask(task.id, { completed: !task.completed })
      .then((updated) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? updated : t))
        );
      })
      .catch((err) => setError(err.message));
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const handleSaveEdit = (id) => {
    if (!editTitle.trim()) return;
    updateTask(id, { title: editTitle, description: editDescription })
      .then((updated) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
        cancelEdit();
      })
      .catch((err) => setError(err.message));
  };

  const handleDelete = (id) => {
    deleteTask(id)
      .then(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      })
      .catch((err) => setError(err.message));
  };

  return (
    <section style={{ padding: "40px 24px", maxWidth: 860, margin: "0 auto", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: "var(--text-h)", margin: "0 0 6px 0", fontSize: "2rem", fontWeight: 700 }}>
            Tasks
          </h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Create, manage, and track assignments and project tasks.
          </p>
        </div>
        {token && (
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid rgba(239, 68, 68, 0.4)",
              background: "transparent",
              color: "#ef4444",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Logout ⎋
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {/* When user is NOT logged in, show Auth Card */}
      {!token ? (
        <div
          style={{
            maxWidth: 420,
            margin: "32px auto 48px",
            background: "var(--card-bg)",
            padding: "36px 32px",
            borderRadius: 8,
            border: "2px solid var(--border-strong)",
            boxShadow: "var(--shadow-sm)",
            color: "var(--text-h)",
          }}
        >
          <h3
            style={{
              margin: "0 0 20px 0",
              textAlign: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-h)",
            }}
          >
            {isLoginMode ? "Welcome Back" : "Create an Account"}
          </h3>

          <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text-h)",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 6,
                  textAlign: "left",
                }}
              >
                Email
              </label>
              <input
                type="email"
                required
                placeholder="gt@gmail.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid var(--input-border)",
                  background: "var(--input-bg)",
                  color: "var(--text-h)",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--text-h)",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 6,
                  textAlign: "left",
                }}
              >
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid var(--input-border)",
                  background: "var(--input-bg)",
                  color: "var(--text-h)",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            {!isLoginMode && (
              <div>
                <label
                  style={{
                    display: "block",
                    color: "var(--text-h)",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 6,
                    textAlign: "left",
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••"
                  value={authConfirmPassword}
                  onChange={(e) => setAuthConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: 6,
                    border: "1px solid var(--input-border)",
                    background: "var(--input-bg)",
                    color: "var(--text-h)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{
                marginTop: 8,
                padding: "12px 18px",
                borderRadius: 6,
                border: "none",
                background: "var(--btn-primary-bg)",
                color: "var(--btn-primary-text)",
                fontWeight: 700,
                fontSize: 15,
                cursor: authLoading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s ease",
              }}
            >
              {authLoading ? "Processing..." : isLoginMode ? "Log in" : "Register"}
            </button>
          </form>

          <div
            style={{
              marginTop: 18,
              textAlign: "center",
              fontSize: 14,
              color: "#6b7280",
            }}
          >
            {isLoginMode ? (
              <>
                Don't have an account?{" "}
                <span
                  onClick={() => {
                    setIsLoginMode(false);
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  style={{
                    color: "#4f46e5",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Register
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setIsLoginMode(true);
                    setAuthError(null);
                  }}
                  style={{
                    color: "#4f46e5",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Log in
                </span>
              </>
            )}
          </div>

          {authError && (
            <div
              style={{
                marginTop: 16,
                background: "#fee2e2",
                border: "1px solid #ef4444",
                color: "#b91c1c",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              {authError}
            </div>
          )}

          {authSuccess && (
            <div
              style={{
                marginTop: 18,
                background: "#16a34a",
                color: "#ffffff",
                padding: "12px 18px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontWeight: 600,
                fontSize: 14,
                boxShadow: "0 4px 14px rgba(22, 163, 74, 0.35)",
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>•</span>
              <span>{authSuccess}</span>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* User Profile Banner (GET /me demonstration) */}
          <div
            style={{
              padding: "12px 18px",
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: 8,
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ color: "#60a5fa", fontSize: 13, fontWeight: 600 }}>Authenticated Session: </span>
              <span style={{ color: "#fff", fontSize: 13 }}>{currentUser?.email || "Loading user profile..."}</span>
            </div>
            <span style={{ background: "#22c55e", color: "#000", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>
              JWT Active
            </span>
          </div>

          {/* Practical 9: In-Memory Cache Telemetry & Benchmark Widget */}
          <CacheMonitor onRefreshTasks={fetchTasks} />

          {/* Task Creation Form */}
          <form
            onSubmit={handleCreate}
            style={{
              background: "var(--social-bg, #111)",
              padding: "20px",
              borderRadius: 8,
              border: "1px solid var(--border, #333)",
              marginBottom: 32,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#fff" }}>Add New Task (Protected Endpoint)</h4>
            {formError && <p style={{ color: "#dc2626", margin: 0, fontSize: 14 }}>{formError}</p>}
            <input
              type="text"
              placeholder="Task Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: "1px solid var(--input-border)",
                background: "var(--input-bg)",
                color: "var(--text-h)",
                fontSize: 14,
                outline: "none",
              }}
            />
            <input
              type="text"
              placeholder="Description (optional - edit or accept AI suggestion)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 6,
                border: "1px solid var(--input-border)",
                background: "var(--input-bg)",
                color: "var(--text-h)",
                fontSize: 14,
                outline: "none",
              }}
            />

            {aiStatusMsg && (
              <span style={{ fontSize: 13, color: aiStatusMsg.startsWith("✨") ? "#10b981" : "#f59e0b" }}>
                {aiStatusMsg}
              </span>
            )}

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  border: "none",
                  background: "var(--btn-primary-bg)",
                  color: "var(--btn-primary-text)",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                }}
              >
                Create Task
              </button>

              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGeneratingAI || !title.trim()}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  border: "none",
                  background: "var(--btn-primary-bg)",
                  color: "var(--btn-primary-text)",
                  fontWeight: 700,
                  cursor: isGeneratingAI || !title.trim() ? "not-allowed" : "pointer",
                  opacity: isGeneratingAI || !title.trim() ? 0.6 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                {isGeneratingAI ? "Generating..." : "AI Suggest Description"}
              </button>
            </div>
          </form>

          {/* Task List */}
          {loading ? (
            <Spinner />
          ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {tasks.length === 0 ? (
                <li style={{ color: "var(--text-muted)" }}>No tasks available. Add one above!</li>
              ) : (
                tasks.map((task) => (
                  <li
                    key={task.id}
                    style={{
                      padding: "18px 22px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--card-bg)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    {editingId === task.id ? (
                      /* Inline Edit View */
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--border-strong)",
                            background: "var(--input-bg)",
                            color: "var(--text-h)",
                            fontSize: 14,
                          }}
                        />
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description"
                          style={{
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--input-border)",
                            background: "var(--input-bg)",
                            color: "var(--text-h)",
                            fontSize: 14,
                          }}
                        />
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <button
                            onClick={() => handleSaveEdit(task.id)}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 4,
                              border: "none",
                              background: "#3b82f6",
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 4,
                              border: "1px solid #555",
                              background: "#333",
                              color: "#ccc",
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Standard Display View */
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 16 }}>
                        <div>
                          <span
                            style={{
                              color: "var(--text-h)",
                              fontWeight: 700,
                              fontSize: 16,
                              textDecoration: task.completed ? "line-through" : "none",
                              opacity: task.completed ? 0.5 : 1,
                            }}
                          >
                            {task.title}
                          </span>
                          {task.description && (
                            <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-muted)" }}>
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button
                            onClick={() => startEdit(task)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 4,
                              border: "1px solid var(--border)",
                              background: "transparent",
                              color: "var(--text)",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Edit ✏️
                          </button>
                          <button
                            onClick={() => handleToggleComplete(task)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 4,
                              border: task.completed ? "1px solid #16a34a" : "1px solid var(--border-strong)",
                              background: task.completed ? "#16a34a" : "var(--pill-bg)",
                              color: task.completed ? "#ffffff" : "var(--pill-text)",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {task.completed ? "Completed ✓" : "Mark Complete"}
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 4,
                              border: "1px solid rgba(239, 68, 68, 0.4)",
                              background: "transparent",
                              color: "#ef4444",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export default Tasks;