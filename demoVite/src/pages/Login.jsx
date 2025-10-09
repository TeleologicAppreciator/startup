export default function Login() {
  return (
    <div>
      <header>
        <h1>Stock Sprint!</h1>
        <nav>
          <ul>
            <li><a href="/" className="active">Home</a></li>
            <li><a href="/account">Account</a></li>
            <li><a href="/leaderboard">Leaderboard</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <h1 className="welcome-title">Welcome</h1>
        <form>
          <div>
            <input type="text" name="email" placeholder="your@email.com" />
          </div>
          <div>
            <input type="password" name="password" placeholder="password" />
          </div>
          <button type="submit">Login</button>
          <button type="button">Create</button>
        </form>
      </main>
    </div>
  );
}