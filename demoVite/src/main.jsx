import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './main.css';   // Use your actual stylesheet
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);