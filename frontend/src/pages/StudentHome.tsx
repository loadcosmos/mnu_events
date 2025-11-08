import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/student.module.css';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  location: string;
  category: 'ACADEMIC' | 'SPORTS' | 'CULTURAL' | 'TECH' | 'SOCIAL' | 'CAREER' | 'OTHER';
  imageUrl?: string;
  creator: {
    firstName: string;
    lastName: string;
  };
  _count?: {
    registrations: number;
  };
}

type FilterType = 'all' | 'ACADEMIC' | 'SPORTS' | 'CULTURAL' | 'TECH' | 'SOCIAL' | 'CAREER' | 'upcoming';

function StudentHome() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [activeFilter]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Build query params
      const params = new URLSearchParams();
      params.append('limit', '50'); // Get more events

      if (activeFilter !== 'all' && activeFilter !== 'upcoming') {
        params.append('category', activeFilter);
      }

      if (activeFilter === 'upcoming') {
        params.append('status', 'UPCOMING');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/events?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      const eventsList = data.data || data; // Handle both paginated and simple response
      setEvents(eventsList);

      // Set recommended events (first 5 for now)
      if (activeFilter === 'all') {
        setRecommendedEvents(eventsList.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleEventClick = (eventId: string) => {
    // TODO: Navigate to event details page
    console.log('Event clicked:', eventId);
    // navigate(`/events/${eventId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ACADEMIC: 'Academic',
      SPORTS: 'Sports',
      CULTURAL: 'Cultural',
      TECH: 'Tech',
      SOCIAL: 'Social',
      CAREER: 'Career',
      OTHER: 'Other',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    // Map categories to CSI-like colors
    const colors: Record<string, string> = {
      ACADEMIC: 'intelligence', // Green
      TECH: 'intelligence', // Green
      SPORTS: 'creativity', // Orange
      CULTURAL: 'creativity', // Orange
      SOCIAL: 'service', // Blue
      CAREER: 'service', // Blue
      OTHER: 'service', // Blue
    };
    return colors[category] || 'service';
  };

  return (
    <div className={styles.studentPage}>
      <div className={styles.backgroundEffect}></div>

      {/* Top Navigation */}
      <nav className={styles.topNav}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>MNU Events</div>
          <div className={styles.navActions}>
            <button className={`${styles.navButton} ${styles.active}`} title="Home">
              <i className="fas fa-home"></i>
            </button>
            <button className={styles.navButton} title="Calendar">
              <i className="fas fa-calendar"></i>
            </button>
            <button className={styles.navButton} title="My Tickets">
              <i className="fas fa-ticket-alt"></i>
            </button>
            <button className={styles.navButton} title="Notifications">
              <i className="fas fa-bell"></i>
            </button>
            <button className={styles.navButton} onClick={handleLogout} title="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
            <img
              src="https://ui-avatars.com/api/?name=Student&background=d62e1f&color=fff"
              alt="Profile"
              className={styles.profilePic}
            />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className={styles.contentWrapper}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Discover Amazing Events</h1>
            <p className={styles.heroSubtitle}>
              Join exciting events, earn CSI points, and make unforgettable memories at MNU
            </p>
            <button className={styles.heroCTA}>
              <i className="fas fa-compass"></i>
              Explore Events
            </button>
          </div>
        </section>

        {/* Recommendations Section */}
        {recommendedEvents.length > 0 && (
          <section className={styles.recommendationsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recommended For You</h2>
              <a href="#" className={styles.viewAllLink}>
                View All <i className="fas fa-arrow-right"></i>
              </a>
            </div>
            <div className={styles.scrollContainer}>
              {recommendedEvents.map((event) => (
                <div
                  key={event.id}
                  className={styles.eventCardHorizontal}
                  onClick={() => handleEventClick(event.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={event.imageUrl || 'https://via.placeholder.com/320x180/d62e1f/ffffff?text=MNU+Event'}
                    alt={event.title}
                    className={styles.eventImageHorizontal}
                  />
                  <div className={styles.eventCardContent}>
                    <span className={`${styles.eventCategory} ${styles[getCategoryColor(event.category)]}`}>
                      {getCategoryLabel(event.category)}
                    </span>
                    <h3 className={styles.eventCardTitle}>{event.title}</h3>
                    <div className={styles.eventMeta}>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-calendar"></i>
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.location}</span>
                      </div>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-users"></i>
                        <span>{event._count?.registrations || 0} attending</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <section className={styles.filtersSection}>
          <button
            className={`${styles.filterPill} ${activeFilter === 'all' ? styles.active : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All Events
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'ACADEMIC' ? styles.active : ''}`}
            onClick={() => handleFilterChange('ACADEMIC')}
          >
            <i className="fas fa-book"></i> Academic
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'TECH' ? styles.active : ''}`}
            onClick={() => handleFilterChange('TECH')}
          >
            <i className="fas fa-laptop-code"></i> Tech
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'SPORTS' ? styles.active : ''}`}
            onClick={() => handleFilterChange('SPORTS')}
          >
            <i className="fas fa-futbol"></i> Sports
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'CULTURAL' ? styles.active : ''}`}
            onClick={() => handleFilterChange('CULTURAL')}
          >
            <i className="fas fa-palette"></i> Cultural
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'SOCIAL' ? styles.active : ''}`}
            onClick={() => handleFilterChange('SOCIAL')}
          >
            <i className="fas fa-users"></i> Social
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'CAREER' ? styles.active : ''}`}
            onClick={() => handleFilterChange('CAREER')}
          >
            <i className="fas fa-briefcase"></i> Career
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'upcoming' ? styles.active : ''}`}
            onClick={() => handleFilterChange('upcoming')}
          >
            <i className="fas fa-clock"></i> Upcoming
          </button>
        </section>

        {/* Events Grid */}
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>All Events</h2>
          </div>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
              <p style={{ marginTop: '1rem' }}>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)' }}>
              <i className="fas fa-calendar-times" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
              <p>No events found</p>
            </div>
          ) : (
            <div className={styles.eventsGrid}>
              {events.map((event) => (
                <div
                  key={event.id}
                  className={styles.eventCard}
                  onClick={() => handleEventClick(event.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={event.imageUrl || 'https://via.placeholder.com/400x200/d62e1f/ffffff?text=MNU+Event'}
                      alt={event.title}
                      className={styles.eventImage}
                    />
                    <div className={styles.eventPoints}>
                      <i className="fas fa-users"></i>
                      {event._count?.registrations || 0}
                    </div>
                  </div>
                  <div className={styles.eventCardContent}>
                    <span className={`${styles.eventCategory} ${styles[getCategoryColor(event.category)]}`}>
                      {getCategoryLabel(event.category)}
                    </span>
                    <h3 className={styles.eventCardTitle}>{event.title}</h3>
                    <div className={styles.eventMeta}>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-calendar"></i>
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.location}</span>
                      </div>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-user"></i>
                        <span>{event.creator.firstName} {event.creator.lastName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default StudentHome;
