// ============================================================================
// src/index.jsx — REACT APPLICATION ENTRY POINT
// ----------------------------------------------------------------------------
// This is the first file executed by the browser. It mounts the React app
// onto the real DOM node with id="root" (defined in public/index.html).
//
// WHAT HAPPENS HERE:
//   1. React 18's createRoot replaces the old ReactDOM.render() API.
//   2. <React.StrictMode> enables extra runtime warnings in development —
//      components may render twice intentionally to catch side-effect bugs.
//   3. <App /> is the root component tree (routing, global providers, etc.)
//   4. index.css is imported here so global styles load before any component.
//   5. reportWebVitals() can be configured to send perf metrics to analytics.
// ============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
