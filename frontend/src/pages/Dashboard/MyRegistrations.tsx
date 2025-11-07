import { useEffect, useState } from 'react';
import { registrationsService } from '../../services/registrations.service';
import { Registration } from '../../types';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      const { data } = await registrationsService.getMyRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Registrations</h1>

      {registrations.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No registrations yet</div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">{reg.event?.title}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(reg.event?.startDate || ''), 'PPp')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{reg.event?.location}</span>
                </div>
                <div className="mt-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    reg.checkedIn ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {reg.checkedIn ? 'Checked In' : 'Registered'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
