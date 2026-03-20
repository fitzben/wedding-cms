import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const journeyData = [
  {
    date: 'December 2021',
    title: 'First Meeting',
    desc: 'A serendipitous encounter where a brief conversation felt like reuniting with an old friend.',
    bg: 'from-[#3d0510] to-[#960c23]'
  },
  {
    date: 'March 2022',
    title: 'First Date',
    desc: 'A quiet dinner that turned into hours of conversation neither of us wanted to end.',
    bg: 'from-[#960c23] to-[#6b1020]'
  },
  {
    date: 'June 2023',
    title: 'The Proposal',
    desc: 'Under the stars, with shaking hands and a full heart, the question was asked.',
    bg: 'from-[#3d0510] to-[#960c23]'
  },
  {
    date: 'September 2023',
    title: 'Our Engagement',
    desc: 'We said yes to forever, surrounded by the people we love most.',
    bg: 'from-[#960c23] to-[#6b1020]'
  }
];

const Journey = () => {
  useScrollReveal();
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const autoAdvanceRef = useRef(null);

  const total = journeyData.length;

  const nextJourney = () => {
    setActiveIndex((prev) => (prev + 1) % total);
    resetAutoAdvance();
  };

  const prevJourney = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
    resetAutoAdvance();
  };

  const resetAutoAdvance = () => {
    if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current);
    autoAdvanceRef.current = setInterval(() => {
      if (window.innerWidth >= 768) {
        setActiveIndex((prev) => (prev + 1) % total);
      }
    }, 5000);
  };

  useEffect(() => {
    resetAutoAdvance();

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextJourney();
      else if (e.key === 'ArrowLeft') prevJourney();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current);
    };
  }, []);

  // Handle Swipe for mobile not leveraging CSS scroll snap, 
  // though mobile uses scroll-snap, this mimics original behavior
  const touchStartRef = useRef(0);
  const handleTouchStart = (e) => {
    touchStartRef.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (window.innerWidth >= 768) {
      if (touchEndX < touchStartRef.current - 50) nextJourney();
      if (touchEndX > touchStartRef.current + 50) prevJourney();
    }
  };

  // Sync mobile scroll with progress bar
  const handleScroll = () => {
    if (window.innerWidth < 768 && trackRef.current) {
      const scrollLeft = trackRef.current.scrollLeft;
      // Get first card width + gap approximately, or calculate relative to total width
      const cardWidth = window.innerWidth * 0.85 + 16; 
      const index = Math.round(scrollLeft / cardWidth);
      if (index !== activeIndex && index >= 0 && index < total) {
        setActiveIndex(index);
      }
    }
  };

  // Calculate 3D styles for each card based on activeIndex
  const getCardStyle = (index) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
       // Mobile handles styles via CSS Media Queries implicitly, inline styles shouldn't override
       return {};
    }

    let offset = index - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    if (offset === 0) {
      return {
        transform: 'translateX(0px) translateZ(0px) rotateY(0deg) scale(1)',
        opacity: 1,
        zIndex: 10,
        filter: 'blur(0px)',
        boxShadow: '0 40px 80px rgba(61,5,16,0.35)'
      };
    } else if (offset === 1) {
      return {
        transform: 'translateX(280px) translateZ(-120px) rotateY(-20deg) scale(0.83)',
        opacity: 0.7,
        zIndex: 5,
        filter: 'blur(0.8px)',
        boxShadow: '0 20px 40px rgba(61,5,16,0.15)'
      };
    } else if (offset === -1) {
      return {
        transform: 'translateX(-280px) translateZ(-120px) rotateY(20deg) scale(0.83)',
        opacity: 0.7,
        zIndex: 5,
        filter: 'blur(0.8px)',
        boxShadow: '0 20px 40px rgba(61,5,16,0.15)'
      };
    } else {
      const isRight = offset >= 2;
      return {
        transform: `translateX(${isRight ? 460 : -460}px) translateZ(-240px) rotateY(${isRight ? -35 : 35}deg) scale(0.65)`,
        opacity: 0.25,
        zIndex: 1,
        filter: 'blur(2px)',
        boxShadow: 'none'
      };
    }
  };

  return (
    <section id="section-journey" className="py-32 bg-offwhite relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-0 md:px-6 relative z-10">
        
        <div className="text-center mb-16 obs-hide obs-up flex flex-col items-center px-6">
          {/* Chinese Medallion */}
          <svg className="w-[40px] h-[40px] text-gold mb-6" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="50" cy="50" r="45"></circle><circle cx="50" cy="50" r="35"></circle>
            <path d="M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50 M18 18 L25 25 M75 75 L82 82 M18 82 L25 75 M75 25 L82 18"></path>
          </svg>
          <h2 className="font-serif text-5xl text-maroon italic font-normal mb-6 obs-hide obs-letter-spacing">Our Journey</h2>
          <p className="text-charcoal text-sm font-light max-w-lg mx-auto leading-relaxed">Two paths destined to cross, creating a story written in the stars and grounded in profound love.</p>
        </div>

        {/* 3D Carousel / Mobile Snap */}
        <div 
          className="relative w-full mb-12 journey-wrapper"
          onMouseEnter={() => clearInterval(autoAdvanceRef.current)}
          onMouseLeave={resetAutoAdvance}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Nav Arrows (Desktop) */}
          <button 
            onClick={prevJourney}
            aria-label="Previous Story" 
            className="hidden md:flex absolute top-[calc(50%-1.25rem)] left-6 w-10 h-10 rounded-full border border-maroon text-maroon items-center justify-center hover:bg-maroon hover:text-ivory transition-colors duration-300 z-20 cursor-pointer pointer-events-auto"
          >
            <Icon icon="solar:arrow-left-linear" style={{ strokeWidth: 1.5 }} />
          </button>
          
          <button 
            onClick={nextJourney}
            aria-label="Next Story" 
            className="hidden md:flex absolute top-[calc(50%-1.25rem)] right-6 w-10 h-10 rounded-full border border-maroon text-maroon items-center justify-center hover:bg-maroon hover:text-ivory transition-colors duration-300 z-20 cursor-pointer pointer-events-auto"
          >
            <Icon icon="solar:arrow-right-linear" style={{ strokeWidth: 1.5 }} />
          </button>

          {/* Track */}
          <div className="journey-track" id="journey-track" ref={trackRef} onScroll={handleScroll}>
            {journeyData.map((item, index) => (
              <div 
                key={index} 
                className="journey-card flex flex-col" 
                data-index={index}
                style={getCardStyle(index)}
                onClick={() => {
                  if (window.innerWidth >= 768) {
                    setActiveIndex(index);
                    resetAutoAdvance();
                  }
                }}
              >
                <div className={`h-[200px] w-full relative bg-gradient-to-br ${item.bg}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/15 via-transparent to-transparent opacity-60"></div>
                </div>
                <div className="p-[28px_24px] text-center flex flex-col items-center bg-ivory flex-grow">
                  <p className="font-sans font-light text-[10px] text-gold tracking-[0.2em] uppercase mb-2.5">{item.date}</p>
                  <svg className="w-16 h-1 mb-2.5" viewBox="0 0 64 4" fill="none">
                    <line x1="0" y1="2" x2="28" y2="2" stroke="#C9A84C" strokeWidth="0.8"/>
                    <circle cx="32" cy="2" r="2" fill="#C9A84C"/>
                    <line x1="36" y1="2" x2="64" y2="2" stroke="#C9A84C" strokeWidth="0.8"/>
                  </svg>
                  <h4 className="font-serif italic text-[26px] text-maroon font-normal my-2.5">{item.title}</h4>
                  <p className="font-sans font-light text-[13px] text-charcoal leading-[1.8]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bars */}
        <div className="flex justify-center gap-2 mt-4 relative z-20 pb-12 md:pb-0" id="journey-progress">
          {journeyData.map((_, index) => (
            <div 
              key={index}
              className={`journey-progress-bar h-1 bg-gold transition-all duration-300 ${activeIndex === index ? 'w-[60px] opacity-100' : 'w-[20px] opacity-30'}`} 
            ></div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Journey;
