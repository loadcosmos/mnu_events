import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';

export default function LoginPage() {
  const [showSignup, setShowSignup] = useState(false);
  const [loginType, setLoginType] = useState('student'); // 'student' or 'admin'
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
  const { login, register, user } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await login({
        email: formData.email,
        password: formData.password,
      });
      
      // Редирект в зависимости от роли пользователя
      // Всегда редиректим по роли, игнорируя сохраненный путь
      const userRole = response?.user?.role;
      
      // Проверяем соответствие выбранного типа входа и роли пользователя
      if (loginType === 'admin' && userRole !== 'ADMIN' && userRole !== 'ORGANIZER') {
        setError('Access denied. Admin or Organizer privileges required.');
        setLoading(false);
        return;
      }
      
      if (loginType === 'student' && (userRole === 'ADMIN' || userRole === 'ORGANIZER')) {
        setError('Please use Admin login for admin/organizer accounts.');
        setLoading(false);
        return;
      }
      
      // Редирект в зависимости от роли
      if (userRole === 'ORGANIZER') {
        navigate('/organizer', { replace: true });
        toast.success('Welcome back!', {
          description: `Logged in as Organizer: ${response?.user?.firstName || response?.user?.email}`,
        });
      } else if (userRole === 'ADMIN') {
        navigate('/admin', { replace: true });
        toast.success('Welcome back!', {
          description: `Logged in as Admin: ${response?.user?.firstName || response?.user?.email}`,
        });
      } else {
        // Студенты идут на главную страницу
        navigate('/', { replace: true });
        toast.success('Welcome back!', {
          description: `Logged in as ${response?.user?.firstName || response?.user?.email}`,
        });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      // Toast для ошибок уже показывается в apiClient interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.email.endsWith('@kazguu.kz')) {
      setError('Please use your @kazguu.kz email');
      return;
    }

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
      // После регистрации редиректим на страницу верификации email
      navigate('/verify-email', { 
        replace: true,
        state: { email: formData.email }
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
      {/* Кнопка переключения Student/Admin в правом верхнем углу */}
      {!showSignup && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLoginType(loginType === 'student' ? 'admin' : 'student');
            setError('');
          }}
          className="fixed top-4 right-4 z-50 bg-white"
        >
          {loginType === 'student' ? 'Admin' : 'Student'}
        </Button>
      )}

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">
            {showSignup ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {showSignup
              ? 'Register with your @kazguu.kz account'
              : 'Please enter your details to sign in'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center border border-destructive/20">
              {error}
            </div>
          )}

          {!showSignup ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="user@kazguu.kz"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="link"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              setShowSignup(!showSignup);
              setError('');
            }}
          >
            {showSignup
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
