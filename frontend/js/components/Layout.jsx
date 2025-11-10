import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import OrganizerLayout from './OrganizerLayout.jsx';
import AdminLayout from './AdminLayout.jsx';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  
  // Все хуки должны быть объявлены до любых условных return
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('ENG');
  const langDropdownRef = useRef(null);
  
  // Редирект организаторов и админов с публичных страниц на их страницы
  useEffect(() => {
    if (isAuthenticated() && user) {
      if (user.role === 'ORGANIZER' && location.pathname !== '/organizer' && !location.pathname.startsWith('/organizer')) {
        navigate('/organizer', { replace: true });
        return;
      }
      if (user.role === 'ADMIN' && location.pathname !== '/admin' && !location.pathname.startsWith('/admin')) {
        navigate('/admin', { replace: true });
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.pathname, navigate]);
  
  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    };

    if (langOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [langOpen]);
  
  // Если пользователь - организатор, используем OrganizerLayout
  if (isAuthenticated() && user?.role === 'ORGANIZER') {
    return <OrganizerLayout>{children}</OrganizerLayout>;
  }
  
  // Если пользователь - админ, используем AdminLayout
  if (isAuthenticated() && user?.role === 'ADMIN') {
    return <AdminLayout>{children}</AdminLayout>;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/clubs', label: 'Clubs' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="MNU Events" className="h-10" />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language selector */}
            <div className="relative" ref={langDropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLangOpen(!langOpen)}
                className="gap-1"
              >
                {selectedLang}
                <i className="fa-solid fa-chevron-down text-xs" />
              </Button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-md border bg-popover p-1 shadow-md z-50">
                  {['ENG', 'РУС', 'ҚАЗ'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang);
                        setLangOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent",
                        selectedLang === lang && "bg-accent"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth buttons */}
            {isAuthenticated() ? (
              <div className="flex items-center space-x-2">
                {/* Показываем ссылки только для студентов (организаторы и админы имеют свои Layout'ы) */}
                {user?.role === 'STUDENT' && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/registrations">My Registrations</Link>
                  </Button>
                )}
                {/* Profile link */}
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <i className="fa-solid fa-user text-xs" />
                    <span className="text-sm">{user?.firstName || user?.email}</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link to="/login">Log In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

