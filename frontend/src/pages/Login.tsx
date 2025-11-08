import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import '../styles/auth.css';

type UserRole = 'student' | 'organizer';
type AuthMode = 'signin' | 'signup';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('student');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Sign In State
  const [signinData, setSigninData] = useState({ email: '', password: '' });

  // Sign Up State
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organizationName: '',
  });

  // Verification State
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(signinData);

      // Check role match
      if (role === 'organizer' && (response.user.role === 'ORGANIZER' || response.user.role === 'ADMIN')) {
        navigate('/organizer');
      } else if (role === 'student' && response.user.role === 'STUDENT') {
        navigate('/');
      } else {
        setError(`This account is not registered as a ${role}`);
        authService.logout();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email domain
    if (!signupData.email.endsWith('@kazguu.kz')) {
      setError('Registration is only available for @kazguu.kz email addresses');
      return;
    }

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: signupData.email,
        password: signupData.password,
        firstName: role === 'student' ? signupData.firstName : signupData.organizationName,
        lastName: role === 'student' ? signupData.lastName : 'Organization',
      });

      setPendingEmail(signupData.email);
      setIsVerifying(true);
      setSuccess('Verification code sent to your email');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sign up failed');
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

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setSuccess('');
    setSigninData({ email: '', password: '' });
    setSignupData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      organizationName: '',
    });
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    resetForm();
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-background" />

      {/* Auth Container */}
      <div className="auth-container">
        {!isVerifying && (
          <>
            {/* Role Toggle */}
            <div className="role-toggle-container">
              <div className="role-toggle">
                <button
                  className={`role-toggle-option ${role === 'student' ? 'active' : ''}`}
                  onClick={() => switchRole('student')}
                >
                  Students
                </button>
                <button
                  className={`role-toggle-option ${role === 'organizer' ? 'active' : ''}`}
                  onClick={() => switchRole('organizer')}
                >
                  Organizers
                </button>
              </div>
            </div>

            {/* Auth Header */}
            <div className="auth-header">
              <h1 className="auth-title">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h1>
              {role === 'organizer' && (
                <span className="auth-mode-label">(Admin Mode)</span>
              )}
              <p className="auth-subtitle">
                {mode === 'signin' ? (
                  role === 'student' ? (
                    'Please enter your student details to sign in'
                  ) : (
                    'Please enter your organizer credentials to sign in'
                  )
                ) : (
                  role === 'student' ? (
                    'Use your university email to join the community'
                  ) : (
                    'Register your club or department'
                  )
                )}
              </p>
            </div>

            {/* Form Tabs */}
            <div className="form-tabs">
              <button
                className={`form-tab ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => switchMode('signin')}
              >
                Sign In
              </button>
              <button
                className={`form-tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => switchMode('signup')}
              >
                Sign Up
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="error-message">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}
            {success && (
              <div className="success-message">
                <i className="fa-solid fa-circle-check"></i>
                {success}
              </div>
            )}

            {/* Sign In Form */}
            {mode === 'signin' && (
              <form className="auth-form" onSubmit={handleSignIn}>
                <div className="form-field">
                  <i className="fa-solid fa-envelope"></i>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="Enter your email"
                    value={signinData.email}
                    onChange={(e) => setSigninData({ ...signinData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Enter your password"
                    value={signinData.password}
                    onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <a href="#" className="auth-link forgot-password">
                  Forgot Your Password?
                </a>
              </form>
            )}

            {/* Sign Up Form */}
            {mode === 'signup' && (
              <form className="auth-form" onSubmit={handleSignUp}>
                {role === 'student' ? (
                  <>
                    <div className="form-field">
                      <i className="fa-solid fa-user"></i>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="First Name"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <i className="fa-solid fa-user"></i>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="Last Name"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-field">
                    <i className="fa-solid fa-building"></i>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Organization / Club Name"
                      value={signupData.organizationName}
                      onChange={(e) => setSignupData({ ...signupData, organizationName: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="form-field">
                  <i className="fa-solid fa-envelope"></i>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="user@kazguu.kz"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                  <p className="validation-hint">
                    Must use your @kazguu.kz university email
                  </p>
                </div>

                <div className="form-field">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Create password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Confirm password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
            )}
          </>
        )}

        {/* Email Verification Form */}
        {isVerifying && (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Verify Email</h1>
              <p className="auth-subtitle">
                Enter the 6-digit code sent to <strong>{pendingEmail}</strong>
              </p>
            </div>

            {error && (
              <div className="error-message">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                <i className="fa-solid fa-circle-check"></i>
                {success}
              </div>
            )}

            <form className="auth-form" onSubmit={handleVerify}>
              <div className="form-field">
                <i className="fa-solid fa-shield-halved"></i>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <a
                href="#"
                className="auth-link forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  setIsVerifying(false);
                  setMode('signin');
                }}
              >
                Back to Sign In
              </a>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
