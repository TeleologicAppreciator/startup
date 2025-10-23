import React from "react";

export default function Login({ onAuthChange }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [error, setError] = React.useState(null);

  // when the component loads, check if the user is already saved
  React.useEffect(() => {
    const savedUser = localStorage.getItem("userEmail");
    if (savedUser) {
      setEmail(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    localStorage.setItem("userEmail", email);
    setIsAuthenticated(true);
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
    setIsAuthenticated(true);
    setError(null);
    if (onAuthChange) onAuthChange(email, true);
  }

  function handleLogout() {
    localStorage.removeItem("userEmail");
    setEmail("");
    setPassword("");
    setIsAuthenticated(false);
    if (onAuthChange) onAuthChange("", false);
  }

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

            {/* logout button anchored above footer */}
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