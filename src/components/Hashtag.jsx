import { useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import useSettings from '../hooks/useSettings';

const Hashtag = ({ isVisible }) => {
  useScrollReveal();
  const { settings } = useSettings();

  const groomNickname = settings?.groom_nickname || 'Benjamin';
  const brideNickname = settings?.bride_nickname || 'Angelin';
  const weddingDate = settings?.resepsi_date || '31 · 05 · 2026';

  useEffect(() => {
    // Only spawn particles when the section becomes visible
    // (i.e. after the hero invitation is opened)
    if (isVisible) {
      const spawnHashtagParticles = () => {
        const container = document.getElementById('hashtag-particles');
        if (!container) return;
        
        // Clear any existing particles
        container.innerHTML = '';

        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
            const p = document.createElement('div');
            const size = Math.random() * 3 + 1;
            p.style.cssText = `
              position:absolute;
              width:${size}px; height:${size}px;
              background:#C9A84C;
              border-radius:50%;
              left:${Math.random() * 100}%;
              bottom:-10px;
              opacity:${Math.random() * 0.4 + 0.1};
              animation: floatParticle ${Math.random() * 8 + 6}s ${Math.random() * 3}s ease-in infinite;
              pointer-events:none;
            `;
            container.appendChild(p);
          }, i * 120);
        }
      };

      // Trigger text animations
      const label = document.getElementById('ht-label');
      const main = document.getElementById('ht-main');
      const line = document.getElementById('ht-line');
      const date = document.getElementById('ht-date');
      const scroll = document.getElementById('ht-scroll');

      setTimeout(() => {
        if (label) {
          label.style.opacity = '1';
          label.style.transform = 'translateY(0)';
        }

        setTimeout(() => {
          if (main) {
            main.style.opacity = '1';
            main.style.transform = 'translateY(0)';
          }
        }, 200);

        setTimeout(() => {
          if (line) line.style.opacity = '1';
          if (date) {
            date.style.opacity = '1';
            date.style.transform = 'translateY(0)';
          }
        }, 600);

        setTimeout(() => {
          if (scroll) scroll.style.opacity = '1';
        }, 1400);

        spawnHashtagParticles();
      }, 80);
    }
  }, [isVisible]);

  return (
    <section
      id="section-hashtag"
      className="min-h-screen flex flex-col items-center justify-end pb-16 md:pb-24 bg-[#1a0408] relative overflow-hidden"
    >
      {/* Full screen background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-[#1a0408] via-[#2d0810] to-[#0d0204]"></div>
        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(10,2,4,0.85)_100%)] z-10"></div>
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0d0204]/80 to-transparent z-10"></div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-[#0d0204] via-[#0d0204]/90 to-transparent z-10"></div>
      </div>

      {/* Floating particles */}
      <div id="hashtag-particles" className="absolute inset-0 pointer-events-none z-10"></div>

      {/* Batak corner ornaments */}
      <svg
        className="absolute top-8 left-8 z-30 text-gold w-14 h-14 pointer-events-none"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M4 32 L4 4 L32 4" />
        <path d="M10 26 L10 10 L26 10" />
        <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      </svg>
      <svg
        className="absolute top-8 right-8 z-30 text-gold w-14 h-14 rotate-90 pointer-events-none"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M4 32 L4 4 L32 4" />
        <path d="M10 26 L10 10 L26 10" />
        <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      </svg>
      <svg
        className="absolute bottom-8 left-8 z-30 text-gold w-14 h-14 -rotate-90 pointer-events-none"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M4 32 L4 4 L32 4" />
        <path d="M10 26 L10 10 L26 10" />
        <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      </svg>
      <svg
        className="absolute bottom-8 right-8 z-30 text-gold w-14 h-14 rotate-180 pointer-events-none"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M4 32 L4 4 L32 4" />
        <path d="M10 26 L10 10 L26 10" />
        <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      </svg>

      {/* Content bottom-aligned like cinematic title card */}
      <div className="relative z-30 w-full flex flex-col items-center text-center px-6">
        <p
          id="ht-label"
          className="font-sans font-light text-[10px] text-gold tracking-[0.4em] uppercase mb-6 opacity-0"
          style={{ transition: 'opacity 0.8s ease, transform 0.8s ease', transform: 'translateY(20px)' }}
        >
          Wedding Invitation
        </p>

        <h1
          id="ht-main"
          className="font-script text-[clamp(56px,11vw,140px)] text-ivory leading-none opacity-0 mb-5"
          style={{
            transition: 'opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)',
            transform: 'translateY(40px)',
            textShadow: '0 4px 60px rgba(201,168,76,0.2)'
          }}
        >
          {groomNickname} &amp; {brideNickname}
        </h1>

        <svg
          id="ht-line"
          className="opacity-0 mb-5"
          style={{ transition: 'opacity 0.8s ease 0.4s', width: '240px', height: '8px' }}
          viewBox="0 0 240 8"
          fill="none"
        >
          <line
            x1="0"
            y1="4"
            x2="108"
            y2="4"
            stroke="#C9A84C"
            strokeWidth="0.8"
            strokeDasharray="108"
            strokeDashoffset="108"
          >
            <animate attributeName="stroke-dashoffset" from="108" to="0" dur="1s" begin="0.6s" fill="freeze" />
          </line>
          <circle cx="120" cy="4" r="3" fill="#C9A84C" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.2s" fill="freeze" />
          </circle>
          <line
            x1="132"
            y1="4"
            x2="240"
            y2="4"
            stroke="#C9A84C"
            strokeWidth="0.8"
            strokeDasharray="108"
            strokeDashoffset="108"
          >
            <animate attributeName="stroke-dashoffset" from="108" to="0" dur="1s" begin="0.6s" fill="freeze" />
          </line>
        </svg>

        <p
          id="ht-date"
          className="font-sans font-light text-[11px] text-ivory/55 tracking-[0.35em] uppercase opacity-0 mb-12"
          style={{ transition: 'opacity 0.8s ease', transform: 'translateY(10px)' }}
        >
          #BengothisAngel &nbsp;&middot;&nbsp; {weddingDate}
        </p>

        {/* Scroll hint */}
        <div id="ht-scroll" className="opacity-0 flex flex-col items-center gap-3" style={{ transition: 'opacity 1s ease' }}>
          <p className="font-sans font-light text-[9px] text-gold/50 tracking-[0.3em] uppercase">
            Scroll to explore
          </p>
          <svg width="1" height="40" viewBox="0 0 1 40">
            <line
              x1="0.5"
              y1="0"
              x2="0.5"
              y2="40"
              stroke="#C9A84C"
              strokeWidth="0.8"
              strokeDasharray="40"
              strokeDashoffset="40"
            >
              <animate attributeName="stroke-dashoffset" values="40;0;40" dur="2s" begin="2s" repeatCount="indefinite" />
            </line>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hashtag;
