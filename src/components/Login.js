import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const endpoint = isRegistering
      ? "https://venomous-plant-fb14f0407ddd.herokuapp.com/api/users/register"
      : "https://venomous-plant-fb14f0407ddd.herokuapp.com/api/users/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.text(); // Expect a text response like "User registered successfully" or "Login successful"
      if (!response.ok) {
        throw new Error(data);
      }

      if (!isRegistering) {
        // Save user email to local storage on login
        localStorage.setItem("userEmail", email);
        alert("Login successful");
        navigate("/"); // Redirect to the home page after login
      } else {
        alert(data); // Show success message for registration
        setIsRegistering(false); // Switch to login view
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>{isRegistering ? "Register" : "Login"}</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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

        <button type="submit" style={{ width: "100%", padding: "10px", marginTop: "10px" }}>
          {isRegistering ? "Register" : "Login"}
        </button>
      </form>

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
    </div>
  );
}

export default Login;
