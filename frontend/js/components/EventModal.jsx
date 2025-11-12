import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import eventsService from '../services/eventsService';
import registrationsService from '../services/registrationsService';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function EventModal({ eventId, isOpen, onClose }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log('[EventModal] State changed:', { isOpen, eventId });
    if (isOpen && eventId) {
      loadEventDetails();
    }
  }, [isOpen, eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await eventsService.getById(eventId);
      setEvent(data);
    } catch (err) {
      console.error('[EventModal] Failed to load event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please log in to register for events');
      return;
    }

    if (!eventId) {
      toast.error('Invalid event');
      return;
    }

    try {
      setRegistering(true);
      await registrationsService.register(eventId);
      toast.success('Successfully registered for event!');
      onClose();
    } catch (err) {
      console.error('[EventModal] Registration failed:', err);
      const errorMessage = err.response?.data?.message
        ? (Array.isArray(err.response.data.message)
            ? err.response.data.message.join(', ')
            : err.response.data.message)
        : err.message || 'Failed to register for event';
      toast.error(errorMessage);
    } finally {
      setRegistering(false);
    }
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const date = d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { date, time };
  };

  const getCategoryColor = (category) => {
    const colors = {
      CULTURAL: 'bg-purple-100 text-purple-800',
      SOCIAL: 'bg-green-100 text-green-800',
      ACADEMIC: 'bg-blue-100 text-blue-800',
      TECH: 'bg-blue-100 text-blue-800',
      SPORTS: 'bg-green-100 text-green-800',
      CAREER: 'bg-orange-100 text-orange-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Dark Premium Modal Content - Optimized Size */}
      <div className="relative w-full max-w-5xl min-h-[500px] max-h-[85vh] h-auto overflow-y-auto bg-neutral-900 rounded-lg shadow-2xl border border-neutral-800 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in my-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-800 border-t-primary"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <i className="fa-solid fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
            <p className="text-white font-semibold mb-2">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        ) : event ? (
          <>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-800/90 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-800 transition-all"
            >
              <i className="fa-solid fa-xmark text-neutral-300 text-xl" />
            </button>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-6 md:p-8">
              {/* Left Column - Image & Main Info */}
              <div className="space-y-5">
                {/* Event Image - Optimized Size */}
                {event.imageUrl && (
                  <div className="relative h-64 md:h-72 overflow-hidden rounded-lg bg-neutral-950">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/event-placeholder.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <div className="px-3 py-1 bg-primary text-white rounded-md text-xs font-bold">
                        {event.category}
                      </div>
                    </div>
                  </div>
                )}

                {/* Title */}
                <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                  {event.title}
                </h2>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">About this event</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed line-clamp-5">
                    {event.description || 'No description provided.'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleRegister}
                    disabled={registering || !user}
                    className="w-full px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {registering ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-ticket mr-2" />
                        {user ? 'Register for Event' : 'Login to Register'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2.5 border border-neutral-700 text-white hover:bg-neutral-800 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Right Column - Meta Info & Organizer */}
              <div className="space-y-5">
                {/* Meta Info */}
                <div className="p-5 bg-neutral-950/50 border border-neutral-800 rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <i className="fa-regular fa-calendar text-primary text-sm" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-medium">Date</p>
                      <p className="text-sm font-semibold text-white">
                        {formatDate(event.startDate).date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-clock text-primary text-sm" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-medium">Time</p>
                      <p className="text-sm font-semibold text-white">
                        {formatDate(event.startDate).time} - {formatDate(event.endDate).time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-location-dot text-primary text-sm" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-medium">Location</p>
                      <p className="text-sm font-semibold text-white line-clamp-1">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-users text-primary text-sm" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-medium">Capacity</p>
                      <p className="text-sm font-semibold text-white">
                        {event.availableSeats || event.capacity} seats
                      </p>
                    </div>
                  </div>
                </div>

                {/* Organizer */}
                {event.creator && (
                  <div className="p-5 bg-neutral-950/50 border border-neutral-800 rounded-lg">
                    <p className="text-xs text-neutral-500 font-medium mb-2">Organized by</p>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-base font-bold text-primary">
                          {event.creator.firstName?.[0]}{event.creator.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {event.creator.firstName} {event.creator.lastName}
                        </p>
                        <p className="text-xs text-neutral-400">{event.creator.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
