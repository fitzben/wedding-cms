import { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Icon } from '@iconify/react';
import useSettings from '../hooks/useSettings';

const CoupleIntro = () => {
  const [hoveredProfile, setHoveredProfile] = useState(null);
  const { settings } = useSettings();
  useScrollReveal([settings]);

  const groomName = settings?.groom_name || 'Benjamin';
  const brideName = settings?.bride_name || 'Angelin';
  const groomNickname = settings?.groom_nickname || 'Benjamin';
  const brideNickname = settings?.bride_nickname || 'Angelin';

  const groomIG = settings?.groom_instagram;
  const brideIG = settings?.bride_instagram;

  return (
    <section id="section-couple" className="py-32 bg-ivory relative overflow-hidden">
      
      {/* Floating Romantic Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-maroon/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatRomantic ${Math.random() * 5 + 5}s infinite ease-in-out ${Math.random() * 5}s`,
              opacity: 0,
            }}
          >
            <Icon icon="mdi:cards-heart" className="text-sm md:text-xl" />
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-4 lg:gap-8 relative">
          
          {/* Left Portrait */}
          <div 
            className="flex flex-col items-center text-center obs-hide obs-up" 
            style={{ animationDelay: '100ms' }}
            onMouseEnter={() => setHoveredProfile('left')}
            onMouseLeave={() => setHoveredProfile(null)}
          >
            <div className={`relative w-64 h-80 md:w-72 md:h-96 mb-6 rounded-3xl p-2 border border-gold/40 transition-all duration-500 group bg-white/50 backdrop-blur-sm cursor-pointer ${hoveredProfile ? 'shadow-2xl scale-105' : 'shadow-lg'}`}>
              <div className="w-full h-full rounded-2xl overflow-hidden relative">
                <div className="w-full h-full bg-gradient-to-tr from-[#1A1A1A] via-[#2a2a2a] to-[#4a0611] transition-transform duration-1000 group-hover:scale-110"></div>
                <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/10 transition-colors duration-500"></div>
              </div>
            </div>
            
            <h2 className="font-serif text-4xl text-charcoal mb-1 font-normal obs-hide obs-letter-spacing">
              {groomNickname}
            </h2>
            <p className="text-maroon text-[10px] sm:text-xs uppercase tracking-[0.2em] font-light mb-1">{groomName}</p>
            <p className="text-charcoal/40 text-[10px] uppercase tracking-[0.2em] font-light mb-4">The Groom</p>

            <div className="space-y-1 mb-6">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-light">
                {settings?.groom_child_order || 'Putra Pertama dari'}
              </p>
              <p className="text-sm font-serif italic text-charcoal/80">
                Bpk. {settings?.groom_father || 'Father Name'} & Ibu {settings?.groom_mother || 'Mother Name'}
              </p>
            </div>

            {groomIG && (
              <a 
                href={`https://instagram.com/${groomIG.replace('@', '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-charcoal/60 hover:text-maroon transition-colors group/link cursor-pointer relative"
              >
                <Icon icon="mdi:instagram" className="text-lg group-hover/link:-translate-y-1 transition-transform duration-300" />
                <span className="font-sans text-xs tracking-wider relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-maroon after:origin-bottom-right after:transition-transform after:duration-300 group-hover/link:after:scale-x-100 group-hover/link:after:origin-bottom-left">
                  @{groomIG.replace('@', '')}
                </span>
              </a>
            )}
          </div>

          {/* Animated Connector */}
          <div className="flex items-center justify-center w-full md:w-auto my-12 md:my-0 px-4 md:px-0">
            {/* Left Line */}
            <div className="relative flex items-center">
              <div className="h-[1px] w-20 md:w-12 lg:w-20 bg-gold/50 obs-hide obs-draw-left" style={{ animationDelay: '500ms' }}></div>
              <div className="absolute right-0 text-gold/60 anim-pulse-left pointer-events-none" style={{ animationDelay: '1.2s' }}>
                <Icon icon="material-symbols:astrophotography-mode" className="text-xs" />
              </div>
            </div>

            {/* Heart */}
            <div className="mx-4 text-maroon obs-hide obs-heartbeat relative" style={{ animationDelay: '700ms' }}>
              <Icon 
                icon="mdi:cards-heart" 
                className={`text-4xl transition-all duration-700 ${hoveredProfile ? 'drop-shadow-[0_0_15px_rgba(150,12,35,0.8)] scale-110' : 'drop-shadow-[0_0_8px_rgba(150,12,35,0.4)] scale-100'}`} 
              />
            </div>

            {/* Right Line */}
            <div className="relative flex items-center">
              <div className="h-[1px] w-20 md:w-12 lg:w-20 bg-gold/50 obs-hide obs-draw-right" style={{ animationDelay: '500ms' }}></div>
              <div className="absolute left-0 text-gold/60 anim-pulse-right pointer-events-none" style={{ animationDelay: '1.2s' }}>
                <Icon icon="material-symbols:astrophotography-mode" className="text-xs" />
              </div>
            </div>
          </div>

          {/* Right Portrait */}
          <div 
            className="flex flex-col items-center text-center obs-hide obs-up" 
            style={{ animationDelay: '300ms' }}
            onMouseEnter={() => setHoveredProfile('right')}
            onMouseLeave={() => setHoveredProfile(null)}
          >
            <div className={`relative w-64 h-80 md:w-72 md:h-96 mb-6 rounded-3xl p-2 border border-gold/40 transition-all duration-500 group bg-white/50 backdrop-blur-sm cursor-pointer ${hoveredProfile ? 'shadow-2xl scale-105' : 'shadow-lg'}`}>
              <div className="w-full h-full rounded-2xl overflow-hidden relative">
                <div className="w-full h-full bg-gradient-to-bl from-[#1A1A1A] via-[#2a2a2a] to-[#4a0611] transition-transform duration-1000 group-hover:scale-110"></div>
                <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/10 transition-colors duration-500"></div>
              </div>
            </div>
            
            <h2 className="font-serif text-4xl text-charcoal mb-1 font-normal obs-hide obs-letter-spacing">
              {brideNickname}
            </h2>
            <p className="text-maroon text-[10px] sm:text-xs uppercase tracking-[0.2em] font-light mb-1">{brideName}</p>
            <p className="text-charcoal/40 text-[10px] uppercase tracking-[0.2em] font-light mb-4">The Bride</p>

            <div className="space-y-1 mb-6">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-light">
                {settings?.bride_child_order || 'Putri Pertama dari'}
              </p>
              <p className="text-sm font-serif italic text-charcoal/80">
                Bpk. {settings?.bride_father || 'Father Name'} & Ibu {settings?.bride_mother || 'Mother Name'}
              </p>
            </div>

            {brideIG && (
              <a 
                href={`https://instagram.com/${brideIG.replace('@', '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-charcoal/60 hover:text-maroon transition-colors group/link cursor-pointer relative"
              >
                <Icon icon="mdi:instagram" className="text-lg group-hover/link:-translate-y-1 transition-transform duration-300" />
                <span className="font-sans text-xs tracking-wider relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-maroon after:origin-bottom-right after:transition-transform after:duration-300 group-hover/link:after:scale-x-100 group-hover/link:after:origin-bottom-left">
                  @{brideIG.replace('@', '')}
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoupleIntro;
