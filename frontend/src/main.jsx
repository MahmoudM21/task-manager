import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('[TaskFlow] #root element not found in index.html');
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
