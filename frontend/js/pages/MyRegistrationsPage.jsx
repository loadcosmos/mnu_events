import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import registrationsService from '../services/registrationsService';
import EventModal from '../components/EventModal';
import FilterSheet from '../components/FilterSheet';
import { formatDate } from '../utils/dateFormatters';
import { toast } from 'sonner';

export default function MyRegistrationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [modalEventId, setModalEventId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filters = ['ALL', 'UPCOMING', 'PAST', 'WAITLIST'];

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: '/registrations' } } });
      return;
    }
    loadRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await registrationsService.getMyRegistrations();
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
      await loadRegistrations();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel registration');
      console.error('[MyRegistrationsPage] Cancel registration failed:', err);
      toast.error('Failed to cancel registration', {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setCancellingId(null);
    }
  };

  const openEventModal = (eventId) => {
    setModalEventId(eventId);
    setIsModalOpen(true);
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalEventId(null), 300);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'REGISTERED':
        return 'bg-green-600';
      case 'WAITLIST':
        return 'bg-yellow-600';
      case 'CANCELLED':
        return 'bg-[#666666]';
      default:
        return 'bg-[#2a2a2a]';
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        reg.event?.title?.toLowerCase().includes(query) ||
        reg.event?.description?.toLowerCase().includes(query) ||
        reg.event?.location?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'WAITLIST') return reg.status === 'WAITLIST';

    const now = new Date();
    const eventEnd = new Date(reg.event?.endDate || reg.event?.startDate);

    if (selectedFilter === 'UPCOMING') {
      return eventEnd > now && reg.status !== 'CANCELLED';
    }
    if (selectedFilter === 'PAST') {
      return eventEnd <= now || reg.status === 'CANCELLED';
    }
    return true;
  });

  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
    return new Date(a.event?.startDate) - new Date(b.event?.startDate);
  });

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section (Not Sticky) */}
      <div className="py-12 px-4 border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            My <span className="text-[#d62e1f]">Registrations</span>
          </h1>
          <p className="text-xl text-[#a0a0a0]">View and manage your event registrations</p>
        </div>
      </div>

      {/* Desktop: Sticky Search Bar Only */}
      <div className="hidden md:block sticky top-28 z-30 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#2a2a2a] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative max-w-2xl">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0] text-lg" />
            <Input
              type="search"
              placeholder="Search your registrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 rounded-lg border-[#2a2a2a] bg-[#1a1a1a] text-white placeholder:text-[#666666] focus:border-[#d62e1f] focus:ring-2 focus:ring-[#d62e1f]/20"
            />
          </div>
        </div>
      </div>

      {/* Mobile: Compact Sticky Bar with Icons */}
      <div className="md:hidden sticky top-28 z-30 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] text-[#a0a0a0]"
          >
            <i className="fa-solid fa-magnifying-glass text-lg" />
            <span className="text-sm">Search registrations...</span>
          </button>

          <button
            onClick={() => setFilterSheetOpen(true)}
            className="bg-[#d62e1f] hover:bg-[#b91c1c] p-3 rounded-lg transition-colors"
            aria-label="Open filters"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </button>
        </div>

        {mobileSearchOpen && (
          <div className="px-4 pb-3">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0] text-lg" />
              <Input
                type="search"
                placeholder="Search registrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="pl-12 pr-6 py-3 rounded-lg border-[#2a2a2a] bg-[#1a1a1a] text-white placeholder:text-[#666666] focus:border-[#d62e1f] focus:ring-2 focus:ring-[#d62e1f]/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Non-Sticky Filter Buttons */}
      <div className="hidden md:block py-6 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                  selectedFilter === filter
                    ? 'bg-[#d62e1f] text-white'
                    : 'bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Registrations Grid */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-8 p-6 rounded-lg bg-[#1a1a1a] border border-[#d62e1f]/50">
              <div className="flex items-center gap-3 text-[#d62e1f]">
                <i className="fa-solid fa-exclamation-circle text-xl" />
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2a2a2a] border-t-[#d62e1f]"></div>
            </div>
          ) : sortedRegistrations.length === 0 ? (
            <div className="text-center py-20 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
              <i className="fa-regular fa-calendar-xmark text-5xl text-[#666666] mb-6"></i>
              <h3 className="text-2xl font-bold text-white mb-2">No registrations found</h3>
              <p className="text-[#a0a0a0] mb-6">
                {selectedFilter === 'ALL'
                  ? "You haven't registered for any events yet"
                  : `No ${selectedFilter.toLowerCase()} registrations found`}
              </p>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#d62e1f] hover:bg-[#b91c1c] text-white font-semibold rounded-lg transition-colors"
              >
                Browse Events
                <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-[#a0a0a0]">
                  Showing <span className="font-semibold text-white">{sortedRegistrations.length}</span>{' '}
                  {sortedRegistrations.length === 1 ? 'registration' : 'registrations'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedRegistrations.map((registration) => {
                  const event = registration.event;
                  if (!event) return null;

                  const imageUrl = event.imageUrl || '/images/event-placeholder.jpg';
                  const isPast = new Date(event.endDate || event.startDate) < new Date();
                  const isCheckedIn = registration.checkedInAt;

                  return (
                    <div
                      key={registration.id}
                      className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-[#d62e1f] transition-all cursor-pointer group"
                      onClick={() => openEventModal(event.id)}
                    >
                      <div className="relative h-48 overflow-hidden bg-[#0a0a0a]">
                        <img
                          src={imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = '/images/event-placeholder.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-[#d62e1f] text-white rounded text-xs font-bold uppercase">
                          {event.category}
                        </div>

                        {/* Status Badge */}
                        <div className={`absolute top-3 left-3 px-3 py-1.5 ${getStatusBadgeColor(registration.status)} text-white rounded text-xs font-bold uppercase`}>
                          {registration.status}
                        </div>

                        {/* Checked In Indicator */}
                        {isCheckedIn && (
                          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold flex items-center gap-2">
                            <i className="fa-solid fa-check-circle" />
                            CHECKED IN
                          </div>
                        )}
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[#a0a0a0] text-sm">{formatDate(event.startDate)}</span>
                        </div>

                        <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-[#d62e1f] transition-colors">
                          {event.title}
                        </h3>

                        <p className="text-[#a0a0a0] text-sm line-clamp-2">{event.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center text-[#a0a0a0] text-sm">
                            <i className="fa-solid fa-location-dot mr-2" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                          {event.endDate && event.endDate !== event.startDate && (
                            <div className="flex items-center text-[#a0a0a0] text-sm">
                              <i className="fa-regular fa-calendar mr-2" />
                              <span className="line-clamp-1">Ends: {formatDate(event.endDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Cancel Button */}
                        {!isPast && registration.status !== 'CANCELLED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(registration.id);
                            }}
                            disabled={cancellingId === registration.id}
                            className="w-full mt-4 px-4 py-2 bg-[#2a2a2a] hover:bg-[#d62e1f] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingId === registration.id ? (
                              <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-xmark mr-2" />
                                Cancel Registration
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Bottom Sheet */}
      <FilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter Registrations"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3">Status</label>
            <div className="space-y-2">
              {filters.map((filter) => (
                <label
                  key={filter}
                  className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFilter === filter
                      ? 'bg-[#d62e1f] text-white'
                      : 'bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="filter"
                    checked={selectedFilter === filter}
                    onChange={() => setSelectedFilter(filter)}
                    className="mr-3 accent-[#d62e1f]"
                  />
                  {filter}
                </label>
              ))}
            </div>
          </div>
        </div>
      </FilterSheet>

      {/* Event Modal */}
      <EventModal eventId={modalEventId} isOpen={isModalOpen} onClose={closeEventModal} />
    </div>
  );
}
