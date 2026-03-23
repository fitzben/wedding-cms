import { Icon } from '@iconify/react';
import { useScrollReveal } from '../hooks/useScrollReveal';

// ─── EventCard defined OUTSIDE parent to avoid remount on every re-render ─────
const EventCard = ({ title, venue, time, address, mapsUrl, delay }) => (
  <div
    className="min-w-[280px] max-w-[480px] min-h-[400px] p-[48px_40px] bg-ivory text-charcoal border border-gold rounded text-center relative flex flex-col justify-center items-center obs-hide obs-up hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(61,5,16,0.3)] transition-all duration-300 group"
    style={{ animationDelay: delay }}
  >
    {/* Makassar Corners */}
    <svg className="w-16 h-16 text-gold absolute top-2 left-2 pointer-events-none" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M 4,32 L 4,4 L 32,4" />
    </svg>
    <svg className="w-16 h-16 text-gold absolute top-2 right-2 rotate-90 pointer-events-none" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M 4,32 L 4,4 L 32,4" />
    </svg>
    <svg className="w-16 h-16 text-gold absolute bottom-2 left-2 -rotate-90 pointer-events-none" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M 4,32 L 4,4 L 32,4" />
    </svg>
    <svg className="w-16 h-16 text-gold absolute bottom-2 right-2 rotate-180 pointer-events-none" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M 4,32 L 4,4 L 32,4" />
    </svg>

    <h3 className="font-serif text-[36px] tracking-tight text-maroon mb-8 italic font-normal mt-4">{title}</h3>
    <div className="flex flex-col items-center space-y-6 text-charcoal flex-grow">
      <div className="flex flex-col items-center">
        <Icon icon="solar:clock-circle-linear" className="text-2xl text-gold mb-2" style={{ strokeWidth: 1.5 }} />
        <p className="text-sm font-light uppercase tracking-[0.1em]">{time || '--:--'}</p>
      </div>
      <div className="flex flex-col items-center mb-4">
        <Icon icon="solar:map-point-linear" className="text-2xl text-gold mb-2" style={{ strokeWidth: 1.5 }} />
        <p className="text-sm font-light uppercase tracking-[0.1em] mb-1">{venue || 'TBA'}</p>
        <p className="text-xs text-charcoal/70 font-light max-w-[200px] leading-relaxed">{address || ''}</p>
      </div>
    </div>

    {mapsUrl && (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 px-6 py-2.5 border border-gold text-gold text-[10px] uppercase tracking-widest hover:bg-gold hover:text-ivory transition-all duration-300 rounded-full"
      >
        View Map
      </a>
    )}
  </div>
);

// ─── EventDetails ─────────────────────────────────────────────────────────────
const EventDetails = ({ eventAccess, settings = {} }) => {
  const showHM = eventAccess === 'both' || eventAccess === 'hm_only';
  const showResepsi = eventAccess === 'both' || eventAccess === 'resepsi_only';

  useScrollReveal([eventAccess]);

  return (
    <section id="section-celebration" className="py-32 bg-batak-grid min-h-[600px] block relative z-1 bg-maroon">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <h2 className="font-serif text-[48px] text-ivory italic font-normal text-center mb-[60px] obs-hide obs-up obs-letter-spacing">
          The Celebration
        </h2>

        <div className="flex flex-col md:flex-row gap-8 justify-center flex-wrap">
          {showHM && (
            <EventCard
              title="Holy Matrimony"
              venue={settings?.hm_venue_name}
              time={settings?.hm_time_start ? `${settings.hm_time_start} - ${settings.hm_time_end || 'End'}` : null}
              address={settings?.hm_address}
              mapsUrl={settings?.hm_maps_url}
              delay="200ms"
            />
          )}
          {showResepsi && (
            <EventCard
              title="Wedding Reception"
              venue={settings?.resepsi_venue_name}
              time={settings?.resepsi_time_start ? `${settings.resepsi_time_start} - ${settings.resepsi_time_end || 'End'}` : null}
              address={settings?.resepsi_address}
              mapsUrl={settings?.resepsi_maps_url}
              delay="350ms"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default EventDetails;