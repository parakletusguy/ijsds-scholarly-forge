import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// When a lazy-loaded chunk is missing after a new deployment, reload once to get fresh assets.
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
