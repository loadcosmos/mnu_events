import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentHome from './pages/StudentHome';
import OrganizerDashboard from './pages/OrganizerDashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<StudentHome />} />
      <Route path="/organizer" element={<OrganizerDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
