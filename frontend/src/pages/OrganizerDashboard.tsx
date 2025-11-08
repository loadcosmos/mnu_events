import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/organizer.module.css';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface DashboardStats {
  totalEvents: number;
  totalAttendees: number;
  activeEvents: number;
  avgRating: number;
}

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalAttendees: 0,
    activeEvents: 0,
    avgRating: 0,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch stats
      const statsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/organizer/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!statsResponse.ok) {
        if (statsResponse.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch stats');
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch events
      const eventsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/organizer/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events');
      }

      const eventsData = await eventsResponse.json();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className={styles.organizerPage}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>MNU Events</div>
          <span className={styles.sidebarBadge}>Organizer</span>
        </div>

        <nav className={styles.sidebarNav}>
          <a
            href="#"
            className={`${styles.navItem} ${activeNav === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveNav('dashboard')}
          >
            <i className="fas fa-th-large"></i>
            Dashboard
          </a>
          <a
            href="#"
            className={`${styles.navItem} ${activeNav === 'events' ? styles.active : ''}`}
            onClick={() => setActiveNav('events')}
          >
            <i className="fas fa-calendar-alt"></i>
            Events
          </a>
          <a
            href="#"
            className={`${styles.navItem} ${activeNav === 'attendees' ? styles.active : ''}`}
            onClick={() => setActiveNav('attendees')}
          >
            <i className="fas fa-users"></i>
            Attendees
          </a>
          <a
            href="#"
            className={`${styles.navItem} ${activeNav === 'checkin' ? styles.active : ''}`}
            onClick={() => setActiveNav('checkin')}
          >
            <i className="fas fa-qrcode"></i>
            Check-in
          </a>
          <a
            href="#"
            className={`${styles.navItem} ${activeNav === 'analytics' ? styles.active : ''}`}
            onClick={() => setActiveNav('analytics')}
          >
            <i className="fas fa-chart-line"></i>
            Analytics
          </a>
          <a
            href="#"
            className={`${styles.navItem} ${activeNav === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveNav('settings')}
          >
            <i className="fas fa-cog"></i>
            Settings
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <img
              src="https://ui-avatars.com/api/?name=Organizer&background=d62e1f&color=fff"
              alt="Profile"
              className={styles.userAvatar}
            />
            <div className={styles.userInfo}>
              <p className={styles.userName}>Organizer</p>
              <p className={styles.userRole}>Admin</p>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <div className={styles.topBarActions}>
            <div className={styles.searchBar}>
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search events..." />
            </div>
            <button className={styles.createEventBtn}>
              <i className="fas fa-plus"></i>
              Create Event
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={`${styles.kpiIcon} ${styles.primary}`}>
                <i className="fas fa-calendar-check"></i>
              </div>
              <span className={styles.kpiLabel}>Total Events</span>
            </div>
            <h2 className={styles.kpiValue}>{stats.totalEvents}</h2>
            <div className={`${styles.kpiTrend} ${styles.up}`}>
              <i className="fas fa-arrow-up"></i>
              <span>12% from last month</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={`${styles.kpiIcon} ${styles.success}`}>
                <i className="fas fa-users"></i>
              </div>
              <span className={styles.kpiLabel}>Total Attendees</span>
            </div>
            <h2 className={styles.kpiValue}>{stats.totalAttendees}</h2>
            <div className={`${styles.kpiTrend} ${styles.up}`}>
              <i className="fas fa-arrow-up"></i>
              <span>8% from last month</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={`${styles.kpiIcon} ${styles.info}`}>
                <i className="fas fa-play-circle"></i>
              </div>
              <span className={styles.kpiLabel}>Active Events</span>
            </div>
            <h2 className={styles.kpiValue}>{stats.activeEvents}</h2>
            <div className={`${styles.kpiTrend} ${styles.up}`}>
              <i className="fas fa-arrow-up"></i>
              <span>3 ongoing now</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={`${styles.kpiIcon} ${styles.warning}`}>
                <i className="fas fa-star"></i>
              </div>
              <span className={styles.kpiLabel}>Avg Rating</span>
            </div>
            <h2 className={styles.kpiValue}>{stats.avgRating.toFixed(1)}</h2>
            <div className={`${styles.kpiTrend} ${styles.up}`}>
              <i className="fas fa-arrow-up"></i>
              <span>0.3 from last month</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Event Attendance Overview</h3>
            <div className={styles.chartFilters}>
              <button className={`${styles.chartFilter} ${styles.active}`}>7 Days</button>
              <button className={styles.chartFilter}>30 Days</button>
              <button className={styles.chartFilter}>3 Months</button>
            </div>
          </div>
          <div className={styles.chartPlaceholder}>
            <div style={{ textAlign: 'center' }}>
              <i className="fas fa-chart-bar" style={{ fontSize: '3rem', color: '#d62e1f', marginBottom: '1rem' }}></i>
              <p>Chart visualization will be displayed here</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Install recharts library for interactive charts
              </p>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className={styles.eventsTable}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Recent Events</h3>
            <a href="#" className={styles.viewAllBtn}>
              View All <i className="fas fa-arrow-right"></i>
            </a>
          </div>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
              <p style={{ marginTop: '1rem' }}>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <i className="fas fa-calendar-times" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
              <p>No events found</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Attendees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className={styles.eventTitle}>{event.title}</div>
                    </td>
                    <td>
                      <div className={styles.eventDate}>{formatDate(event.date)}</div>
                    </td>
                    <td>{event.location}</td>
                    <td>{event.attendees}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[event.status]}`}>{event.status}</span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button className={styles.actionBtn} title="Edit">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className={styles.actionBtn} title="View Details">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className={styles.actionBtn} title="Delete">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default OrganizerDashboard;
