import React from "react";

export default function Leaderboard() {
  const [dailyLeaders, setDailyLeaders] = React.useState([]);
  const [allTimeLeaders, setAllTimeLeaders] = React.useState([]);

  React.useEffect(() => {
    const dailyText = localStorage.getItem("dailyLeaders");
    const allTimeText = localStorage.getItem("allTimeLeaders");

    if (dailyText) {
      setDailyLeaders(JSON.parse(dailyText));
    } else {
      const mockDaily = [
        { name: "도윤 이", profit: 34.23 },
        { name: "Annie James", profit: 29.3 },
        { name: "Gunter Spears", profit: 7.0 },
      ];
      setDailyLeaders(mockDaily);
      localStorage.setItem("dailyLeaders", JSON.stringify(mockDaily));
    }

    if (allTimeText) {
      setAllTimeLeaders(JSON.parse(allTimeText));
    } else {
      const mockAllTime = [
        { name: "John Smith", score: 1000, date: "May 20, 2021" },
        { name: "Alfred Him", score: 35, date: "June 2, 2021" },
        { name: "Reece Easpuffs", score: 34.24, date: "July 3, 2020" },
      ];
      setAllTimeLeaders(mockAllTime);
      localStorage.setItem("allTimeLeaders", JSON.stringify(mockAllTime));
    }
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const updatedDaily = [
        { name: "도윤 이", profit: +(Math.random() * 50).toFixed(2) },
        { name: "Annie James", profit: +(Math.random() * 50).toFixed(2) },
        { name: "Gunter Spears", profit: +(Math.random() * 50).toFixed(2) },
      ]
        .sort((a, b) => b.profit - a.profit);

      setDailyLeaders(updatedDaily);
      localStorage.setItem("dailyLeaders", JSON.stringify(updatedDaily));

      const winner = updatedDaily[0];
      const newAllTime = [
        ...allTimeLeaders,
        {
          name: winner.name,
          score: winner.profit,
          date: new Date().toLocaleDateString(),
        },
      ]
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
          <p>{new Date().toLocaleDateString()}</p>
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
                    <td>{entry.date}</td>
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