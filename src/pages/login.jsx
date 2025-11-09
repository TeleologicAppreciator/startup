import React from "react";

export default function Login({ onAuthChange }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem("userEmail");
    if (savedUser) {
      setEmail(savedUser);
      if (onAuthChange) onAuthChange(savedUser, true);
    }
  }, [onAuthChange]);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.msg || "Login failed");
        return;
      }

      localStorage.setItem("userEmail", email);
      if (onAuthChange) onAuthChange(email, true);
    } catch (err) {
      console.error("Login error:", err);
      setError("Error connecting to server");
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.msg || "Registration failed");
        return;
      }

      await handleLogin(e);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Error connecting to server");
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Logout error:", err);
    }

    localStorage.removeItem("userEmail");
    setEmail("");
    setPassword("");
    if (onAuthChange) onAuthChange("", false);
  }

  const isAuthenticated = !!localStorage.getItem("userEmail");

  return (
    <div className="login-container">
      <main>
        {!isAuthenticated ? (
          <>
            <h1 className="welcome-title">Welcome</h1>

            <form onSubmit={handleLogin}>
              <div>
                <input
                  type="text"
                  name="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="error-text">{error}</p>}

              <button type="submit">Login</button>
              <button type="button" onClick={handleCreate}>
                Create
              </button>
            </form>
          </>
        ) : (
          <div className="logged-in-view">
            <h2 className="welcome-title">Welcome, {email}</h2>
            <div className="logout-bar">
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}