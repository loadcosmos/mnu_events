import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import usersService from '../services/usersService';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    faculty: '',
    avatar: '',
  });

  const loadUser = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      setError('');

      const userData = await usersService.getById(currentUser.id);
      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        faculty: userData.faculty || '',
        avatar: userData.avatar || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      console.error('[ProfilePage] Load user failed:', err);
      toast.error('Failed to load profile', {
        description: err.message || 'Unable to load your profile information.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated and load user data
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    if (currentUser?.id) {
      loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Validation failed', {
        description: 'Please fill in all required fields.',
      });
      return;
    }

    try {
      setSaving(true);
      setError('');

      const updatedUser = await usersService.update(currentUser.id, formData);
      setUser(updatedUser);
      setIsEditing(false);

      // Update user in auth context
      await refreshUser();

      toast.success('Profile updated successfully!', {
        description: 'Your profile information has been saved.',
      });
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('[ProfilePage] Update failed:', err);
      toast.error('Failed to update profile', {
        description: err.message || 'Unable to save your changes. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        faculty: user.faculty || '',
        avatar: user.avatar || '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-600 text-white';
      case 'ORGANIZER':
        return 'bg-orange-600 text-white';
      case 'STUDENT':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error || 'User not found'}</p>
              <Button onClick={loadUser} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted mb-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={cn(
                    'w-full h-full flex items-center justify-center text-2xl font-bold text-white',
                    !user.avatar && 'bg-gradient-to-br from-primary to-primary/80'
                  )}
                  style={{ display: user.avatar ? 'none' : 'flex' }}
                >
                  {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              {isEditing && (
                <div className="w-full">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    type="url"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Role Badge */}
            <div className="text-center">
              <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
            </div>

            {/* Email (read-only) */}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={user.email || ''}
                disabled
                className="mt-1 bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="faculty">Faculty</Label>
                <Input
                  id="faculty"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="mt-1"
                  placeholder="e.g., Computer Science"
                />
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" disabled={saving}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Additional account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Account Created</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <Label>Last Updated</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

