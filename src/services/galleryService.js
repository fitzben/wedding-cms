import { apiCache } from './apiCache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getGallerySections = async () => {
  const cacheKey = 'gallery_sections';

  return apiCache.fetch(cacheKey, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gallery/sections`);
      if (!response.ok) throw new Error('Failed to fetch gallery sections');
      const data = await response.json();
      return data.sections;
    } catch (error) {
      console.error('Error fetching gallery sections:', error);
      throw error;
    }
  });
};

export const getGalleryMedia = async (sectionId) => {
  const cacheKey = `gallery_media_${sectionId}`;

  return apiCache.fetch(cacheKey, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gallery/media?section_id=${sectionId}`);
      if (!response.ok) throw new Error('Failed to fetch gallery media');
      const data = await response.json();
      return data.media;
    } catch (error) {
      console.error('Error fetching gallery media:', error);
      throw error;
    }
  });
};
