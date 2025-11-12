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
  const [profileOpen, setProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const langDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  
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
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    if (langOpen || profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [langOpen, profileOpen]);

  // Отслеживание прокрутки для анимации хедера (только на главной странице)
  useEffect(() => {
    const isHomePage = location.pathname === '/';

    if (!isHomePage) {
      // На всех внутренних страницах хедер всегда черный
      setIsScrolled(true);
      return;
    }

    // На главной странице отслеживаем прокрутку
    const handleScroll = () => {
      // Hero Section занимает 100vh (высоту экрана)
      // Когда прокрутка превышает высоту экрана - меняем фон хедера
      const heroHeight = window.innerHeight;
      const scrollPosition = window.scrollY;

      if (scrollPosition > heroHeight - 100) {
        // -100px для плавного перехода чуть раньше
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Добавляем слушатель события прокрутки
    window.addEventListener('scroll', handleScroll);

    // Проверяем сразу при монтировании (на случай если уже прокручено)
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);
  
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

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      <header
        className={`fixed top-0 z-50 w-full border-b transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'border-gray-800/50 bg-black/90 backdrop-blur-md'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="container flex h-28 items-center justify-between px-4">
          {/* Left side - Language selector */}
          <div className="flex items-center flex-1">
            <div className="relative" ref={langDropdownRef}>
              <Button
                variant="ghost"
                size="default"
                onClick={() => setLangOpen(!langOpen)}
                className="gap-2 text-white hover:text-white hover:bg-gray-800/50 text-base"
              >
                {selectedLang}
                <i className="fa-solid fa-chevron-down text-sm" />
              </Button>
              {langOpen && (
                <div className="absolute left-0 mt-2 w-32 rounded-md border bg-popover p-1 shadow-md z-50">
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
          </div>

          {/* Center - Logo */}
          <Link to="/" className="flex items-center absolute left-1/2 transform -translate-x-1/2">
            <img src="/images/logo.png" alt="MNU Events" className="h-16" />
          </Link>

          {/* Right side - Navigation and Auth */}
          <div className="flex items-center space-x-6 flex-1 justify-end">
            {/* Navigation - показываем только Events и Clubs для неавторизованных */}
            {!isAuthenticated() && (
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  to="/events"
                  className={cn(
                    "text-base font-medium transition-colors hover:text-gray-300",
                    location.pathname === '/events'
                      ? "text-white"
                      : "text-white"
                  )}
                >
                  Events
                </Link>
                <Link
                  to="/clubs"
                  className={cn(
                    "text-base font-medium transition-colors hover:text-gray-300",
                    location.pathname === '/clubs'
                      ? "text-white"
                      : "text-white"
                  )}
                >
                  Clubs
                </Link>
              </nav>
            )}

            {/* Auth buttons */}
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                {/* Показываем ссылки только для студентов (организаторы и админы имеют свои Layout'ы) */}
                {user?.role === 'STUDENT' && (
                  <>
                    <Button variant="ghost" size="default" asChild className="text-white hover:text-white hover:bg-gray-800/50 text-base">
                      <Link to="/events">Events</Link>
                    </Button>
                    <Button variant="ghost" size="default" asChild className="text-white hover:text-white hover:bg-gray-800/50 text-base">
                      <Link to="/clubs">Clubs</Link>
                    </Button>
                  </>
                )}

                {/* Profile dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <Button
                    variant="ghost"
                    size="default"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="gap-2 text-white hover:text-white hover:bg-gray-800/50 text-base"
                  >
                    <i className="fa-solid fa-user text-sm" />
                    <span className="text-base text-white">{user?.firstName || user?.email}</span>
                    <i className="fa-solid fa-chevron-down text-sm" />
                  </Button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-lg z-50">
                      <div className="py-1">
                        {user?.role === 'STUDENT' && (
                          <Link
                            to="/registrations"
                            onClick={() => setProfileOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <i className="fa-solid fa-calendar-check mr-2" />
                            My Registrations
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <i className="fa-solid fa-user-edit mr-2" />
                          Edit Profile
                        </Link>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                        >
                          <i className="fa-solid fa-sign-out-alt mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="default"
                asChild
                className="bg-transparent border-white text-white hover:bg-gray-800/50 hover:text-white rounded-full text-base px-6 py-2"
              >
                <Link to="/login">Log In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className={isHomePage ? '' : 'pt-28'}>{children}</main>
    </div>
  );
}

