// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';
import './styles/reset.css';
import './styles/global.css';
import './styles/themes/theme.css';  // ← fixed import path
import './index.css';  // your default styles from create-react-app
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
