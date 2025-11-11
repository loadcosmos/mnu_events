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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Student Clubs</h1>
        <p className="text-muted-foreground text-lg">
          Discover student organizations and join communities that interest you
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading clubs...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-2">Failed to load clubs</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={loadClubs}>
            Try Again
          </Button>
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="text-center py-12">
          <i className="fa-regular fa-users text-4xl text-muted-foreground mb-4 block"></i>
          <p className="text-muted-foreground text-lg font-semibold">
            {clubs.length === 0 ? 'No clubs available' : 'No clubs found'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {clubs.length === 0 
              ? 'Check back later for new clubs!' 
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground text-center">
            Found {filteredClubs.length} {filteredClubs.length === 1 ? 'club' : 'clubs'}
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
                <Card
                  key={club.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={club.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/images/event-placeholder.jpg';
                      }}
                    />
                    <Badge className={`absolute top-3 right-3 ${getCategoryColor(club.category)}`}>
                      {uiCategory}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{club.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{shortDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <i className="fa-solid fa-users text-primary" />
                        <span>{membersCount} {membersCount === 1 ? 'member' : 'members'}</span>
                      </div>
                      {club.organizer && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <i className="fa-solid fa-user-tie text-primary" />
                          <span>Organized by {club.organizer.firstName} {club.organizer.lastName}</span>
                        </div>
                      )}
                    </div>
                    <Button className="w-full" asChild>
                      <Link to={`/clubs/${club.id}`}>View Club</Link>
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
