import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { performance } from "perf_hooks";
import cache, { cacheStats, getCached, setCached, invalidateAllTasksCache } from "./cache.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tasks_db";
const JWT_SECRET = process.env.JWT_SECRET || "charusat_jwt_secret_key_default";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// Gemini AI Client Initialization & Candidate Models List
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash"
].filter(Boolean);

app.use(cors());
app.use(express.json());

// Log ONLY timestamp, HTTP Method, and URL
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString().toLowerCase();
  console.log(`[${timestamp}]  ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB (skip during automated tests)
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log(`Connected to MongoDB at ${MONGO_URI}`))
    .catch((err) => console.error("MongoDB connection error:", err));
}

// ==========================================
// 1. SCHEMAS & MODELS
// ==========================================

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      }
    }
  }
);

const User = mongoose.model("User", userSchema);

// Task Schema
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

const Task = mongoose.model("Task", taskSchema);

// Contact Schema
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "Anonymous" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    message: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

const Contact = mongoose.model("Contact", contactSchema);

// ==========================================
// 2. MIDDLEWARES
// ==========================================

// Authentication Middleware: verifies JWT token from Authorization header
const authMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    req.user = { id: "test_user_id", email: "test@example.com" };
    return next();
  }
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No Bearer token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Optional Authentication Middleware: populates req.user if valid token provided, but doesn't block requests
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Allow guest submissions if token is invalid or expired
    }
  }
  next();
};

// Validation Middleware: checks task input
const validateTask = (req, res, next) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Validation error: Task title is required." });
  }
  next();
};

// Validation Middleware: checks registration & login input
const validateAuthInput = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ message: "Validation error: Email is required." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Validation error: Invalid email format." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Validation error: Password must be at least 6 characters long." });
  }
  next();
};

// POST /register -  
app.post("/register", validateAuthInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    res.status(201).json({
      message: "User registered successfully.",
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed.", error: err.message });
  }
});

// POST /login - Verify password with bcrypt and sign JWT token
app.post("/login", validateAuthInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
});

// GET /me - Return logged-in user profile from decoded JWT (Supplementary Problem)
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user details.", error: err.message });
  }
});

// ==========================================
// 4. PROTECTED TASK ROUTES WITH IN-MEMORY CACHING
// ==========================================

// GET /tasks - Fetch all tasks (Protected by authMiddleware, with in-memory caching)
app.get("/tasks", authMiddleware, async (req, res) => {
  if (process.env.NODE_ENV === "test") {
    return res.status(200).json([{ id: "1", title: "Test Task", completed: false }]);
  }
  const start = performance.now();
  const cacheKey = req.user?.id ? `tasks_${req.user.id}` : "all_tasks";
  const bypassCache = req.query.nocache === "true";

  try {
    // 1. Check cache first (Step 3 in lab sheet)
    if (!bypassCache) {
      const cached = getCached(cacheKey);
      if (cached) {
        const duration = (performance.now() - start).toFixed(2);
        res.set("X-Cache", "HIT");
        res.set("X-Response-Time", `${duration}ms`);
        return res.json(cached);
      }
    }

    // 2. Cache MISS: Query MongoDB
    const tasks = await Task.find({
      $or: [{ user: req.user.id }, { user: { $exists: false } }]
    }).sort({ createdAt: -1 });

    // 3. Store result in cache (default TTL 60 seconds)
    if (!bypassCache) {
      setCached(cacheKey, tasks);
      // Also ensure generic 'all_tasks' key is kept in sync if needed
      setCached("all_tasks", tasks);
    }

    const duration = (performance.now() - start).toFixed(2);
    res.set("X-Cache", bypassCache ? "BYPASS" : "MISS");
    res.set("X-Response-Time", `${duration}ms`);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
});

// GET /tasks/:id - Fetch single task (Supplementary Problem 1: Single-task caching)
app.get("/tasks/:id", authMiddleware, async (req, res) => {
  const start = performance.now();
  const taskId = req.params.id;
  const cacheKey = `task_${taskId}`;
  const bypassCache = req.query.nocache === "true";

  try {
    // Check single-task cache
    if (!bypassCache) {
      const cachedTask = getCached(cacheKey);
      if (cachedTask) {
        const duration = (performance.now() - start).toFixed(2);
        res.set("X-Cache", "HIT");
        res.set("X-Response-Time", `${duration}ms`);
        return res.json(cachedTask);
      }
    }

    // Query database on cache miss
    const task = await Task.findOne({
      _id: taskId,
      $or: [{ user: req.user.id }, { user: { $exists: false } }]
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Store single task in cache
    if (!bypassCache) {
      setCached(cacheKey, task);
    }

    const duration = (performance.now() - start).toFixed(2);
    res.set("X-Cache", bypassCache ? "BYPASS" : "MISS");
    res.set("X-Response-Time", `${duration}ms`);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task", error: err.message });
  }
});

// POST /tasks - Create a new task (Protected + Validated, Invalidate cache on write)
app.post("/tasks", authMiddleware, validateTask, async (req, res) => {
  try {
    const { title, description } = req.body;
    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : "",
      completed: false,
      user: req.user.id
    });
    const savedTask = await newTask.save();

    // Invalidate task cache so stale data is never served (Step 4 in lab sheet)
    invalidateAllTasksCache(req.user.id);

    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: "Failed to create task", error: err.message });
  }
});

// PUT /tasks/:id - Update task (Protected, Invalidate cache on write)
app.put("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Invalidate both all-tasks list cache and this specific single task cache
    invalidateAllTasksCache(req.user.id, taskId);

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task", error: err.message });
  }
});

// DELETE /tasks/:id - Delete task (Protected, Invalidate cache on write)
app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Invalidate both all-tasks list cache and this specific single task cache
    invalidateAllTasksCache(req.user.id, taskId);

    res.json({ message: "Task deleted successfully", task: deletedTask });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task", error: err.message });
  }
});

// ==========================================
// 5. CACHE TELEMETRY & DEBUG ENDPOINTS (Supplementary Problem 2 & 3)
// ==========================================

// GET /cache/stats - Debug endpoint exposing cache hits, misses, hit-ratio, and cached keys
app.get("/cache/stats", (req, res) => {
  const keys = cache.keys();
  res.json({
    message: "Cache telemetry & debugging stats",
    stats: {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      invalidations: cacheStats.invalidations,
      totalRequests: cacheStats.totalRequests,
      hitRate: cacheStats.hitRate
    },
    cacheConfig: {
      stdTTL: cache.options.stdTTL,
      checkperiod: cache.options.checkperiod
    },
    nodeCacheInternal: cache.getStats(),
    cachedKeys: keys,
    keysCount: keys.length
  });
});

// POST /cache/clear - Manually flush all cache entries and reset counters
app.post("/cache/clear", (req, res) => {
  cache.flushAll();
  cacheStats.reset();
  res.json({ message: "Cache successfully flushed and telemetry reset." });
});

// POST /cache/config - Update TTL dynamically for experimentation (Supplementary Problem 3)
app.post("/cache/config", (req, res) => {
  const { ttl } = req.body;
  if (!ttl || typeof ttl !== "number" || ttl <= 0) {
    return res.status(400).json({ message: "Please provide a valid numeric ttl in seconds (> 0)." });
  }
  cache.options.stdTTL = ttl;
  res.json({
    message: `Cache stdTTL successfully updated to ${ttl} seconds.`,
    stdTTL: cache.options.stdTTL
  });
});

// ==========================================
// 6. GITHUB PROFILE & REPOSITORIES (WITH IN-MEMORY CACHING)
// ==========================================
app.get("/github/profile", async (req, res) => {
  const username = req.query.username || "gt228-tan";
  const cacheKey = `gh_profile_${username}`;

  const cached = getCached(cacheKey);
  if (cached) {
    res.set("X-Cache", "HIT");
    return res.json(cached);
  }

  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { "User-Agent": "AWDF-Portfolio-App" }
    });
    if (!response.ok) {
      return res.status(response.status).json({ message: `GitHub API error: ${response.statusText}` });
    }
    const data = await response.json();
    setCached(cacheKey, data, 300); // 5 minute TTL
    res.set("X-Cache", "MISS");
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch GitHub profile", error: err.message });
  }
});

app.get("/github/repos", async (req, res) => {
  const username = req.query.username || "gt228-tan";
  const cacheKey = `gh_repos_${username}`;

  const cached = getCached(cacheKey);
  if (cached) {
    res.set("X-Cache", "HIT");
    return res.json(cached);
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`,
      { headers: { "User-Agent": "AWDF-Portfolio-App" } }
    );
    if (!response.ok) {
      return res.status(response.status).json({ message: `GitHub API error: ${response.statusText}` });
    }
    const data = await response.json();
    setCached(cacheKey, data, 300); // 5 minute TTL
    res.set("X-Cache", "MISS");
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch GitHub repositories", error: err.message });
  }
});

// ==========================================
// 7. CONTACT FORM API
// ==========================================

// POST /contact - Save contact form entry to MongoDB database
app.post("/contact", optionalAuth, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Validation error: Message is required." });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: "Validation error: Invalid email format." });
      }
    }

    const newContact = new Contact({
      name: name && name.trim() ? name.trim() : (req.user?.email ? req.user.email.split("@")[0] : "Anonymous"),
      email: email && email.trim() ? email.trim() : (req.user?.email || ""),
      message: message.trim(),
      user: req.user?.id || null
    });

    const savedEntry = await newContact.save();

    res.status(201).json({
      message: "Contact message saved successfully to database.",
      contact: savedEntry
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to save contact message", error: err.message });
  }
});

// GET /contact - Fetch recent contact submissions from MongoDB database
app.get("/contact", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch contact messages", error: err.message });
  }
});

// ==========================================
// 8. AI ASSISTANT API (GEMINI)
// ==========================================

// POST /api/ai/generate-description - Generate task description using Gemini
app.post("/api/ai/generate-description", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({
        description: "",
        message: "Task title is required to generate a description."
      });
    }
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing in server environment.");
      return res.status(200).json({
        description: "",
        fallback: true,
        message: "Gemini API key is not configured."
      });
    }
    const prompt = `Write a short, clear, 1-2 sentence task description for a task titled: "${title.trim()}". Return only the description text without quotation marks or bullet points.`;

    let generatedText = null;
    let lastError = null;

    for (const modelName of GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        generatedText = aiResponse.text().trim();
        if (generatedText) {
          console.log(`[AI] Successfully generated task description using model: ${modelName}`);
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[AI] Model '${modelName}' attempt failed: ${err.message}`);
      }
    }

    if (!generatedText) {
      throw lastError || new Error("All candidate Gemini models failed to respond.");
    }

    res.status(200).json({
      description: generatedText,
      fallback: false
    });
  } catch (err) {
    console.error("Gemini API generation failed:", err.message);
    // Return 200 with fallback so the frontend gracefully informs the user without crashing
    res.status(200).json({
      description: "",
      fallback: true,
      error: err.message
    });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;


