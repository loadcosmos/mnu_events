import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { eventsService } from '../../services/events.service';
import { registrationsService } from '../../services/registrations.service';
import { Event } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (id) loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const data = await eventsService.getById(id!);
      setEvent(data);
    } catch (error) {
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register');
      return;
    }
    setRegistering(true);
    try {
      await registrationsService.register(id!);
      toast.success('Successfully registered!');
      loadEvent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!event) return <div className="text-center py-10">Event not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} className="w-full h-96 object-cover rounded-lg mb-8" />
      )}

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded">{event.category}</span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">{event.status}</span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
        <p className="text-gray-700 text-lg mb-8">{event.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="font-medium">{format(new Date(event.startDate), 'PPp')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-medium">{event._count?.registrations || 0} / {event.capacity}</p>
            </div>
          </div>
        </div>

        {user && event.status === 'UPCOMING' && (
          <button
            onClick={handleRegister}
            disabled={registering || (event._count?.registrations || 0) >= event.capacity}
            className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {registering ? 'Registering...' : 'Register for Event'}
          </button>
        )}
      </div>
    </div>
  );
}
