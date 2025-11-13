import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventsService from '../services/eventsService';
import clubsService from '../services/clubsService';
import TabNavigation from '../components/TabNavigation';
import AdBanner from '../components/AdBanner';
import ServiceCard from '../components/ServiceCard';
import NativeAd from '../components/NativeAd';
import EventModal from '../components/EventModal';
import { Calendar, MapPin, Users } from 'lucide-react';
import { formatDate } from '../utils/dateFormatters';
import { getCategoryColor } from '../utils/categoryMappers';

// Mock data for initial development
const mockAds = [
  {
    id: 1,
    position: 'TOP_BANNER',
    imageUrl: 'https://via.placeholder.com/728x90?text=Top+Banner+Ad',
    linkUrl: 'https://kazguu.kz',
    title: 'Образование будущего',
  },
  {
    id: 2,
    position: 'NATIVE_FEED',
    imageUrl: 'https://via.placeholder.com/400x300?text=Native+Ad',
    linkUrl: 'https://kaspi.kz',
    title: 'Специальное предложение',
    description: 'Получите скидку 20% на все товары!',
  },
];

const mockServices = [
  {
    id: 1,
    type: 'GENERAL',
    title: 'Professional Logo Design',
    description: 'I will create a unique logo for your business with unlimited revisions',
    category: 'DESIGN',
    price: 15000,
    priceType: 'FIXED',
    rating: 4.8,
    reviewCount: 24,
    imageUrl: 'https://via.placeholder.com/400x300?text=Logo+Design',
    provider: {
      firstName: 'Айдар',
      lastName: 'Султанов',
      faculty: 'Design',
    },
  },
  {
    id: 2,
    type: 'TUTORING',
    title: 'Math Tutoring (Algebra & Calculus)',
    description: 'Experienced math tutor for university students. Flexible schedule.',
    category: 'MATH',
    price: 5000,
    priceType: 'HOURLY',
    rating: 5.0,
    reviewCount: 18,
    imageUrl: 'https://via.placeholder.com/400x300?text=Math+Tutoring',
    provider: {
      firstName: 'Алия',
      lastName: 'Нурмуханова',
      faculty: 'Mathematics',
    },
  },
  {
    id: 3,
    type: 'GENERAL',
    title: 'Web Development Services',
    description: 'Full-stack web development: React, Node.js, PostgreSQL',
    category: 'IT',
    price: 25000,
    priceType: 'FIXED',
    rating: 4.9,
    reviewCount: 31,
    imageUrl: 'https://via.placeholder.com/400x300?text=Web+Development',
    provider: {
      firstName: 'Ерлан',
      lastName: 'Бекназаров',
      faculty: 'Computer Science',
    },
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [services] = useState(mockServices); // Will be loaded from API later
  const [loading, setLoading] = useState(true);
  const [modalEventId, setModalEventId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Redirect organizers and admins
  useEffect(() => {
    if (isAuthenticated() && user) {
      if (user.role === 'ORGANIZER') {
        navigate('/organizer', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (events.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(events.length, 6));
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [eventsResponse, clubsResponse] = await Promise.all([
        eventsService.getAll({ page: 1, limit: 20 }),
        clubsService.getAll({ page: 1, limit: 20 }),
      ]);

      // Handle events response
      let eventsData = [];
      if (eventsResponse && typeof eventsResponse === 'object') {
        if (Array.isArray(eventsResponse)) {
          eventsData = eventsResponse;
        } else if (Array.isArray(eventsResponse.data)) {
          eventsData = eventsResponse.data;
        } else if (eventsResponse.events && Array.isArray(eventsResponse.events)) {
          eventsData = eventsResponse.events;
        }
      }

      // Handle clubs response
      let clubsData = [];
      if (clubsResponse && typeof clubsResponse === 'object') {
        if (Array.isArray(clubsResponse)) {
          clubsData = clubsResponse;
        } else if (Array.isArray(clubsResponse.data)) {
          clubsData = clubsResponse.data;
        }
      }

      setEvents(eventsData);
      setClubs(clubsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return renderEventsTab();
      case 'clubs':
        return renderClubsTab();
      case 'services':
        return renderServicesTab('GENERAL');
      case 'tutoring':
        return renderServicesTab('TUTORING');
      default:
        return renderEventsTab();
    }
  };

  const renderEventsTab = () => {
    if (loading) {
      return <div className="text-center py-12">Загрузка событий...</div>;
    }

    // Insert native ads every 5-6 cards
    const contentWithAds = [];
    events.forEach((event, index) => {
      contentWithAds.push(
        <EventCard key={event.id} event={event} onClick={() => openEventModal(event.id)} />
      );

      // Insert native ad after every 5 events
      if ((index + 1) % 5 === 0 && mockAds.find((ad) => ad.position === 'NATIVE_FEED')) {
        const nativeAd = mockAds.find((ad) => ad.position === 'NATIVE_FEED');
        contentWithAds.push(<NativeAd key={`ad-${index}`} ad={nativeAd} />);
      }
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentWithAds}
      </div>
    );
  };

  const renderClubsTab = () => {
    if (loading) {
      return <div className="text-center py-12">Загрузка клубов...</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <ClubCard key={club.id} club={club} onClick={() => navigate(`/clubs/${club.id}`)} />
        ))}
      </div>
    );
  };

  const renderServicesTab = (type) => {
    const filteredServices = services.filter((service) => service.type === type);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Hero Section - Event Slider */}
      <section className="relative h-screen -mt-20 pt-20 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] transition-colors duration-300">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-900 dark:text-white">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#d62e1f] mb-4"></div>
              <p className="text-xl">Loading events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <>
            <div className="absolute inset-0 bg-[url('/images/backg.jpg')] bg-cover bg-center opacity-20 dark:opacity-20" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
                Discover <span className="text-[#d62e1f]">Events</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-[#a0a0a0] mb-8 max-w-2xl text-center">
                Join the best university events at MNU
              </p>
            </div>
          </>
        ) : (
          <>
            {events.slice(0, 6).map((event, index) => {
              const isActive = index === currentSlide;
              const imageUrl = event.imageUrl || '/images/backg.jpg';

              return (
                <div
                  key={event.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  >
                    <div className="absolute inset-0 bg-black/50" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
                    <div className="max-w-4xl text-center space-y-6">
                      <span className="inline-block bg-[#d62e1f] text-white px-4 py-2 rounded-full text-sm font-bold uppercase">
                        {event.category}
                      </span>
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
                        {event.title}
                      </h1>
                      <p className="text-lg md:text-xl text-[#e0e0e0] max-w-2xl mx-auto line-clamp-2">
                        {event.description || 'Join us for an amazing event!'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base text-white">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <div className="hidden md:flex justify-center pt-4">
                        <button
                          type="button"
                          onClick={() => openEventModal(event.id)}
                          className="liquid-glass-red-button px-8 py-4 text-white rounded-2xl font-bold text-base"
                        >
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {events.slice(0, 6).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-3 rounded-full transition-all ${
                          idx === currentSlide
                            ? 'bg-[#d62e1f] w-8'
                            : 'liquid-glass-subtle hover:liquid-glass w-3'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentSlide((prev) => (prev - 1 + 6) % Math.min(events.length, 6))
                    }
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 liquid-glass-button text-white p-4 rounded-2xl transition-all"
                    aria-label="Previous slide"
                  >
                    <i className="fa-solid fa-chevron-left text-xl" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % Math.min(events.length, 6))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 liquid-glass-button text-white p-4 rounded-2xl transition-all"
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

      {/* Top Banner Ad */}
      {mockAds.find((ad) => ad.position === 'TOP_BANNER') && (
        <div className="bg-gray-100 dark:bg-[#0a0a0a] py-4">
          <AdBanner ad={mockAds.find((ad) => ad.position === 'TOP_BANNER')} position="TOP_BANNER" />
        </div>
      )}

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Bottom Banner Ad */}
      {mockAds.find((ad) => ad.position === 'BOTTOM_BANNER') && (
        <AdBanner ad={mockAds.find((ad) => ad.position === 'BOTTOM_BANNER')} position="BOTTOM_BANNER" />
      )}

      {/* Event Modal */}
      {modalEventId && (
        <EventModal
          eventId={modalEventId}
          isOpen={isModalOpen}
          onClose={closeEventModal}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ event, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        group cursor-pointer
        bg-white/80 dark:bg-[#1a1a1a]/80
        backdrop-blur-xl rounded-2xl overflow-hidden
        border border-gray-200/50 dark:border-[#2a2a2a]/50
        hover:border-[#d62e1f]/50 dark:hover:border-[#d62e1f]/50
        shadow-lg hover:shadow-xl
        transform hover:-translate-y-1
        transition-all duration-300
      "
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl || 'https://via.placeholder.com/400x300?text=Event'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
              event.category
            )}`}
          >
            {event.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          {event._count?.registrations !== undefined && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{event._count.registrations} зарегистрировано</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Club Card Component
function ClubCard({ club, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        group cursor-pointer
        bg-white/80 dark:bg-[#1a1a1a]/80
        backdrop-blur-xl rounded-2xl overflow-hidden
        border border-gray-200/50 dark:border-[#2a2a2a]/50
        hover:border-[#d62e1f]/50 dark:hover:border-[#d62e1f]/50
        shadow-lg hover:shadow-xl
        transform hover:-translate-y-1
        transition-all duration-300
      "
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={club.imageUrl || 'https://via.placeholder.com/400x300?text=Club'}
          alt={club.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {club.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {club.description}
        </p>

        {club._count?.members !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{club._count.members} участников</span>
          </div>
        )}
      </div>
    </div>
  );
}
