import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import eventsService from '../services/eventsService';
import registrationsService from '../services/registrationsService';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [myRegistration, setMyRegistration] = useState(null);

  useEffect(() => {
    loadEvent();
    if (isAuthenticated()) {
      checkRegistration();
    }
  }, [id, user]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await eventsService.getById(id);
      setEvent(data);
      
      // Debug: логируем даты для отладки
      if (import.meta.env.DEV && data) {
        const eventEndDate = new Date(data.endDate);
        const now = new Date();
        console.log('[EventDetailsPage] Date debug:', {
          eventEndDate: eventEndDate.toISOString(),
          now: now.toISOString(),
          eventEndDateLocal: eventEndDate.toLocaleString(),
          nowLocal: now.toLocaleString(),
          isPast: eventEndDate < now,
          diff: eventEndDate.getTime() - now.getTime(),
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load event');
      console.error('[EventDetailsPage] Load event failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const response = await registrationsService.getMyRegistrations();
      // API может вернуть массив или объект с data
      const registrations = Array.isArray(response) ? response : (response.data || response.registrations || []);
      const registration = registrations.find(r => r.eventId === id);
      if (registration) {
        setIsRegistered(true);
        setMyRegistration(registration);
      }
    } catch (err) {
      console.error('[EventDetailsPage] Check registration failed:', err);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    try {
      setRegistering(true);
      setError('');
      await registrationsService.register(id);
      setIsRegistered(true);
      toast.success('Successfully registered!', {
        description: 'You have been registered for this event.',
      });
      // Перезагружаем событие для обновления availableSeats
      await loadEvent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
      console.error('[EventDetailsPage] Register failed:', err);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!myRegistration) return;

    try {
      setRegistering(true);
      setError('');
      await registrationsService.cancel(myRegistration.id);
      setIsRegistered(false);
      setMyRegistration(null);
      toast.success('Registration cancelled', {
        description: 'Your registration has been cancelled successfully.',
      });
      // Перезагружаем событие для обновления availableSeats
      await loadEvent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel registration');
      console.error('[EventDetailsPage] Cancel registration failed:', err);
    } finally {
      setRegistering(false);
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

  const getCategoryColor = (category) => {
    const cat = category?.toLowerCase();
    const colors = {
      creativity: 'bg-purple-100 text-purple-800 border-purple-200',
      service: 'bg-green-100 text-green-800 border-green-200',
      intelligence: 'bg-blue-100 text-blue-800 border-blue-200',
      tech: 'bg-blue-100 text-blue-800 border-blue-200',
      academic: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[cat] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      UPCOMING: 'bg-green-100 text-green-800 border-green-200',
      ONGOING: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => navigate('/events')} variant="outline">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const startDate = formatDate(event.startDate);
  const endDate = formatDate(event.endDate);
  const isFull = event.availableSeats <= 0;
  // Проверяем, закончилось ли событие, сравнивая endDate с текущей датой/временем
  // event.endDate может быть строкой или Date объектом, поэтому парсим его явно
  // Используем getTime() для точного сравнения timestamp, чтобы избежать проблем с часовыми поясами
  const eventEndDate = new Date(event.endDate);
  const now = new Date();
  const isPast = eventEndDate.getTime() < now.getTime();
  
  // Debug в development режиме
  if (import.meta.env.DEV) {
    console.log('[EventDetailsPage] Event status check:', {
      eventEndDate: eventEndDate.toISOString(),
      now: now.toISOString(),
      eventEndDateTimestamp: eventEndDate.getTime(),
      nowTimestamp: now.getTime(),
      isPast,
      diffMs: eventEndDate.getTime() - now.getTime(),
      diffDays: Math.floor((eventEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/events')}
          className="mb-6"
        >
          ← Back to Events
        </Button>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {event.imageUrl && (
              <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={cn(getCategoryColor(event.category))}>
                    {event.category}
                  </Badge>
                </div>
                {event.status && (
                  <div className="absolute top-4 left-4">
                    <Badge className={cn(getStatusBadge(event.status))}>
                      {event.status}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Title and Description */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                    {event.creator && (
                      <CardDescription className="text-base">
                        Organized by {event.creator.firstName} {event.creator.lastName}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date & Time */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <i className="fa-regular fa-calendar text-primary" />
                    <span className="font-medium">Start</span>
                  </div>
                  <p className="text-base font-medium">{startDate.full}</p>
                </div>

                {event.endDate && event.endDate !== event.startDate && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <i className="fa-regular fa-calendar text-primary" />
                      <span className="font-medium">End</span>
                    </div>
                    <p className="text-base font-medium">{endDate.full}</p>
                  </div>
                )}

                {/* Location */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <i className="fa-solid fa-location-dot text-primary" />
                    <span className="font-medium">Location</span>
                  </div>
                  <p className="text-base">{event.location}</p>
                </div>

                {/* Capacity */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <i className="fa-solid fa-users text-primary" />
                    <span className="font-medium">Capacity</span>
                  </div>
                  <p className="text-base">
                    {event.availableSeats} of {event.capacity} seats available
                  </p>
                  {isFull && (
                    <p className="text-sm text-destructive mt-1">Event is full</p>
                  )}
                </div>

                {/* Registration Status */}
                {isRegistered && myRegistration && (
                  <div className="p-3 rounded-md bg-green-50 border border-green-200">
                    <p className="text-sm font-medium text-green-800">
                      ✓ You are registered
                    </p>
                    {myRegistration.status === 'WAITLIST' && (
                      <p className="text-xs text-green-600 mt-1">
                        You are on the waitlist
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons - только для студентов */}
                {!isPast && user?.role === 'STUDENT' && (
                  <div className="space-y-2 pt-4">
                    {isRegistered ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleCancelRegistration}
                        disabled={registering}
                      >
                        {registering ? 'Cancelling...' : 'Cancel Registration'}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={handleRegister}
                        disabled={registering || isFull || !isAuthenticated()}
                      >
                        {registering
                          ? 'Registering...'
                          : !isAuthenticated()
                          ? 'Login to Register'
                          : isFull
                          ? 'Event Full'
                          : 'Register for Event'}
                      </Button>
                    )}
                    {!isAuthenticated() && (
                      <p className="text-xs text-center text-muted-foreground">
                        <Link to="/login" className="text-primary hover:underline">
                          Sign in
                        </Link>{' '}
                        to register for this event
                      </p>
                    )}
                  </div>
                )}
                
                {/* Сообщение для организаторов и админов */}
                {!isPast && isAuthenticated() && user?.role !== 'STUDENT' && (
                  <div className="p-3 rounded-md bg-gray-50 border border-gray-200 mt-4">
                    <p className="text-sm text-muted-foreground text-center">
                      {user?.role === 'ORGANIZER' 
                        ? 'Organizers cannot register for events. Manage your events from the dashboard.'
                        : 'Only students can register for events.'}
                    </p>
                  </div>
                )}

                {isPast && (
                  <div className="p-3 rounded-md bg-gray-50 border border-gray-200">
                    <p className="text-sm text-muted-foreground text-center">
                      This event has ended
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

