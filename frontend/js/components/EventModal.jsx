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
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modern Modal Content - Single Column Layout with Liquid Glass */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2a2a2a] transform transition-all duration-300 scale-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-[#2a2a2a] border-t-[#d62e1f]"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <i className="fa-solid fa-exclamation-circle text-4xl text-[#d62e1f] mb-4"></i>
            <p className="text-gray-900 dark:text-white font-semibold mb-2 transition-colors duration-300">{error}</p>
          </div>
        ) : event ? (
          <>
            {/* Hero Image with Overlay Information */}
            {event.imageUrl && (
              <div className="relative h-72 md:h-96 overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-[#0a0a0a] transition-colors duration-300">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/event-placeholder.jpg';
                  }}
                />

                {/* Dark gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                {/* Category Badge - Top Left */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block bg-[#d62e1f] text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide shadow-lg">
                    {event.category}
                  </span>
                </div>

                {/* Meta Info Overlay - Bottom Section - Liquid Glass Cards */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Date */}
                    <div className="flex items-center gap-2.5 bg-white/10 dark:bg-black/50 backdrop-blur-md px-3 py-2.5 rounded-lg border border-white/20 shadow-lg transition-colors duration-300">
                      <i className="fa-regular fa-calendar text-[#d62e1f] text-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 font-semibold mb-0.5">Date</p>
                        <p className="text-sm font-bold text-white truncate">
                          {formatDate(event.startDate).date}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2.5 bg-white/10 dark:bg-black/50 backdrop-blur-md px-3 py-2.5 rounded-lg border border-white/20 shadow-lg transition-colors duration-300">
                      <i className="fa-solid fa-clock text-[#d62e1f] text-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 font-semibold mb-0.5">Time</p>
                        <p className="text-sm font-bold text-white truncate">
                          {formatDate(event.startDate).time}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2.5 bg-white/10 dark:bg-black/50 backdrop-blur-md px-3 py-2.5 rounded-lg border border-white/20 shadow-lg transition-colors duration-300">
                      <i className="fa-solid fa-location-dot text-[#d62e1f] text-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 font-semibold mb-0.5">Location</p>
                        <p className="text-sm font-bold text-white truncate">
                          {event.location}
                        </p>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center gap-2.5 bg-white/10 dark:bg-black/50 backdrop-blur-md px-3 py-2.5 rounded-lg border border-white/20 shadow-lg transition-colors duration-300">
                      <i className="fa-solid fa-users text-[#d62e1f] text-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 font-semibold mb-0.5">Capacity</p>
                        <p className="text-sm font-bold text-white truncate">
                          {event._count?.registrations || 0} / {event.capacity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Organizer Section - Above Title */}
              {event.creator && (
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-[#2a2a2a] transition-colors duration-300">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d62e1f]/30 to-[#d62e1f]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-[#d62e1f]">
                        {event.creator.firstName?.[0]}{event.creator.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 dark:text-[#a0a0a0] font-semibold mb-0.5 transition-colors duration-300">Organized by</p>
                      <p className="font-bold text-gray-900 dark:text-white text-base truncate transition-colors duration-300">
                        {event.creator.firstName} {event.creator.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Go to Club Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/clubs';
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] text-gray-900 dark:text-white rounded-lg font-semibold text-sm transition-colors flex-shrink-0"
                  >
                    <i className="fa-solid fa-arrow-right text-[#d62e1f]" />
                    <span className="hidden sm:inline">Go to Club</span>
                  </button>
                </div>
              )}

              {/* Event Title - Large and Bold */}
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight transition-colors duration-300">
                {event.title}
              </h2>

              {/* Description */}
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">About this event</h3>
                <p className="text-gray-700 dark:text-[#a0a0a0] text-base leading-relaxed transition-colors duration-300">
                  {event.description || 'No description provided.'}
                </p>
              </div>

              {/* Action Button - Only Register */}
              <div className="pt-4">
                <button
                  onClick={handleRegister}
                  disabled={registering || !user}
                  className="w-full px-6 py-4 bg-[#d62e1f] hover:bg-[#b91c1c] text-white rounded-xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg"
                >
                  {registering ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2 text-lg" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-ticket mr-2 text-lg" />
                      {user ? 'Register for Event' : 'Login to Register'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
