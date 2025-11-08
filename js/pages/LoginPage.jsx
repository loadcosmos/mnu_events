import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [showSignup, setShowSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  // Путь для редиректа после успешной авторизации
  const from = location.state?.from?.pathname || '/';

  // Обработка изменения полей формы
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Очищаем ошибку при вводе
  };

  // Обработка Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login({
        email: formData.email,
        password: formData.password,
      });

      // Успешная авторизация - редирект
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Обработка Sign Up
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    // Проверка email на @kazguu.kz
    if (!formData.email.endsWith('@kazguu.kz')) {
      setError('Please use your @kazguu.kz email');
      return;
    }

    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      // Успешная регистрация - редирект
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Белая кнопка "Админ" в правом верхнем углу */}
      <Link
        to="/admin/login"
        className="role-switch"
        title="Войти как админ"
        style={{
          position: 'fixed',
          top: 16,
          right: 20,
          background: '#fff',
          color: '#d62e1f',
          border: '1px solid rgba(0,0,0,.06)',
          borderRadius: 9999,
          padding: '8px 14px',
          fontWeight: 800,
          fontSize: 14,
          lineHeight: 1,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(16,24,40,.12)',
          zIndex: 2000,
        }}
      >
        Админ
      </Link>

      {/* HEADER */}
      <header className="header container">
        <div className="left-section"></div>

        <div className="logo">
          <Link to="/">
            <img src="/images/logo.png" alt="MNU Events" />
          </Link>
        </div>
      </header>

      {/* LOGIN / SIGNUP CONTAINER */}
      <div className="login-container">
        {/* Показ ошибок */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#d62e1f',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {!showSignup && (
          <div className="login-form" id="loginForm">
            <h2>Welcome Back</h2>

            <div className="form-message-container">
              <span>Please enter your details to sign in</span>
            </div>

            <form className="form-text" onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
              <a href="#">Forgot Your Password?</a>
            </form>

            <p>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setShowSignup(true); setError(''); }}>
                Sign Up
              </a>
            </p>
          </div>
        )}

        {/* SIGNUP FORM */}
        {showSignup && (
          <div className="signup-form" id="signupForm">
            <h2>Create Account</h2>

            <div className="form-message-container">
              <span>Register with your @kazguu.kz account</span>
            </div>

            <form onSubmit={handleSignup}>
              <input
                type="email"
                name="email"
                placeholder="user@kazguu.kz"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>

            <p>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setShowSignup(false); setError(''); }}>
                Sign In
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
