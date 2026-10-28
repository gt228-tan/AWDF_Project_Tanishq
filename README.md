# Student Portfolio & Task Management System with AI and In-Memory Caching

**Course**: Advanced Web Development Frameworks (ITUE301)  
**Student**: Tanishq Mehta  
  

---

## 📌 Project Overview

This full-stack application is a modern MERN-stack portfolio and task management system engineered for performance, security, and developer productivity. It integrates **Google Gemini Generative AI** for automated task assistance, an **in-memory caching layer (`node-cache`)** with empirical performance benchmarking, **JWT-based authentication**, **MongoDB database persistence**, and **Docker containerization with GitHub Actions CI/CD**.

```
                           ┌──────────────────────────────┐
                           │      React 19 + Vite UI      │
                           │  (Port 5173 / Client-side)   │
                           └──────────────┬───────────────┘
                                          │ HTTP / REST API
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Express Backend (Port 5000)                              │
│                                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────┐  ┌───────────────────────────┐  │
│  │ JWT Authentication &  │  │ In-Memory Cache Engine  │  │ Gemini Generative AI SDK  │  │
│  │ Password Hashing      │  │ (node-cache / Telemetry)│  │ (Multi-Model Cascade)     │  │
│  └──────────┬────────────┘  └───────────┬────────────┘  └─────────────┬─────────────┘  │
└─────────────┼───────────────────────────┼─────────────────────────────┼────────────────┘
              │                           │                             │
              ▼                           ▼                             ▼
       ┌──────────────┐          ┌─────────────────┐           ┌──────────────────┐
       │   MongoDB    │          │  Cache HIT/MISS │           │ Google Gemini AI │
       │ (Port 27017) │          │  Invalidation   │           │   (Cloud API)    │
       └──────────────┘          └─────────────────┘           └──────────────────┘
```

---

## ✨ Features Breakdown

### 1. 🤖 AI-Powered Task Description Assistant (Google Gemini AI)
- **Automated Suggestions**: Generates concise, context-aware 1-2 sentence task descriptions from a title.
- **Multi-Model Cascade Fallback**: Intelligently tries candidate Gemini models in sequence until generation succeeds:
  1. `gemini-3.5-flash-lite`
  2. `gemini-3.5-flash`
  3. `gemini-3.8-flash`
  4. `gemini-3.7-flash`
  5. `gemini-2.5-flash`
  6. `gemini-1.5-flash`
- **Server-Side Key Protection**: `GEMINI_API_KEY` is strictly confined to backend `.env` variables and never exposed to the client bundle.
- **Graceful Fallback & Error Resilience**: On network failure, quota limits, or invalid keys, the API returns a status 200 with `{ fallback: true }` and informative error details so the app remains fully functional.
- **Interactive UI**: Integrated alongside the "Create Task" button, allowing students to inspect, edit, or accept AI suggestions before saving.

---

### 2. ⚡ Practical 9: In-Memory Caching & Telemetry Engine
- **Shared Cache Architecture (`server/cache.js`)**: Backed by `node-cache` with configurable standard TTL (default 60s) and automatic purge intervals.
- **Collection-Level Caching (`GET /tasks`)**:
  - Serves cached responses instantly on cache hits.
  - Adds diagnostic response headers: `X-Cache: HIT | MISS | BYPASS` and `X-Response-Time: <duration>ms`.
  - Supports side-by-side benchmarking via `?nocache=true`.
- **Single-Task Caching (`GET /tasks/:id`)**: Independent cache keys (`task_${id}`) for granular item caching.
- **Write-Through Consistency**:
  - `POST /tasks` -> Invalidates list cache.
  - `PUT /tasks/:id` -> Invalidates list cache and single-task entry.
  - `DELETE /tasks/:id` -> Invalidates list cache and single-task entry.
- **Telemetry & Live Monitor (`src/components/CacheMonitor.jsx`)**:
  - Real-time KPI tiles tracking Total Requests, Cache Hits, Cache Misses, Hit Rate %, and Key Count.
  - Interactive benchmark tool comparing cached vs. uncached latency.
  - Dynamic TTL reconfiguration (`POST /cache/config`) and one-click cache flushing (`POST /cache/clear`).

#### Benchmark Performance Gains:
| Metric | Uncached DB Query | In-Memory Cached | Improvement |
| :--- | :---: | :---: | :---: |
| **Response Latency** | ~13.39 ms | ~2.65 ms | **~80.2% Faster** |
| **Server CPU Load** | High (MongoDB read) | Minimal (RAM lookup) | **Significantly Reduced** |

---

### 3. 🔐 User Authentication & Authorization (JWT)
- **Secure Registration (`POST /register`)**: Validates email format, enforces password minimum length, and salts/hashes passwords using **bcryptjs** (10 salt rounds).
- **Stateless Authentication (`POST /login`)**: Generates cryptographically signed **JSON Web Tokens (JWT)** with configurable expiry (`JWT_EXPIRES_IN`).
- **Profile Endpoint (`GET /me`)**: Returns authenticated user profile using decoded token identity.
- **Frontend Session Management**: LocalStorage token persistence with reactive `auth-changed` event listeners and automatic 401 expiration handling.

---

### 4. 📝 Task Management (Full CRUD)
- **User-Scoped Tasks**: Each task is associated with an authenticated MongoDB user ID.
- **Creation & Validation**: Rejects empty or whitespace-only task titles.
- **Status Toggles**: Quick completion checkbox toggling.
- **Inline Editing**: Live update task title and description with cancel/save options.
- **Deletion**: Clean removal with instant UI state updates and cache invalidation.

---

### 5. 🌐 GitHub Portfolio & Contact Form Integration
- **GitHub API Caching Proxy**:
  - `GET /github/profile` and `GET /github/repos` with 5-minute cache TTL to prevent GitHub rate limiting.
  - Automatic fallback to direct client-side GitHub requests if backend is unreachable.
- **Contact Message Database (`POST /contact`)**:
  - Validates contact details and persists inquiries to MongoDB.
  - Optional user-binding linking messages to logged-in student accounts.

---

### 6. 🐳 DevOps, Docker Containerization & CI/CD
- **Docker Compose (`docker-compose.yml`)**: Multi-container stack orchestrating:
  - `mongodb`: Official Mongo image with persistent volume `mongo_data`.
  - `backend`: Node.js Express server with health checks.
  - `frontend`: Optimized client container.
- **Automated Testing**: Jest and Supertest unit/integration test suite (`tests/tasks.test.js`).
- **High-Speed Linting**: Oxlint configured via `.oxlintrc.json`.
- **GitHub Actions CI (`.github/workflows/ci.yml`)**: Automated pipeline running `npm test` on every push to `main`.

---

## 🔌 API Reference

| Endpoint | Method | Auth | Description |
| :--- | :---: | :---: | :--- |
| `/register` | `POST` | Public | Register new user with hashed password |
| `/login` | `POST` | Public | Authenticate user and return signed JWT |
| `/me` | `GET` | Bearer | Fetch profile of currently authenticated user |
| `/tasks` | `GET` | Bearer | Fetch user tasks (Supports `?nocache=true`) |
| `/tasks/:id` | `GET` | Bearer | Fetch single task by ID |
| `/tasks` | `POST` | Bearer | Create a new task (invalidates cache) |
| `/tasks/:id` | `PUT` | Bearer | Update existing task (invalidates cache) |
| `/tasks/:id` | `DELETE` | Bearer | Delete task (invalidates cache) |
| `/api/ai/generate-description` | `POST` | Public | Generate description using Gemini AI multi-model cascade |
| `/cache/stats` | `GET` | Public | Retrieve real-time cache telemetry metrics |
| `/cache/clear` | `POST` | Public | Flush all in-memory keys |
| `/cache/config` | `POST` | Public | Dynamically update standard TTL duration |
| `/github/profile` | `GET` | Public | Cached GitHub profile information |
| `/github/repos` | `GET` | Public | Cached repository listings |
| `/contact` | `POST` | Optional | Submit contact message to database |
| `/contact` | `GET` | Public | Retrieve submitted contact messages |

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root directory:

```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/tasks_db

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1h

# Google Gemini AI
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
# Optional override (defaults to multi-model cascade)
GEMINI_MODEL=gemini-1.5-flash
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or via Docker
- Google Gemini API key ([Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Installation
```bash
npm install
```

### 2. Start the Backend Server
```bash
npm run server
```
Server starts on `http://localhost:5000`.

### 3. Start the Frontend (Vite)
```bash
npm run dev
```
Client application will open at `http://localhost:5173`.

---

## 🧪 Testing & Quality Assurance

### Run Unit & Integration Tests (Jest + Supertest)
```bash
npm test
```

### Run Linter (Oxlint)
```bash
npm run lint
```

### Run Docker Compose Stack
```bash
docker compose up --build
```
This spins up MongoDB, the Express backend, and the Vite frontend simultaneously.
