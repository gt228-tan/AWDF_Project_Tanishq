const BASE_URL = "http://localhost:5000";

export const getToken = () => localStorage.getItem("token");

export const setToken = (token) => {
  localStorage.setItem("token", token);
  window.dispatchEvent(new Event("auth-changed"));
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-changed"));
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    logout();
    throw new Error("Session expired or unauthorized. Please log in again.");
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    const errorMsg = data?.message || "Request failed with status " + res.status;
    throw new Error(errorMsg);
  }

  return data;
};

// ==========================================
// AUTH API
// ==========================================

export const registerUser = (userData) =>
  fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  }).then(handleResponse);

export const loginUser = (credentials) =>
  fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  }).then(handleResponse);

export const getMe = () =>
  fetch(`${BASE_URL}/me`, {
    headers: getAuthHeaders()
  }).then(handleResponse);

// ==========================================
// TASKS API (PROTECTED)
// ==========================================

export const getTasks = () =>
  fetch(`${BASE_URL}/tasks`, {
    headers: getAuthHeaders()
  }).then(handleResponse);

export const createTask = (taskData) =>
  fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData)
  }).then(handleResponse);

export const updateTask = (id, taskData) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData)
  }).then(handleResponse);

export const deleteTask = (id) =>
  fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  }).then(handleResponse);
