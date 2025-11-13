import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import OrganizerLayout from './OrganizerLayout.jsx';
import AdminLayout from './AdminLayout.jsx';
import BottomNavigation from './BottomNavigation';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

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
  
  // Определяем, должны ли элементы быть белыми (когда hero section виден в светлом режиме)
  const isHeroVisible = isHomePage && !isScrolled && !isDark;
  const textColorClass = isHeroVisible 
    ? 'text-white' 
    : 'text-gray-800 dark:text-white';
  const iconColorClass = isHeroVisible 
    ? 'text-white' 
    : 'text-gray-800 dark:text-white';
  const hoverClass = isHeroVisible
    ? 'hover:bg-white/20'
    : 'hover:bg-gray-200/50 dark:hover:bg-white/10';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'liquid-glass-strong'
            : 'liquid-glass-subtle'
        }`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          {/* Left side - Language selector & Theme toggle (Desktop only) */}
          <div className="hidden md:flex flex-1 items-center justify-start gap-2 max-w-[250px]">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`rounded-xl ${iconColorClass} ${hoverClass} transition-all`}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <i className="fa-solid fa-sun text-lg" />
              ) : (
                <i className="fa-solid fa-moon text-lg" />
              )}
            </Button>

            {/* Language Selector */}
            <div className="relative" ref={langDropdownRef}>
              <Button
                variant="ghost"
                size="default"
                onClick={() => setLangOpen(!langOpen)}
                className={`rounded-xl gap-2 ${textColorClass} ${hoverClass} text-base transition-all`}
              >
                {selectedLang}
                <i
                  className={`fa-solid fa-chevron-down text-xs transition-transform ${iconColorClass} ${
                    langOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>
              {langOpen && (
                <div className="absolute left-0 top-full mt-2 w-32 rounded-2xl liquid-glass-strong p-1 shadow-xl z-50">
                  {['ENG', 'РУС', 'ҚАЗ'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang);
                        setLangOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-sm rounded-xl text-gray-600 dark:text-[#a0a0a0] hover:bg-gray-200/50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all',
                        selectedLang === lang && 'bg-gray-200/70 dark:bg-white/15 text-gray-900 dark:text-white'
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Mobile left spacer - with theme toggle */}
          <div className="md:hidden flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`rounded-xl ${iconColorClass} ${hoverClass} transition-all`}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <i className="fa-solid fa-sun text-lg" />
              ) : (
                <i className="fa-solid fa-moon text-lg" />
              )}
            </Button>
          </div>

          {/* Center - Logo */}
          <Link
            to="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <img
              src={isDark ? "/images/logo.png" : "/images/logoblack.png"}
              alt="MNU Events"
              className="h-12 transition-all duration-300"
            />
          </Link>

          {/* Right side - Navigation and Auth */}
          <div className="flex flex-1 items-center justify-end gap-4">
            {/* Desktop Only: Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="default"
                asChild
                className={`rounded-xl ${textColorClass} ${hoverClass} text-base transition-all`}
              >
                <Link to="/events">Events</Link>
              </Button>
              <Button
                variant="ghost"
                size="default"
                asChild
                className={`rounded-xl ${textColorClass} ${hoverClass} text-base transition-all`}
              >
                <Link to="/clubs">Clubs</Link>
              </Button>
            </nav>

            {/* Auth buttons (Desktop only) */}
            <div className="hidden md:flex items-center">
              {isAuthenticated() ? (
                <>
                  {/* Profile dropdown (Desktop only) */}
                  <div className="relative" ref={profileDropdownRef}>
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => setProfileOpen(!profileOpen)}
                      className={`rounded-xl gap-2 ${textColorClass} ${hoverClass} text-base transition-all`}
                    >
                      <i className={`fa-regular fa-circle-user text-lg ${iconColorClass}`} />
                      <span className="hidden sm:inline">
                        {user?.firstName || user?.email}
                      </span>
                      <i
                        className={`fa-solid fa-chevron-down text-xs transition-transform ${iconColorClass} ${
                          profileOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl liquid-glass-strong shadow-xl z-50">
                        <div className="p-1">
                          {user?.role === 'STUDENT' && (
                            <Link
                              to="/registrations"
                              onClick={() => setProfileOpen(false)}
                              className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-[#a0a0a0] hover:bg-gray-200/50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all rounded-xl"
                            >
                              <i className="fa-solid fa-calendar-check w-4 text-center" />
                              My Registrations
                            </Link>
                          )}
                          <Link
                            to="/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-[#a0a0a0] hover:bg-gray-200/50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all rounded-xl"
                          >
                            <i className="fa-solid fa-user-edit w-4 text-center" />
                            Edit Profile
                          </Link>
                          <div className="my-1 h-px bg-gray-300/30 dark:bg-white/10" />
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              handleLogout();
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-[#d62e1f] hover:bg-[#d62e1f] hover:text-white transition-colors rounded-xl"
                          >
                            <i className="fa-solid fa-sign-out-alt w-4 text-center" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Desktop Only: Login Button */}
                  <Button
                    asChild
                    className="liquid-glass-red-button text-white rounded-2xl text-base px-6 font-semibold shadow-lg"
                  >
                    <Link to="/login">Log In</Link>
                  </Button>
                </>
              )}
            </div>
            {/* Mobile right spacer */}
            <div className="md:hidden flex-1"></div>
          </div>
        </div>
      </header>

      <main className="pt-20">{children}</main>

      {/* Bottom Navigation for mobile */}
      <BottomNavigation />
    </div>
  );
}

