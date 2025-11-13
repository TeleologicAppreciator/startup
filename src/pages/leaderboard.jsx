import React from "react";

export default function Leaderboard() {
  const [leaders, setLeaders] = React.useState([]);
  const [error, setError] = React.useState(null);

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  async function loadLeaderboard() {
    try {
      const response = await fetch("/api/leaderboard");
      if (!response.ok) {
        setError("Failed to load leaderboard");
        return;
      }

      const data = await response.json();
      setLeaders(data);
    } catch (err) {
      console.error("Leaderboard error:", err);
      setError("Server error loading leaderboard");
    }
  }

  // Load leaderboard on mount
  React.useEffect(() => {
    loadLeaderboard();

    // Refresh every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="leaderboard-page">
      <main>
        <section>
          <h2><span>Daily Leaderboard</span></h2>
          <p>{formatDate(new Date())}</p>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {leaders.length ? (
                leaders.map((player, index) => (
                  <tr key={player.email || index}>
                    <td>{index + 1}</td>
                    <td>{player.email}</td>
                    <td>${player.profit?.toFixed(2) || "0.00"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No leaders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}