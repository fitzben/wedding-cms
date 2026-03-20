import { Icon } from '@iconify/react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const EventDetails = () => {
  useScrollReveal();

  return (
    <section className="py-32 bg-batak-grid min-h-[600px] block relative z-1 bg-maroon">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <h2 className="font-serif text-[48px] text-ivory italic font-normal text-center mb-[60px] obs-hide obs-up obs-letter-spacing">
          The Celebration
        </h2>

        <div className="flex flex-col md:flex-row gap-8 justify-center flex-wrap">
          
          {/* Holy Matrimony */}
          <div 
            className="min-w-[280px] max-w-[480px] min-h-[400px] p-[48px_40px] bg-ivory text-charcoal border border-gold rounded text-center relative flex flex-col justify-center items-center obs-hide obs-left hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(61,5,16,0.3)] transition-all duration-300 group" 
            style={{ animationDelay: '200ms' }}
          >
            {/* Makassar Corners */}
            <svg className="w-16 h-16 text-gold absolute top-2 left-2 pointer-events-none obs-hide obs-draw-ring" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M 4,32 L 4,4 L 32,4" strokeDasharray="60" strokeDashoffset="60" />
              <path d="M 10,26 L 10,10 L 26,10" strokeDasharray="40" strokeDashoffset="40" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </svg>
            <svg className="w-16 h-16 text-gold absolute top-2 right-2 rotate-90 pointer-events-none obs-hide obs-draw-ring" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M 4,32 L 4,4 L 32,4" strokeDasharray="60" strokeDashoffset="60" />
              <path d="M 10,26 L 10,10 L 26,10" strokeDasharray="40" strokeDashoffset="40" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </svg>
            <svg className="w-16 h-16 text-gold absolute bottom-2 left-2 -rotate-90 pointer-events-none obs-hide obs-draw-ring" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M 4,32 L 4,4 L 32,4" strokeDasharray="60" strokeDashoffset="60" />
              <path d="M 10,26 L 10,10 L 26,10" strokeDasharray="40" strokeDashoffset="40" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </svg>
            <svg className="w-16 h-16 text-gold absolute bottom-2 right-2 rotate-180 pointer-events-none obs-hide obs-draw-ring" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M 4,32 L 4,4 L 32,4" strokeDasharray="60" strokeDashoffset="60" />
              <path d="M 10,26 L 10,10 L 26,10" strokeDasharray="40" strokeDashoffset="40" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </svg>

            <h3 className="font-serif text-[36px] tracking-tight text-maroon mb-8 italic font-normal mt-4">Holy Matrimony</h3>
            <div className="flex flex-col items-center space-y-6 text-charcoal">
              <div className="flex flex-col items-center">
                <Icon icon="solar:clock-circle-linear" className="text-2xl text-gold mb-2" style={{ strokeWidth: 1.5 }} />
                <p className="text-sm font-light uppercase tracking-[0.1em]">10:00 AM</p>
              </div>
              <div className="flex flex-col items-center mb-4">
                <Icon icon="solar:map-point-linear" className="text-2xl text-gold mb-2" style={{ strokeWidth: 1.5 }} />
                <p className="text-sm font-light uppercase tracking-[0.1em] mb-1">CATHEDRAL PARISH</p>
                <p className="text-xs text-charcoal/70 font-light">Central District, Jakarta</p>
              </div>
            </div>
          </div>

          {/* Holy Reception */}
          <div 
            className="min-w-[280px] max-w-[480px] min-h-[400px] p-[48px_40px] bg-ivory text-charcoal border border-gold rounded text-center relative flex flex-col justify-center items-center obs-hide obs-right hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(61,5,16,0.3)] transition-all duration-300 group" 
            style={{ animationDelay: '350ms' }}
          >
            {/* Makassar Corners */}
            <svg className="w-16 h-16 text-gold absolute top-2 left-2 pointer-events-none obs-hide obs-draw-ring" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M 4,32 L 4,4 L 32,4" strokeDasharray="60" strokeDashoffset="60" />
              <path d="M 10,26 L 10,10 L 26,10" strokeDasharray="40" strokeDashoffset="40" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </svg>
            <svg className="w-16 h-16 text-gold absolute top-2 right-2 rotate-90 pointer-events-none obs-hide obs-draw-ring" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M 4,32 L 4,4 L 32,4" strokeDasharray="60" strokeDashoffset="60" />
              <path d="M 10,26 L 10,10 L 26,10" strokeDasharray="40" strokeDashoffset="40" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </svg>
            <svg className="w-16 h-16 text-gold absolute bottom-2 left-2 -rotate-90 pointer-events-none obs-hide obs-draw-ring" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M 4,32 L 4,4 L 32,4" strokeDasharray="60" strokeDashoffset="60" />
              <path d="M 10,26 L 10,10 L 26,10" strokeDasharray="40" strokeDashoffset="40" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </svg>
            <svg className="w-16 h-16 text-gold absolute bottom-2 right-2 rotate-180 pointer-events-none obs-hide obs-draw-ring" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M 4,32 L 4,4 L 32,4" strokeDasharray="60" strokeDashoffset="60" />
              <path d="M 10,26 L 10,10 L 26,10" strokeDasharray="40" strokeDashoffset="40" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </svg>

            <h3 className="font-serif text-[36px] tracking-tight text-maroon mb-8 italic font-normal mt-4">Holy Reception</h3>
            <div className="flex flex-col items-center space-y-6 text-charcoal">
              <div className="flex flex-col items-center">
                <Icon icon="solar:clock-circle-linear" className="text-2xl text-gold mb-2" style={{ strokeWidth: 1.5 }} />
                <p className="text-sm font-light uppercase tracking-[0.1em]">18:00 PM</p>
              </div>
              <div className="flex flex-col items-center mb-4">
                <Icon icon="solar:map-point-linear" className="text-2xl text-gold mb-2" style={{ strokeWidth: 1.5 }} />
                <p className="text-sm font-light uppercase tracking-[0.1em] mb-1">THE GRAND BALLROOM</p>
                <p className="text-xs text-charcoal/70 font-light">Luxury Avenue, Jakarta</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EventDetails;
