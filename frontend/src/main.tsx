import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// New theme styles (for Login and future pages)
import './styles/dark-theme.css';
import './styles/light-theme.css';
import './styles/auth.css';

// Old styles (keeping for compatibility with existing pages)
import './styles/main.css';
import './styles/style.css';
import './styles/events.css';
import './styles/clubs.css';
import './styles/organizer.css';
import './styles/hero.css';
import './styles/calendar.css';
import './styles/add_event.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
