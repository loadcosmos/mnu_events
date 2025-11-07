import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsService } from '../../services/events.service';
import { Event } from '../../types';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data } = await eventsService.getAll({ limit: 20 });
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading events...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">University Events</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link key={event.id} to={`/events/${event.id}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">{event.category}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{event.status}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(event.startDate), 'PPp')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{event._count?.registrations || 0} / {event.capacity}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
