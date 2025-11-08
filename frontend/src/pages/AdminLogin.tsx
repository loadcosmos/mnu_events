import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import '../styles/style.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(loginData);

      // Check if user is organizer or admin
      if (response.user.role === 'ORGANIZER' || response.user.role === 'ADMIN') {
        navigate('/organizer');
      } else {
        setError('You must be an organizer or admin to access this area');
        authService.logout();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <a className="role-switch" href="/login" title="Back to Students">
        Students
      </a>

      <header className="header container">
        <div className="left-section"></div>
        <div className="logo">
          <a href="/">
            <img src="/images/logo.png" alt="MNU Events" />
          </a>
        </div>
      </header>

      <div className="login-container">
        <div className="login-form" id="loginForm">
          <h2>Welcome Back</h2>
          <h4>
            <span style={{ opacity: 0.85, fontWeight: 600, textAlign: 'center' }}>
              (Admin Mode)
            </span>
          </h4>

          <div className="form-message-container">
            <span>Please enter your organizer credentials to sign in</span>
          </div>

          {error && <p style={{ color: '#ff4444', textAlign: 'center' }}>{error}</p>}

          <form className="form-text" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="official@kazguu.kz"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <a href="#">Forgot Your Password?</a>
          </form>
        </div>
      </div>
    </div>
  );
}
