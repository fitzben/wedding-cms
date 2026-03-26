import { apiClient } from './apiClient';
import { apiCache } from './apiCache';

export const getRsvps = async () => {
  const cacheKey = 'admin_rsvps';

  return apiCache.fetch(cacheKey, () => apiClient.get('/api/admin/rsvp'));
};

