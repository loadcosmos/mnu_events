import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import ClubsPage from './pages/ClubsPage.jsx';
import OrganizerPage from './pages/OrganizerPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';

/**
 * Главный компонент приложения
 * Настраивает роутинг и оборачивает приложение в AuthProvider
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/clubs" element={<ClubsPage />} />

          {/* Защищенные маршруты - требуют авторизации */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute>
                <OrganizerPage />
              </ProtectedRoute>
            }
          />

          {/* Защищенные маршруты для администратора */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['admin', 'super_admin']}>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          {/* Маршрут для логина администратора */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* 404 - не найдено */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

/**
 * Вложенные маршруты администратора
 */
function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/events" element={<AdminEvents />} />
      <Route path="/users" element={<AdminUsers />} />
      <Route path="/clubs" element={<AdminClubs />} />
      {/* Добавьте дополнительные административные маршруты */}
    </Routes>
  );
}

/**
 * Временные компоненты для административных страниц
 * TODO: Создать полноценные компоненты
 */
function AdminDashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel</p>
    </div>
  );
}

function AdminEvents() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Manage Events</h1>
      <p>Event management interface</p>
    </div>
  );
}

function AdminUsers() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Manage Users</h1>
      <p>User management interface</p>
    </div>
  );
}

function AdminClubs() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Manage Clubs</h1>
      <p>Club management interface</p>
    </div>
  );
}

/**
 * Страница 404 - Not Found
 */
function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
      }}>
        <h1 style={{
          fontSize: '72px',
          fontWeight: '700',
          color: '#d62e1f',
          marginBottom: '1rem',
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1a1a1a',
          marginBottom: '1rem',
        }}>
          Page Not Found
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '2rem',
        }}>
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            backgroundColor: '#d62e1f',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'background-color 0.2s',
          }}
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}

export default App;
