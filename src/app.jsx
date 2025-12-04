import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Account from "./pages/account";
import Leaderboard from "./pages/leaderboard";
import About from "./pages/about";
import "./main.css";

function App() {
  const [userName, setUserName] = React.useState("");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // WebSocket connection
  const [isConnected, setIsConnected] = React.useState(false);
  const [wsMessages, setWsMessages] = React.useState([]);

  // Authentication load
  React.useEffect(() => {
    const savedUser = localStorage.getItem("userEmail");
    if (savedUser) {
      setUserName(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  function handleAuthChange(user, loggedIn) {
    setUserName(user);
    setIsAuthenticated(loggedIn);
  }

  // WebSocket connection
  React.useEffect(() => {
    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("WS message:", msg);
        setWsMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => socket.close();
  }, []);

  return (
    <div id="app-shell">
      <BrowserRouter>
        <header>
          <h1>Stock Sprint!</h1>
          <nav>
            <ul>
              <li>
                <NavLink to="/" end>
                  Home
                </NavLink>
              </li>

              {isAuthenticated && (
                <>
                  <li>
                    <NavLink to="/account">Account</NavLink>
                  </li>
                  <li>
                    <NavLink to="/leaderboard">Leaderboard</NavLink>
                  </li>
                </>
              )}

              <li>
                <NavLink to="/about">About</NavLink>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          {/* You can remove this later — it's just to prove WS messages appear */}
          <div className="ws-debug">
            <h3>WebSocket Messages</h3>
            {wsMessages.map((m, i) => (
              <div key={i}>
                <strong>{m.from}:</strong> {m.msg}
              </div>
            ))}
          </div>

          <Routes>
            <Route
              path="/"
              element={<Login onAuthChange={handleAuthChange} />}
            />
            <Route
              path="/account"
              element={
                isAuthenticated ? <Account userName={userName} /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/leaderboard"
              element={
                isAuthenticated ? <Leaderboard /> : <Navigate to="/" replace />
              }
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <footer>
          <span className="footer-left">Bryce Conrad</span>
          <a
            href="https://github.com/TeleologicAppreciator/startup"
            className="footer-right"
            target="_blank"
          >
            GitHub
          </a>
        </footer>
      </BrowserRouter>
    </div>
  );
}

export default App;