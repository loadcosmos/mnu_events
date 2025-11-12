/**
 * Category and status mapping utilities
 * Provides consistent translations and mappings across the application
 */

import { EVENT_CATEGORIES, EVENT_STATUSES, CLUB_CATEGORIES } from './constants';

/**
 * Maps event category enum to display name
 */
export const getCategoryDisplayName = (category) => {
  const categoryMap = {
    [EVENT_CATEGORIES.ACADEMIC]: 'Academic',
    [EVENT_CATEGORIES.SPORTS]: 'Sports',
    [EVENT_CATEGORIES.CULTURAL]: 'Cultural',
    [EVENT_CATEGORIES.TECH]: 'Tech',
    [EVENT_CATEGORIES.SOCIAL]: 'Social',
    [EVENT_CATEGORIES.CAREER]: 'Career',
    [EVENT_CATEGORIES.OTHER]: 'Other',
  };

  return categoryMap[category] || category;
};

/**
 * Maps event status enum to display name
 */
export const getStatusDisplayName = (status) => {
  const statusMap = {
    [EVENT_STATUSES.UPCOMING]: 'Upcoming',
    [EVENT_STATUSES.ONGOING]: 'Ongoing',
    [EVENT_STATUSES.COMPLETED]: 'Completed',
    [EVENT_STATUSES.CANCELLED]: 'Cancelled',
  };

  return statusMap[status] || status;
};

/**
 * Maps event category to badge color class
 */
export const getCategoryColor = (category) => {
  const colorMap = {
    [EVENT_CATEGORIES.ACADEMIC]: 'bg-blue-100 text-blue-800',
    [EVENT_CATEGORIES.SPORTS]: 'bg-green-100 text-green-800',
    [EVENT_CATEGORIES.CULTURAL]: 'bg-purple-100 text-purple-800',
    [EVENT_CATEGORIES.TECH]: 'bg-gray-100 text-gray-800',
    [EVENT_CATEGORIES.SOCIAL]: 'bg-pink-100 text-pink-800',
    [EVENT_CATEGORIES.CAREER]: 'bg-yellow-100 text-yellow-800',
    [EVENT_CATEGORIES.OTHER]: 'bg-neutral-100 text-neutral-800',
  };

  return colorMap[category] || 'bg-neutral-100 text-neutral-800';
};

/**
 * Maps event status to badge color class
 */
export const getStatusColor = (status) => {
  const colorMap = {
    [EVENT_STATUSES.UPCOMING]: 'bg-blue-100 text-blue-800',
    [EVENT_STATUSES.ONGOING]: 'bg-green-100 text-green-800',
    [EVENT_STATUSES.COMPLETED]: 'bg-gray-100 text-gray-800',
    [EVENT_STATUSES.CANCELLED]: 'bg-red-100 text-red-800',
  };

  return colorMap[status] || 'bg-neutral-100 text-neutral-800';
};

/**
 * Maps club category enum to display name
 */
export const getClubCategoryDisplayName = (category) => {
  const categoryMap = {
    [CLUB_CATEGORIES.ACADEMIC]: 'Academic',
    [CLUB_CATEGORIES.ARTS]: 'Arts',
    [CLUB_CATEGORIES.SERVICE]: 'Service',
    [CLUB_CATEGORIES.TECH]: 'Tech',
    [CLUB_CATEGORIES.SPORTS]: 'Sports',
    [CLUB_CATEGORIES.CULTURAL]: 'Cultural',
    [CLUB_CATEGORIES.OTHER]: 'Other',
  };

  return categoryMap[category] || category;
};
