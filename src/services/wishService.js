import { apiClient } from './apiClient';
import { apiCache } from './apiCache';

export const getWishes = async () => {
  const cacheKey = 'public_wishes';

  return apiCache.fetch(cacheKey, async () => {
    const data = await apiClient.get('/api/wishes');
    return data.wishes;
  });
};

