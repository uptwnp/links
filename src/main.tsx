import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Remove StrictMode in production to prevent double API calls
// Keep it for development to catch side effects
const isDevelopment = import.meta.env.DEV;

// Performance optimization: Use requestIdleCallback for non-critical rendering
const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  const root = createRoot(rootElement);
  
  if (isDevelopment) {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } else {
    root.render(<App />);
  }
};

// Use requestIdleCallback if available, otherwise render immediately
if ('requestIdleCallback' in window) {
  requestIdleCallback(renderApp, { timeout: 100 });
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(renderApp, 0);
}