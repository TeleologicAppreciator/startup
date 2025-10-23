import React from 'react';

export default function Unauthenticated(props) {
  const [userName, setUserName] = React.useState(props.userName || '');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);

  async function loginUser() {
    if (!userName || !password) {
      setError('Please enter both email and password.');
      return;
    }

    localStorage.setItem('userName', userName);
    props.onLogin(userName);
  }

  async function createUser() {
    if (!userName || !password) {
      setError('Please enter both email and password.');
      return;
    }

    localStorage.setItem('userName', userName);
    props.onLogin(userName);
  }

  return (
    <div>
      <div className="input-group mb-3">
        <span className="input-group-text">@</span>
        <input
          className="form-control"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="your@email.com"
        />
      </div>

      <div className="input-group mb-3">
        <span className="input-group-text">🔒</span>
        <input
          className="form-control"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={loginUser} disabled={!userName || !password}>
        Login
      </button>
      <button onClick={createUser} disabled={!userName || !password}>
        Create
      </button>
    </div>
  );
}