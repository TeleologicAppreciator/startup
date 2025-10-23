import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Authenticated(props) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('userName');
    props.onLogout();
  }

  return (
    <div>
      <h2>Welcome, {props.userName}!</h2>
      <button onClick={() => navigate('/account')}>Go to Account</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}