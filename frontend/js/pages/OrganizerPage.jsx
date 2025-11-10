import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import eventsService from '../services/eventsService';

export default function OrganizerPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalRegistrations: 0,
    activeClubs: 0, // Пока не реализовано на бэкенде
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    if (isAuthenticated()) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Загружаем события организатора
      const response = await eventsService.getMyEvents({ page: 1, limit: 50 });
      const events = response.data || response || [];
      
      // Вычисляем статистику
      const now = new Date();
      const upcoming = events.filter(e => new Date(e.startDate) > now);
      const totalRegistrations = events.reduce((sum, e) => sum + (e._count?.registrations || 0), 0);

      setStats({
        totalEvents: events.length,
        upcomingEvents: upcoming.length,
        totalRegistrations,
        activeClubs: 0, // TODO: реализовать когда будет API для клубов
      });

      // Сортируем по дате и берем ближайшие
      setUpcomingEvents(
        upcoming
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 10)
      );
    } catch (err) {
      console.error('[OrganizerPage] Load dashboard data failed:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (startDate > now) return { variant: 'default', label: 'Upcoming' };
    if (startDate <= now && endDate >= now) return { variant: 'default', label: 'Ongoing' };
    if (endDate < now) return { variant: 'secondary', label: 'Completed' };
    return { variant: 'secondary', label: event.status };
  };

  if (!isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to access the organizer dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, <span className="font-semibold text-black">{user?.firstName || user?.email}</span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* KPI Cards - Red/White/Black */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-600">Total Events</CardDescription>
            <CardTitle className="text-4xl font-bold text-black">{stats.totalEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-600">Upcoming Events</CardDescription>
            <CardTitle className="text-4xl font-bold text-black">{stats.upcomingEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-600">Total Registrations</CardDescription>
            <CardTitle className="text-4xl font-bold text-black">{stats.totalRegistrations}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-600">Active Clubs</CardDescription>
            <CardTitle className="text-4xl font-bold text-black">{stats.activeClubs}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Upcoming Events Table - Admin Style */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-black">Upcoming Events</CardTitle>
              <CardDescription className="mt-1 text-gray-600">Manage your upcoming events</CardDescription>
            </div>
            <Button 
              asChild
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Link to="/organizer/create-event">
                Create Event
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-semibold text-black mb-2">No upcoming events</p>
              <p className="text-sm text-gray-600 mb-6">Get started by creating your first event</p>
              <Button 
                asChild
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Link to="/organizer/create-event">Create Your First Event</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const registrations = event._count?.registrations || 0;
                  const capacity = event.capacity || 0;
                  const statusBadge = getStatusBadge(event);
                  const percentage = capacity > 0 ? Math.min((registrations / capacity) * 100, 100) : 0;
                  
                  return (
                    <div
                      key={event.id}
                      className="p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-black">
                              {event.title}
                            </h3>
                            <Badge 
                              variant={statusBadge.variant === 'default' ? 'default' : 'secondary'}
                              className={statusBadge.variant === 'default' ? 'bg-red-600 text-white' : 'bg-gray-200 text-black'}
                            >
                              {statusBadge.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {formatDate(event.startDate)} · {event.location}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 font-medium">
                                {registrations} / {capacity} registered
                              </span>
                              <span className="text-gray-500">
                                {Math.round(percentage)}%
                              </span>
                            </div>
                            {capacity > 0 && (
                              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="absolute inset-y-0 left-0 bg-red-600 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <Link to={`/events/${event.id}`}>View</Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <Link to={`/organizer/events/${event.id}/edit`}>Edit</Link>
                          </Button>
                          <Button 
                            size="sm" 
                            asChild
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Link to={`/events/${event.id}`}>Manage</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button 
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white" 
                size="lg"
                asChild
              >
                <Link to="/organizer/create-event">
                  Create New Event
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
