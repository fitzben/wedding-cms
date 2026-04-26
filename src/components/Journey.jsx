import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useInView } from "framer-motion";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useJourney } from "../hooks/useJourney";
import useSettings from "../hooks/useSettings";

const Journey = () => {
  useScrollReveal();
  const { items, loading } = useJourney();
  const { settings, loading: settingsLoading } = useSettings();
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoFullscreen, setVideoFullscreen] = useState(false);
  const trackRef = useRef(null);
  const mobileIndexRef = useRef(0);
  const autoAdvanceRef = useRef(null);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const isSectionInView = useInView(sectionRef, { amount: 0.1 });

  // Ensure items are sorted by sort_order from BE
  const journeyData = [...items].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  const total = journeyData.length;

  const bgUrl = settings?.journey_background ?? "";
  const isVideo = !!(
    bgUrl.match(/\.(mp4|webm|ogg|mov)$/i) ||
    bgUrl.includes("vimeo") ||
    bgUrl.includes("youtube") ||
    bgUrl.includes("youtu.be") ||
    bgUrl.includes("stream")
  );
  const isImage = !!(bgUrl.startsWith("http") && !isVideo);
  const videoCardExists = isVideo && !!bgUrl;

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
    if (total === 0) return;
    resetAutoAdvance();

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") nextJourney();
      else if (e.key === "ArrowLeft") prevJourney();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // ─── Touch / Swipe ────────────────────────────────────────────────────────
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

  // ─── Mobile JS Carousel ───────────────────────────────────────────────────
  const mobileSwipeStartX = useRef(0);
  const mobileSwipeStartY = useRef(0);
  const isSwiping = useRef(false);

  const getMobileTotal = () => {
    const base = journeyData.length;
    return videoCardExists ? base + 1 : base;
  };

  const scrollToMobileIndex = (index, animate = true) => {
    if (!trackRef.current || window.innerWidth >= 768) return;
    const cardWidth = window.innerWidth * 0.85 + 16;
    const offset = index * cardWidth - (window.innerWidth - window.innerWidth * 0.85) / 2;
    if (animate) {
      trackRef.current.style.transition = "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    } else {
      trackRef.current.style.transition = "none";
    }
    trackRef.current.style.transform = `translateX(-${Math.max(0, offset)}px)`;
    mobileIndexRef.current = index;
    setActiveIndex(index);
  };

  const handleMobileTouchStart = (e) => {
    if (window.innerWidth >= 768) return;
    mobileSwipeStartX.current = e.changedTouches[0].screenX;
    mobileSwipeStartY.current = e.changedTouches[0].screenY;
    isSwiping.current = false;
  };

  const handleMobileTouchEnd = (e) => {
    if (window.innerWidth >= 768) return;
    const dx = e.changedTouches[0].screenX - mobileSwipeStartX.current;
    const dy = e.changedTouches[0].screenY - mobileSwipeStartY.current;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < 40) return;

    const mobileTotal = getMobileTotal();
    let next = mobileIndexRef.current;
    if (dx < 0) next = (next + 1) % mobileTotal;
    else next = (next - 1 + mobileTotal) % mobileTotal;
    scrollToMobileIndex(next);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        scrollToMobileIndex(0, false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [journeyData.length, videoCardExists]);

  // ─── 3D Card Styles ───────────────────────────────────────────────────────
  const getCardStyle = (index) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return {};

    let offset = index - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    if (offset === 0) {
      return {
        transform: "translateX(0px) translateZ(0px) rotateY(0deg) scale(1)",
        opacity: 1,
        zIndex: 10,
        filter: "blur(0px)",
        boxShadow: "0 40px 80px rgba(61,5,16,0.35)",
      };
    } else if (offset === 1) {
      return {
        transform:
          "translateX(280px) translateZ(-120px) rotateY(-20deg) scale(0.83)",
        opacity: 0.7,
        zIndex: 5,
        filter: "blur(0.8px)",
        boxShadow: "0 20px 40px rgba(61,5,16,0.15)",
      };
    } else if (offset === -1) {
      return {
        transform:
          "translateX(-280px) translateZ(-120px) rotateY(20deg) scale(0.83)",
        opacity: 0.7,
        zIndex: 5,
        filter: "blur(0.8px)",
        boxShadow: "0 20px 40px rgba(61,5,16,0.15)",
      };
    } else {
      const isRight = offset >= 2;
      return {
        transform: `translateX(${isRight ? 460 : -460}px) translateZ(-240px) rotateY(${isRight ? -35 : 35}deg) scale(0.65)`,
        opacity: 0.25,
        zIndex: 1,
        filter: "blur(2px)",
        boxShadow: "none",
      };
    }
  };

  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (isSectionInView) {
        videoRef.current.play().catch((err) => {
          console.warn("Video autoplay failed:", err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isSectionInView, isVideo]);

  // ─── Loading State ────────────────────────────────────────────────────────
  if (loading || settingsLoading) {
    return (
      <section
        id="section-journey"
        className="py-32 bg-offwhite relative overflow-hidden"
      >
        <div className="flex items-center justify-center h-64 text-maroon/40 text-sm">
          Loading…
        </div>
      </section>
    );
  }

  // ─── Empty State ──────────────────────────────────────────────────────────
  if (journeyData.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="section-journey"
      className="py-32 relative overflow-hidden bg-white"
    >
      {/* ─── Aesthetic Background Layer ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {isVideo ? (
          <div className="hidden md:block absolute inset-0 w-full h-full">
            <video
              ref={videoRef}
              key={bgUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover scale-[1.02]"
              src={bgUrl}
            />
            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-black/80" />
          </div>
        ) : isImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
            style={{ backgroundImage: `url(${bgUrl})` }}
          >
            <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px]" />
          </div>
        ) : bgUrl ? (
          <div
            className="absolute inset-0 transition-colors duration-500"
            style={{ backgroundColor: bgUrl }}
          />
        ) : (
          <div className="absolute inset-0 bg-white" />
        )}

        {isVideo && (
          <div className="md:hidden absolute inset-0 bg-gradient-to-b from-[#1a0a0e] via-[#2d1218] to-[#1a0a0e]">
            {/* Subtle texture */}
            <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
            {/* Gold accent lines */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          </div>
        )}

        {/* Subtle Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      </div>

      <div className="max-w-7xl mx-auto px-0 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 obs-hide obs-up flex flex-col items-center px-6">
          <svg
            className={`w-[40px] h-[40px] mb-6 transition-colors duration-500 ${isVideo ? "text-gold" : "text-gold"}`}
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="50" cy="50" r="45" />
            <circle cx="50" cy="50" r="35" />
            <path d="M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50 M18 18 L25 25 M75 75 L82 82 M18 82 L25 75 M75 25 L82 18" />
          </svg>
          <h2
            className={`font-serif text-5xl italic font-normal mb-6 obs-hide obs-letter-spacing transition-colors duration-500 ${isVideo ? "text-ivory" : "text-maroon"}`}
          >
            Our Journey
          </h2>
          <p
            className={`text-sm font-light max-w-lg mx-auto leading-relaxed transition-colors duration-500 ${isVideo ? "text-white/80" : "text-charcoal"}`}
          >
            {settings?.couple_quote}
          </p>
        </div>

        {/* 3D Carousel / Mobile Snap */}
        <div
          className="relative w-full mb-12 journey-wrapper"
          onMouseEnter={() => clearInterval(autoAdvanceRef.current)}
          onMouseLeave={resetAutoAdvance}
          onTouchStart={(e) => {
            if (window.innerWidth < 768) handleMobileTouchStart(e);
            else handleTouchStart(e);
          }}
          onTouchEnd={(e) => {
            if (window.innerWidth < 768) handleMobileTouchEnd(e);
            else handleTouchEnd(e);
          }}
        >
          {/* Nav Arrows (Desktop) */}
          <button
            onClick={prevJourney}
            aria-label="Previous Story"
            className={`hidden md:flex absolute top-[calc(50%-1.25rem)] left-6 w-11 h-11 rounded-full border items-center justify-center transition-all duration-500 z-20 cursor-pointer pointer-events-auto backdrop-blur-sm ${
              isVideo
                ? "border-white/30 text-white hover:bg-white/20 hover:border-white/60"
                : "border-maroon text-maroon hover:bg-maroon hover:text-ivory"
            }`}
          >
            <Icon
              icon="solar:arrow-left-linear"
              className="w-6 h-6"
              style={{ strokeWidth: 1.5 }}
            />
          </button>

          <button
            onClick={nextJourney}
            aria-label="Next Story"
            className={`hidden md:flex absolute top-[calc(50%-1.25rem)] right-6 w-11 h-11 rounded-full border items-center justify-center transition-all duration-500 z-20 cursor-pointer pointer-events-auto backdrop-blur-sm ${
              isVideo
                ? "border-white/30 text-white hover:bg-white/20 hover:border-white/60"
                : "border-maroon text-maroon hover:bg-maroon hover:text-ivory"
            }`}
          >
            <Icon
              icon="solar:arrow-right-linear"
              className="w-6 h-6"
              style={{ strokeWidth: 1.5 }}
            />
          </button>

          {/* Track */}
          <div
            className="journey-track"
            id="journey-track"
            ref={trackRef}
          >
            {/* Video Card — Mobile Only */}
            {videoCardExists && (
              <div className="journey-card flex flex-col md:hidden flex-shrink-0">
                {/* Landscape video area — tappable */}
                <div
                  className="relative w-full overflow-hidden bg-black cursor-pointer"
                  style={{ aspectRatio: "16/9" }}
                  onClick={() => setVideoFullscreen(true)}
                >
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    src={bgUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                  {/* Tap to expand hint */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span className="text-[10px] text-white/70 font-light">Tap to expand</span>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-[28px_24px] text-center flex flex-col items-center bg-ivory flex-grow">
                  <p className="font-sans font-light text-[10px] text-gold tracking-[0.2em] uppercase mb-2.5">
                    Our Story
                  </p>
                  <svg className="w-16 h-1 mb-2.5" viewBox="0 0 64 4" fill="none">
                    <line x1="0" y1="2" x2="28" y2="2" stroke="#C9A84C" strokeWidth="0.8" />
                    <circle cx="32" cy="2" r="2" fill="#C9A84C" />
                    <line x1="36" y1="2" x2="64" y2="2" stroke="#C9A84C" strokeWidth="0.8" />
                  </svg>
                  <h4 className="font-serif italic text-[22px] text-maroon font-normal my-2.5">
                    {settings?.couple_names || "Benjamin & Lina"}
                  </h4>
                  <p className="font-sans font-light text-[12px] text-charcoal/70 leading-[1.8] italic">
                    {settings?.couple_quote || "A love story worth telling"}
                  </p>
                </div>
              </div>
            )}
            {journeyData.map((item, index) => (
              <div
                key={item.id ?? index}
                className="journey-card flex flex-col group"
                data-index={index}
                style={getCardStyle(index)}
                onClick={() => {
                  if (window.innerWidth >= 768) {
                    setActiveIndex(index);
                    resetAutoAdvance();
                  }
                }}
              >
                {/* Card Image or Gradient */}
                <div
                  className={`h-[220px] md:h-[200px] w-full relative overflow-hidden ${
                    item.photo_url ? "" : `bg-gradient-to-br ${item.bg}`
                  }`}
                >
                  {item.photo_url ? (
                    <img
                      src={item.photo_url}
                      alt={item.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/15 via-transparent to-transparent opacity-60" />
                  )}
                </div>

                {/* Card Content */}
                <div className="p-[28px_24px] text-center flex flex-col items-center bg-ivory flex-grow">
                  <p className="font-sans font-light text-[10px] text-gold tracking-[0.2em] uppercase mb-2.5">
                    {item.date}
                  </p>
                  <svg
                    className="w-16 h-1 mb-2.5"
                    viewBox="0 0 64 4"
                    fill="none"
                  >
                    <line
                      x1="0"
                      y1="2"
                      x2="28"
                      y2="2"
                      stroke="#C9A84C"
                      strokeWidth="0.8"
                    />
                    <circle cx="32" cy="2" r="2" fill="#C9A84C" />
                    <line
                      x1="36"
                      y1="2"
                      x2="64"
                      y2="2"
                      stroke="#C9A84C"
                      strokeWidth="0.8"
                    />
                  </svg>
                  <h4 className="font-serif italic text-[26px] text-maroon font-normal my-2.5">
                    {item.title}
                  </h4>
                  <p className="font-sans font-light text-[13px] text-charcoal leading-[1.8]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bars */}
        <div
          className="flex justify-center gap-2 mt-4 relative z-20 pb-12 md:pb-0"
          id="journey-progress"
        >
          {/* Extra dot for video card — mobile only */}
          {videoCardExists && (
            <div
              className={`md:hidden h-1 transition-all duration-500 rounded-full ${
                activeIndex === 0
                  ? `w-16 ${isVideo ? "bg-gold shadow-[0_0_10px_rgba(201,168,76,0.5)]" : "bg-gold"}`
                  : `w-4 ${isVideo ? "bg-white/20" : "bg-gold/30"}`
              }`}
            />
          )}
          {journeyData.map((_, index) => {
            const adjustedIndex = videoCardExists ? index + 1 : index;
            return (
              <div
                key={index}
                className={`h-1 transition-all duration-500 rounded-full ${
                  activeIndex === adjustedIndex
                    ? `w-16 ${isVideo ? "bg-gold shadow-[0_0_10px_rgba(201,168,76,0.5)]" : "bg-gold"}`
                    : `w-4 ${isVideo ? "bg-white/20" : "bg-gold/30"}`
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Video Fullscreen Overlay — Mobile */}
      {videoFullscreen && (
        <div
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center md:hidden"
          onClick={() => setVideoFullscreen(false)}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            controls
            className="w-full h-full object-contain"
            src={bgUrl}
          />
          {/* Close button */}
          <button
            onClick={() => setVideoFullscreen(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Hint text */}
          <p className="absolute bottom-8 left-0 right-0 text-center text-white/40 text-xs font-light">
            Rotate your phone for full experience
          </p>
        </div>
      )}
    </section>
  );
};

export default Journey;
