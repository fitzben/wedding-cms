import { useScrollReveal } from '../hooks/useScrollReveal';

export const BatakDivider = ({ className = '' }) => {
  useScrollReveal();
  
  return (
    <div className={`w-full flex justify-center border-b border-gold/20 ${className}`}>
      <svg
        className="w-64 text-gold obs-hide obs-draw-divider"
        viewBox="0 0 200 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <line x1="0" y1="10" x2="200" y2="10" strokeDasharray="200" strokeDashoffset="200"></line>
        <polygon points="100,2 108,10 100,18 92,10" strokeDasharray="40" strokeDashoffset="40"></polygon>
        <polygon points="70,5 75,10 70,15 65,10" strokeDasharray="30" strokeDashoffset="30"></polygon>
        <polygon points="130,5 135,10 130,15 125,10" strokeDasharray="30" strokeDashoffset="30"></polygon>
        <polygon points="40,6 44,10 40,14 36,10" strokeDasharray="25" strokeDashoffset="25"></polygon>
        <polygon points="160,6 164,10 160,14 156,10" strokeDasharray="25" strokeDashoffset="25"></polygon>
      </svg>
    </div>
  );
};

export const ManadoDivider = ({ className = '' }) => {
  useScrollReveal();

  return (
    <div className={`w-full flex justify-center border-t border-gold/20 ${className}`}>
      <svg
        className="w-64 text-gold obs-hide obs-draw-divider"
        viewBox="0 0 200 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M0,10 C30,-5 70,25 100,10 C130,-5 170,25 200,10" strokeDasharray="210" strokeDashoffset="210"></path>
        <circle cx="50" cy="10" r="1.5" fill="currentColor"></circle>
        <circle cx="150" cy="10" r="1.5" fill="currentColor"></circle>
      </svg>
    </div>
  );
};
