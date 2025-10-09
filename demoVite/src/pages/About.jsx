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
            Stock Sprint is an app where each day users get fake currency and compete
            to see who can make the most money off of the stock market in a day. Prices
            are based off of the stock price at the beggining of the day. You may only
            buy stocks you cannot sell them once purchased.
          </p>
        </div>
      </main>
    </div>
  );
}
