import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.css';
import '../styles/hero.css';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('ENG');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* Transparent Header */}
      <header className="header header-transparent">
        <div className="header-inner">
          <div className="left-section lang-wrap">
            <button
              type="button"
              className="icon-arw"
              onMouseEnter={() => setIsLangOpen(true)}
              onMouseLeave={() => setIsLangOpen(false)}
            >
              {selectedLang} <i className="fa-solid fa-chevron-down"></i>
            </button>
            {isLangOpen && (
              <div
                className="dropdown-menu show"
                onMouseEnter={() => setIsLangOpen(true)}
                onMouseLeave={() => setIsLangOpen(false)}
              >
                <button
                  className={selectedLang === 'ENG' ? 'active' : ''}
                  onClick={() => setSelectedLang('ENG')}
                >
                  ENG
                </button>
                <button
                  className={selectedLang === 'РУС' ? 'active' : ''}
                  onClick={() => setSelectedLang('РУС')}
                >
                  РУС
                </button>
                <button
                  className={selectedLang === 'ҚАЗ' ? 'active' : ''}
                  onClick={() => setSelectedLang('ҚАЗ')}
                >
                  ҚАЗ
                </button>
              </div>
            )}
          </div>

          <div className="logo">
            <Link to="/">
              <img src="/images/logo.png" alt="MNU Events" />
            </Link>
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

      {/* Black Fixed Header */}
      <header className={`header header-black ${isScrolled ? 'visible' : ''}`}>
        <div className="header-inner">
          <div className="left-section lang-wrap">
            <button type="button" className="icon-arw">
              {selectedLang} <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>

          <div className="logo">
            <Link to="/">
              <img src="/images/logo.png" alt="MNU Events" />
            </Link>
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

      {/* Hero Section */}
      <section className="about-section">
        <h1>Welcome to MNU Events</h1>
        <p>
          Discover exciting events and activities at Maqsut Narikbayev University.
          Join clubs, attend workshops, and connect with your peers.
        </p>
        <Link to="/events" className="btn">
          Explore Events
        </Link>
      </section>
    </div>
  );
}
