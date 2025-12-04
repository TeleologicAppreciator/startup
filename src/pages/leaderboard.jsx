import React from "react";

export default function Leaderboard({ wsMessages }) {
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

  // Refresh when WebSocket indicates leaderboard update
  React.useEffect(() => {
    if (wsMessages.length === 0) return;

    const latestMessage = wsMessages[wsMessages.length - 1];

    if (latestMessage.type === "leaderboard_update" ||
        latestMessage.type === "trading_closed") {
      loadLeaderboard();
    }
  }, [wsMessages]);

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
                leaders.map((player, index) => {
                  const profit = player.profit || 0;
                  const profitClass = profit > 0 ? "positive" : profit < 0 ? "negative" : "";
                  const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";

                  return (
                    <tr key={player.email || index}>
                      <td>{medal} {index + 1}</td>
                      <td>{player.email}</td>
                      <td className={profitClass}>
                        ${profit.toFixed(2)}
                        {profit > 0 && " 📈"}
                        {profit < 0 && " 📉"}
                      </td>
                    </tr>
                  );
                })
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