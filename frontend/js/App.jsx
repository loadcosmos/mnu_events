import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import OrganizerLayout from './components/OrganizerLayout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import ModeratorLayout from './components/ModeratorLayout.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { Toaster } from './components/ui/sonner.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePageNew.jsx'; // Updated to new version with tabs
import EventsPage from './pages/EventsPage.jsx';
import EventDetailsPage from './pages/EventDetailsPage.jsx';
import MyRegistrationsPage from './pages/MyRegistrationsPage.jsx';
import ClubsPage from './pages/ClubsPage.jsx';
import ClubDetailsPage from './pages/ClubDetailsPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import TutoringPage from './pages/TutoringPage.jsx';
import ServiceDetailsPage from './pages/ServiceDetailsPage.jsx';
import OrganizerPage from './pages/OrganizerPage.jsx';
import OrganizerScannerPage from './pages/OrganizerScannerPage.jsx';
import OrganizerAnalyticsPage from './pages/OrganizerAnalyticsPage.jsx';
import EventQRDisplayPage from './pages/EventQRDisplayPage.jsx';
import StudentScannerPage from './pages/StudentScannerPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import CreateEventPage from './pages/CreateEventPage.jsx';
import EditEventPage from './pages/EditEventPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminEventsPage from './pages/AdminEventsPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminClubsPage from './pages/AdminClubsPage.jsx';
import PricingSettingsPage from './pages/PricingSettingsPage.jsx';
import MockPaymentPage from './pages/MockPaymentPage.jsx';
import ModerationQueuePage from './pages/ModerationQueuePage.jsx';
import ModeratorDashboardPage from './pages/ModeratorDashboardPage.jsx';
import CsiDashboardPage from './pages/CsiDashboardPage.jsx';

/**
 * Главный компонент приложения
 * Настраивает роутинг и оборачивает приложение в ThemeProvider и AuthProvider
 */
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Routes>
            {/* Публичные маршруты без Layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/mock-payment/:transactionId" element={<MockPaymentPage />} />

            {/* Публичные маршруты с Layout */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/events" element={<Layout><EventsPage /></Layout>} />
            <Route path="/events/:id" element={<Layout><EventDetailsPage /></Layout>} />
            <Route path="/clubs" element={<Layout><ClubsPage /></Layout>} />
            <Route path="/clubs/:id" element={<Layout><ClubDetailsPage /></Layout>} />

            {/* Services & Tutoring (Phase 3) */}
            <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
            <Route path="/tutoring" element={<Layout><TutoringPage /></Layout>} />
            <Route path="/services/:id" element={<Layout><ServiceDetailsPage /></Layout>} />

            {/* Защищенные маршруты для организаторов - требуют роль ORGANIZER */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute roles={['ORGANIZER']}>
                  <OrganizerLayout><OrganizerPage /></OrganizerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/create-event"
              element={
                <ProtectedRoute roles={['ORGANIZER']}>
                  <OrganizerLayout><CreateEventPage /></OrganizerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/:id/edit"
              element={
                <ProtectedRoute roles={['ORGANIZER']}>
                  <OrganizerLayout><EditEventPage /></OrganizerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/scanner/:eventId"
              element={
                <ProtectedRoute roles={['ORGANIZER']}>
                  <OrganizerScannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/event-qr/:eventId"
              element={
                <ProtectedRoute roles={['ORGANIZER']}>
                  <EventQRDisplayPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/analytics"
              element={
                <ProtectedRoute roles={['ORGANIZER']}>
                  <OrganizerLayout><OrganizerAnalyticsPage /></OrganizerLayout>
                </ProtectedRoute>
              }
            />

            {/* Защищенные маршруты для студентов - требуют роль STUDENT */}
            <Route
              path="/registrations"
              element={
                <ProtectedRoute roles={['STUDENT']}>
                  <Layout><MyRegistrationsPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/csi-dashboard"
              element={
                <ProtectedRoute roles={['STUDENT']}>
                  <Layout><CsiDashboardPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/scan-event"
              element={
                <ProtectedRoute roles={['STUDENT']}>
                  <StudentScannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout><ProfilePage /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Защищенные маршруты для модераторов - требуют роль MODERATOR */}
            <Route
              path="/moderator/*"
              element={
                <ProtectedRoute roles={['MODERATOR']}>
                  <ModeratorLayout><ModeratorRoutes /></ModeratorLayout>
                </ProtectedRoute>
              }
            />

            {/* Защищенные маршруты для администратора - требуют роль ADMIN */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminLayout><AdminRoutes /></AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 - не найдено */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

/**
 * Вложенные маршруты модератора
 */
function ModeratorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ModeratorDashboardPage />} />
      <Route path="/queue" element={<ModerationQueuePage />} />
    </Routes>
  );
}

/**
 * Вложенные маршруты администратора
 */
function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboardPage />} />
      <Route path="/events" element={<AdminEventsPage />} />
      <Route path="/users" element={<AdminUsersPage />} />
      <Route path="/clubs" element={<AdminClubsPage />} />
      <Route path="/pricing" element={<PricingSettingsPage />} />
    </Routes>
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
