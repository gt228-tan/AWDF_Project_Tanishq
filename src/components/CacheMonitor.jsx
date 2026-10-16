import { useState, useEffect, useCallback } from "react";
import { getCacheStats, clearCache, updateCacheTTL, getTasks } from "../api";

function CacheMonitor({ onRefreshTasks }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const [lastCacheStatus, setLastCacheStatus] = useState(null);
  const [customTtl, setCustomTtl] = useState(60);
  const [ttlMsg, setTtlMsg] = useState("");
  const [benchmarkHistory, setBenchmarkHistory] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getCacheStats();
      setStats(data);
      if (data?.cacheConfig?.stdTTL) {
        setCustomTtl(data.cacheConfig.stdTTL);
      }
    } catch (err) {
      console.error("Failed to fetch cache stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleFetchBenchmark = async (bypassCache = false) => {
    setLoading(true);
    const start = performance.now();
    try {
      const url = bypassCache
        ? "http://localhost:5000/tasks?nocache=true"
        : "http://localhost:5000/tasks";

      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      const elapsed = (performance.now() - start).toFixed(2);
      const cacheHeader = res.headers.get("X-Cache") || (bypassCache ? "BYPASS" : "MISS");
      const serverTimeHeader = res.headers.get("X-Response-Time") || "-";

      setLastRequestTime(elapsed);
      setLastCacheStatus(cacheHeader);

      setBenchmarkHistory((prev) => [
        {
          id: Date.now(),
          mode: bypassCache ? "Uncached (Bypass)" : "Cached (node-cache)",
          clientTime: `${elapsed} ms`,
          serverTime: serverTimeHeader,
          status: cacheHeader,
          count: Array.isArray(data) ? data.length : 0,
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 4)
      ]);

      if (onRefreshTasks) {
        onRefreshTasks();
      }
      fetchStats();
    } catch (err) {
      console.error("Benchmark error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlushCache = async () => {
    try {
      await clearCache();
      setLastCacheStatus("FLUSHED");
      setLastRequestTime(null);
      await fetchStats();
      if (onRefreshTasks) onRefreshTasks();
    } catch (err) {
      console.error("Failed to clear cache:", err);
    }
  };

  const handleUpdateTTL = async (e) => {
    e.preventDefault();
    try {
      const res = await updateCacheTTL(Number(customTtl));
      setTtlMsg(`TTL set to ${customTtl}s`);
      setTimeout(() => setTtlMsg(""), 3000);
      fetchStats();
    } catch (err) {
      setTtlMsg("Failed to update TTL");
    }
  };

  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 28,
        color: "#f8fafc",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#38bdf8" }}>
              Live Cache Monitor            </h4>
            <span
              style={{
                fontSize: 10,
                background: "#0284c7",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: 10,
                fontWeight: 600
              }}
            >
              TTL: {stats?.cacheConfig?.stdTTL || customTtl}s
            </span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
            Real-time server-side cache stats, TTL configuration, and live API response latency benchmarks.
          </p>
        </div>

        <button
          onClick={fetchStats}
          style={{
            padding: "4px 10px",
            background: "rgba(51, 65, 85, 0.8)",
            border: "1px solid #475569",
            borderRadius: 6,
            color: "#cbd5e1",
            cursor: "pointer",
            fontSize: 12
          }}
          title="Refresh Telemetry"
        >
          🔄 Refresh
        </button>
      </div>

      {/* KPI Tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 12,
          marginBottom: 18
        }}
      >
        <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(56, 189, 248, 0.2)" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Cache Hits</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#4ade80" }}>{stats?.stats?.hits ?? 0}</div>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(244, 63, 94, 0.2)" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Cache Misses</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fb7185" }}>{stats?.stats?.misses ?? 0}</div>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(168, 85, 247, 0.2)" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Hit Rate</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#c084fc" }}>{stats?.stats?.hitRate ?? "0%"}</div>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(251, 146, 60, 0.2)" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Invalidations</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fb923c" }}>{stats?.stats?.invalidations ?? 0}</div>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(148, 163, 184, 0.2)" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Active Keys</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#38bdf8" }}>{stats?.keysCount ?? 0}</div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          background: "rgba(15, 23, 42, 0.5)",
          borderRadius: 8,
          border: "1px solid #334155"
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => handleFetchBenchmark(false)}
            disabled={loading}
            style={{
              padding: "7px 14px",
              background: "#0284c7",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(2, 132, 199, 0.4)"
            }}
          >
            {loading ? "Testing..." : "🚀 Test Cached GET /tasks"}
          </button>

          <button
            onClick={() => handleFetchBenchmark(true)}
            disabled={loading}
            style={{
              padding: "7px 14px",
              background: "#475569",
              color: "#e2e8f0",
              border: "1px solid #64748b",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            🐢 Test Uncached (Bypass)
          </button>

          <button
            onClick={handleFlushCache}
            style={{
              padding: "7px 12px",
              background: "transparent",
              border: "1px solid #ef4444",
              color: "#f87171",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            🗑️ Flush Cache
          </button>
        </div>

        {/* Dynamic TTL Config */}
        <form onSubmit={handleUpdateTTL} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>TTL (s):</span>
          <input
            type="number"
            min="5"
            max="600"
            value={customTtl}
            onChange={(e) => setCustomTtl(e.target.value)}
            style={{
              width: 55,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #475569",
              background: "#0f172a",
              color: "#fff",
              fontSize: 12
            }}
          />
          <button
            type="submit"
            style={{
              padding: "4px 10px",
              background: "#334155",
              color: "#38bdf8",
              border: "1px solid #475569",
              borderRadius: 4,
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            Set
          </button>
          {ttlMsg && <span style={{ fontSize: 11, color: "#4ade80" }}>{ttlMsg}</span>}
        </form>
      </div>

      {/* Benchmark Response Display */}
      {lastRequestTime && (
        <div
          style={{
            marginTop: 14,
            padding: "8px 14px",
            background: lastCacheStatus === "HIT" ? "rgba(34, 197, 94, 0.15)" : "rgba(59, 130, 246, 0.15)",
            border: `1px solid ${lastCacheStatus === "HIT" ? "rgba(34, 197, 94, 0.4)" : "rgba(59, 130, 246, 0.4)"}`,
            borderRadius: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13
          }}
        >
          <div>
            <span style={{ fontWeight: 600, color: lastCacheStatus === "HIT" ? "#4ade80" : "#60a5fa" }}>
              [{lastCacheStatus}]
            </span>{" "}
            Round-trip response latency: <strong>{lastRequestTime} ms</strong>
          </div>
          <span style={{ fontSize: 11, color: "#cbd5e1" }}>
            {lastCacheStatus === "HIT" ? "⚡ Served from Node memory" : "🍃 Query executed on MongoDB"}
          </span>
        </div>
      )}

      {/* Live Benchmark History Table */}
      {benchmarkHistory.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
            Recent Benchmark Readings:
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                  <th style={{ padding: "6px 8px" }}>Time</th>
                  <th style={{ padding: "6px 8px" }}>Mode</th>
                  <th style={{ padding: "6px 8px" }}>Client Latency</th>
                  <th style={{ padding: "6px 8px" }}>Server Processing</th>
                  <th style={{ padding: "6px 8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkHistory.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid rgba(51, 65, 85, 0.4)" }}>
                    <td style={{ padding: "6px 8px", color: "#94a3b8" }}>{row.timestamp}</td>
                    <td style={{ padding: "6px 8px", color: "#e2e8f0" }}>{row.mode}</td>
                    <td style={{ padding: "6px 8px", fontWeight: 600, color: "#38bdf8" }}>{row.clientTime}</td>
                    <td style={{ padding: "6px 8px", color: "#cbd5e1" }}>{row.serverTime}</td>
                    <td style={{ padding: "6px 8px" }}>
                      <span
                        style={{
                          background: row.status === "HIT" ? "#166534" : "#1e293b",
                          color: row.status === "HIT" ? "#4ade80" : "#94a3b8",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CacheMonitor;
