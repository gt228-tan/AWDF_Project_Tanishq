import { useState, useEffect } from "react";
import Spinner from "./Spinner";
import ErrorMessage from "./ErrorMessage";

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://api.github.com/users/gt228-tan/repos")
      .then((res) => res.json())
      .then((data) => setRepos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  return (
    <section style={{ padding: "32px 24px", maxWidth: 800, margin: "0 auto", textAlign: "left" }}>
      <h3 style={{ color: "#f6ff00", marginBottom: 24 }}>GitHub Repositories</h3>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {repos.map((repo) => (
          <li
            key={repo.id} style={{padding: "16px 20px",borderRadius: 8,border: "1px solid var(--border)",background: "var(--social-bg)",transition: "box-shadow 0.3s",}} >
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer"style={{ color: "rgb(255, 255, 255)", fontWeight: 600, textDecoration: "none",}}>{repo.name}</a>
            {repo.description && (<p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--text)" }}>
                {repo.description}
              </p>)}
          </li>
        ))}
      </ul>
    </section>
  );
}
export default Projects;