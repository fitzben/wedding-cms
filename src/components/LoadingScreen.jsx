import { useEffect, useState } from "react";

const LOGO_URL =
  "https://res.cloudinary.com/dpsaoeync/image/upload/v1773336735/Untitled_design_ewzvbh.png";

const styles = `
  /* B slides in from left, A from right */
  @keyframes ls-B-in {
    0%   { opacity: 0; clip-path: inset(0 100% 0 0); transform: translateX(-18px); }
    60%  { opacity: 1; clip-path: inset(0 0% 0 0);   transform: translateX(2px); }
    100% { opacity: 1; clip-path: inset(0 0% 0 0);   transform: translateX(0); }
  }
  @keyframes ls-A-in {
    0%   { opacity: 0; clip-path: inset(0 0 0 100%); transform: translateX(18px); }
    60%  { opacity: 1; clip-path: inset(0 0 0 0%);   transform: translateX(-2px); }
    100% { opacity: 1; clip-path: inset(0 0 0 0%);   transform: translateX(0); }
  }

  /* Shimmer sweep */
  @keyframes ls-shimmer {
    0%   { background-position: -250% center; }
    100% { background-position: 250% center; }
  }

  /* Glow expand — small circle explodes outward then fades */
  @keyframes ls-glow-expand {
    0%   { transform: scale(0.15); opacity: 0; }
    20%  { opacity: 0.9; }
    60%  { opacity: 0.6; }
    100% { transform: scale(2.8); opacity: 0; }
  }

  /* Second wave, delayed */
  @keyframes ls-glow-expand-2 {
    0%   { transform: scale(0.1); opacity: 0; }
    15%  { opacity: 0.6; }
    100% { transform: scale(2.2); opacity: 0; }
  }

  /* Crossbar draw */
  @keyframes ls-bar-draw {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
  }

  /* Ring rotate */
  @keyframes ls-ring-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* Corner ornaments */
  @keyframes ls-corner-in {
    from { opacity: 0; transform: scale(0.6); }
    to   { opacity: 0.5; transform: scale(1); }
  }

  /* Particle float */
  @keyframes ls-particle {
    0%   { transform: translateY(0) scale(1);    opacity: 0; }
    15%  { opacity: 1; }
    85%  { opacity: 0.5; }
    100% { transform: translateY(-80px) scale(0.3); opacity: 0; }
  }

  .ls-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #080808;
    overflow: hidden;
    transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1),
                visibility 0.9s cubic-bezier(0.4,0,0.2,1);
  }
  .ls-overlay.ls-visible { opacity: 1; visibility: visible; pointer-events: all; }
  .ls-overlay.ls-hidden  { opacity: 0; visibility: hidden;  pointer-events: none; }

  .ls-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 60% at 50% 50%,
      rgba(210,165,120,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .ls-ring {
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    border: 1px dashed rgba(210,165,120,0.15);
    animation: ls-ring-spin 18s linear infinite;
    pointer-events: none;
  }
  .ls-ring-2 {
    width: 370px; height: 370px;
    border: 1px solid rgba(210,165,120,0.06);
    animation: ls-ring-spin 30s linear infinite reverse;
  }

  .ls-corner {
    position: absolute;
    width: 20px; height: 20px;
    opacity: 0;
    animation: ls-corner-in 0.6s ease 1.6s forwards;
  }
  .ls-tl { top: 24px;    left: 24px;  border-top: 1px solid rgba(210,165,120,0.7); border-left: 1px solid rgba(210,165,120,0.7); }
  .ls-tr { top: 24px;    right: 24px; border-top: 1px solid rgba(210,165,120,0.7); border-right: 1px solid rgba(210,165,120,0.7); }
  .ls-bl { bottom: 24px; left: 24px;  border-bottom: 1px solid rgba(210,165,120,0.7); border-left: 1px solid rgba(210,165,120,0.7); }
  .ls-br { bottom: 24px; right: 24px; border-bottom: 1px solid rgba(210,165,120,0.7); border-right: 1px solid rgba(210,165,120,0.7); }

  .ls-stage {
    position: relative;
    width: 220px; height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Glow — always circular, expands like a ripple/explosion */
  .ls-glow-wrap {
    position: absolute;
    width: 180px; height: 180px;
    border-radius: 50%;
    pointer-events: none;
  }

  .ls-glow, .ls-glow-2 {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at center,
      rgba(210,165,120,0.6) 0%,
      rgba(210,165,120,0.2) 40%,
      transparent 70%
    );
    transform-origin: center;
  }

  .ls-glow {
    animation: ls-glow-expand 3s ease-out 0.8s infinite;
  }
  .ls-glow-2 {
    animation: ls-glow-expand 3s ease-out 2.3s infinite;
  }

  /* Both halves render same image, different clip */
  .ls-half {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .ls-half img {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    object-fit: contain;
  }

  .ls-half-B {
    clip-path: inset(0 50% 0 0);
    opacity: 0;
    animation: ls-B-in 1s cubic-bezier(0.22,1,0.36,1) 0.3s forwards;
  }
  .ls-half-A {
    clip-path: inset(0 0 0 50%);
    opacity: 0;
    animation: ls-A-in 1s cubic-bezier(0.22,1,0.36,1) 0.3s forwards;
  }

  .ls-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 30%,
      rgba(255,225,180,0.5) 50%,
      transparent 70%
    );
    background-size: 300% 100%;
    mix-blend-mode: overlay;
    pointer-events: none;
    animation: ls-shimmer 3s ease-in-out 1.5s infinite;
  }

  .ls-crossbar {
    position: absolute;
    left: 16%; right: 16%;
    top: 50%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(210,165,120,0.55), transparent);
    transform-origin: center;
    transform: scaleX(0);
    opacity: 0;
    animation: ls-bar-draw 0.6s cubic-bezier(0.4,0,0.2,1) 1.1s forwards;
  }

  .ls-p {
    position: absolute;
    width: 2px; height: 2px;
    border-radius: 50%;
    background: rgba(210,165,120,0.9);
    animation: ls-particle var(--dur) ease-in-out var(--delay) infinite;
  }
`;

const PARTICLES = [
  { left: "44%", top: "72%", delay: "1.5s", dur: "2.8s" },
  { left: "54%", top: "74%", delay: "2.2s", dur: "3.1s" },
  { left: "49%", top: "71%", delay: "2.9s", dur: "2.6s" },
  { left: "38%", top: "73%", delay: "3.4s", dur: "3.0s" },
  { left: "61%", top: "72%", delay: "1.8s", dur: "2.9s" },
  { left: "51%", top: "75%", delay: "3.9s", dur: "3.3s" },
];

let styleInjected = false;
function injectStyles() {
  if (styleInjected) return;
  const tag = document.createElement("style");
  tag.dataset.ls = "1";
  tag.textContent = styles;
  document.head.appendChild(tag);
  styleInjected = true;
}

export default function LoadingScreen({ isLoading }) {
  const [mounted, setMounted] = useState(isLoading);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (isLoading) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 950);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`ls-overlay ${isLoading ? "ls-visible" : "ls-hidden"}`}
    >
      <div className="ls-bg" />
      <div className="ls-ring" />
      <div className="ls-ring ls-ring-2" />

      {/* Corner ornaments */}
      <div className="ls-corner ls-tl" />
      <div className="ls-corner ls-tr" />
      <div className="ls-corner ls-bl" />
      <div className="ls-corner ls-br" />

      <div className="ls-stage">
        <div className="ls-glow-wrap">
          <div className="ls-glow" />
          <div className="ls-glow-2" />
        </div>

        {/* B — left half slides in from left */}
        <div className="ls-half ls-half-B">
          <img src={LOGO_URL} alt="" draggable={false} />
        </div>

        {/* A — right half slides in from right */}
        <div className="ls-half ls-half-A">
          <img src={LOGO_URL} alt="" draggable={false} />
        </div>

        {/* Horizontal crossbar accent */}
        <div className="ls-crossbar" />

        {/* Gold shimmer sweep */}
        <div className="ls-shimmer" />
      </div>

      {/* Floating gold particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="ls-p"
          style={{ left: p.left, top: p.top, "--delay": p.delay, "--dur": p.dur }}
        />
      ))}
    </div>
  );
}
