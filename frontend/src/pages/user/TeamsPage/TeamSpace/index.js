export { default } from './TeamSpace';

// Also export pages for direct import
export { default as Overview } from './pages/Overview';
export { default as Squad } from './pages/Squad/Squad';
export { default as Formation } from './pages/Formation/Formation';
export { default as Calendar } from './pages/Calendar/Calendar';
export { default as Settings } from './pages/Settings/Settings';

// Log for debugging
console.log('TeamSpace index.js loaded with page exports');
