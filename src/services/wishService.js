import { apiClient } from './apiClient';
import { apiCache } from './apiCache';

const WISHES_CACHE_KEY = 'public_wishes';

export const getWishes = async () => {
  return apiCache.fetch(WISHES_CACHE_KEY, async () => {
    const data = await apiClient.get('/api/wishes');
    return data.wishes;
  });
};

export const invalidateWishes = () => {
  apiCache.delete(WISHES_CACHE_KEY);
};

