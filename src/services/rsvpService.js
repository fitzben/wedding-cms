import { apiCache } from './apiCache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getRsvps = async () => {
  const token = localStorage.getItem('token');
  const cacheKey = 'admin_rsvps';

  return apiCache.fetch(cacheKey, async () => {
    try {
      const url = new URL(`${API_BASE_URL}/api/admin/rsvp`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch RSVPs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      throw error;
    }
  });
};

