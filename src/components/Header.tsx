import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearAuth, getToken } from "../lib/auth";

export default function Header() {
  const navigate = useNavigate();
  const token = getToken();

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    textDecoration: "none",
    fontWeight: isActive ? 700 : 400,
  });

  function onLogout() {
    clearAuth();
    navigate("/");
  }

  return (
    <header>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" className="brand">
          <img src="/Holi.png" alt="Holidaze logo" className="brand-logo" />
        </Link>

        <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <NavLink to="/" style={linkStyle}>
            Venues
          </NavLink>

          {token ? (
            <>
              <NavLink to="/profile" style={linkStyle}>
                Profile
              </NavLink>
              <NavLink to="/bookings" style={linkStyle}>
                My bookings
              </NavLink>
              <NavLink to="/admin" style={linkStyle}>
                Manage venues
              </NavLink>
              <button type="button" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" style={linkStyle}>
                Login
              </NavLink>
              <NavLink to="/register" style={linkStyle}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
