import React from "react";

export default function Login() {
  return (
    <div>
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