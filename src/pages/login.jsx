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

  function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    localStorage.setItem("userEmail", email);
    setError(null);
    if (onAuthChange) onAuthChange(email, true);
  }

  function handleCreate(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    localStorage.setItem("userEmail", email);
    setError(null);
    if (onAuthChange) onAuthChange(email, true);
  }

  function handleLogout() {
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