import { apiCache } from './apiCache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getGuests = async (page = 1, limit = 10, search = '') => {
  const token = localStorage.getItem('token');
  const cacheKey = `guests_p${page}_l${limit}_s${search}`;

  return apiCache.fetch(cacheKey, async () => {
    try {
      const url = new URL(`${API_BASE_URL}/api/admin/guests`);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);
      if (search) {
        url.searchParams.append('search', search);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch guests');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching guests:', error);
      throw error;
    }
  });
};

