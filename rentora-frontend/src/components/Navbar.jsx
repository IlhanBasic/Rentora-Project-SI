import { NavLink, useNavigate, Link } from "react-router-dom";
import logoImg from "/logo1.png";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";
export default function Navbar() {
  const [hamburgerMenu, setHamburgerMenu] = useState(false);
  const navigate = useNavigate();
  const ctx = useContext(AuthContext);
  useEffect(() => {
    setHamburgerMenu(false);
  }, [location.pathname]);
  function handleNavigate(link) {
    navigate(link);
  }

  function handleLogout() {
    ctx.logout();
    navigate("/");
  }

  function handleToggle() {
    setHamburgerMenu((prev) => !prev);
  }

  return (
    <>
      <nav className={`main-navbar ${hamburgerMenu ? "active" : ""}`}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : undefined)}
          end
        >
          <img src={logoImg} alt="Rentora logo" />
        </NavLink>

        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : undefined)}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/vehicles"
              className={({ isActive }) => (isActive ? "active" : undefined)}
              end
            >
              Vozila
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? "active" : undefined)}
              end
            >
              O Nama
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/conditions"
              className={({ isActive }) => (isActive ? "active" : undefined)}
              end
            >
              Uslovi
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? "active" : undefined)}
              end
            >
              Kontakt
            </NavLink>
          </li>
        </ul>

        <div className="navbar-btn-group">
          {!ctx.isLoggedIn && (
            <>
              <button onClick={() => handleNavigate("/auth/?mode=Login")}>
                Prijavi se
              </button>
              <button onClick={() => handleNavigate("/auth/?mode=Register")}>
                Registruj se
              </button>
            </>
          )}
          {ctx.isLoggedIn && (
            <>
              <button
                onClick={() =>
                  handleNavigate(`${ctx.isAdmin ? "/Admin" : "/my-rentals"}`)
                }
              >
                {ctx.isAdmin ? "Admin Stranica  " : "Profil"}
              </button>
              <button onClick={handleLogout}>Odjavi se</button>
            </>
          )}
        </div>

        <button
          className={`hamburger ${hamburgerMenu ? "active" : ""}`}
          aria-label="Toggle menu"
          onClick={handleToggle}
        ></button>
      </nav>
    </>
  );
}
