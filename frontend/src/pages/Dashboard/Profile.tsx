import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <p className="text-lg font-medium">{user.firstName} {user.lastName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="text-lg font-medium">{user.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Role</label>
            <p className="text-lg font-medium">{user.role}</p>
          </div>
          {user.faculty && (
            <div>
              <label className="text-sm text-gray-500">Faculty</label>
              <p className="text-lg font-medium">{user.faculty}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
