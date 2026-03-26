import { apiClient } from './apiClient';
import { apiCache } from './apiCache';

export const getGuests = async (page = 1, limit = 10, search = '') => {
  const cacheKey = `guests_p${page}_l${limit}_s${search}`;

  return apiCache.fetch(cacheKey, async () => {
    const url = new URL('/api/admin/guests', 'http://localhost'); // Dummy base for URL constructor
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    if (search) {
      url.searchParams.append('search', search);
    }
    
    // Extract path and query for apiClient
    const path = url.pathname + url.search;
    return apiClient.get(path);
  });
};

