import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "./home/Footer";

function Home() {
  const skills = [
    { name: "HTML" },
    { name: "CSS" },
    { name: "JavaScript" },
    { name: "UI/UX Design" },
    { name: "SQL" },
    { name: "Video Editing" },
    { name: "Graphic Design" }
  ];

  const [useGitHubPhoto, setUseGitHubPhoto] = useState(false);

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* Hero Section - Matching attached reference image 2 */}
      <section
        style={{
          width: "100%",
          padding: "70px 24px 90px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 60,
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Left Column: Text & CTAs */}
          <div style={{ textAlign: "left" }}>
            {/* "Hi There!" with underline */}
            <div style={{ display: "inline-block", marginBottom: 20 }}>
              <span
                style={{
                  fontSize: "1.85rem",
                  fontWeight: 700,
                  color: "var(--text-h)",
                  display: "block",
                  letterSpacing: "-0.5px",
                }}
              >
                Hi There!
              </span>
              <div
                style={{
                  width: 52,
                  height: 3.5,
                  background: "var(--border-strong)",
                  marginTop: 6,
                  borderRadius: 2,
                }}
              />
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 3.8rem)",
                fontWeight: 800,
                color: "var(--text-h)",
                letterSpacing: "-1.5px",
                lineHeight: 1.1,
                margin: "0 0 20px 0",
              }}
            >
              I'm Tanishq Mehta
            </h1>

            {/* Solid Pill Badge */}
            <div style={{ marginBottom: 24 }}>
              <span
                style={{
                  display: "inline-block",
                  background: "var(--pill-bg)",
                  color: "var(--pill-text)",
                  padding: "8px 18px",
                  borderRadius: 4,
                  fontSize: "1rem",
                  fontWeight: 600,
                  letterSpacing: "0.2px",
                }}
              >
                Web Developer & Graphic Designer
              </span>
            </div>

            {/* Subtext description */}
            <p
              style={{
                fontSize: "1.15rem",
                lineHeight: 1.6,
                color: "var(--text-muted)",
                maxWidth: 520,
                marginBottom: 36,
              }}
            >
              I build responsive websites and design professional visuals for businesses.
              Lifelong learner dedicated to clean code, high-performance web applications, and intuitive user experiences.
            </p>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <Link to="/projects" className="btn-solid" style={{ padding: "12px 24px", fontSize: "0.95rem" }}>
                View Projects →
              </Link>
              <Link to="/contact" className="btn-outline" style={{ padding: "12px 24px", fontSize: "0.95rem" }}>
                Contact Me
              </Link>
              <a
                href="https://github.com/gt228-tan"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ padding: "12px 18px", fontSize: "0.95rem" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>

          {/* Right Column: Signature Offset Frame Illustration (matching Image 2) */}
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <div
              style={{
                position: "relative",
                width: 340,
                maxWidth: "100%",
                aspectRatio: "3/4",
              }}
            >
              {/* Offset Wireframe Border Box shifted top-right */}
              <div
                style={{
                  position: "absolute",
                  top: -16,
                  right: -16,
                  width: "100%",
                  height: "100%",
                  border: "2px solid var(--border-strong)",
                  borderRadius: 4,
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />

              {/* Main Card */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  background: "var(--card-muted)",
                  zIndex: 2,
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <img
                  src={useGitHubPhoto ? "https://avatars.githubusercontent.com/u/187567565?v=4" : "/developer_portrait.jpg"}
                  alt="Tanishq Mehta"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                {/* Switcher Badge for GitHub Avatar vs Illustration */}
                <button
                  onClick={() => setUseGitHubPhoto((prev) => !prev)}
                  title="Toggle Avatar Source"
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    background: "var(--pill-bg)",
                    color: "var(--pill-text)",
                    border: "none",
                    borderRadius: 4,
                    padding: "6px 10px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: 0.9,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  {useGitHubPhoto ? "Show Art" : "Show GitHub Avatar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        style={{
          width: "100%",
          padding: "80px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto", textAlign: "left" }}>
          <div style={{ display: "inline-block", marginBottom: 12 }}>
            <span
              style={{
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                fontWeight: 700,
                color: "var(--text-muted)",
              }}
            >
              About ME
            </span>
            <div style={{ width: 32, height: 2, background: "var(--border-strong)", marginTop: 4 }} />
          </div>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--text-h)",
              marginBottom: 20,
              letterSpacing: "-0.5px",
            }}
          >
            About Myself
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 48,
              alignItems: "start",
            }}
            className="about-grid"
          >
            <div>
              <p
                style={{
                  fontSize: "1.1rem",
                  lineHeight: 1.7,
                  color: "var(--text)",
                  marginBottom: 18,
                }}
              >
                Hi, I'm <strong>Tanishq Mehta</strong> — a lifelong learner. I enjoy building clean, functional websites and exploring new technologies every day.
              </p>
              <p
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.7,
                  color: "var(--text-muted)",
                  marginBottom: 24,
                }}
              >
                My focus spans modern web development, intuitive UI/UX design, database systems, and multimedia editing. I believe in creating digital solutions that are both aesthetically compelling and structurally resilient.
              </p>
              <Link to="/contact" className="btn-solid" style={{ fontSize: "0.9rem" }}>
                Send a Message
              </Link>
            </div>

            {/* Quick Metrics / Highlights Card */}
            <div
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "28px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 18, color: "var(--text-h)" }}>
                Key Highlights
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border-strong)" }} />
                  <span style={{ fontSize: "0.95rem", color: "var(--text)" }}>
                    <strong>Frontend & Full-Stack</strong> modern web engineering
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border-strong)" }} />
                  <span style={{ fontSize: "0.95rem", color: "var(--text)" }}>
                    <strong>UI/UX & Visual Arts</strong> graphic design & video editing
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border-strong)" }} />
                  <span style={{ fontSize: "0.95rem", color: "var(--text)" }}>
                    <strong>Database Architecture</strong> SQL and MongoDB integration
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border-strong)" }} />
                  <span style={{ fontSize: "0.95rem", color: "var(--text)" }}>
                    <strong>Continuous Learning</strong> passionate about emerging tech
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section
        style={{
          width: "100%",
          padding: "80px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card-bg)",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto", textAlign: "left" }}>
          <div style={{ display: "inline-block", marginBottom: 12 }}>
            <span
              style={{
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                fontWeight: 700,
                color: "var(--text-muted)",
              }}
            >
              Skill Set
            </span>
            <div style={{ width: 32, height: 2, background: "var(--border-strong)", marginTop: 4 }} />
          </div>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--text-h)",
              marginBottom: 12,
              letterSpacing: "-0.5px",
            }}
          >
            My Skills & Expertise
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", marginBottom: 36, maxWidth: 600 }}>
            A curated blend of technical engineering, design principles, and creative media tools.
          </p>

          {/* Grid of skills */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {skills.map((s) => (
              <div
                key={s.name}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "20px 22px",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>{s.icon}</div>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-h)" }}>
                  {s.name}
                </h4>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      background: "var(--card-muted)",
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontWeight: 500,
                    }}
                  >
                    {s.category}
                  </span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-h)" }}>
                    {s.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Callout Banner */}
      <section
        style={{
          width: "100%",
          padding: "70px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            border: "2px solid var(--border-strong)",
            borderRadius: 8,
            padding: "40px 36px",
            background: "var(--card-bg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 24,
            textAlign: "left",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.6rem", fontWeight: 700, color: "var(--text-h)" }}>
              Explore Live GitHub Projects
            </h3>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "1rem" }}>
              Dynamic repositories, live language stats, search filters, and cache monitors.
            </p>
          </div>
          <Link to="/projects" className="btn-solid" style={{ padding: "12px 28px", fontSize: "0.95rem" }}>
            Open Projects →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 868px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
