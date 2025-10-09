import React from "react";

export default function Leaderboard() {
  return (
    <div className="leaderboard-page">
      <main>
        <section>
          <h2><span>Daily Leaderboard</span></h2>
          <p>September 24, 2025</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>도윤 이</td><td>$34.23</td></tr>
              <tr><td>2</td><td>Annie James</td><td>$29.30</td></tr>
              <tr><td>3</td><td>Gunter Spears</td><td>$7.00</td></tr>
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
              <tr><td>1</td><td>John Smith</td><td>$1000.00</td><td>May 20, 2021</td></tr>
              <tr><td>2</td><td>Alfred Him</td><td>$35.00</td><td>June 2, 2021</td></tr>
              <tr><td>3</td><td>Reece Easpuffs</td><td>$34.24</td><td>July 3, 2020</td></tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
