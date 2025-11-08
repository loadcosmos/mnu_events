import React from 'react';
import { Link } from 'react-router-dom';

export default function EventsPage() {
  return (
    <div className="ev-body">
      {/* HEADER */}
      <header className="header header-black visible" id="pageHeader">
        <div className="header-inner">
          <div className="left-section lang-wrap">
            <button type="button" className="icon-arw" id="langBtn">
              ENG <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
            <div className="dropdown-menu" id="langMenu">
              <button className="active" data-lang="ENG">ENG</button>
              <button data-lang="РУС">РУС</button>
              <button data-lang="ҚАЗ">ҚАЗ</button>
            </div>
          </div>

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

      {/* MAIN */}
      <main className="ev-container">
        <div className="ev-search ev-search--header" id="evSearchBox">
          <i className="fa-solid fa-magnifying-glass ev-search__icon" aria-hidden="true"></i>
          <input
            id="evSearch"
            className="ev-search__input"
            type="search"
            placeholder="Search events, venues, clubs"
            aria-label="Search"
          />
        </div>

        <section id="evChips" className="ev-chips" aria-label="Event categories"></section>
        <section id="evGrid" className="ev-grid" aria-live="polite"></section>
        <p id="evEmpty" className="ev-empty" hidden>No events found</p>
      </main>
    </div>
  );
}
