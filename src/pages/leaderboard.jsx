import React from "react";

export default function Leaderboard() {
  const [dailyLeaders, setDailyLeaders] = React.useState([]);
  const [allTimeLeaders, setAllTimeLeaders] = React.useState([]);

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const mockData = {
    daily: [
      { name: "도윤 이", profit: 34.23 },
      { name: "Annie James", profit: 29.3 },
      { name: "Gunter Spears", profit: 7.0 },
    ],
    allTime: [
      { name: "John Smith", score: 1000, date: "2021-05-20T00:00:00Z" },
      { name: "Alfred Him", score: 35, date: "2021-06-02T00:00:00Z" },
      { name: "Reece Easpuffs", score: 34.24, date: "2020-07-03T00:00:00Z" },
    ],
  };

  React.useEffect(() => {
    const storedDaily = localStorage.getItem("dailyLeaders");
    const storedAllTime = localStorage.getItem("allTimeLeaders");

    if (storedDaily) {
      setDailyLeaders(JSON.parse(storedDaily));
    } else {
      setDailyLeaders(mockData.daily);
      localStorage.setItem("dailyLeaders", JSON.stringify(mockData.daily));
    }

    if (storedAllTime) {
      setAllTimeLeaders(JSON.parse(storedAllTime));
    } else {
      setAllTimeLeaders(mockData.allTime);
      localStorage.setItem("allTimeLeaders", JSON.stringify(mockData.allTime));
    }
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const updatedDaily = mockData.daily
        .map((entry) => ({
          ...entry,
          profit: +(Math.random() * 50).toFixed(2),
        }))
        .sort((a, b) => b.profit - a.profit);

      setDailyLeaders(updatedDaily);
      localStorage.setItem("dailyLeaders", JSON.stringify(updatedDaily));

      const winner = updatedDaily[0];
      const newEntry = {
        name: winner.name,
        score: winner.profit,
        date: new Date().toISOString(),
      };

      const newAllTime = [...allTimeLeaders, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setAllTimeLeaders(newAllTime);
      localStorage.setItem("allTimeLeaders", JSON.stringify(newAllTime));
    }, 30000);

    return () => clearInterval(interval);
  }, [allTimeLeaders]);

  return (
    <div className="leaderboard-page">
      <main>
        <section>
          <h2><span>Daily Leaderboard</span></h2>
          <p>{formatDate(new Date())}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {dailyLeaders.length ? (
                dailyLeaders.map((player, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{player.name}</td>
                    <td>${player.profit.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section>
          <h2><span>All-time Leaderboard</span></h2>
          <table className="alltime-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {allTimeLeaders.length ? (
                allTimeLeaders.map((entry, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{entry.name}</td>
                    <td>${entry.score.toFixed(2)}</td>
                    <td>{formatDate(entry.date)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4">Be the first to score</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}