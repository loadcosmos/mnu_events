import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import eventsService from '../services/eventsService';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Редирект организаторов и админов на их страницы
  useEffect(() => {
    if (isAuthenticated() && user) {
      if (user.role === 'ORGANIZER') {
        navigate('/organizer', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка событий при монтировании
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');

      // Загружаем все события
      const response = await eventsService.getAll({ page: 1, limit: 50 });
      
      // Обрабатываем различные форматы ответа API
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

      if (import.meta.env.DEV) {
        console.log('[HomePage] Loaded events:', {
          responseType: typeof response,
          isArray: Array.isArray(response),
          hasData: !!response?.data,
          eventsCount: eventsData.length,
          firstEvent: eventsData[0] || null,
        });
      }

      // Сортируем по дате
      const sortedEvents = [...eventsData].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      // Featured Events - берем первые 3-6 ближайших событий
      const now = new Date();
      const upcoming = sortedEvents.filter(e => {
        const eventDate = new Date(e.startDate);
        return eventDate >= now;
      });
      setFeaturedEvents(upcoming.slice(0, 6));

      // Все события для календаря
      setAllEvents(sortedEvents);
    } catch (err) {
      console.error('[HomePage] Load events failed:', err);
      const errorMessage = err.response?.data?.message
        ? (Array.isArray(err.response.data.message)
            ? err.response.data.message.join(', ')
            : err.response.data.message)
        : err.message || 'Failed to load events';
      setError(errorMessage);
      setFeaturedEvents([]);
      setAllEvents([]);
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

  // Форматирование даты для отображения
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return { date, time, dateOnly: d.toISOString().split('T')[0] };
  };

  // Получить события для выбранной даты
  const getEventsForDate = (dateStr) => {
    return allEvents.filter(event => {
      const eventDate = formatDate(event.startDate).dateOnly;
      return eventDate === dateStr;
    });
  };

  // Получить даты с событиями для текущего месяца
  const getDatesWithEvents = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const datesWithEvents = new Set();

    allEvents.forEach(event => {
      const eventDate = new Date(event.startDate);
      if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
        datesWithEvents.add(eventDate.toISOString().split('T')[0]);
      }
    });

    return datesWithEvents;
  };

  const datesWithEvents = getDatesWithEvents();
  const eventsForSelectedDate = getEventsForDate(selectedDate);

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-red-600 to-red-800 text-white">
        <div className="absolute inset-0 bg-[url('/images/backg.jpg')] opacity-10 bg-cover bg-center" />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              MNU Events
            </h1>
            <p className="text-xl md:text-2xl text-red-100">
              Your guide to university life
            </p>
            <p className="text-lg text-red-50 max-w-2xl mx-auto">
              All the most exciting campus events in one place — parties, exhibitions, lectures, and much more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/events">Explore Events</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/clubs">View Clubs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              MNU Events — your guide to university life.
            </h2>
            <p className="text-lg text-muted-foreground">
              All the most exciting campus events in one place — parties, exhibitions, lectures, and much more.
            </p>
            <p className="text-muted-foreground">
              We aim to inspire creativity, build connections, and celebrate student life through diverse cultural, social, and educational events.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/login">Join the Community</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Events</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-2">Failed to load events</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No upcoming events</p>
              <p className="text-sm text-muted-foreground mt-2">Check back later for new events!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => {
                const { date, time } = formatDate(event.startDate);
                const uiCategory = mapCategoryToUI(event.category);
                const imageUrl = event.imageUrl || '/images/event-placeholder.jpg';
                const shortDescription = event.description
                  ? (event.description.length > 100
                      ? event.description.substring(0, 100) + '...'
                      : event.description)
                  : 'No description available';

                return (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/images/event-placeholder.jpg';
                        }}
                      />
                      <Badge className={`absolute top-4 right-4 ${getCategoryColor(event.category)}`}>
                        {uiCategory}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{shortDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <i className="fa-regular fa-calendar text-primary" />
                          <span>{date} · {time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-location-dot text-primary" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" asChild>
                        <Link to={`/events/${event.id}`}>Learn More</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events Calendar */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-2">Don't Miss Out!</p>
            <h2 className="text-3xl font-bold">
              <span className="text-foreground">Upcoming</span>{' '}
              <span className="text-primary">Events</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading calendar...</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {(() => {
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = now.getMonth();
                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                      
                      return Array.from({ length: daysInMonth }, (_, i) => {
                        const date = new Date(year, month, i + 1);

                      const dateStr = date.toISOString().split('T')[0];
                      const isSelected = selectedDate === dateStr;
                      const hasEvents = datesWithEvents.has(dateStr);
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      const isPast = date < new Date() && !isToday;

                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          disabled={isPast}
                          className={`min-w-[60px] p-3 rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : isPast
                              ? 'bg-muted border-border opacity-50 cursor-not-allowed'
                              : hasEvents
                              ? 'bg-background border-primary/30 hover:bg-muted'
                              : 'bg-background border-border hover:bg-muted'
                          }`}
                        >
                          <div className="text-xs font-medium">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                            {date.getDate()}
                          </div>
                          {hasEvents && !isSelected && (
                            <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1" />
                          )}
                        </button>
                      );
                    })})()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventsForSelectedDate.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-muted-foreground">
                      <i className="fa-regular fa-calendar-xmark text-4xl mb-4 block"></i>
                      <p className="text-lg font-semibold">No events on this date</p>
                      <p className="text-sm mt-2">Check other dates or explore all events</p>
                      <Button className="mt-4" asChild>
                        <Link to="/events">View All Events</Link>
                      </Button>
                    </div>
                  ) : (
                    eventsForSelectedDate.map((event) => {
                      const { date, time } = formatDate(event.startDate);
                      const uiCategory = mapCategoryToUI(event.category);
                      const imageUrl = event.imageUrl || '/images/event-placeholder.jpg';

                      return (
                        <Link key={event.id} to={`/events/${event.id}`} className="block">
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full">
                            <div className="relative h-32 overflow-hidden">
                              <img
                                src={imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src = '/images/event-placeholder.jpg';
                                }}
                              />
                            </div>
                            <CardHeader>
                              <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                              <CardDescription className="text-sm">
                                <Badge className={getCategoryColor(event.category)}>
                                  {uiCategory}
                                </Badge>
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-sm text-muted-foreground">
                                <div className="flex items-center gap-2 mb-1">
                                  <i className="fa-regular fa-calendar text-primary" />
                                  <span>{date} · {time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <i className="fa-solid fa-location-dot text-primary" />
                                  <span className="line-clamp-1">{event.location}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
