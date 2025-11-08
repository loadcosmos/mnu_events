import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/student.module.css';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: 'creativity' | 'service' | 'intelligence';
  points: number;
  imageUrl?: string;
  organizer: string;
  attendees: number;
}

type FilterType = 'all' | 'creativity' | 'service' | 'intelligence' | 'upcoming' | 'popular';

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

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/events?filter=${activeFilter}`,
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
      setEvents(data);

      // Set recommended events (first 5 for now)
      if (activeFilter === 'all') {
        setRecommendedEvents(data.slice(0, 5));
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
    const labels = {
      creativity: 'Creativity',
      service: 'Service',
      intelligence: 'Intelligence',
    };
    return labels[category as keyof typeof labels] || category;
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
                <div key={event.id} className={styles.eventCardHorizontal}>
                  <img
                    src={event.imageUrl || 'https://via.placeholder.com/320x180/d62e1f/ffffff?text=MNU+Event'}
                    alt={event.title}
                    className={styles.eventImageHorizontal}
                  />
                  <div className={styles.eventCardContent}>
                    <span className={`${styles.eventCategory} ${styles[event.category]}`}>
                      {getCategoryLabel(event.category)}
                    </span>
                    <h3 className={styles.eventCardTitle}>{event.title}</h3>
                    <div className={styles.eventMeta}>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-calendar"></i>
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.location}</span>
                      </div>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-star"></i>
                        <span>{event.points} CSI Points</span>
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
            className={`${styles.filterPill} ${activeFilter === 'creativity' ? styles.active : ''}`}
            onClick={() => handleFilterChange('creativity')}
          >
            <i className="fas fa-palette"></i> Creativity
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'service' ? styles.active : ''}`}
            onClick={() => handleFilterChange('service')}
          >
            <i className="fas fa-hands-helping"></i> Service
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'intelligence' ? styles.active : ''}`}
            onClick={() => handleFilterChange('intelligence')}
          >
            <i className="fas fa-brain"></i> Intelligence
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'upcoming' ? styles.active : ''}`}
            onClick={() => handleFilterChange('upcoming')}
          >
            <i className="fas fa-clock"></i> Upcoming
          </button>
          <button
            className={`${styles.filterPill} ${activeFilter === 'popular' ? styles.active : ''}`}
            onClick={() => handleFilterChange('popular')}
          >
            <i className="fas fa-fire"></i> Popular
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
                <div key={event.id} className={styles.eventCard}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={event.imageUrl || 'https://via.placeholder.com/400x200/d62e1f/ffffff?text=MNU+Event'}
                      alt={event.title}
                      className={styles.eventImage}
                    />
                    <div className={styles.eventPoints}>
                      <i className="fas fa-star"></i>
                      {event.points}
                    </div>
                  </div>
                  <div className={styles.eventCardContent}>
                    <span className={`${styles.eventCategory} ${styles[event.category]}`}>
                      {getCategoryLabel(event.category)}
                    </span>
                    <h3 className={styles.eventCardTitle}>{event.title}</h3>
                    <div className={styles.eventMeta}>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-calendar"></i>
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.location}</span>
                      </div>
                      <div className={styles.eventMetaItem}>
                        <i className="fas fa-users"></i>
                        <span>{event.attendees} attending</span>
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
