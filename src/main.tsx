import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress ResizeObserver loop limit exceeded error overlay in dev
const suppressResizeObserverError = () => {
  const _error = window.console.error;
  window.console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
      return;
    }
    _error.apply(window.console, args);
  };

  window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop limit exceeded') {
      const overlay = document.getElementById('vite-error-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    }
  });
};

suppressResizeObserverError();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
