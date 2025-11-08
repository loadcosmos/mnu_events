import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function OrganizerPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <header style={{
        padding: '1rem 2rem',
        backgroundColor: '#1a1a1a',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '700' }}>
          MNU Events
        </Link>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>Welcome, {user?.name || user?.email}</span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#d62e1f',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem' }}>
        <h1>Organizer Dashboard</h1>
        <p>This is a protected page. Only authenticated users can see this.</p>

        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}>
          <h2>Your Profile</h2>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role || 'User'}</p>
          <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#d62e1f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}>
              Create Event
            </button>
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}>
              View My Events
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
