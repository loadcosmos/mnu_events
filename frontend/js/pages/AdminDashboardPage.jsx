import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import eventsService from '../services/eventsService';
import usersService from '../services/usersService';
import clubsService from '../services/clubsService';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    activeClubs: 0,
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError('');

      // Загружаем статистику параллельно
      const [usersResponse, eventsResponse, clubsResponse] = await Promise.all([
        usersService.getAll({ page: 1, limit: 1 }), // Получаем только для подсчета total
        eventsService.getAll({ page: 1, limit: 1 }), // Получаем только для подсчета total
        clubsService.getAll({ page: 1, limit: 1 }), // Получаем только для подсчета total
      ]);

      // Извлекаем метаданные из ответов
      const totalUsers = usersResponse.meta?.total || usersResponse.total || 0;
      const totalEvents = eventsResponse.meta?.total || eventsResponse.total || 0;
      const activeClubs = clubsResponse.meta?.total || clubsResponse.total || 0;

      // Подсчитываем общее количество регистраций
      // Для этого нужно загрузить все события с регистрациями
      const allEventsResponse = await eventsService.getAll({ page: 1, limit: 1000 });
      const events = allEventsResponse.data || allEventsResponse || [];
      const totalRegistrations = events.reduce((sum, event) => {
        return sum + (event._count?.registrations || 0);
      }, 0);

      setStats({
        totalUsers,
        totalEvents,
        totalRegistrations,
        activeClubs,
      });
    } catch (err) {
      console.error('[AdminDashboard] Load statistics failed:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black mb-2">Admin Dashboard</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform statistics and overview</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm text-gray-600">Total Users</CardDescription>
            <CardTitle className="text-4xl font-bold text-black">{stats.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">
              All registered users
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm text-gray-600">Total Events</CardDescription>
            <CardTitle className="text-4xl font-bold text-black">{stats.totalEvents}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">
              All platform events
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm text-gray-600">Total Registrations</CardDescription>
            <CardTitle className="text-4xl font-bold text-black">{stats.totalRegistrations}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">
              Event registrations
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm text-gray-600">Active Clubs</CardDescription>
            <CardTitle className="text-4xl font-bold text-black">{stats.activeClubs}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">
              Student clubs
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-black">Quick Actions</CardTitle>
          <CardDescription>Manage platform content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-black mb-1">Manage Events</h3>
              <p className="text-sm text-gray-600">View and manage all platform events</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-black mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage user accounts</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-black mb-1">Manage Clubs</h3>
              <p className="text-sm text-gray-600">View and manage student clubs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

