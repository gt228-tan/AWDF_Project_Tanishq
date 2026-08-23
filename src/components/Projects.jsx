import { useState, useEffect } from "react";
import Spinner from "./Spinner";
import ErrorMessage from "./ErrorMessage";
import { getTasks, createTask, updateTask, deleteTask } from "../api";

function Projects() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Creation form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState(null);

  // Edit task states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    setLoading(true);
    setError(null);
    getTasks()
      .then((data) => setTasks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
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
        setTasks((prev) => [...prev, newTask]);
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

  if (loading) return <Spinner />;

  return (
    <section style={{ padding: "32px 24px", maxWidth: 800, margin: "0 auto", textAlign: "left" }}>
      <h3 style={{ color: "#f6ff00", marginBottom: 24 }}>Tasks & Projects</h3>

      {error && <ErrorMessage message={error} />}

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
        <h4 style={{ margin: "0 0 8px 0", color: "#fff" }}>Add New Task</h4>
        {formError && <p style={{ color: "#dc2626", margin: 0, fontSize: 14 }}>{formError}</p>}
        <input
          type="text"
          placeholder="Task Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            border: "1px solid var(--border, #444)",
            background: "#1e1e1e",
            color: "#fff",
            fontSize: 14,
          }}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            border: "1px solid var(--border, #444)",
            background: "#1e1e1e",
            color: "#fff",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "none",
            background: "#f6ff00",
            color: "#000",
            fontWeight: 600,
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          Create Task
        </button>
      </form>

      {/* Task List */}
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {tasks.length === 0 ? (
          <li style={{ color: "var(--text, #888)" }}>No tasks available. Add one above!</li>
        ) : (
          tasks.map((task) => (
            <li
              key={task.id}
              style={{
                padding: "16px 20px",
                borderRadius: 8,
                border: "1px solid var(--border, #333)",
                background: "var(--social-bg, #111)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
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
                      border: "1px solid #3b82f6",
                      background: "#1e1e1e",
                      color: "#fff",
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
                      border: "1px solid #444",
                      background: "#1e1e1e",
                      color: "#fff",
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
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 16,
                        textDecoration: task.completed ? "line-through" : "none",
                        opacity: task.completed ? 0.6 : 1,
                      }}
                    >
                      {task.title}
                    </span>
                    {task.description && (
                      <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text, #aaa)" }}>
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
                        border: "1px solid #3b82f6",
                        background: "rgba(59, 130, 246, 0.1)",
                        color: "#60a5fa",
                        fontSize: 12,
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
                        border: "1px solid #444",
                        background: task.completed ? "#22c55e" : "#333",
                        color: "#fff",
                        fontSize: 12,
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
                        border: "1px solid #dc2626",
                        background: "#dc2626",
                        color: "#fff",
                        fontSize: 12,
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
    </section>
  );
}

export default Projects;