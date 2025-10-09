export default function About() {
  return (
    <div>
      <header>
        <h1>Stock Sprint!</h1>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/account">Account</a></li>
            <li><a href="/leaderboard">Leaderboard</a></li>
            <li><a href="/about" className="active">About</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <div className="app-description">
          <p>
            Stock Sprint is a fun, fast-paced stock trading simulation game that challenges
            players to make smart investments and grow their portfolios in real-time.
          </p>
          <p>
            Compete against others on the leaderboard, learn about market trends, and test
            your strategy — all in a safe, risk-free environment.
          </p>
        </div>
      </main>
    </div>
  );
}
