import { useState, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { getGallerySections, getGalleryMedia } from '../services/galleryService';

const Gallery = () => {
  useScrollReveal();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const sections = await getGallerySections();
        const gallerySection = sections.find(s => s.key === 'gallery') || sections[0];
        if (gallerySection) {
          const items = await getGalleryMedia(gallerySection.id);
          setMedia(items);
        }
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  if (loading) return (
    <div className="py-20 text-center text-maroon/50 font-serif italic text-xl">Loading moments...</div>
  );

  return (
    <section id="section-gallery" className="pb-[100px] bg-offwhite relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 obs-hide obs-up flex justify-center">
          <h2 className="font-serif text-5xl tracking-tight text-maroon italic font-normal obs-hide obs-letter-spacing">
            Moments
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 auto-rows-[250px] md:auto-rows-[400px]">
          {media.length > 0 ? (
            media.map((item, idx) => (
              <div 
                key={item.id}
                className={`${(idx === 0 || idx === 5) ? 'col-span-2 row-span-2' : ''} ${(idx === 4) ? 'col-span-2' : ''} overflow-hidden relative cursor-pointer group obs-hide obs-scale`} 
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <img 
                  src={item.public_url} 
                  alt={item.caption || 'Wedding moment'} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/20 transition-colors duration-500 z-10 pointer-events-none"></div>
                {item.caption && (
                  <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-ivory text-xs font-light tracking-wide bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-block">{item.caption}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-charcoal/40 font-light italic">
              Photos are being curated with love...
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
