import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Login from "./pages/login";
import Account from "./pages/account";
import Leaderboard from "./pages/leaderboard";
import About from "./pages/about";
import "./main.css";

function App() {
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
              <li>
                <NavLink to="/account">
                  Account
                </NavLink>
              </li>
              <li>
                <NavLink to="/leaderboard">
                  Leaderboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/about">
                  About
                </NavLink>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
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