import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import eventsService from '../services/eventsService';
import EventModal from '../components/EventModal';
import FilterSheet from '../components/FilterSheet';
import { formatDate } from '../utils/dateFormatters';
import { EVENT_CATEGORIES } from '../utils/constants';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalEventId, setModalEventId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Collapsible filter sections
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const [statusExpanded, setStatusExpanded] = useState(false);
  const [dateExpanded, setDateExpanded] = useState(false);

  const categories = ['ALL', ...Object.values(EVENT_CATEGORIES)];
  const statuses = ['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'];

  const openEventModal = (eventId) => {
    setModalEventId(eventId);
    setIsModalOpen(true);
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalEventId(null), 300);
  };

  // Load events when filters change
  useEffect(() => {
    const debounceTime = searchQuery ? 500 : 300;
    const timer = setTimeout(() => {
      loadEvents();
    }, debounceTime);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedStatus, searchQuery, startDate, endDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: 1,
        limit: 100,
      };

      if (selectedCategory !== 'ALL') {
        params.category = selectedCategory;
      }

      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (startDate) {
        params.startDateFrom = startDate;
      }

      if (endDate) {
        params.startDateTo = endDate;
      }

      const response = await eventsService.getAll(params);

      let eventsData = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          eventsData = response;
        } else if (Array.isArray(response.data)) {
          eventsData = response.data;
        } else if (response.events && Array.isArray(response.events)) {
          eventsData = response.events;
        }
      }

      setEvents(eventsData);
    } catch (err) {
      console.error('[EventsPage] Load events failed:', err);
      const errorMessage =
        err.response?.data?.message
          ? Array.isArray(err.response.data.message)
            ? err.response.data.message.join(', ')
            : err.response.data.message
          : err.message || 'Failed to load events';
      setError(errorMessage);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section (Not Sticky) */}
      <div className="py-12 px-4 border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            Discover <span className="text-[#d62e1f]">Events</span>
          </h1>
          <p className="text-xl text-[#a0a0a0]">Find your next adventure</p>
        </div>
      </div>

      {/* Desktop: Sticky Search Bar and Filters */}
      <div className="hidden md:block sticky top-20 z-30 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0] text-lg" />
              <Input
                type="search"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 rounded-lg border-[#2a2a2a] bg-[#1a1a1a] text-white placeholder:text-[#666666] focus:border-[#d62e1f] focus:ring-2 focus:ring-[#d62e1f]/20"
              />
            </div>
          </div>
        </div>
        {/* Category Filters */}
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#d62e1f] text-white'
                    : 'bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Compact Sticky Bar with Icons */}
      <div className="md:hidden sticky top-20 z-30 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Search Icon */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] text-[#a0a0a0]"
          >
            <i className="fa-solid fa-magnifying-glass text-lg" />
            <span className="text-sm">Search events...</span>
          </button>

          {/* Filter Icon */}
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

        {/* Mobile Search Expanded */}
        {mobileSearchOpen && (
          <div className="px-4 pb-3">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0] text-lg" />
              <Input
                type="search"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="pl-12 pr-6 py-3 rounded-lg border-[#2a2a2a] bg-[#1a1a1a] text-white placeholder:text-[#666666] focus:border-[#d62e1f] focus:ring-2 focus:ring-[#d62e1f]/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Events Grid */}
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
          ) : sortedEvents.length === 0 ? (
            <div className="text-center py-20 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
              <i className="fa-regular fa-calendar-xmark text-5xl text-[#666666] mb-6"></i>
              <h3 className="text-2xl font-bold text-white mb-2">No events found</h3>
              <p className="text-[#a0a0a0]">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-[#a0a0a0]">
                  Showing <span className="font-semibold text-white">{sortedEvents.length}</span>{' '}
                  {sortedEvents.length === 1 ? 'event' : 'events'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedEvents.map((event) => {
                  const imageUrl = event.imageUrl || '/images/event-placeholder.jpg';

                  return (
                    <div
                      key={event.id}
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
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-block bg-[#d62e1f] text-white px-3 py-1 rounded text-xs font-bold uppercase">
                            {event.category}
                          </span>
                          <span className="text-[#a0a0a0] text-sm">{formatDate(event.startDate)}</span>
                        </div>

                        <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-[#d62e1f] transition-colors">
                          {event.title}
                        </h3>

                        <p className="text-[#a0a0a0] text-sm line-clamp-2">{event.description}</p>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center text-[#a0a0a0] text-sm">
                            <i className="fa-solid fa-location-dot mr-2" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                          <div className="flex items-center text-[#a0a0a0] text-sm">
                            <i className="fa-solid fa-users mr-2" />
                            <span>
                              {event._count?.registrations || 0} / {event.capacity}
                            </span>
                          </div>
                        </div>
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
        title="Filter Events"
      >
        <div className="space-y-4">
          {/* Category Filter - Collapsible */}
          <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
            <button
              onClick={() => setCategoryExpanded(!categoryExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#2a2a2a] text-white font-semibold hover:bg-[#3a3a3a] transition-colors"
            >
              <span>Category</span>
              <i
                className={`fa-solid fa-chevron-down text-sm transition-transform ${
                  categoryExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            {categoryExpanded && (
              <div className="p-3 space-y-2 bg-[#1a1a1a]">
                {categories.map((category) => (
                  <label
                    key={category}
                    className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#d62e1f] text-white'
                        : 'bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                      className="mr-3 accent-[#d62e1f]"
                    />
                    {category}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter - Collapsible */}
          <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
            <button
              onClick={() => setStatusExpanded(!statusExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#2a2a2a] text-white font-semibold hover:bg-[#3a3a3a] transition-colors"
            >
              <span>Status</span>
              <i
                className={`fa-solid fa-chevron-down text-sm transition-transform ${
                  statusExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            {statusExpanded && (
              <div className="p-3 space-y-2 bg-[#1a1a1a]">
                {statuses.map((status) => (
                  <label
                    key={status}
                    className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                      selectedStatus === status
                        ? 'bg-[#d62e1f] text-white'
                        : 'bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      checked={selectedStatus === status}
                      onChange={() => setSelectedStatus(status)}
                      className="mr-3 accent-[#d62e1f]"
                    />
                    {status}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Filter - Collapsible */}
          <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
            <button
              onClick={() => setDateExpanded(!dateExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#2a2a2a] text-white font-semibold hover:bg-[#3a3a3a] transition-colors"
            >
              <span>Date Range</span>
              <i
                className={`fa-solid fa-chevron-down text-sm transition-transform ${
                  dateExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            {dateExpanded && (
              <div className="p-4 space-y-4 bg-[#1a1a1a]">
                <div>
                  <label className="block text-[#a0a0a0] text-sm mb-2">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[#2a2a2a] bg-[#2a2a2a] text-white focus:border-[#d62e1f] focus:ring-2 focus:ring-[#d62e1f]/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#a0a0a0] text-sm mb-2">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[#2a2a2a] bg-[#2a2a2a] text-white focus:border-[#d62e1f] focus:ring-2 focus:ring-[#d62e1f]/20 outline-none"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-white transition-colors text-sm"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </FilterSheet>

      <EventModal eventId={modalEventId} isOpen={isModalOpen} onClose={closeEventModal} />
    </div>
  );
}
