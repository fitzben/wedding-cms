import { useRef, useEffect } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

const STYLES = `
  @keyframes dc-line-draw {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
  }
  @keyframes dc-swatch-in {
    from { opacity: 0; transform: translateY(16px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes dc-label-in {
    from { opacity: 0; letter-spacing: 0.5em; }
    to   { opacity: 0.6; letter-spacing: 0.35em; }
  }
  @keyframes dc-grain {
    0%, 100% { transform: translate(0,0); }
    25%  { transform: translate(-1%,-1%); }
    50%  { transform: translate(1%,1%); }
    75%  { transform: translate(-1%,1%); }
  }

  .dc-section.active .dc-label    { animation: dc-label-in  0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .dc-section.active .dc-title    { animation: dc-swatch-in 1.0s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
  .dc-section.active .dc-rule     { animation: dc-line-draw 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both; transform-origin: left; }
  .dc-section.active .dc-note     { animation: dc-swatch-in 0.8s cubic-bezier(0.16,1,0.3,1) 0.65s both; }
  .dc-section.active .dc-palette  { animation: dc-swatch-in 0.9s cubic-bezier(0.16,1,0.3,1) 0.8s both; }

  .dc-swatch {
    position: relative;
    cursor: default;
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .dc-swatch:hover { transform: translateY(-6px) scale(1.06); }
  .dc-swatch:hover .dc-swatch-label { opacity: 1; transform: translateY(0); }

  .dc-swatch-label {
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .dc-grain-layer {
    position: absolute; inset: 0; pointer-events: none; z-index: 1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-size: 160px;
    opacity: 0.025;
    animation: dc-grain 0.5s steps(1) infinite;
  }
`;

let injected = false;
function inject() {
  if (injected) return;
  const s = document.createElement("style");
  s.textContent = STYLES;
  document.head.appendChild(s);
  injected = true;
}

// ─── Swatch ───────────────────────────────────────────────────────────────────
function Swatch({ color, index }) {
  // Luminance check for text contrast
  // const isLight = (() => {
  //   const hex = (color.hex || "#888").replace("#", "");
  //   if (hex.length < 6) return true;
  //   const r = parseInt(hex.slice(0, 2), 16);
  //   const g = parseInt(hex.slice(2, 4), 16);
  //   const b = parseInt(hex.slice(4, 6), 16);
  //   return (r * 299 + g * 587 + b * 114) / 1000 > 155;
  // })();

  return (
    <div
      className="dc-swatch flex flex-col items-center gap-3"
      style={{ animationDelay: `${0.8 + index * 0.08}s` }}
    >
      {/* Main circle */}
      <div
        className="relative rounded-full shadow-lg"
        style={{
          width: "clamp(52px, 8vw, 72px)",
          height: "clamp(52px, 8vw, 72px)",
          background: color.hex,
          boxShadow: `0 8px 32px -8px ${color.hex}80, inset 0 1px 0 rgba(255,255,255,0.2)`,
        }}
      >
        {/* Inner sheen */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25) 0%, transparent 60%)",
          }}
        />
        {/* Fine border */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}
        />
      </div>

      {/* Label on hover */}
      <div className="dc-swatch-label text-center">
        {color.label && (
          <p className="font-sans text-[9px] font-medium text-charcoal/50 uppercase tracking-[0.15em] whitespace-nowrap">
            {color.label}
          </p>
        )}
        <p className="font-mono text-[8px] text-charcoal/30 mt-0.5">
          {(color.hex || "").toUpperCase()}
        </p>
      </div>
    </div>
  );
}

// ─── Full-width color band ────────────────────────────────────────────────────
function ColorBand({ colors }) {
  if (!colors.length) return null;
  return (
    <div
      className="w-full overflow-hidden"
      style={{ height: 4, borderRadius: 2 }}
    >
      <div className="flex h-full">
        {colors.map((c, i) => (
          <div
            key={c.id || i}
            className="flex-1 transition-all duration-500 hover:flex-[2]"
            style={{ background: c.hex }}
            title={c.label || c.hex}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const DressCode = ({ settings }) => {
  const sectionRef = useRef(null);
  const { dress_code_colors, dress_code_theme, dress_code_notes } =
    settings || {};

  useEffect(() => {
    inject();
  }, []);
  useScrollReveal([dress_code_colors, dress_code_theme]);

  if (!dress_code_theme && !dress_code_notes && !dress_code_colors) return null;

  let colors = [];
  try {
    colors = JSON.parse(dress_code_colors || "[]");
  } catch {
    /* empty */
  }

  // IntersectionObserver for entrance
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("active");
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-dresscode"
      className="dc-section relative py-28 md:py-40 bg-ivory overflow-hidden"
    >
      {/* Grain */}
      <div className="dc-grain-layer" />

      {/* Ambient blobs */}
      {colors.slice(0, 2).map((c, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: "40vw",
            height: "40vw",
            background: c.hex,
            borderRadius: "50%",
            filter: "blur(120px)",
            opacity: 0.06,
            top: i === 0 ? "-10%" : "auto",
            bottom: i === 1 ? "-10%" : "auto",
            left: i === 0 ? "-10%" : "auto",
            right: i === 1 ? "-10%" : "auto",
          }}
        />
      ))}

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* ── Header ── */}
        <div className="text-center mb-20 md:mb-28">
          <p className="dc-label font-sans text-[9px] text-gold tracking-[0.35em] uppercase mb-6 block">
            Attire
          </p>
          <h2 className="dc-title font-serif text-[clamp(48px,7vw,96px)] italic font-normal text-maroon leading-none tracking-tight mb-8">
            Dress Code
          </h2>

          {/* Animated rule */}
          <div
            className="dc-rule mx-auto mb-8"
            style={{
              height: 1,
              width: 180,
              background:
                "linear-gradient(to right, transparent, rgba(201,168,76,0.6), transparent)",
            }}
          />

          {dress_code_theme && (
            <p className="dc-note font-sans text-[11px] font-bold text-maroon/50 uppercase tracking-[0.3em]">
              {dress_code_theme}
            </p>
          )}
        </div>

        {/* ── Color palette — editorial horizontal layout ── */}
        {colors.length > 0 && (
          <div className="dc-palette mb-16 md:mb-24">
            {/* Thin color band across full width */}
            <ColorBand colors={colors} />

            {/* Swatches */}
            <div className="flex items-end justify-center gap-6 md:gap-10 mt-10 flex-wrap">
              {colors.map((c, i) => (
                <Swatch key={c.id || i} color={c} index={i} />
              ))}
            </div>

            {/* Bottom band mirror */}
            <div className="mt-10">
              <ColorBand colors={[...colors].reverse()} />
            </div>
          </div>
        )}

        {/* ── Notes — quote-style ── */}
        {dress_code_notes && (
          <div className="dc-note max-w-lg mx-auto text-center relative">
            {/* Opening quote mark */}
            <span
              className="absolute -top-8 left-1/2 -translate-x-1/2 font-serif text-[80px] text-gold/10 leading-none select-none pointer-events-none"
              aria-hidden
            >
              "
            </span>
            <p className="font-serif italic text-charcoal/60 text-base md:text-lg leading-relaxed font-normal relative z-10">
              {dress_code_notes}
            </p>
          </div>
        )}

        {/* ── No colors fallback ── */}
        {colors.length === 0 && !dress_code_notes && dress_code_theme && (
          <div className="text-center">
            <svg
              className="mx-auto mb-4 opacity-10"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3d0510"
              strokeWidth="1"
            >
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
};

export default DressCode;
