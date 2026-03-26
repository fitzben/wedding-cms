import { apiClient } from './apiClient';
import { apiCache } from './apiCache';

export const getPublicSettings = async () => {
  const cacheKey = 'public_settings';

  return apiCache.fetch(cacheKey, async () => {
    const data = await apiClient.get('/api/settings');
    return data.settings;
  });
};
