import React from 'react';
import { Link } from 'react-router-dom';

export default function ClubsPage() {
  return (
    <div>
      <header className="header header-black visible">
        <div className="header-inner">
          <div className="logo">
            <Link to="/"><img src="/images/logo.png" alt="MNU Events" /></Link>
          </div>

          <nav>
            <ul>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/clubs">Clubs</Link></li>
              <li><Link to="/login">Log In</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main style={{ padding: '100px 2rem 2rem' }}>
        <h1>Clubs</h1>
        <p>Clubs page - Coming soon</p>
      </main>
    </div>
  );
}
