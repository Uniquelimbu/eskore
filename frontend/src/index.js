import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create fallback HTML for 404 handling
// This helps SEO and avoids blank pages when directly loading a route
if (typeof window !== 'undefined') {
  const noscriptContent = document.querySelector('noscript');
  if (noscriptContent) {
    const fallbackHTML = noscriptContent.innerHTML;
    window.__FALLBACK_HTML__ = fallbackHTML;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals();
