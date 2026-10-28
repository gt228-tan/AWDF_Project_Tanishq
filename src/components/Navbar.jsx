import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getToken, logout } from "../api";

function NavBar() {
  const [hasToken, setHasToken] = useState(Boolean(getToken()));
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("portfolio-theme") === "dark";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleAuthChange = () => {
      setHasToken(Boolean(getToken()));
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("portfolio-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("portfolio-theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Tasks", path: "/tasks" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav
      style={{
        width: "100%",
        background: "#00111D",
        borderBottom: "1px solid rgba(248, 248, 246, 0.12)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Brand / Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "#F8F8F6",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              background: "#F8F8F6",
              color: "#00111D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "-0.5px",
            }}
          >
            TM
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px", color: "#F8F8F6" }}>
            Tanishq Mehta
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  color: isActive ? "#F8F8F6" : "rgba(248, 248, 246, 0.75)",
                  textDecoration: "none",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 14,
                  padding: "8px 14px",
                  borderRadius: 6,
                  background: isActive ? "rgba(248, 248, 246, 0.12)" : "transparent",
                  transition: "all 0.15s ease",
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Controls: Theme Switcher & Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            style={{
              background: "transparent",
              border: "1px solid rgba(248, 248, 246, 0.25)",
              color: "#F8F8F6",
              width: 36,
              height: 36,
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              transition: "border-color 0.2s ease, background 0.2s ease",
            }}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Auth Button */}
          {hasToken ? (
            <button
              onClick={() => logout()}
              style={{
                background: "transparent",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                color: "#f87171",
                padding: "8px 16px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.15s ease",
              }}
            >
              Logout
            </button>
          ) : (
            <Link
              to="/tasks"
              style={{
                background: "#F8F8F6",
                color: "#00111D",
                padding: "8px 16px",
                borderRadius: 6,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
                transition: "opacity 0.2s ease, transform 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;