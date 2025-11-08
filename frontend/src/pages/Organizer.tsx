import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsService, CreateEventDto } from '../services/events.service';
import { authService } from '../services/auth.service';
import '../styles/organizer.css';
import '../styles/add_event.css';

type Page = 'home' | 'create' | 'events' | 'profile';

export default function Organizer() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="organizer-wrapper">
      <Sidebar currentPage={currentPage} onSelectPage={setCurrentPage} onLogout={handleLogout} />
      <main className="main-section">
        {currentPage === 'home' && <OrganizerHome />}
        {currentPage === 'create' && <CreateEvent />}
        {currentPage === 'events' && <MyEvents />}
        {currentPage === 'profile' && <Profile />}
      </main>
    </div>
  );
}

function Sidebar({
  currentPage,
  onSelectPage,
  onLogout,
}: {
  currentPage: Page;
  onSelectPage: (page: Page) => void;
  onLogout: () => void;
}) {
  const menu = [
    { id: 'home' as Page, label: 'Recommendations', icon: 'fa-lightbulb' },
    { id: 'create' as Page, label: 'Add Event', icon: 'fa-plus' },
    { id: 'events' as Page, label: 'My Events', icon: 'fa-calendar-days' },
    { id: 'profile' as Page, label: 'Profile', icon: 'fa-user' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/images/logo.png" alt="MNU Events" />
        <h2 className="slider-title">Event Organizer</h2>
      </div>

      <nav className="sidebar-menu">
        {menu.map((item) => (
          <button
            key={item.id}
            className={`menu-btn ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onSelectPage(item.id)}
          >
            <i className={`fa-solid ${item.icon}`}></i> {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <i className="fa-solid fa-right-from-bracket"></i> Log Out
        </button>
      </div>
    </aside>
  );
}

function OrganizerHome() {
  return (
    <div className="page-content">
      <h1>Recommendations</h1>
      <p>Check out the activities of other clubs for inspiration and collaborations!</p>
    </div>
  );
}

function CreateEvent() {
  const [form, setForm] = useState<CreateEventDto>({
    title: '',
    description: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    capacity: 0,
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await eventsService.create(form);
      setSuccess('Event created successfully!');
      setForm({
        title: '',
        description: '',
        category: '',
        location: '',
        startDate: '',
        endDate: '',
        capacity: 0,
        imageUrl: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the form?')) {
      setForm({
        title: '',
        description: '',
        category: '',
        location: '',
        startDate: '',
        endDate: '',
        capacity: 0,
        imageUrl: '',
      });
    }
  };

  return (
    <div className="page-content">
      <h1>Add Event or Lecture</h1>

      {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: '#10b981', marginBottom: '1rem' }}>{success}</div>}

      <form className="event-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Enter event title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <div className="datetime-row">
          <input
            type="datetime-local"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />
          <input
            type="datetime-local"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={form.capacity}
          onChange={handleChange}
          required
        />

        <div className="dropdown-row">
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="" disabled>
              Select category
            </option>
            <option value="ACADEMIC">Academic / Intelligence</option>
            <option value="SPORTS">Sports / Service</option>
            <option value="CULTURAL">Cultural / Creativity</option>
            <option value="TECH">Tech / Intelligence</option>
            <option value="SOCIAL">Social / Service</option>
            <option value="CAREER">Career</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL (optional)"
          value={form.imageUrl}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        ></textarea>

        <div className="button-row">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Submit'}
          </button>
          <button type="button" className="reset-btn" onClick={handleReset}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function MyEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventsService.getMyEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventsService.delete(id);
      setEvents(events.filter((e) => e.id !== id));
    } catch (error) {
      alert('Failed to delete event');
    }
  };

  return (
    <div className="page-content">
      <h1>My Events</h1>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events yet. Create your first event!</p>
      ) : (
        <table className="events-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Category</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{new Date(event.startDate).toLocaleDateString()}</td>
                <td>{event.category}</td>
                <td>{event.capacity}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(event.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Profile() {
  const user = authService.getUser();

  return (
    <div className="page-content">
      <h1>Account Settings</h1>
      <div className="profile-card">
        <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>Basic info</div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#6b7280', fontSize: 14, display: 'block', marginBottom: 6 }}>
              Name
            </label>
            <p style={{ fontSize: 16, fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#6b7280', fontSize: 14, display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <p>{user?.email}</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#6b7280', fontSize: 14, display: 'block', marginBottom: 6 }}>
              Role
            </label>
            <p>{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
