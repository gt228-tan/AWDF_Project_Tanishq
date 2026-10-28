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

export const getTasks = (options = {}) => {
  const url = options.nocache ? `${BASE_URL}/tasks?nocache=true` : `${BASE_URL}/tasks`;
  return fetch(url, {
    headers: getAuthHeaders()
  }).then(handleResponse);
};

export const getTask = (id, options = {}) => {
  const url = options.nocache ? `${BASE_URL}/tasks/${id}?nocache=true` : `${BASE_URL}/tasks/${id}`;
  return fetch(url, {
    headers: getAuthHeaders()
  }).then(handleResponse);
};

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

// ==========================================
// CACHE TELEMETRY & DEBUG API (PRACTICAL 9)
// ==========================================

export const getCacheStats = () =>
  fetch(`${BASE_URL}/cache/stats`).then(handleResponse);

export const clearCache = () =>
  fetch(`${BASE_URL}/cache/clear`, {
    method: "POST"
  }).then(handleResponse);

export const updateCacheTTL = (ttl) =>
  fetch(`${BASE_URL}/cache/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ttl: Number(ttl) })
  }).then(handleResponse);

// ==========================================
// GITHUB API (PROFILE & REPOSITORIES)
// ==========================================

export const fetchGitHubProfile = async (username = "gt228-tan") => {
  try {
    const res = await fetch(`${BASE_URL}/github/profile?username=${encodeURIComponent(username)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // If backend proxy is not reachable, continue to direct GitHub API
  }

  const directRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
  if (!directRes.ok) {
    throw new Error(`GitHub user not found or rate limit reached (${directRes.status})`);
  }
  return await directRes.json();
};

export const fetchGitHubRepos = async (username = "gt228-tan") => {
  try {
    const res = await fetch(`${BASE_URL}/github/repos?username=${encodeURIComponent(username)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // If backend proxy is not reachable, continue to direct GitHub API
  }

  const directRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`
  );
  if (!directRes.ok) {
    throw new Error(`Unable to load GitHub repositories (${directRes.status})`);
  }
  return await directRes.json();
};

// ==========================================
// CONTACT API
// ==========================================

export const submitContact = (contactData) =>
  fetch(`${BASE_URL}/contact`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(contactData)
  }).then(handleResponse);

export const getContactMessages = () =>
  fetch(`${BASE_URL}/contact`, {
    headers: getAuthHeaders()
  }).then(handleResponse);


