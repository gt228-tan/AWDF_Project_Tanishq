import { useState, useEffect, useMemo, useCallback } from "react";
import Spinner from "./Spinner";
import ErrorMessage from "./ErrorMessage";
import { fetchGitHubProfile, fetchGitHubRepos } from "../api";

// Language color mapping for GitHub languages
const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  PHP: "#4F5D95",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Shell: "#89e051",
  Vue: "#41b883",
  React: "#61dafb",
};

function Projects() {
  const [username, setUsername] = useState("gt228-tan");
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("ALL");
  const [sortBy, setSortBy] = useState("updated"); // 'updated', 'stars', 'forks', 'name'
  const [includeForks, setIncludeForks] = useState(true);
  const [customUserModal, setCustomUserModal] = useState(false);
  const [customUserInput, setCustomUserInput] = useState("");

  const loadGitHubData = useCallback(async (userToFetch) => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, reposData] = await Promise.all([
        fetchGitHubProfile(userToFetch),
        fetchGitHubRepos(userToFetch),
      ]);
      setProfile(profileData);
      setRepos(Array.isArray(reposData) ? reposData : []);
    } catch (err) {
      setError(err.message || "Failed to load GitHub projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGitHubData(username);
  }, [username, loadGitHubData]);

  // Extract unique languages for filter buttons
  const availableLanguages = useMemo(() => {
    const langs = new Set();
    repos.forEach((repo) => {
      if (repo.language) {
        langs.add(repo.language);
      }
    });
    return ["ALL", ...Array.from(langs).sort()];
  }, [repos]);

  // Aggregated stats
  const totalStars = useMemo(() => {
    return repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
  }, [repos]);

  const totalForks = useMemo(() => {
    return repos.reduce((acc, repo) => acc + (repo.forks_count || 0), 0);
  }, [repos]);

  // Filter and sort repositories
  const filteredRepos = useMemo(() => {
    return repos
      .filter((repo) => {
        if (!includeForks && repo.fork) return false;
        if (selectedLanguage !== "ALL" && repo.language !== selectedLanguage) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = repo.name?.toLowerCase().includes(q);
          const matchDesc = repo.description?.toLowerCase().includes(q);
          const matchLang = repo.language?.toLowerCase().includes(q);
          return matchName || matchDesc || matchLang;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "stars") {
          return (b.stargazers_count || 0) - (a.stargazers_count || 0);
        }
        if (sortBy === "forks") {
          return (b.forks_count || 0) - (a.forks_count || 0);
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        // default: updated
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
  }, [repos, searchQuery, selectedLanguage, sortBy, includeForks]);

  const handleCustomUserSubmit = (e) => {
    e.preventDefault();
    const clean = customUserInput.trim();
    if (clean && clean !== username) {
      setUsername(clean);
      setCustomUserModal(false);
      setCustomUserInput("");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div style={{ width: "100%", maxWidth: 1120, margin: "0 auto", padding: "28px 20px" }}>
      {/* Page Title & Controls Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ textAlign: "left" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "2.2rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text-h, #ffffff)",
            }}
          >
            GitHub Projects
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--text, #9ca3af)", fontSize: "0.95rem" }}>
            Live repositories and open-source contributions fetched dynamically from GitHub.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => loadGitHubData(username)}
            disabled={loading}
            title="Refresh Repositories"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border, #333)",
              color: "var(--text-h, #fff)",
              padding: "8px 14px",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.85rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>

          <button
            onClick={() => setCustomUserModal(!customUserModal)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--accent-bg, rgba(170, 59, 255, 0.15))",
              border: "1px solid var(--accent-border, rgba(170, 59, 255, 0.4))",
              color: "var(--accent, #c084fc)",
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Change User
          </button>
        </div>
      </div>

      {/* Change User Prompt Modal / Inline Box */}
      {customUserModal && (
        <form
          onSubmit={handleCustomUserSubmit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(22, 23, 29, 0.95)",
            border: "1px solid var(--accent, #c084fc)",
            borderRadius: 10,
            padding: "12px 18px",
            marginBottom: 24,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ fontSize: "0.9rem", color: "var(--text-h, #fff)", fontWeight: 500 }}>
            GitHub Username:
          </span>
          <input
            type="text"
            placeholder="e.g. gt228-tan"
            value={customUserInput}
            onChange={(e) => setCustomUserInput(e.target.value)}
            style={{
              flex: 1,
              maxWidth: 240,
              padding: "6px 12px",
              background: "#111",
              border: "1px solid var(--border, #444)",
              borderRadius: 6,
              color: "#fff",
              fontSize: "0.9rem",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "6px 14px",
              background: "#c084fc",
              color: "#000",
              fontWeight: 600,
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Load
          </button>
          <button
            type="button"
            onClick={() => setCustomUserModal(false)}
            style={{
              padding: "6px 12px",
              background: "transparent",
              border: "1px solid #444",
              color: "#9ca3af",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Profile Overview Banner */}
      {profile && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(26, 27, 38, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)",
            border: "1px solid var(--border, #2e303a)",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <img
              src={profile.avatar_url}
              alt={profile.login}
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                border: "3px solid #c084fc",
                boxShadow: "0 4px 14px rgba(192, 132, 252, 0.35)",
              }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 700, color: "#ffffff" }}>
                  {profile.name || profile.login}
                </h2>
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--accent, #c084fc)",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  @{profile.login}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
              {profile.bio && (
                <p style={{ margin: "6px 0 0", color: "#9ca3af", fontSize: "0.9rem", maxWidth: 600 }}>
                  {profile.bio}
                </p>
              )}
              {profile.blog && (
                <a
                  href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: 6,
                    color: "#f6ff00",
                    fontSize: "0.82rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    textDecoration: "none",
                  }}
                >
                  🌐 {profile.blog}
                </a>
              )}
            </div>
          </div>

          {/* Quick Stat Chips */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "10px 16px",
                borderRadius: 10,
                textAlign: "center",
                minWidth: 80,
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
                {profile.public_repos || repos.length}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase" }}>
                Repositories
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "10px 16px",
                borderRadius: 10,
                textAlign: "center",
                minWidth: 80,
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#facc15" }}>
                ⭐ {totalStars}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase" }}>
                Stars Earned
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "10px 16px",
                borderRadius: 10,
                textAlign: "center",
                minWidth: 80,
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#60a5fa" }}>
                🍴 {totalForks}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase" }}>
                Forks
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "10px 16px",
                borderRadius: 10,
                textAlign: "center",
                minWidth: 80,
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#34d399" }}>
                👥 {profile.followers ?? 0}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase" }}>
                Followers
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search, Language Filter & Sort Controls */}
      <div
        style={{
          background: "rgba(18, 19, 25, 0.7)",
          border: "1px solid var(--border, #2e303a)",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          textAlign: "left",
        }}
      >
        {/* Top Controls Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {/* Search Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#11141b",
              border: "1px solid var(--border, #333)",
              borderRadius: 8,
              padding: "8px 12px",
              flex: "1 1 260px",
              maxWidth: 400,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Filter by repository name or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "0.9rem",
                width: "100%",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: 2,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort & Fork Options */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: "#11141b",
                  border: "1px solid var(--border, #333)",
                  borderRadius: 6,
                  color: "#fff",
                  padding: "6px 10px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="updated">Recently Updated</option>
                <option value="stars">Most Stars</option>
                <option value="forks">Most Forks</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.85rem",
                color: "#9ca3af",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={includeForks}
                onChange={(e) => setIncludeForks(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              Include Forks
            </label>

            <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Showing {filteredRepos.length} of {repos.length}
            </span>
          </div>
        </div>

        {/* Language Filter Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>
            Language:
          </span>
          {availableLanguages.map((lang) => {
            const isSelected = selectedLanguage === lang;
            const langColor = LANGUAGE_COLORS[lang] || "#c084fc";
            return (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 16,
                  border: isSelected ? `1px solid ${langColor}` : "1px solid rgba(255, 255, 255, 0.1)",
                  background: isSelected ? "rgba(192, 132, 252, 0.15)" : "transparent",
                  color: isSelected ? "#fff" : "#9ca3af",
                  fontSize: "0.8rem",
                  fontWeight: isSelected ? 600 : 400,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                {lang !== "ALL" && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: langColor,
                      display: "inline-block",
                    }}
                  />
                )}
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: "60px 0" }}>
          <Spinner />
          <p style={{ marginTop: 16, color: "#9ca3af", fontSize: "0.95rem" }}>
            Fetching projects from GitHub for @{username}...
          </p>
        </div>
      ) : error ? (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <ErrorMessage message={error} />
          <button
            onClick={() => loadGitHubData(username)}
            style={{
              marginTop: 12,
              padding: "8px 18px",
              background: "#c084fc",
              color: "#000",
              fontWeight: 600,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
          >
            Retry Fetching
          </button>
        </div>
      ) : filteredRepos.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px dashed var(--border, #333)",
            borderRadius: 12,
            color: "#9ca3af",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔍</div>
          <h3 style={{ margin: "0 0 6px", color: "#fff" }}>No repositories match your filter</h3>
          <p style={{ fontSize: "0.9rem", margin: 0 }}>
            Try clearing your search query or switching language filters.
          </p>
          {(searchQuery || selectedLanguage !== "ALL" || !includeForks) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLanguage("ALL");
                setIncludeForks(true);
              }}
              style={{
                marginTop: 16,
                padding: "8px 16px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid var(--border, #444)",
                color: "#fff",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* Repository Cards Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
            textAlign: "left",
          }}
        >
          {filteredRepos.map((repo) => {
            const langColor = repo.language ? LANGUAGE_COLORS[repo.language] || "#c084fc" : "#888";
            return (
              <div
                key={repo.id}
                style={{
                  background: "rgba(22, 23, 29, 0.8)",
                  border: "1px solid var(--border, #2e303a)",
                  borderRadius: 14,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "rgba(192, 132, 252, 0.6)";
                  e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--border, #2e303a)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Card Top: Name & Fork Tag */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "1.12rem",
                        fontWeight: 600,
                        color: "var(--accent, #c084fc)",
                        textDecoration: "none",
                        wordBreak: "break-word",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      {repo.name}
                    </a>

                    {repo.fork && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          background: "rgba(255, 255, 255, 0.08)",
                          color: "#9ca3af",
                          padding: "2px 8px",
                          borderRadius: 12,
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          flexShrink: 0,
                        }}
                      >
                        Fork
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--text, #9ca3af)",
                      lineHeight: "1.5",
                      margin: "0 0 16px",
                      minHeight: 40,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {repo.description || "No description provided for this repository."}
                  </p>
                </div>

                {/* Card Bottom: Metadata and Action Links */}
                <div>
                  {/* Language and Stats Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                      paddingTop: 12,
                      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {repo.language ? (
                        <>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: langColor,
                              display: "inline-block",
                            }}
                          />
                          <span style={{ fontWeight: 500, color: "#d1d5db" }}>{repo.language}</span>
                        </>
                      ) : (
                        <span style={{ color: "#6b7280" }}>Text / Config</span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span title="Stargazers" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {repo.stargazers_count}
                      </span>
                      <span title="Forks" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="6" y1="3" x2="6" y2="15" />
                          <circle cx="18" cy="6" r="3" />
                          <circle cx="6" cy="18" r="3" />
                          <path d="M18 9a9 9 0 0 1-9 9" />
                        </svg>
                        {repo.forks_count}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Updated Timestamp */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      Updated {formatDate(repo.updated_at)}
                    </span>

                    <div style={{ display: "flex", gap: 8 }}>
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Live Demo"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "5px 10px",
                            borderRadius: 6,
                            background: "rgba(246, 255, 0, 0.12)",
                            border: "1px solid rgba(246, 255, 0, 0.35)",
                            color: "#f6ff00",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textDecoration: "none",
                            transition: "all 0.15s ease",
                          }}
                        >
                          Demo ↗
                        </a>
                      )}

                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "5px 10px",
                          borderRadius: 6,
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: "#fff",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          textDecoration: "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Code
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Projects;
