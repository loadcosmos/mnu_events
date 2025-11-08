import { useState, FormEvent } from 'react';
import styles from '../styles/auth.module.css';

type Role = 'student' | 'organizer';
type FormMode = 'signin' | 'signup';

interface FormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
}

function Login() {
  const [role, setRole] = useState<Role>('student');
  const [formMode, setFormMode] = useState<FormMode>('signin');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      organizationName: '',
    });
  };

  const handleFormModeChange = (mode: FormMode) => {
    setFormMode(mode);
    setError('');
    setSuccess('');
  };

  const validateEmail = (email: string): boolean => {
    if (role === 'student' && !email.endsWith('@kazguu.kz')) {
      setError('Students must use @kazguu.kz email domain');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!validateEmail(formData.email)) return;

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formMode === 'signup') {
      if (role === 'student' && (!formData.firstName || !formData.lastName)) {
        setError('First name and last name are required');
        return;
      }
      if (role === 'organizer' && !formData.organizationName) {
        setError('Organization name is required');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = formMode === 'signin' ? '/auth/login' : '/auth/register';
      const payload =
        formMode === 'signin'
          ? { email: formData.email, password: formData.password }
          : role === 'student'
          ? {
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              role: 'student',
            }
          : {
              email: formData.email,
              password: formData.password,
              organizationName: formData.organizationName,
              role: 'organizer',
            };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store token
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', role);

      setSuccess(formMode === 'signin' ? 'Login successful!' : 'Registration successful!');

      // Redirect after success
      setTimeout(() => {
        window.location.href = role === 'student' ? '/' : '/organizer';
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.animatedBackground}></div>

      <div className={styles.glassContainer}>
        {/* Role Toggle */}
        <div className={styles.roleToggleWrapper}>
          <div className={styles.roleToggle}>
            <button
              type="button"
              className={`${styles.roleOption} ${role === 'student' ? styles.active : ''}`}
              onClick={() => handleRoleChange('student')}
            >
              Students
            </button>
            <button
              type="button"
              className={`${styles.roleOption} ${role === 'organizer' ? styles.active : ''}`}
              onClick={() => handleRoleChange('organizer')}
            >
              Organizers
            </button>
          </div>
        </div>

        {/* Header */}
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Welcome to MNU Events</h1>
          {role === 'organizer' && <span className={styles.adminBadge}>Organizer Portal</span>}
          <p className={styles.authSubtitle}>
            {role === 'student'
              ? 'Discover and join amazing events at MNU'
              : 'Manage events and track attendance'}
          </p>
        </div>

        {/* Form Tabs */}
        <div className={styles.formTabs}>
          <button
            type="button"
            className={`${styles.formTab} ${formMode === 'signin' ? styles.active : ''}`}
            onClick={() => handleFormModeChange('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.formTab} ${formMode === 'signup' ? styles.active : ''}`}
            onClick={() => handleFormModeChange('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        {success && (
          <div className={styles.successMessage}>
            <i className="fas fa-check-circle"></i>
            {success}
          </div>
        )}

        {/* Form */}
        <form className={styles.authForm} onSubmit={handleSubmit}>
          {/* Sign Up: Additional Fields */}
          {formMode === 'signup' && role === 'student' && (
            <>
              <div className={styles.formField}>
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  className={styles.authInput}
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div className={styles.formField}>
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  className={styles.authInput}
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {formMode === 'signup' && role === 'organizer' && (
            <div className={styles.formField}>
              <i className="fas fa-building"></i>
              <input
                type="text"
                className={styles.authInput}
                placeholder="Organization Name"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                required
              />
            </div>
          )}

          {/* Email */}
          <div className={styles.formField}>
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              className={styles.authInput}
              placeholder={role === 'student' ? 'student@kazguu.kz' : 'organizer@example.com'}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
            {role === 'student' && formMode === 'signup' && (
              <p className={styles.validationHint}>Must use @kazguu.kz email domain</p>
            )}
          </div>

          {/* Password */}
          <div className={styles.formField}>
            <i className="fas fa-lock"></i>
            <input
              type="password"
              className={styles.authInput}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
            {formMode === 'signup' && (
              <p className={styles.validationHint}>Minimum 6 characters</p>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.authSubmitBtn} disabled={isLoading}>
            {isLoading ? 'Loading...' : formMode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>

          {/* Forgot Password Link */}
          {formMode === 'signin' && (
            <a href="#" className={`${styles.authLink} ${styles.forgotPassword}`}>
              Forgot password?
            </a>
          )}
        </form>

        {/* Footer */}
        <div className={styles.authFooter}>
          {formMode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <a href="#" className={styles.authLink} onClick={() => handleFormModeChange('signup')}>
                Sign Up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="#" className={styles.authLink} onClick={() => handleFormModeChange('signin')}>
                Sign In
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
