import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getToken, logout } from "../api";

function NavBar() {
  const [hasToken, setHasToken] = useState(Boolean(getToken()));

  useEffect(() => {
    const handleAuthChange = () => {
      setHasToken(Boolean(getToken()));
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  return (
    <nav
      style={{
        padding: "15px 24px",
        background: "#00111d",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Link
          to="/"
          style={{ color: "white", marginRight: "20px", textDecoration: "none", fontWeight: 500 }}
        >
          Home
        </Link>

        <Link
          to="/tasks"
          style={{ color: "white", marginRight: "20px", textDecoration: "none", fontWeight: 500 }}
        >
          Tasks
        </Link>

        <Link
          to="/contact"
          style={{ color: "white", textDecoration: "none", fontWeight: 500 }}
        >
          Contact
        </Link>
      </div>

      <div>
        {hasToken ? (
          <button
            onClick={() => logout()}
            style={{
              background: "transparent",
              border: "1px solid #dc2626",
              color: "#f87171",
              padding: "5px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        ) : (
          <Link
            to="/tasks"
            style={{
              color: "#f6ff00",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Login / Register
          </Link>
        )}
      </div>
    </nav>
  );
}

export default NavBar;