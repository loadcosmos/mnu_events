import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

/**
 * Административный Layout для админов
 * Sidebar слева, минималистичный дизайн: красный, белый, черный (как у организатора, но для админов)
 */
export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('ENG');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const langDropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/events', label: 'Manage Events', icon: '📅' },
    { path: '/admin/users', label: 'Manage Users', icon: '👥' },
    { path: '/admin/clubs', label: 'Manage Clubs', icon: '🏢' },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-black text-white transition-all duration-300 z-40",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 border-b border-gray-800 flex items-center px-4">
            {sidebarOpen ? (
              <Link to="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="font-bold text-lg">Admin Panel</span>
              </Link>
            ) : (
              <Link to="/admin" className="flex items-center justify-center w-full">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold">
                  A
                </div>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-2">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-red-600 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-800 p-4">
            {sidebarOpen ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.firstName || user?.email}
                    </p>
                    <p className="text-xs text-gray-400 truncate">Administrator</p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white"
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                </div>
                <Button
                  onClick={handleLogout}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white"
                  size="sm"
                  title="Logout"
                >
                  ⬅
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-20"
      )}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-black"
            >
              {sidebarOpen ? '☰' : '☰'}
            </Button>
            <h1 className="text-xl font-semibold text-black">
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language selector */}
            <div className="relative" ref={langDropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLangOpen(!langOpen)}
                className="text-gray-600 hover:text-black"
              >
                {selectedLang}
                <i className="fa-solid fa-chevron-down text-xs ml-1" />
              </Button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-md border border-gray-200 bg-white p-1 shadow-lg z-50">
                  {['ENG', 'РУС', 'ҚАЗ'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang);
                        setLangOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-2 py-1.5 text-sm rounded-sm transition-colors",
                        selectedLang === lang
                          ? "bg-red-600 text-white"
                          : "hover:bg-gray-100 text-black"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-gray-50 min-h-[calc(100vh-4rem)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}



