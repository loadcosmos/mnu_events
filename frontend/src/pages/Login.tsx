import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import '../styles/style.css';

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Signup form
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  // Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(loginData);
      navigate('/events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!signupData.email.endsWith('@kazguu.kz')) {
      setError('Please use your @kazguu.kz email');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: signupData.email,
        password: signupData.password,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
      });

      setPendingEmail(signupData.email);
      setIsVerifying(true);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.verifyEmail({
        email: pendingEmail,
        code: verificationCode,
      });
      navigate('/events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <a
        className="role-switch"
        href="/admin-login"
        title="Войти как админ"
      >
        Admin
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
        {/* Verification Form */}
        {isVerifying && (
          <div className="login-form">
            <h2>Verify Email</h2>
            <div className="form-message-container">
              <span>Enter the 6-digit code sent to {pendingEmail}</span>
            </div>
            {error && <p style={{ color: '#ff4444', textAlign: 'center' }}>{error}</p>}
            <form className="form-text" onSubmit={handleVerify}>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify'}
              </button>
              <a href="#" onClick={() => setIsVerifying(false)}>
                Back to login
              </a>
            </form>
          </div>
        )}

        {/* Login Form */}
        {!isSignup && !isVerifying && (
          <div className="login-form" id="loginForm">
            <h2>Welcome Back</h2>
            <div className="form-message-container">
              <span>Please enter your details to sign in</span>
            </div>
            {error && <p style={{ color: '#ff4444', textAlign: 'center' }}>{error}</p>}
            <form className="form-text" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Enter your email"
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
            <p>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(true); }}>
                Sign Up
              </a>
            </p>
          </div>
        )}

        {/* Signup Form */}
        {isSignup && !isVerifying && (
          <div className="signup-form" id="signupForm">
            <h2>Create Account</h2>
            <div className="form-message-container">
              <span>Register with your @kazguu.kz account</span>
            </div>
            {error && <p style={{ color: '#ff4444', textAlign: 'center' }}>{error}</p>}
            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="First Name"
                value={signupData.firstName}
                onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={signupData.lastName}
                onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="user@kazguu.kz"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Create password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
            <p>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(false); setError(''); }}>
                Sign In
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
