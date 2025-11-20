import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.jsx';
import servicesService from '../services/servicesService';
import { toast } from 'sonner';
import { AlertCircle, Sparkles } from 'lucide-react';

// Service types
const SERVICE_TYPES = [
  { value: 'GENERAL', label: 'General Service', description: 'Design, IT, Photo/Video, etc.' },
  { value: 'TUTORING', label: 'Tutoring', description: 'Academic subjects and languages' },
];

// Categories for GENERAL services
const GENERAL_CATEGORIES = [
  { value: 'DESIGN', label: 'Design' },
  { value: 'PHOTO_VIDEO', label: 'Photo/Video' },
  { value: 'IT', label: 'IT' },
  { value: 'COPYWRITING', label: 'Copywriting' },
  { value: 'CONSULTING', label: 'Consulting' },
  { value: 'OTHER', label: 'Other' },
];

// Categories for TUTORING services
const TUTORING_CATEGORIES = [
  { value: 'MATH', label: 'Math' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'PROGRAMMING', label: 'Programming' },
  { value: 'PHYSICS', label: 'Physics' },
  { value: 'CHEMISTRY', label: 'Chemistry' },
  { value: 'BIOLOGY', label: 'Biology' },
  { value: 'ECONOMICS', label: 'Economics' },
  { value: 'LAW', label: 'Law' },
];

// Price types
const PRICE_TYPES = [
  { value: 'HOURLY', label: 'Per Hour', description: 'Hourly rate' },
  { value: 'FIXED', label: 'Fixed Price', description: 'One-time fee' },
  { value: 'PER_SESSION', label: 'Per Session', description: 'Per session/lesson' },
];

export default function CreateServicePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myServicesCount, setMyServicesCount] = useState(0);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    category: '',
    price: '',
    priceType: '',
    imageUrl: '',
  });

  // Check subscription status
  const isPremium = user?.subscription?.status === 'ACTIVE';
  const maxServices = isPremium ? 10 : 3;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load user's current services count
  useEffect(() => {
    const loadMyServices = async () => {
      try {
        const response = await servicesService.getMyServices();
        const activeServices = response.data?.filter(s => s.isActive) || [];
        setMyServicesCount(activeServices.length);
      } catch (err) {
        console.error('[CreateServicePage] Failed to load services count:', err);
      }
    };

    if (isAuthenticated()) {
      loadMyServices();
    }
  }, [isAuthenticated]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');

    // Reset category when type changes
    if (field === 'type') {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  };

  const validateForm = () => {
    if (!formData.type) {
      setError('Service type is required');
      return false;
    }
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (formData.title.length > 200) {
      setError('Title must be less than 200 characters');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (formData.description.length < 100) {
      setError('Description must be at least 100 characters');
      return false;
    }
    if (formData.description.length > 5000) {
      setError('Description must be less than 5000 characters');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError('Price must be 0 or greater');
      return false;
    }
    if (!formData.priceType) {
      setError('Price type is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check service limit
    if (myServicesCount >= maxServices) {
      setError(
        isPremium
          ? 'You have reached the maximum of 10 active services. Please deactivate some services first.'
          : 'You have reached the free tier limit of 3 active services. Upgrade to Premium (500 тг/month) to post up to 10 services.'
      );
      toast.error('Service limit reached', {
        description: isPremium
          ? 'Maximum 10 active services'
          : 'Upgrade to Premium for more listings',
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const serviceData = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        priceType: formData.priceType,
        ...(formData.imageUrl.trim() && { imageUrl: formData.imageUrl.trim() }),
      };

      const response = await servicesService.create(serviceData);
      const serviceId = response.id || response.data?.id;

      toast.success('Service posted successfully!', {
        description: 'Your service has been submitted for moderation and will be reviewed shortly.',
      });

      if (serviceId) {
        navigate(`/services/${serviceId}`);
      } else {
        navigate('/services');
      }
    } catch (err) {
      console.error('[CreateServicePage] Create service failed:', err);
      const errorMessage = err.response?.data?.message
        ? (Array.isArray(err.response.data.message)
            ? err.response.data.message.join(', ')
            : err.response.data.message)
        : err.message || 'Failed to create service';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get categories based on selected service type
  const getCategories = () => {
    if (formData.type === 'GENERAL') {
      return GENERAL_CATEGORIES;
    } else if (formData.type === 'TUTORING') {
      return TUTORING_CATEGORIES;
    }
    return [];
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300 mb-2">
          Post a Service
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your skills and expertise with the MNU community
        </p>
      </div>

      {/* Subscription Info */}
      <div className={`mb-6 p-4 rounded-2xl ${isPremium ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'}`}>
        <div className="flex items-start gap-3">
          <Sparkles className={`w-5 h-5 mt-0.5 ${isPremium ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`} />
          <div>
            <p className={`font-medium ${isPremium ? 'text-purple-900 dark:text-purple-100' : 'text-blue-900 dark:text-blue-100'}`}>
              {isPremium ? '⭐ Premium Account' : 'Free Account'}
            </p>
            <p className={`text-sm mt-1 ${isPremium ? 'text-purple-700 dark:text-purple-300' : 'text-blue-700 dark:text-blue-300'}`}>
              You have <strong>{myServicesCount} / {maxServices}</strong> active services.
              {!isPremium && (
                <span className="block mt-1">
                  Upgrade to Premium (500 тг/month) to post up to 10 services!
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <Card className="liquid-glass-card rounded-2xl">
        <CardHeader className="border-b border-gray-200 dark:border-[#2a2a2a]">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Service Details
          </CardTitle>
          <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
            Enter all required information about your service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm border border-destructive/20 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="dark:text-white">Service Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
                required
              >
                <SelectTrigger id="type" className="rounded-xl">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="dark:text-white">
                Title * <span className="text-xs text-gray-500">(max 200 characters)</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Professional Logo Design"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                maxLength={200}
                className="rounded-xl"
              />
              <p className="text-xs text-gray-500">
                {formData.title.length} / 200 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="dark:text-white">
                Description * <span className="text-xs text-gray-500">(min 100, max 5000 characters)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your service in detail... (minimum 100 characters)"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={8}
                required
                minLength={100}
                maxLength={5000}
                className="rounded-xl"
              />
              <p className="text-xs text-gray-500">
                {formData.description.length} / 5000 characters
                {formData.description.length < 100 && (
                  <span className="text-orange-600 dark:text-orange-400 ml-2">
                    ({100 - formData.description.length} more characters needed)
                  </span>
                )}
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="dark:text-white">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
                required
                disabled={!formData.type}
              >
                <SelectTrigger id="category" className="rounded-xl">
                  <SelectValue placeholder={formData.type ? 'Select a category' : 'First select service type'} />
                </SelectTrigger>
                <SelectContent>
                  {getCategories().map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price and Price Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="dark:text-white">Price (тг) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="e.g., 5000"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceType" className="dark:text-white">Price Type *</Label>
                <Select
                  value={formData.priceType}
                  onValueChange={(value) => handleChange('priceType', value)}
                  required
                >
                  <SelectTrigger id="priceType" className="rounded-xl">
                    <SelectValue placeholder="Select price type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="dark:text-white">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                className="rounded-xl"
              />
              <p className="text-xs text-gray-500">
                Add a preview image to showcase your service
              </p>
            </div>

            {/* Moderation Notice */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium">Moderation Review</p>
                  <p className="mt-1 text-blue-700 dark:text-blue-300">
                    Your service will be reviewed by our moderation team before going live. This usually takes 24-48 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-[#2a2a2a]">
              <Button
                type="submit"
                disabled={loading || myServicesCount >= maxServices}
                size="lg"
                className="flex-1 liquid-glass-red-button text-white rounded-2xl"
              >
                {loading ? 'Submitting...' : 'Post Service'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate('/services')}
                disabled={loading}
                className="border-gray-300 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
