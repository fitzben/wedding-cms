import { apiClient } from './apiClient';
import { apiCache } from './apiCache';

export const getGallerySections = async () => {
  const cacheKey = 'gallery_sections';

  return apiCache.fetch(cacheKey, async () => {
    const data = await apiClient.get('/api/gallery/sections');
    return data.sections;
  });
};

export const getGalleryMedia = async (sectionId) => {
  const cacheKey = `gallery_media_${sectionId}`;

  return apiCache.fetch(cacheKey, async () => {
    const data = await apiClient.get(`/api/gallery/media?section_id=${sectionId}`);
    return data.media;
  });
};
