import { useScrollReveal } from "../hooks/useScrollReveal";

const Footer = () => {
  useScrollReveal();

  return (
    <footer className="pt-16 pb-8 bg-charcoal text-center flex flex-col items-center relative overflow-hidden">
      <h2 className="font-serif text-3xl tracking-tight mb-6 font-normal text-white relative z-10 obs-hide obs-up obs-letter-spacing">
        Benjamin &amp; Angelin
      </h2>
      <p
        className="text-gold text-[0.65rem] uppercase tracking-[0.3em] font-light mb-6 relative z-10 obs-hide obs-up"
        style={{ animationDelay: "100ms" }}
      >
        31 May 2026
      </p>

      <svg
        className="w-16 text-gold mb-6 relative z-10 obs-hide obs-scale"
        viewBox="0 0 100 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        style={{ animationDelay: "200ms" }}
      >
        <line x1="0" y1="2" x2="100" y2="2"></line>
        <circle cx="50" cy="2" r="1.5" fill="#C9A84C"></circle>
      </svg>

      <p
        className="italic font-serif font-light text-white/40 mb-12 relative z-10 obs-hide obs-up"
        style={{ animationDelay: "300ms" }}
      >
        Created with love &amp; gratitude by BenElin
      </p>

      {/* Jakarta Skyline */}
      <svg
        className="w-full h-32 absolute bottom-0 left-0 text-ivory obs-hide obs-monas pointer-events-none"
        viewBox="0 0 1000 100"
        preserveAspectRatio="xMidYMax slice"
        fill="currentColor"
      >
        {/* Monas */}
        <path d="M495,100 L495,80 L498,80 L498,30 L500,20 L502,30 L502,80 L505,80 L505,100 Z"></path>
        {/* Buildings */}
        <rect x="100" y="60" width="40" height="40"></rect>
        <rect x="150" y="50" width="35" height="50"></rect>
        <rect x="200" y="70" width="50" height="30"></rect>
        <rect x="270" y="45" width="25" height="55"></rect>
        <rect x="310" y="80" width="60" height="20"></rect>
        <rect x="390" y="55" width="45" height="45"></rect>
        <rect x="450" y="85" width="30" height="15"></rect>
        <rect x="530" y="65" width="30" height="35"></rect>
        <rect x="580" y="40" width="45" height="60"></rect>
        <rect x="640" y="75" width="50" height="25"></rect>
        <rect x="710" y="50" width="35" height="50"></rect>
        <rect x="760" y="80" width="60" height="20"></rect>
        <rect x="840" y="55" width="40" height="45"></rect>
        <rect x="900" y="70" width="30" height="30"></rect>
      </svg>
    </footer>
  );
};

export default Footer;
