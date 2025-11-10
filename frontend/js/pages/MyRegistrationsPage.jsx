import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import registrationsService from '../services/registrationsService';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function MyRegistrationsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All'); // All, Upcoming, Past, Waitlist
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: '/registrations' } } });
      return;
    }
    loadRegistrations();
  }, [isAuthenticated]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await registrationsService.getMyRegistrations();
      // API может вернуть массив или объект с data
      const data = Array.isArray(response) ? response : (response.data || response.registrations || []);
      setRegistrations(data);
    } catch (err) {
      setError(err.message || 'Failed to load registrations');
      console.error('[MyRegistrationsPage] Load registrations failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId) => {
    if (!confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    try {
      setCancellingId(registrationId);
      setError('');
      await registrationsService.cancel(registrationId);
      toast.success('Registration cancelled', {
        description: 'Your registration has been cancelled successfully.',
      });
      // Перезагружаем список
      await loadRegistrations();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel registration');
      console.error('[MyRegistrationsPage] Cancel registration failed:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-GB', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      full: date.toLocaleString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      REGISTERED: 'bg-green-100 text-green-800 border-green-200',
      WAITLIST: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryColor = (category) => {
    const cat = category?.toLowerCase();
    const colors = {
      creativity: 'bg-purple-100 text-purple-800 border-purple-200',
      service: 'bg-green-100 text-green-800 border-green-200',
      intelligence: 'bg-blue-100 text-blue-800 border-blue-200',
      tech: 'bg-blue-100 text-blue-800 border-blue-200',
      academic: 'bg-blue-100 text-blue-800 border-blue-200',
      sports: 'bg-orange-100 text-orange-800 border-orange-200',
      cultural: 'bg-pink-100 text-pink-800 border-pink-200',
      social: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      career: 'bg-teal-100 text-teal-800 border-teal-200',
    };
    return colors[cat] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (filter === 'All') return true;
    if (filter === 'Waitlist') return reg.status === 'WAITLIST';
    
    const now = new Date();
    const eventEnd = new Date(reg.event?.endDate || reg.eventEndDate);
    
    if (filter === 'Upcoming') {
      return eventEnd > now && reg.status !== 'CANCELLED';
    }
    if (filter === 'Past') {
      return eventEnd <= now || reg.status === 'CANCELLED';
    }
    return true;
  });

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Registrations</h1>
          <p className="text-muted-foreground">
            View and manage your event registrations
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['All', 'Upcoming', 'Past', 'Waitlist'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={cn(
                filter === f && 'bg-primary text-primary-foreground'
              )}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Registrations List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading registrations...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                {filter === 'All'
                  ? "You haven't registered for any events yet"
                  : `No ${filter.toLowerCase()} registrations found`}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/events')}
              >
                Browse Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegistrations.map((registration) => {
              const event = registration.event;
              if (!event) return null;

              const startDate = formatDate(event.startDate);
              const endDate = formatDate(event.endDate);
              const isPast = new Date(event.endDate) < new Date();
              const isCheckedIn = registration.checkedIn;

              return (
                <Card key={registration.id} className="overflow-hidden">
                  {event.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={cn(getCategoryColor(event.category))}>
                          {event.category}
                        </Badge>
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge className={cn(getStatusBadge(registration.status))}>
                          {registration.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <i className="fa-regular fa-calendar text-primary" />
                        <span>{startDate.full}</span>
                      </div>
                      {event.endDate && event.endDate !== event.startDate && (
                        <div className="flex items-center gap-2">
                          <i className="fa-regular fa-calendar text-primary" />
                          <span>End: {endDate.full}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-primary" />
                        <span>{event.location}</span>
                      </div>
                      {isCheckedIn && (
                        <div className="flex items-center gap-2 text-green-600">
                          <i className="fa-solid fa-check-circle" />
                          <span className="font-medium">Checked In</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <Link to={`/events/${event.id}`}>View Event</Link>
                      </Button>
                      {!isPast && registration.status !== 'CANCELLED' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancel(registration.id)}
                          disabled={cancellingId === registration.id}
                        >
                          {cancellingId === registration.id ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

