import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tasks_db";
const JWT_SECRET = process.env.JWT_SECRET || "charusat_jwt_secret_key_default";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

app.use(cors());
app.use(express.json());

// Log ONLY timestamp, HTTP Method, and URL
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString().toLowerCase();
  console.log(`[${timestamp}]  ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`Connected to MongoDB at ${MONGO_URI}`))
  .catch((err) => console.error("MongoDB connection error:", err));

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

// ==========================================
// 2. MIDDLEWARES
// ==========================================

// Authentication Middleware: verifies JWT token from Authorization header
const authMiddleware = (req, res, next) => {
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

// POST /register - Register new user and hash password with bcrypt
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
// 4. PROTECTED TASK ROUTES
// ==========================================

// GET /tasks - Fetch all tasks (Protected by authMiddleware)
app.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [{ user: req.user.id }, { user: { $exists: false } }]
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
});

// POST /tasks - Create a new task (Protected + Validated)
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
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: "Failed to create task", error: err.message });
  }
});

// PUT /tasks/:id - Update task (Protected)
app.put("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task", error: err.message });
  }
});

// DELETE /tasks/:id - Delete task (Protected)
app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully", task: deletedTask });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
