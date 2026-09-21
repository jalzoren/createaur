import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { installFlushListeners } from './lib/storage';
import './styles/global.css';

installFlushListeners();

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);