import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Calendar } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-primary-600">MNU Events</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/events" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                  Events
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <>
                  <Link to="/my-registrations" className="p-2 text-gray-600 hover:text-gray-900">
                    <Calendar className="h-5 w-5" />
                  </Link>
                  <Link to="/profile" className="ml-3 p-2 text-gray-600 hover:text-gray-900">
                    <User className="h-5 w-5" />
                  </Link>
                  <button onClick={logout} className="ml-3 p-2 text-gray-600 hover:text-gray-900">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">
        <Outlet />
      </main>
    </div>
  );
}
