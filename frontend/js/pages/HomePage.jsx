import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import eventsService from '../services/eventsService';
import EventModal from '../components/EventModal';

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalEventId, setModalEventId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openEventModal = (eventId) => {
    console.log('[HomePage] Opening modal for event:', eventId);
    setModalEventId(eventId);
    setIsModalOpen(true);
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalEventId(null), 300);
  };

  // Загрузка событий при монтировании
  useEffect(() => {
    loadEvents();
  }, []);

  // Автопереключение слайдов каждые 5 секунд
  useEffect(() => {
    if (featuredEvents.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredEvents.length]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');

      // Загружаем события на 3 месяца вперед
      const today = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      const response = await eventsService.getAll({
        page: 1,
        limit: 100,
        startDateFrom: today.toISOString().split('T')[0],
        startDateTo: threeMonthsLater.toISOString().split('T')[0]
      });
      
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

      // Featured Events - берем первые 3-6 ближайших событий (на 3 месяца вперед)
      const now = new Date();
      const threeMonthsAhead = new Date();
      threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

      const upcoming = sortedEvents.filter(e => {
        const eventDate = new Date(e.startDate);
        return eventDate >= now && eventDate <= threeMonthsAhead;
      });
      setFeaturedEvents(upcoming.slice(0, 6));

      // Все события для календаря (на 3 месяца вперед)
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

  // Получить даты с событиями для выбранного месяца
  const getDatesWithEvents = () => {
    const [year, month] = selectedDate.split('-').map(Number);
    const datesWithEvents = new Set();

    allEvents.forEach(event => {
      const eventDate = new Date(event.startDate);
      if (eventDate.getMonth() === month - 1 && eventDate.getFullYear() === year) {
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
      {/* Hero Section - Automatic Event Slider */}
      <section className="relative overflow-hidden h-screen">
        {loading ? (
          // Loading state
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-red-600 to-red-800 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p className="text-xl">Loading events...</p>
            </div>
          </div>
        ) : featuredEvents.length === 0 ? (
          // Fallback when no events
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-red-600 to-red-800 text-white">
            <div className="absolute inset-0 bg-[url('/images/backg.jpg')] opacity-10 bg-cover bg-center" />
            <div className="container relative mx-auto px-4 h-full flex items-center justify-center">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  MNU Events
                </h1>
                <p className="text-xl md:text-2xl text-red-100">
                  Your guide to university life
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
          </div>
        ) : (
          // Event Slider
          <>
            {featuredEvents.map((event, index) => {
              const isActive = index === currentSlide;
              const { date, time } = formatDate(event.startDate);
              const imageUrl = event.imageUrl || '/images/backg.jpg';

              return (
                <div
                  key={event.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  {/* Background Image with Overlay */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  >
                    <div className="absolute inset-0 bg-black/60" />
                  </div>

                  {/* Content */}
                  <div className="container relative mx-auto px-4 h-full flex items-center">
                    <div className="max-w-4xl text-white space-y-6">
                      <Badge className="bg-primary text-white border-0 text-sm px-4 py-1">
                        {mapCategoryToUI(event.category)}
                      </Badge>
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                        {event.title}
                      </h1>
                      <p className="text-lg md:text-xl text-gray-200 max-w-2xl line-clamp-3">
                        {event.description || 'Join us for an amazing event!'}
                      </p>
                      <div className="flex flex-wrap gap-6 text-sm md:text-base">
                        <div className="flex items-center gap-2">
                          <i className="fa-regular fa-calendar text-xl" />
                          <span>{date} · {time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-location-dot text-xl" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => openEventModal(event.id)}
                          className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-base transition-colors"
                        >
                          Learn More
                        </button>
                        <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                          <Link to="/events">View All Events</Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Slide Indicators */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {featuredEvents.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          idx === currentSlide
                            ? 'bg-white w-8'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all backdrop-blur-sm"
                    aria-label="Previous slide"
                  >
                    <i className="fa-solid fa-chevron-left text-xl" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredEvents.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all backdrop-blur-sm"
                    aria-label="Next slide"
                  >
                    <i className="fa-solid fa-chevron-right text-xl" />
                  </button>
                </div>
              );
            })}
          </>
        )}
      </section>

      {/* About Section - Asymmetric Layout */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text Content */}
            <div className="space-y-6 md:space-y-8">
              <div className="inline-block">
                <span className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">About MNU Events</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
                Your guide to{' '}
                <span className="text-primary">university life</span>
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-neutral-600 leading-relaxed">
                  All the most exciting campus events in one place — parties, exhibitions, lectures, and much more.
                </p>
                <p className="text-neutral-500 leading-relaxed">
                  We inspire creativity, build connections, and celebrate student life through diverse cultural, social, and educational events.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-6 text-base font-semibold shadow-soft transition-all hover:shadow-soft-lg"
                  asChild
                >
                  <Link to="/login">Join the Community</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-neutral-200 text-neutral-900 hover:bg-neutral-50 rounded-full px-8 py-6 text-base font-semibold"
                  asChild
                >
                  <Link to="/events">Explore Events</Link>
                </Button>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden shadow-soft-lg">
                <img
                  src="/images/backg.jpg"
                  alt="University Events"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative Element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary rounded-3xl -z-10 opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events - Horizontal Scroll */}
      <section className="py-24 md:py-32 bg-neutral-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold tracking-wide text-neutral-500 uppercase mb-2 block">Upcoming</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900">Featured Events</h2>
            </div>
            <Link
              to="/events"
              className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              View All
              <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
              <i className="fa-solid fa-exclamation-circle text-4xl text-destructive mb-4"></i>
              <p className="text-neutral-900 font-semibold mb-2">Failed to load events</p>
              <p className="text-sm text-neutral-500">{error}</p>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
              <i className="fa-regular fa-calendar-xmark text-4xl text-neutral-300 mb-4"></i>
              <p className="text-neutral-900 font-semibold mb-2">No upcoming events</p>
              <p className="text-sm text-neutral-500">Check back later for new events!</p>
            </div>
          ) : (
            <>
              {/* Horizontal Scrolling Cards */}
              <div className="relative -mx-4 px-4">
                <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
                  {featuredEvents.map((event) => {
                    const { date, time } = formatDate(event.startDate);
                    const imageUrl = event.imageUrl || '/images/event-placeholder.jpg';

                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => openEventModal(event.id)}
                        className="flex-shrink-0 w-80 group snap-start text-left"
                      >
                        {/* Card */}
                        <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-all hover:shadow-soft-lg h-full cursor-pointer">
                          {/* Image */}
                          <div className="relative h-48 overflow-hidden bg-neutral-100">
                            <img
                              src={imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = '/images/event-placeholder.jpg';
                              }}
                            />
                          </div>

                          {/* Content */}
                          <div className="p-6 space-y-4">
                            {/* Date Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                              <i className="fa-regular fa-calendar" />
                              {date}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-neutral-900 line-clamp-2 group-hover:text-primary transition-colors">
                              {event.title}
                            </h3>

                            {/* Location & Time */}
                            <div className="space-y-2 text-sm text-neutral-500">
                              <div className="flex items-center gap-2">
                                <i className="fa-solid fa-clock w-4" />
                                <span>{time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="fa-solid fa-location-dot w-4" />
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile View All Link */}
              <div className="md:hidden mt-8 text-center">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 text-primary font-semibold px-6 py-3 rounded-full border-2 border-primary hover:bg-primary hover:text-white transition-all"
                >
                  View All Events
                  <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            </>
          )}
        </div>

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
      </section>

      {/* Upcoming Events - Interactive Calendar */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-sm font-semibold tracking-wide text-neutral-500 uppercase mb-2 block">Don't Miss Out</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">Upcoming Events</h2>
            <p className="text-neutral-500">Browse events for the next 3 months</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-primary"></div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[400px_1fr] gap-8 max-w-6xl mx-auto">
              {/* Left Column - Calendar */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 h-fit">
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-neutral-900">
                    {(() => {
                      const [year, month] = selectedDate.split('-').map(Number);
                      const date = new Date(year, month - 1);
                      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    })()}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const [year, month] = selectedDate.split('-').map(Number);
                        // Переход на предыдущий месяц
                        let newYear = year;
                        let newMonth = month - 1;
                        if (newMonth < 1) {
                          newMonth = 12;
                          newYear--;
                        }
                        const newDateStr = `${newYear}-${String(newMonth).padStart(2, '0')}-01`;
                        setSelectedDate(newDateStr);
                      }}
                      disabled={(() => {
                        // Запрещаем переход назад, если уже в текущем месяце
                        const [year, month] = selectedDate.split('-').map(Number);
                        const today = new Date();
                        const currentYear = today.getFullYear();
                        const currentMonth = today.getMonth() + 1; // JS месяцы 0-11, конвертируем в 1-12
                        return (year < currentYear) || (year === currentYear && month <= currentMonth);
                      })()}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      <i className="fa-solid fa-chevron-left text-neutral-600 text-sm" />
                    </button>
                    <button
                      onClick={() => {
                        const [year, month] = selectedDate.split('-').map(Number);
                        // Переход на следующий месяц
                        let newYear = year;
                        let newMonth = month + 1;
                        if (newMonth > 12) {
                          newMonth = 1;
                          newYear++;
                        }
                        const newDateStr = `${newYear}-${String(newMonth).padStart(2, '0')}-01`;
                        setSelectedDate(newDateStr);
                      }}
                      disabled={(() => {
                        // Запрещаем переход вперед больше чем на 3 месяца
                        const [year, month] = selectedDate.split('-').map(Number);
                        const today = new Date();
                        const currentYear = today.getFullYear();
                        const currentMonth = today.getMonth() + 1; // JS месяцы 0-11, конвертируем в 1-12

                        // Вычисляем месяц через 3 месяца
                        let maxYear = currentYear;
                        let maxMonth = currentMonth + 3;
                        if (maxMonth > 12) {
                          maxYear++;
                          maxMonth -= 12;
                        }

                        return (year > maxYear) || (year === maxYear && month >= maxMonth);
                      })()}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      <i className="fa-solid fa-chevron-right text-neutral-600 text-sm" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="space-y-2">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="text-center text-xs font-semibold text-neutral-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const [year, month] = selectedDate.split('-').map(Number);
                      const firstDay = new Date(year, month - 1, 1);
                      const lastDay = new Date(year, month, 0);
                      const daysInMonth = lastDay.getDate();

                      // Adjust to start week on Monday (0 = Sun, 1 = Mon, ..., 6 = Sat)
                      let startDayOfWeek = firstDay.getDay();
                      startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

                      const days = [];

                      // Empty cells before first day
                      for (let i = 0; i < startDayOfWeek; i++) {
                        days.push(<div key={`empty-${i}`} className="aspect-square" />);
                      }

                      // Actual days
                      const today = new Date().toISOString().split('T')[0];

                      for (let day = 1; day <= daysInMonth; day++) {
                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isToday = dateStr === today;
                        const isSelected = dateStr === selectedDate;
                        const hasEvents = datesWithEvents.has(dateStr);
                        const isPast = new Date(dateStr) < new Date(today) && !isToday;

                        days.push(
                          <button
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            disabled={isPast}
                            className={`
                              aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-semibold transition-all relative
                              ${isSelected ? 'bg-primary text-white' : ''}
                              ${isToday && !isSelected ? 'border-2 border-primary text-primary' : ''}
                              ${!isSelected && !isToday && !isPast ? 'hover:bg-neutral-100 text-neutral-900' : ''}
                              ${isPast ? 'text-neutral-300 cursor-not-allowed' : ''}
                            `}
                          >
                            <span>{day}</span>
                            {hasEvents && !isSelected && (
                              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                            )}
                          </button>
                        );
                      }

                      return days;
                    })()}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <div className="w-3 h-3 rounded border-2 border-primary" />
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <div className="w-3 h-3 rounded bg-primary" />
                    <span>Selected date</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <div className="flex items-end">
                      <div className="w-3 h-3 rounded bg-neutral-100 flex items-end justify-center pb-0.5">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                      </div>
                    </div>
                    <span>Has events</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Events List */}
              <div className="space-y-6">
                {/* Date Header */}
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                    {(() => {
                      const date = new Date(selectedDate + 'T00:00:00');
                      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
                    })()}
                  </h3>
                  <p className="text-neutral-500">
                    {eventsForSelectedDate.length} {eventsForSelectedDate.length === 1 ? 'event' : 'events'}
                  </p>
                </div>

                {/* Events List */}
                {eventsForSelectedDate.length === 0 ? (
                  <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200">
                    <i className="fa-regular fa-calendar-xmark text-4xl text-neutral-300 mb-4"></i>
                    <h4 className="text-xl font-bold text-neutral-900 mb-2">No events on this date</h4>
                    <p className="text-neutral-500 mb-6">Check other dates or explore all events</p>
                    <Button className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-3" asChild>
                      <Link to="/events">View All Events</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventsForSelectedDate.map((event) => {
                      const { time } = formatDate(event.startDate);
                      const imageUrl = event.imageUrl || '/images/event-placeholder.jpg';

                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => openEventModal(event.id)}
                          className="block group w-full text-left"
                        >
                          <div className="flex gap-4 p-4 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-soft transition-all cursor-pointer">
                            {/* Event Image */}
                            <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-neutral-100">
                              <img
                                src={imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src = '/images/event-placeholder.jpg';
                                }}
                              />
                            </div>

                            {/* Event Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-neutral-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                {event.title}
                              </h4>
                              <div className="space-y-1 text-sm text-neutral-600">
                                <div className="flex items-center gap-2">
                                  <i className="fa-solid fa-clock w-4 text-neutral-400" />
                                  <span>{time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <i className="fa-solid fa-location-dot w-4 text-neutral-400" />
                                  <span className="line-clamp-1">{event.location}</span>
                                </div>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex-shrink-0 flex items-center">
                              <i className="fa-solid fa-arrow-right text-neutral-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Event Modal */}
      <EventModal
        eventId={modalEventId}
        isOpen={isModalOpen}
        onClose={closeEventModal}
      />
    </div>
  );
}
