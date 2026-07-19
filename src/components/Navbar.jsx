import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav style={{ padding: "15px", background: "#00111d" }}>
      <Link
        to="/"
        style={{ color: "white", marginRight: "20px", textDecoration: "none" }}
      >
       Home
      </Link>

      <Link
        to="/projects" style={{ color: "white", marginRight: "20px", textDecoration: "none" }}
      >
        Projects
      </Link>

      <Link
        to="/contact" style={{ color: "white", textDecoration: "none" }}
      >
        Contact
      </Link>
    </nav>
  );
}

export default NavBar;