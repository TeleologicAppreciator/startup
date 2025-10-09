import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Leaderboard from "./pages/Leaderboard";
import About from "./pages/About";
import "./main.css";

function App() {
  return (
    <div id="app-shell">
      <BrowserRouter>
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