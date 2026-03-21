import { apiCache } from './apiCache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getPublicSettings = async () => {
  const cacheKey = 'public_settings';

  return apiCache.fetch(cacheKey, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch settings');
      }

      const data = await response.json();
      return data.settings;
    } catch (error) {
      console.error('Error fetching public settings:', error);
      throw error;
    }
  });
};
