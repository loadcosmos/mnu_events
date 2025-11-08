import { Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth.service';

// Pages
import Login from './pages/Login';
import Events from './pages/Events';
import Clubs from './pages/Clubs';
import Organizer from './pages/Organizer';
import Home from './pages/Home';

// Protected route wrapper
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const isAuth = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/events" element={<Events />} />
      <Route path="/clubs" element={<Clubs />} />

      {/* Protected routes */}
      <Route
        path="/organizer/*"
        element={
          <ProtectedRoute requiredRole="ORGANIZER">
            <Organizer />
          </ProtectedRoute>
        }
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
