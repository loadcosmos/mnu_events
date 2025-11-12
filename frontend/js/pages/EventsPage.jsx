import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import eventsService from '../services/eventsService';
import EventModal from '../components/EventModal';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalEventId, setModalEventId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['All', 'Creativity', 'Service', 'Intelligence'];

  const openEventModal = (eventId) => {
    console.log('[EventsPage] Opening modal for event:', eventId);
    setModalEventId(eventId);
    setIsModalOpen(true);
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalEventId(null), 300);
  };

  // Загрузка событий при монтировании и изменении фильтров
  useEffect(() => {
    // Debounce для всех изменений фильтров (300ms для категорий, 500ms для поиска)
    const debounceTime = searchQuery ? 500 : 300;
    const timer = setTimeout(() => {
      loadEvents();
    }, debounceTime);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Маппинг категорий UI на категории API
      const categoryMap = {
        'Creativity': 'CULTURAL',
        'Service': 'SOCIAL',
        'Intelligence': 'ACADEMIC',
      };
      
      const params = {
        page: 1,
        limit: 50, // Загружаем больше событий для лучшего UX
      };
      
      // Добавляем фильтры если выбраны
      if (selectedCategory !== 'All' && categoryMap[selectedCategory]) {
        params.category = categoryMap[selectedCategory];
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await eventsService.getAll(params);
      
      // API возвращает { data: [...], meta: {...} }
      // Проверяем разные возможные форматы ответа
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
      
      // Логирование для отладки (только в dev режиме)
      if (import.meta.env.DEV) {
        console.log('[EventsPage] Loaded events:', {
          responseType: typeof response,
          isArray: Array.isArray(response),
          hasData: !!response?.data,
          eventsCount: eventsData.length,
          firstEvent: eventsData[0] || null,
        });
      }
      
      setEvents(eventsData);
    } catch (err) {
      console.error('[EventsPage] Load events failed:', err);
      // Более понятное сообщение об ошибке
      const errorMessage = err.response?.data?.message 
        ? (Array.isArray(err.response.data.message) 
            ? err.response.data.message.join(', ')
            : err.response.data.message)
        : err.message || 'Failed to load events';
      setError(errorMessage);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Маппинг категорий API на категории UI
  const mapCategoryToUI = (apiCategory) => {
    const categoryMap = {
      'CULTURAL': 'Creativity',
      'SOCIAL': 'Service',
      'ACADEMIC': 'Intelligence',
      'TECH': 'Intelligence',
      'SPORTS': 'Service',
      'CAREER': 'Service',
      'OTHER': 'Service',
    };
    return categoryMap[apiCategory] || 'Service';
  };

  // Сортировка по дате (фильтрация происходит на бэкенде)
  const sortedEvents = [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  const getCategoryColor = (category) => {
    const uiCategory = mapCategoryToUI(category);
    const cat = uiCategory.toLowerCase();
    const colors = {
      creativity: 'bg-purple-100 text-purple-800 border-purple-200',
      service: 'bg-green-100 text-green-800 border-green-200',
      intelligence: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[cat] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Dark Premium */}
      <div className="bg-gradient-to-b from-neutral-900 to-black py-16 md:py-20 border-b border-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Discover Events
            </h1>
            <p className="text-lg md:text-xl text-neutral-400">
              Find the perfect event for you from our collection of upcoming activities
            </p>

            {/* Dark Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500 text-lg" />
              <Input
                type="search"
                placeholder="Search events, organizers, or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-6 py-6 rounded-lg border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 text-base"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Dark Category Filters */}
        <div className="sticky top-28 z-40 bg-black/90 backdrop-blur-lg py-6 -mx-4 px-4 mb-8 border-b border-neutral-800">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm font-semibold text-neutral-400 flex-shrink-0">Filter:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  if (import.meta.env.DEV) {
                    console.log('[EventsPage] Category selected:', cat);
                  }
                }}
                className={cn(
                  'flex-shrink-0 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all',
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-neutral-900 text-neutral-300 border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 rounded-lg bg-red-950/50 border border-red-900/50">
            <div className="flex items-center gap-3 text-red-400">
              <i className="fa-solid fa-exclamation-circle text-xl" />
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-800 border-t-primary"></div>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa-regular fa-calendar-xmark text-5xl text-neutral-700 mb-6"></i>
            <h3 className="text-2xl font-bold text-white mb-2">No events found</h3>
            <p className="text-neutral-400">
              {error ? 'Failed to load events. Please try again later.' : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-neutral-400">
                Showing <span className="font-semibold text-white">{sortedEvents.length}</span> {sortedEvents.length === 1 ? 'event' : 'events'}
              </p>
            </div>

            {/* Dark Premium Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEvents.map((event) => {
                const { date, time } = formatDate(event.startDate);
                const imageUrl = event.imageUrl || '/images/event-placeholder.jpg';

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => openEventModal(event.id)}
                    className="group text-left w-full"
                  >
                    {/* Dark Premium Card */}
                    <div className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all hover:shadow-xl hover:shadow-primary/5 h-full cursor-pointer">
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden bg-neutral-950">
                        <img
                          src={imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = '/images/event-placeholder.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Red Date Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-md text-sm font-bold">
                          <i className="fa-regular fa-calendar" />
                          {date}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>

                        {/* Meta Info */}
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3 text-sm text-neutral-400">
                            <i className="fa-solid fa-clock w-4 text-primary" />
                            <span className="font-medium">{time}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-neutral-400">
                            <i className="fa-solid fa-location-dot w-4 text-primary" />
                            <span className="line-clamp-1 font-medium">{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        eventId={modalEventId}
        isOpen={isModalOpen}
        onClose={closeEventModal}
      />

      {/* Custom Scrollbar Style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
