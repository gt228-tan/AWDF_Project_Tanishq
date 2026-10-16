# AWDF Project - Task Management System & In-Memory Caching

**Course**: Advanced Web Development Frameworks (ITUE301)  
**Student**: Tanishq Mehta  
**Institution**: CHARUSAT - FTE / DEPSTAR  

---

## Practical 9: In-Memory Caching and Query Optimization

### 🎯 Objective
To implement server-side in-memory caching using `node-cache`, enforce write-through invalidation for data consistency, and empirically measure the performance gains on API response latencies.

---

### 🚀 Key Features Implemented

1. **Shared Cache Architecture (`server/cache.js`)**:
   - `node-cache` instance initialized with 60s standard TTL (`stdTTL: 60`, `checkperiod: 120`).
   - Integrated telemetry tracking for cache hits, misses, hit rate, and invalidation counters.

2. **Collection-Level Caching (`GET /tasks`)**:
   - Checks in-memory cache before executing MongoDB queries.
   - Attaches `X-Cache: HIT | MISS` and `X-Response-Time` headers to responses.
   - Supports `?nocache=true` query parameter for side-by-side benchmarking.

3. **Single-Task Caching (`GET /tasks/:id`) [Supplementary 1]**:
   - Individual task caching under unique key `task_${taskId}`.

4. **Guaranteed Consistency & Invalidation on Writes**:
   - `POST /tasks`: Clears list cache.
   - `PUT /tasks/:id`: Clears list cache + specific single task key.
   - `DELETE /tasks/:id`: Clears list cache + specific single task key.

5. **Telemetry & Debug Endpoint (`GET /cache/stats`) [Supplementary 2]**:
   - Exposes real-time hit counts, miss counts, hit-rate percentage, and active key listings.

6. **Runtime Dynamic TTL Configuration (`POST /cache/config`) [Supplementary 3]**:
   - Dynamically updates cache TTL (e.g., 10s, 30s, 60s) to observe TTL trade-offs.

7. **Interactive UI Cache Monitor (`src/components/CacheMonitor.jsx`)**:
   - Built into the React application with real-time KPI tiles, live latency testing buttons, manual cache flushing, and a live benchmark history table.

---

### 📊 Benchmark Results Summary

Measured using automated benchmark script `node scripts/test_cache_practical9.js`:

| Sample | Uncached Client Latency | Uncached DB Query Time | Cached Client Latency | Cached Server Processing | Cache Status |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 31.25 ms | 27.66 ms | 4.79 ms | 2.20 ms | MISS |
| 2 | 4.66 ms | 2.51 ms | 1.72 ms | 0.12 ms | **HIT** |
| 3 | 4.25 ms | 1.92 ms | 1.43 ms | 0.01 ms | **HIT** |
| **Avg** | **13.39 ms** | **10.70 ms** | **2.65 ms** | **0.78 ms** | **80.2% Speedup** |

*Detailed report and Viva answers available in [docs/practical9_report.md](docs/practical9_report.md).*

---

### 🛠️ Getting Started

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Run Backend Server
```bash
npm run server
```

#### 3. Run Frontend
```bash
npm run dev
```

#### 4. Run Practical 9 Benchmark Suite
```bash
node scripts/test_cache_practical9.js
```
