const BASE_URL = "http://localhost:5000";

export const getTasks = () =>
  fetch(`${BASE_URL}/tasks`).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  });

export const createTask = (taskData) =>
  fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
  });

export const updateTask = (id, taskData) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  });

export const deleteTask = (id) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to delete task");
    return res.json();
  });
