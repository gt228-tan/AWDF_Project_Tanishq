import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const PORT = 5000;
const MONGO_URI = "mongodb://127.0.0.1:27017/tasks_db";

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
  .then(() => console.log("Connected to MongoDB at mongodb://127.0.0.1:27017/tasks_db"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Task Schema & Model
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false }
  },
  {
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

// GET /tasks - Fetch all tasks from MongoDB
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
});

// POST /tasks - Create a new task in MongoDB
app.post("/tasks", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }
    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : "",
      completed: false
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: "Failed to create task", error: err.message });
  }
});

// PUT /tasks/:id - Update task in MongoDB
app.put("/tasks/:id", async (req, res) => {
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

// DELETE /tasks/:id - Delete task from MongoDB
app.delete("/tasks/:id", async (req, res) => {
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
