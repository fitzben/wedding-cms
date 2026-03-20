import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

const MusicPlayer = ({ isVisible, audioRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  // Sync internal isPlaying state if audio plays externally
  useEffect(() => {
    if (isVisible && audioRef.current && !audioRef.current.paused) {
      setIsPlaying(true);
      // Ensure volume is at target if it started playing
      audioRef.current.volume = 0.4;
    }
  }, [isVisible, audioRef]);

  const startMusic = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
    
    let vol = 0;
    fadeIntervalRef.current = setInterval(() => {
      vol = Math.min(vol + 0.02, 0.4);
      if (audioRef.current) {
        audioRef.current.volume = vol;
      }
      if (vol >= 0.4 && fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    }, 100);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    if (isPlaying) {
      // Pause with fade
      let vol = audioRef.current.volume;
      fadeIntervalRef.current = setInterval(() => {
        vol = Math.max(vol - 0.02, 0);
        if (audioRef.current) {
          audioRef.current.volume = vol;
        }
        if (vol <= 0) {
          clearInterval(fadeIntervalRef.current);
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
        }
      }, 40);
    } else {
      // Resume with fade
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      let vol = 0;
      fadeIntervalRef.current = setInterval(() => {
        vol = Math.min(vol + 0.02, 0.4);
        if (audioRef.current) {
          audioRef.current.volume = vol;
        }
        if (vol >= 0.4 && fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      }, 40);
    }
  };

  return (
    <button
      id="music-control"
      aria-label="Toggle Music"
      onClick={toggleMusic}
      className={`fixed bottom-7 right-7 z-[9999] w-12 h-12 rounded-full bg-maroon/90 border border-gold/50 backdrop-blur-md shadow-[0_8px_32px_rgba(61,5,16,0.3)] flex items-center justify-center cursor-pointer transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.08] hover:brightness-110 ${
        isVisible ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-80'
      }`}
    >
      {/* Soundwave (Playing state) */}
      <div className={`soundwave ${isPlaying ? 'flex' : 'hidden'}`}>
        <span></span><span></span><span></span>
      </div>
      {/* Mute SVG (Paused state) */}
      {!isPlaying && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" className="block">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      )}
    </button>
  );
};

export default MusicPlayer;
