import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import useSettings from "../hooks/useSettings";
import {
  getGallerySections,
  getGalleryMedia,
} from "../services/galleryService";

/* ─── Keyframe styles injected once ─────────────────────────────────────────── */
const HERO_STYLES = `
  /* ── Entrance animations ── */
  @keyframes hero-fade-up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hero-fade-left {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes hero-fade-right {
    from { opacity: 0; transform: translateX(-32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes hero-scale-in {
    from { opacity: 0; transform: scale(1.06); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes hero-line-draw {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
  }
  @keyframes hero-line-draw-y {
    from { transform: scaleY(0); opacity: 0; }
    to   { transform: scaleY(1); opacity: 1; }
  }
  @keyframes hero-label-in {
    from { opacity: 0; letter-spacing: 0.5em; }
    to   { opacity: 0.6; letter-spacing: 0.3em; }
  }
  @keyframes hero-chevron-bob {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50%       { transform: translateX(-50%) translateY(7px); }
  }
  @keyframes hero-grain {
    0%, 100% { transform: translate(0, 0); }
    10%       { transform: translate(-1%, -2%); }
    20%       { transform: translate(2%, 1%); }
    30%       { transform: translate(-1%, 3%); }
    40%       { transform: translate(1%, -1%); }
    50%       { transform: translate(-2%, 2%); }
    60%       { transform: translate(2%, -2%); }
    70%       { transform: translate(-1%, 1%); }
    80%       { transform: translate(1%, 2%); }
    90%       { transform: translate(-2%, -1%); }
  }
  @keyframes hero-float {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50%       { transform: translateY(-10px) rotate(1deg); }
  }

  /* ── Exit animation ── */
  @keyframes hero-exit {
    to { opacity: 0; transform: scale(1.04); }
  }

  .hero-exit {
    animation: hero-exit 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
  }

  /* ── Staggered entrance helpers ── */
  .hero-label     { animation: hero-label-in     0.9s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
  .hero-line-h    { animation: hero-line-draw     0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both; transform-origin: left; }
  .hero-line-v    { animation: hero-line-draw-y   0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both; transform-origin: top; }
  .hero-name-1    { animation: hero-fade-up       1.0s cubic-bezier(0.16,1,0.3,1) 0.55s both; }
  .hero-name-2    { animation: hero-fade-up       1.0s cubic-bezier(0.16,1,0.3,1) 0.72s both; }
  .hero-date      { animation: hero-fade-up       0.8s cubic-bezier(0.16,1,0.3,1) 0.95s both; }
  .hero-guest     { animation: hero-fade-up       0.8s cubic-bezier(0.16,1,0.3,1) 1.1s  both; }
  .hero-btn       { animation: hero-fade-up       0.8s cubic-bezier(0.16,1,0.3,1) 1.25s both; }
  .hero-photo     { animation: hero-scale-in      1.2s cubic-bezier(0.16,1,0.3,1) 0.1s  both; }
  .hero-side-label{ animation: hero-fade-left     0.8s cubic-bezier(0.16,1,0.3,1) 0.8s  both; }
  .hero-deco-num  { animation: hero-fade-right    0.8s cubic-bezier(0.16,1,0.3,1) 1.0s  both; }

  /* ── Grain overlay ── */
  .hero-grain::after {
    content: '';
    position: absolute;
    inset: -50%;
    width: 200%; height: 200%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    background-size: 180px 180px;
    opacity: 0.035;
    pointer-events: none;
    animation: hero-grain 0.4s steps(1) infinite;
    z-index: 1;
  }

  /* ── Photo float ── */
  .hero-photo-float {
    animation: hero-float 7s ease-in-out infinite;
  }

  /* ── Chevron bob ── */
  .hero-chevron {
    animation: hero-chevron-bob 2s ease-in-out infinite;
  }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const tag = document.createElement("style");
  tag.dataset.hero = "1";
  tag.textContent = HERO_STYLES;
  document.head.appendChild(tag);
  stylesInjected = true;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */
const Hero = ({ guestName, onOpenInvitation }) => {
  const { settings } = useSettings();
  const [exiting, setExiting] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [showChevron, setShowChevron] = useState(true);
  const [photoUrl, setPhotoUrl] = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    injectStyles();
  }, []);

  /* Load hero photo from gallery */
  useEffect(() => {
    (async () => {
      try {
        const sections = await getGallerySections();
        const heroSec = sections.find(
          (s) => s.key === "hero" || s.name.toLowerCase() === "hero",
        );
        if (heroSec) {
          const items = await getGalleryMedia(heroSec.id);
          if (items.length > 0) setPhotoUrl(items[0].public_url);
        }
      } catch {
        /* empty */
      }
    })();
  }, []);

  /* Hide chevron after scroll */
  useEffect(() => {
    const onScroll = () =>
      setShowChevron(window.scrollY < window.innerHeight * 0.4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleOpen = () => {
    setExiting(true);
    onOpenInvitation();
    setTimeout(() => {
      setRemoved(true);
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 650);
  };

  if (removed) return null;

  const groom = settings?.groom_nickname || "";
  const bride = settings?.bride_nickname || "";
  const rawDate = settings?.resepsi_date || "";

  /* Format date: "2026-05-31" → "31 · 05 · 2026" */
  const fmtDate = rawDate ? rawDate.split("-").reverse().join(" · ") : "";

  return (
    <header
      ref={heroRef}
      className={`hero-grain relative w-full min-h-screen overflow-hidden bg-[#0c0a08] ${exiting ? "hero-exit" : ""}`}
      aria-hidden={exiting}
    >
      {/* ── Background texture layer ───────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 60% 50%, rgba(61,5,16,0.55) 0%, transparent 70%),
            radial-gradient(ellipse 50% 80% at 10% 80%, rgba(201,168,76,0.08) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Thin vertical rule — left editorial column ─────────────────────── */}
      <div
        className="hero-line-v absolute left-[3.5rem] md:left-[5.5rem] top-0 bottom-0 w-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 5%, rgba(201,168,76,0.25) 20%, rgba(201,168,76,0.25) 80%, transparent 95%)",
        }}
      />

      {/* ── Top horizontal rule ────────────────────────────────────────────── */}
      <div
        className="hero-line-h absolute top-[4rem] left-[3.5rem] md:left-[5.5rem] right-12 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(201,168,76,0.5), rgba(201,168,76,0.1) 60%, transparent)",
        }}
      />

      {/* ── "THE WEDDING OF" rotated sidebar label ─────────────────────────── */}
      <div
        className="hero-side-label absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg) translateY(50%)",
        }}
      >
        <span
          className="text-[9px] tracking-[0.4em] uppercase font-light"
          style={{ color: "rgba(201,168,76,0.5)" }}
        >
          The Wedding Of
        </span>
      </div>

      {/* ── Issue / date decorative number ─────────────────────────────────── */}
      <div className="hero-deco-num absolute top-[4.5rem] right-10 md:right-16 text-right pointer-events-none hidden md:block">
        <p
          className="text-[9px] tracking-[0.3em] uppercase font-light"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          Vol. I
        </p>
        <p
          className="font-serif italic text-xs mt-0.5"
          style={{ color: "rgba(201,168,76,0.35)" }}
        >
          2026
        </p>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row">
        {/* ── LEFT COLUMN — text content ─────────────────────────────────── */}
        <div className="flex flex-col justify-center pl-[4rem] md:pl-[7.5rem] pr-6 md:pr-0 pt-20 pb-12 md:pt-28 md:pb-20 md:w-[48%] lg:w-[44%] flex-shrink-0">
          {/* Top label */}
          <p
            className="hero-label text-[9px] tracking-[0.3em] uppercase font-light mb-10"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Sunday · May 2026
          </p>

          {/* Names */}
          <div className="mb-3">
            <h1
              className="hero-name-1 font-script text-[clamp(58px,8vw,110px)] font-normal leading-[0.88] text-ivory"
              style={{ textShadow: "0 4px 40px rgba(61,5,16,0.6)" }}
            >
              {groom}
            </h1>
          </div>

          {/* Thin rule with ampersand */}
          <div
            className="hero-line-h flex items-center gap-4 my-2 md:my-3"
            style={{ transformOrigin: "left" }}
          >
            <div
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(to right, rgba(201,168,76,0.5), transparent)",
              }}
            />
            <span
              className="font-serif italic text-xl"
              style={{ color: "rgba(201,168,76,0.7)" }}
            >
              &amp;
            </span>
            <div
              className="h-px w-8"
              style={{ background: "rgba(201,168,76,0.3)" }}
            />
          </div>

          <div className="mb-8 md:mb-12">
            <h1
              className="hero-name-2 font-script text-[clamp(58px,8vw,110px)] font-normal leading-[0.88] text-ivory"
              style={{ textShadow: "0 4px 40px rgba(61,5,16,0.6)" }}
            >
              {bride}
            </h1>
          </div>

          {/* Date line */}
          <div className="hero-date flex items-center gap-4 mb-12 md:mb-16">
            <div
              className="w-6 h-px"
              style={{ background: "rgba(201,168,76,0.5)" }}
            />
            <p
              className="text-[10px] tracking-[0.35em] uppercase font-light"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {fmtDate}
            </p>
          </div>

          {/* Guest greeting */}
          <div className="hero-guest mb-8">
            <p
              className="font-serif italic text-sm mb-1.5"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Dear,
            </p>
            <p className="font-serif text-[clamp(20px,2.5vw,26px)] font-normal text-ivory tracking-tight capitalize">
              {guestName || "Guest Name"}
            </p>
          </div>

          {/* CTA Button */}
          <div className="hero-btn">
            <button
              onClick={handleOpen}
              className="group relative inline-flex items-center gap-4 overflow-hidden cursor-pointer"
              style={{ background: "none", border: "none", padding: 0 }}
            >
              {/* Pill outline */}
              <span
                className="relative flex items-center gap-3 px-7 py-3.5 transition-all duration-500"
                style={{
                  border: "1px solid rgba(201,168,76,0.4)",
                  borderRadius: "2px",
                }}
              >
                {/* Hover fill */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "rgba(201,168,76,0.08)" }}
                />
                <span className="relative text-[10px] tracking-[0.25em] uppercase font-light text-ivory">
                  Open Invitation
                </span>
                <Icon
                  icon="solar:lock-keyhole-linear"
                  className="relative text-base transition-transform duration-500 group-hover:rotate-12"
                  style={{ color: "rgba(201,168,76,0.8)" }}
                />
              </span>
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN — photo ───────────────────────────────────────── */}
        <div className="hero-photo relative flex-1 flex items-stretch md:items-center justify-center overflow-hidden min-h-[40vh] md:min-h-0">
          {/* Photo frame */}
          <div
            className="hero-photo-float relative w-full h-[45vh] md:w-auto md:h-[88vh] md:max-h-[780px] md:aspect-auto"
            style={{ margin: "auto" }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Wedding couple"
                className="w-full h-full object-cover"
                style={{
                  borderLeft: "1px solid rgba(201,168,76,0.15)",
                  filter: "brightness(0.92) contrast(1.06)",
                }}
              />
            ) : (
              /* Placeholder gradient while loading */
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(160deg, #1a0a08 0%, #3d0510 50%, #1a0808 100%)",
                  borderLeft: "1px solid rgba(201,168,76,0.15)",
                }}
              />
            )}

            {/* Vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(to right, rgba(12,10,8,0.7) 0%, transparent 25%),
                  linear-gradient(to top, rgba(12,10,8,0.5) 0%, transparent 30%)
                `,
              }}
            />

            {/* Bottom-right corner ornament on photo */}
            <div className="absolute bottom-6 right-6 pointer-events-none opacity-40">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                stroke="rgba(201,168,76,0.8)"
                strokeWidth="0.8"
              >
                <path d="M32,8 L32,32 L8,32" />
                <path d="M32,14 L32,32 L14,32" />
              </svg>
            </div>
          </div>

          {/* Decorative ghost text behind photo */}
          <span
            className="absolute right-0 top-1/2 -translate-y-1/2 font-serif italic pointer-events-none select-none"
            style={{
              fontSize: "clamp(80px, 12vw, 180px)",
              lineHeight: 1,
              color: "rgba(201,168,76,0.04)",
              writingMode: "vertical-rl",
              letterSpacing: "-0.05em",
              whiteSpace: "nowrap",
            }}
          >
            {groom} &amp; {bride}
          </span>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
      <div
        className="hero-line-h absolute bottom-0 left-[3.5rem] md:left-[5.5rem] right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(201,168,76,0.3), transparent 50%)",
        }}
      />

      {/* ── Scroll chevron ─────────────────────────────────────────────────── */}
      <div
        className={`hero-chevron absolute bottom-8 left-1/2 pointer-events-none transition-opacity duration-500 ${showChevron ? "opacity-100" : "opacity-0"}`}
        style={{ transform: "translateX(-50%)" }}
      >
        <Icon
          icon="solar:alt-arrow-down-linear"
          className="text-2xl"
          style={{ color: "rgba(201,168,76,0.5)" }}
        />
      </div>
    </header>
  );
};

export default Hero;
