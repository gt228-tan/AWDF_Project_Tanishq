import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        background: "#00111D",
        color: "#F8F8F6",
        borderTop: "1px solid rgba(248, 248, 246, 0.12)",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1140,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              background: "#F8F8F6",
              color: "#00111D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            TM
          </div>
          <span style={{ fontSize: "0.95rem", color: "rgba(248, 248, 246, 0.85)" }}>
            © {new Date().getFullYear()} Tanishq Mehta Portfolio. All rights reserved.
          </span>
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link
            to="/"
            style={{ color: "rgba(248, 248, 246, 0.75)", textDecoration: "none", fontSize: "0.88rem" }}
          >
            Home
          </Link>
          <Link
            to="/projects"
            style={{ color: "rgba(248, 248, 246, 0.75)", textDecoration: "none", fontSize: "0.88rem" }}
          >
            Projects
          </Link>
          <Link
            to="/tasks"
            style={{ color: "rgba(248, 248, 246, 0.75)", textDecoration: "none", fontSize: "0.88rem" }}
          >
            Tasks
          </Link>
          <Link
            to="/contact"
            style={{ color: "rgba(248, 248, 246, 0.75)", textDecoration: "none", fontSize: "0.88rem" }}
          >
            Contact
          </Link>
          <a
            href="https://github.com/gt228-tan"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#F8F8F6", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600 }}
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;