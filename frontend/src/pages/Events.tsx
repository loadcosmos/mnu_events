import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsService, Event } from '../services/events.service';
import { registrationsService } from '../services/registrations.service';
import { authService } from '../services/auth.service';
import { format } from 'date-fns';
import '../styles/main.css';
import '../styles/events.css';

const CATEGORIES = ['All', 'Creativity', 'Service', 'Intelligence'];

const CSI_ALIASES: Record<string, string> = {
  academic: 'intelligence',
  science: 'intelligence',
  volunteering: 'service',
  social: 'service',
  arts: 'creativity',
  ACADEMIC: 'intelligence',
  TECH: 'intelligence',
  SPORTS: 'service',
  CULTURAL: 'creativity',
};

function normalizeCSI(category: string): string[] {
  const cat = category.toLowerCase();
  const normalized = CSI_ALIASES[cat] || cat;
  const keep = ['creativity', 'service', 'intelligence'];
  return keep.includes(normalized) ? [normalized] : [];
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, searchQuery]);

  const loadEvents = async () => {
    try {
      const data = await eventsService.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((event) => {
        const cats = normalizeCSI(event.category);
        return cats.includes(selectedCategory.toLowerCase());
      });
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    setFilteredEvents(filtered);
  };

  const handleRegister = async () => {
    if (!selectedEvent) return;

    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    setIsRegistering(true);
    try {
      await registrationsService.register(selectedEvent.id);
      alert('Successfully registered for event!');
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="ev-body">
      {/* Header */}
      <header className="header header-black visible">
        <div className="header-inner">
          <div className="left-section">
            <button type="button" className="icon-arw">
              ENG <i className="fa-solid fa-chevron-down"></i>
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

      {/* Main Content */}
      <main className="ev-container">
        {/* Search */}
        <div className="ev-search ev-search--header">
          <i className="fa-solid fa-magnifying-glass ev-search__icon"></i>
          <input
            className="ev-search__input"
            type="search"
            placeholder="Search events, venues, clubs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Chips */}
        <section className="ev-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`ev-chip ${selectedCategory === cat ? 'is-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Events Grid */}
        {loading ? (
          <p className="ev-empty">Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <p className="ev-empty">No events found</p>
        ) : (
          <section className="ev-grid">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => {
                  setSelectedEvent(event);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </section>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setIsModalOpen(false)}
          onRegister={handleRegister}
          isRegistering={isRegistering}
        />
      )}
    </div>
  );
}

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const cats = normalizeCSI(event.category);
  const eventDate = format(new Date(event.startDate), 'dd MMM');
  const eventTime = format(new Date(event.startDate), 'HH:mm');

  return (
    <div className="ev-card" onClick={onClick} role="button" tabIndex={0}>
      <img
        className="ev-card__img"
        src={event.imageUrl || '/images/event.png'}
        alt={event.title}
        loading="lazy"
      />
      <div className="ev-card__body">
        <h3 className="ev-card__title">{event.title}</h3>
        {cats.length > 0 && (
          <div className="csi-pills">
            {cats.map((c) => (
              <span key={c} className={`csi-pill csi--${c}`}>
                {titleCase(c)}
              </span>
            ))}
          </div>
        )}
        <p className="ev-card__short">{event.description.substring(0, 100)}...</p>
        <ul className="ev-card__meta">
          <li>
            <i className="fa-regular fa-calendar"></i> {eventDate} · {eventTime}
          </li>
          <li>
            <i className="fa-solid fa-location-dot"></i> {event.location}
          </li>
          <li>
            <i className="fa-solid fa-users"></i> {event.creator.firstName} {event.creator.lastName}
          </li>
        </ul>
        <button className="ev-card__btn" type="button">
          View Details
        </button>
      </div>
    </div>
  );
}

function EventModal({
  event,
  onClose,
  onRegister,
  isRegistering,
}: {
  event: Event;
  onClose: () => void;
  onRegister: () => void;
  isRegistering: boolean;
}) {
  const cats = normalizeCSI(event.category);
  const eventDate = format(new Date(event.startDate), 'dd MMMM yyyy');
  const eventTime = format(new Date(event.startDate), 'HH:mm');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  return (
    <div className="ev-modal" role="dialog" aria-modal="true">
      <div className="ev-modal__backdrop" onClick={onClose}></div>

      <article className="ev-modal__content">
        <button className="ev-modal__close" onClick={onClose} aria-label="Close">
          <i className="fa-solid fa-xmark"></i>
        </button>

        <img
          className="ev-md__hero"
          src={event.imageUrl || '/images/event.png'}
          alt={event.title}
        />

        <div className="ev-md__scroll">
          <div className="ev-md__body">
            <div className="ev-md__top">
              <h2 className="ev-md__title">{event.title}</h2>
              {cats.length > 0 && (
                <div className="csi-pills">
                  {cats.map((c) => (
                    <span key={c} className={`csi-pill csi--${c}`}>
                      {titleCase(c)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="ev-md__desc">{event.description}</p>

            <ul className="ev-md__meta">
              <li>
                <i className="fa-regular fa-calendar"></i> {eventDate} · {eventTime}
              </li>
              <li>
                <i className="fa-solid fa-location-dot"></i> {event.location}
              </li>
              <li>
                <i className="fa-solid fa-users"></i> {event.creator.firstName} {event.creator.lastName}
              </li>
              <li>
                <i className="fa-solid fa-ticket"></i> Capacity: {event.capacity}
              </li>
            </ul>
          </div>

          <div className="ev-md__footer">
            <button
              className="ev-join"
              type="button"
              onClick={onRegister}
              disabled={isRegistering}
            >
              {isRegistering ? 'Joining...' : 'Join Event'}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
