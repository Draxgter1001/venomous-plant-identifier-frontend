import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../static/Navbar.css";

function Navbar() {
  const [showNavbar, setShowNavbar] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("userEmail"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="menu-icon" onClick={handleShowNavbar}>
          <div className={`bar ${showNavbar && "open"}`}></div>
          <div className={`bar ${showNavbar && "open"}`}></div>
          <div className={`bar ${showNavbar && "open"}`}></div>
        </div>
        <div className={`nav-elements ${showNavbar ? "active" : ""}`}>
          <ul>
            <li>
              <NavLink to="/" onClick={() => setShowNavbar(false)}>
                Home
              </NavLink>
            </li>
            {isLoggedIn ? (
              <li>
                <NavLink to="/" onClick={handleLogout} className="logout-button">
                  Logout
                </NavLink>
              </li>
            ) : (
              <li>
                <NavLink to="/login" onClick={() => setShowNavbar(false)}>
                  Login
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
