import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

const Landing = () => {
  const { settings } = useSettings();

  const groomName = settings?.groom_name || 'Benjamin';
  const brideName = settings?.bride_name || 'Angelin';
  const weddingDate = settings?.resepsi_date || 'Sunday, 31 May 2026';

  return (
    <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-maroon/5 blur-[120px]"></div>
      </div>

      <div className="max-w-[600px] w-full text-center z-10 space-y-8 animate-fade-in-up">
        {/* Logo/Monogram */}
        <div className="inline-block relative">
          <svg className="w-24 h-24 text-maroon mx-auto opacity-80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="50" cy="50" r="45" />
            <circle cx="50" cy="50" r="35" />
            <path d="M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50" />
            <text x="50" y="58" textAnchor="middle" className="font-serif text-2xl fill-maroon italic">{groomName[0]}&{brideName[0]}</text>
          </svg>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm uppercase tracking-[0.3em] text-gray-400 font-light">Welcome to the Wedding of</h2>
          <h1 className="font-script text-5xl md:text-7xl text-maroon font-normal tracking-wide">{groomName} & {brideName}</h1>
          <p className="text-gray-400 font-light text-lg italic mt-4">{weddingDate}</p>
        </div>

        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto"></div>

        <div className="space-y-6 max-w-[400px] mx-auto">
          <p className="text-gray-500 font-light leading-relaxed">
            Ini adalah undangan pernikahan yang bersifat privat. 
            Silakan gunakan link personal yang telah kami bagikan untuk melihat detail acara dan melakukan RSVP.
          </p>
          
          <div className="pt-4">
             <button disabled className="px-8 py-4 bg-white border border-gray-100 text-gray-400 text-xs font-semibold tracking-widest uppercase rounded-full cursor-not-allowed opacity-60">
                Laman Privat
              </button>
          </div>
        </div>
      </div>

      {/* Subtle Admin Link */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <Link 
          to="/admin/login" 
          className="text-[10px] uppercase tracking-widest text-gray-300 hover:text-maroon transition-colors"
        >
          Administrator
        </Link>
      </div>
    </div>
  );
};

export default Landing;
