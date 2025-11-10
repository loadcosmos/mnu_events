import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import eventsService from '../services/eventsService';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['All', 'Creativity', 'Service', 'Intelligence'];

  // Загрузка событий при монтировании и изменении фильтров
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, searchQuery ? 500 : 0); // Задержка только при вводе поискового запроса

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery]);

  // Вызов loadEvents при монтировании компонента
  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="container mx-auto px-4 py-8">
      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events, venues, clubs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filters */}
      <section className="mb-8" aria-label="Event categories">
        <h2 className="text-lg font-semibold mb-4 text-center">Filter by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => {
                setSelectedCategory(cat);
                // Логирование для отладки
                if (import.meta.env.DEV) {
                  console.log('[EventsPage] Category selected:', cat);
                }
              }}
              className={cn(
                'w-full transition-colors',
                selectedCategory === cat 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'hover:bg-accent'
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="text-center py-12">
          <i className="fa-regular fa-calendar-xmark text-4xl text-muted-foreground mb-4"></i>
          <p className="text-muted-foreground text-lg font-semibold">No events found</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error ? 'Failed to load events. Please try again later.' : 'Try adjusting your search or filters'}
          </p>
          {import.meta.env.DEV && (
            <div className="mt-4 p-4 bg-muted rounded-md text-left max-w-md mx-auto">
              <p className="text-xs font-mono text-muted-foreground">
                Debug: events.length = {events.length}, sortedEvents.length = {sortedEvents.length}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground text-center">
            Found {sortedEvents.length} {sortedEvents.length === 1 ? 'event' : 'events'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedEvents.map((event) => {
            const { date, time } = formatDate(event.startDate);
            const uiCategory = mapCategoryToUI(event.category);
            const organizerName = event.creator 
              ? `${event.creator.firstName} ${event.creator.lastName}`
              : 'Unknown Organizer';
            const imageUrl = event.imageUrl || '/images/event-placeholder.jpg';
            const shortDescription = event.description 
              ? (event.description.length > 100 
                  ? event.description.substring(0, 100) + '...' 
                  : event.description)
              : 'No description available';

            return (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/images/event-placeholder.jpg';
                    }}
                  />
                  <Badge
                    className={`absolute top-3 right-3 ${getCategoryColor(event.category)}`}
                  >
                    {uiCategory}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{shortDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <i className="fa-regular fa-calendar text-primary" />
                      <span>{date} · {time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-location-dot text-primary" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-users text-primary" />
                      <span>{organizerName}</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}
