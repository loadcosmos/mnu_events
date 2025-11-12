import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import clubsService from '../services/clubsService';

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await clubsService.getAll({ page: 1, limit: 50 });
      
      // Обрабатываем различные форматы ответа API
      let clubsData = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          clubsData = response;
        } else if (Array.isArray(response.data)) {
          clubsData = response.data;
        } else if (response.clubs && Array.isArray(response.clubs)) {
          clubsData = response.clubs;
        }
      }

      if (import.meta.env.DEV) {
        console.log('[ClubsPage] Loaded clubs:', {
          responseType: typeof response,
          isArray: Array.isArray(response),
          hasData: !!response?.data,
          clubsCount: clubsData.length,
          firstClub: clubsData[0] || null,
        });
      }

      setClubs(clubsData);
    } catch (err) {
      console.error('[ClubsPage] Load clubs failed:', err);
      const errorMessage = err.response?.data?.message
        ? (Array.isArray(err.response.data.message)
            ? err.response.data.message.join(', ')
            : err.response.data.message)
        : err.message || 'Failed to load clubs';
      setError(errorMessage);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  // Маппинг категорий API на категории UI
  const mapCategoryToUI = (apiCategory) => {
    const categoryMap = {
      'ACADEMIC': 'Academic',
      'ARTS': 'Arts',
      'SERVICE': 'Service',
      'TECH': 'Tech',
      'SPORTS': 'Sports',
      'CULTURAL': 'Cultural',
      'OTHER': 'Other',
    };
    return categoryMap[apiCategory] || apiCategory;
  };

  const categories = ['All', 'Academic', 'Arts', 'Service', 'Tech', 'Sports', 'Cultural'];

  const getCategoryColor = (category) => {
    const uiCategory = mapCategoryToUI(category);
    const colors = {
      'Academic': 'bg-blue-100 text-blue-800 border-blue-200',
      'Arts': 'bg-purple-100 text-purple-800 border-purple-200',
      'Service': 'bg-green-100 text-green-800 border-green-200',
      'Tech': 'bg-orange-100 text-orange-800 border-orange-200',
      'Sports': 'bg-red-100 text-red-800 border-red-200',
      'Cultural': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Other': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[uiCategory] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const uiCategory = mapCategoryToUI(club.category);
    const matchesCategory = selectedCategory === 'All' || uiCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Dark Premium Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-black py-16 md:py-20 border-b border-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Student Clubs
            </h1>
            <p className="text-lg md:text-xl text-neutral-400">
              Discover student organizations and join communities that interest you
            </p>

            {/* Dark Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500 text-lg" />
              <Input
                type="text"
                placeholder="Search clubs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-6 py-6 rounded-lg border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 text-base w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dark Category Filters */}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-800 border-t-primary mb-4"></div>
            <p className="text-neutral-400">Loading clubs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="mb-8 p-6 rounded-lg bg-red-950/50 border border-red-900/50 inline-block">
              <p className="text-red-400 font-semibold mb-2">Failed to load clubs</p>
              <p className="text-sm text-neutral-400">{error}</p>
            </div>
            <div>
              <button
                onClick={loadClubs}
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa-regular fa-users text-5xl text-neutral-700 mb-6 block"></i>
            <p className="text-white text-xl font-bold mb-2">
              {clubs.length === 0 ? 'No clubs available' : 'No clubs found'}
            </p>
            <p className="text-neutral-400">
              {clubs.length === 0
                ? 'Check back later for new clubs!'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-neutral-400 text-center">
              Found <span className="font-semibold text-white">{filteredClubs.length}</span> {filteredClubs.length === 1 ? 'club' : 'clubs'}
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => {
              const imageUrl = club.imageUrl || club.image || '/images/event-placeholder.jpg';
              const shortDescription = club.description
                ? (club.description.length > 120
                    ? club.description.substring(0, 120) + '...'
                    : club.description)
                : 'No description available';
              const uiCategory = mapCategoryToUI(club.category);
              const membersCount = club._count?.members || club.members || 0;

              return (
                <div
                  key={club.id}
                  className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer group"
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden bg-neutral-950">
                    <img
                      src={imageUrl}
                      alt={club.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = '/images/event-placeholder.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-primary text-white rounded-md text-sm font-bold">
                      {uiCategory}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {club.name}
                    </h3>
                    <p className="text-neutral-400 text-sm line-clamp-2 mb-4">
                      {shortDescription}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <i className="fa-solid fa-users text-primary w-4" />
                        <span>{membersCount} {membersCount === 1 ? 'member' : 'members'}</span>
                      </div>
                      {club.organizer && (
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          <i className="fa-solid fa-user-tie text-primary w-4" />
                          <span>Organized by {club.organizer.firstName} {club.organizer.lastName}</span>
                        </div>
                      )}
                    </div>

                    {/* View Club Button */}
                    <Link to={`/clubs/${club.id}`}>
                      <button className="w-full px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors">
                        View Club
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
