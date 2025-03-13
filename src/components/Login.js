import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
  Authentication component handling:
  User login, registration, and logout flows
  Session management via local storage
  Integration with backend authentication API
*/

function Login() {
  // Form state management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login/register
  const [error, setError] = useState(null); // Error message display
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const navigate = useNavigate(); // Navigation hook for post-login redirect

  // Check if user is already logged in
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setIsLoggedIn(true);
    }
  }, []);

  /**
    Handles form submission for both login and registration
    @param {Event} e - Form submit event
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Determine API endpoint based on current mode
    const endpoint = isRegistering
      ? "https://venomous-plant-fb14f0407ddd.herokuapp.com/api/users/register"
      : "https://venomous-plant-fb14f0407ddd.herokuapp.com/api/users/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.text();
      if (!response.ok) {
        throw new Error(data);
      }

      if (!isRegistering) {
        // Save user email to local storage on login
        localStorage.setItem("userEmail", email);
        setIsLoggedIn(true);
        alert("Login successful");
        navigate("/"); // Redirect to home page
      } else {
        alert(data);
        setIsRegistering(false);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("userEmail"); // Remove user session
    setIsLoggedIn(false);
    navigate("/"); // Redirect to home page
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      {/* If logged in, show logout button */}
      {isLoggedIn ? (
        <div style={{ textAlign: "center" }}>
          <h2>Welcome!</h2>
          <p>You are logged in.</p>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <>
          <h1>{isRegistering ? "Register" : "Login"}</h1>

          {/* Error message display */}
          {error && (
            <div style={{ color: "red", marginBottom: "10px" }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email input */}
            <div style={{ marginBottom: "10px" }}>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>

            {/* Password input */}
            <div style={{ marginBottom: "10px" }}>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
            
            {/* Submit button */}
            <button
              type="submit"
              style={{ width: "100%", padding: "10px", marginTop: "10px" }}
            >
              {isRegistering ? "Register" : "Login"}
            </button>
          </form>

          {/* Toggle between login/register */}
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              style={{ padding: "5px" }}
            >
              {isRegistering
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Login;
