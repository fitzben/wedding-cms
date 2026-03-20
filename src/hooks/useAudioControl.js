import { useEffect, useRef } from "react";

export default function useAudioControl() {
  const audioRef = useRef(null);
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current) return;

      if (document.hidden) {
        // Tab hidden: Save current state and pause
        wasPlayingRef.current = !audioRef.current.paused;
        if (wasPlayingRef.current) {
          audioRef.current.pause();
        }
      } else {
        // Tab visible: Resume only if it was playing before
        if (wasPlayingRef.current) {
          audioRef.current.play().catch((err) => {
            console.warn("Playback failed on tab resume:", err);
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return audioRef;
}
