import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import useSettings from "../hooks/useSettings";
// import {
//   getGallerySections,
//   getGalleryMedia,
// } from "../services/galleryService";

const Hero = ({ guestName, onOpenInvitation }) => {
  const { settings } = useSettings();
  const [isOpened, setIsOpened] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showChevron, setShowChevron] = useState(true);
  // const [backgroundMedia, setBackgroundMedia] = useState(null);

  const handleOpenClick = () => {
    setIsOpened(true);
    onOpenInvitation();

    setTimeout(() => {
      setIsRemoving(true);
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 600);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.5) {
        setShowChevron(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // useEffect(() => {
  //   const loadHeroMedia = async () => {
  //     try {
  //       const sections = await getGallerySections();
  //       const heroSection = sections.find(
  //         (s) => s.name.toLowerCase() === "hero" || s.key === "hero",
  //       );
  //       if (heroSection) {
  //         const items = await getGalleryMedia(heroSection.id);
  //         if (items.length > 0) {
  //           // setBackgroundMedia(items[0].public_url);
  //           setBackgroundMedia(null);
  //         }
  //       }
  //     } catch (e) {
  //       console.error("Error loading hero media", e);
  //     }
  //   };
  //   loadHeroMedia();
  // }, []);

  if (isRemoving) return null;

  const groomName = settings?.groom_nickname;
  const brideName = settings?.bride_nickname;
  const weddingDate = settings?.resepsi_date
    ? new Date(settings.resepsi_date + "T00:00:00").toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <header
      id="hero-section"
      className={`relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-between overflow-y-auto overflow-x-hidden bg-black py-10 md:py-20 w-full transition-all duration-600 cursor-pointer ${
        isOpened ? "opacity-0 scale-[1.04]" : "opacity-100 scale-100"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
      onClick={!isOpened ? handleOpenClick : undefined}
      inert={isOpened ? "" : undefined}
    >
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#4a0611] to-[#1A1A1A] scale-105 transition-transform duration-[20000ms] ease-out hover:scale-110"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-maroon/40 via-transparent to-transparent opacity-80 mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent opacity-60 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 w-full flex-grow mt-4 md:mt-12 min-h-0">
        <p className="uppercase text-[10px] md:text-[11px] font-light text-ivory tracking-[0.3em] mb-8 md:mb-12 opacity-70 hero-elem anim-hero-label">
          The Wedding Of
        </p>

        {/* STACKED NAMES WITH GHOST & */}
        <div className="relative flex flex-col items-center justify-center z-10 w-full mb-4 md:mb-8">
          {/* Ghost "&" Watermark */}
          <span
            className="absolute top-1/2 left-1/2 font-serif italic text-[clamp(150px,25vw,400px)] md:text-[clamp(200px,30vw,400px)] text-gold/[0.06] pointer-events-none select-none z-0 hero-elem anim-hero-ghost"
            style={{ lineHeight: 1 }}
          >
            &amp;
          </span>

          {/* Benjamin */}
          <span className="font-script text-[clamp(48px,10vw,150px)] md:text-[clamp(72px,11vw,150px)] font-normal text-ivory tracking-[0.01em] leading-none z-10 hero-elem anim-hero-name1">
            {groomName}
          </span>

          {/* Thin Makassar Rule */}
          <svg
            className="w-[120px] md:w-[160px] h-[8px] my-3 md:my-4 z-10 hero-elem anim-hero-rule"
            viewBox="0 0 160 8"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1"
          >
            <line x1="0" y1="4" x2="72" y2="4"></line>
            <circle cx="80" cy="4" r="3" fill="#C9A84C"></circle>
            <line x1="88" y1="4" x2="160" y2="4"></line>
          </svg>

          {/* Angelin */}
          <span className="font-script text-[clamp(48px,10vw,150px)] md:text-[clamp(72px,11vw,150px)] font-normal text-ivory tracking-[0.01em] leading-none z-10 hero-elem anim-hero-name2">
            {brideName}
          </span>
        </div>

        <p className="text-offwhite text-[10px] md:text-xs uppercase tracking-[0.3em] mt-4 md:mt-8 hero-elem anim-hero-date">
          Sunday &middot; {weddingDate}
        </p>
      </div>

      <div className="flex flex-col w-full z-10 pt-4 md:pt-16 px-6 pb-8 md:pb-0 relative items-center">
        <div className="hero-elem anim-hero-guest flex flex-col items-center">
          <p className="text-offwhite/80 text-xs md:text-sm mb-1 md:mb-2 font-light italic font-serif">
            Dear,
          </p>
          <p className="text-lg md:text-2xl font-serif tracking-tight mb-4 md:mb-10 font-normal text-white capitalize">
            {guestName || "Guest Name"}
          </p>
        </div>

        <button
          onClick={handleOpenClick}
          className="group relative inline-flex items-center justify-center gap-4 px-8 py-3.5 md:py-4 border border-maroon text-offwhite rounded-full overflow-hidden transition-all duration-700 hover:bg-maroon hero-elem anim-hero-btn bg-transparent cursor-pointer"
        >
          <span className="relative z-10 text-[10px] md:text-xs tracking-[0.2em] uppercase font-light">
            Open Invitation
          </span>
          <Icon
            icon="solar:lock-keyhole-linear"
            className="relative z-10 text-lg transition-transform duration-500 group-hover:scale-110"
            style={{ strokeWidth: 1.5 }}
          />
        </button>

        {/* Tap anywhere hint — mobile only */}
        <p
          className="md:hidden text-[9px] text-offwhite/30 tracking-[0.2em] uppercase mt-4 font-light hero-elem anim-hero-btn"
          style={{ animationDelay: "2500ms" }}
        >
          atau tap di mana saja
        </p>
      </div>

      {/* Scroll Chevron */}
      <div
        id="hero-chevron"
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 anim-chevron pointer-events-none transition-opacity duration-400 ${
          showChevron ? "opacity-100" : "opacity-0"
        }`}
      >
        <Icon
          icon="solar:alt-arrow-down-linear"
          className="text-3xl text-gold"
          style={{ strokeWidth: 1.5 }}
        />
      </div>
    </header>
  );
};

export default Hero;
