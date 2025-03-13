import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../static/Navbar.css";

function Navbar() {
  const [showNavbar, setShowNavbar] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    setIsLoggedIn(!!userEmail);
  }, []);

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
            {!isLoggedIn ? (
              <li>
                <NavLink to="/login" onClick={() => setShowNavbar(false)}>
                  Login
                </NavLink>
              </li>
            ) : (
              <li>
                <NavLink to="/login" className="logout-btn">
                  Logout
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
