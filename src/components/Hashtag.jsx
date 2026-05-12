import { useEffect, useState, useRef, useCallback } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import useSettings from "../hooks/useSettings";

// ─── Rose Petals Background ───────────────────────────────────────────────────
const PETAL_COLORS = [
  { r: 180, g: 30, b: 45 },
  { r: 140, g: 20, b: 35 },
  { r: 210, g: 60, b: 70 },
  { r: 160, g: 40, b: 60 },
  { r: 201, g: 168, b: 76 },
  { r: 190, g: 50, b: 80 },
];
const PETAL_WEIGHTS = [22, 22, 20, 18, 8, 10];

function rndPetalColor() {
  let r = Math.random() * PETAL_WEIGHTS.reduce((a, b) => a + b, 0);
  for (let i = 0; i < PETAL_WEIGHTS.length; i++) {
    r -= PETAL_WEIGHTS[i];
    if (r <= 0) return PETAL_COLORS[i];
  }
  return PETAL_COLORS[0];
}

function drawPetalPath(ctx, r) {
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.bezierCurveTo(r * 0.55, -r * 0.9, r * 0.85, r * 0.1, 0, r);
  ctx.bezierCurveTo(-r * 0.85, r * 0.1, -r * 0.55, -r * 0.9, 0, -r);
  ctx.closePath();
}

function mkPetal(W, H, fromTop = true) {
  const depth = 0.3 + Math.random() * 0.7;
  return {
    x: Math.random() * W,
    y: fromTop ? -20 - Math.random() * 80 : Math.random() * H,
    size: 5 + Math.random() * 11,
    depth,
    opacity: 0.18 + depth * 0.3,
    color: rndPetalColor(),
    vx: (Math.random() - 0.5) * 0.6 * depth,
    vy: 0.4 + depth * 1.1,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.025,
    wobbleAmp: 0.6 + Math.random() * 1.2,
    wobbleFreq: 0.008 + Math.random() * 0.012,
    wobbleOff: Math.random() * Math.PI * 2,
    alive: true,
  };
}

function mkBurstPetal(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random() * 5;
  return {
    x,
    y,
    size: 4 + Math.random() * 9,
    depth: 0.7,
    opacity: 0.6 + Math.random() * 0.2,
    color: rndPetalColor(),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 2,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.08,
    wobbleAmp: 0,
    wobbleFreq: 0,
    wobbleOff: 0,
    alive: true,
    burst: true,
    gravity: 0.12,
    drag: 0.97,
    life: 1,
    fadeSpeed: 0.012 + Math.random() * 0.01,
  };
}

function useRosePetals(isVisible) {
  const canvasRef = useRef(null);
  const petalsRef = useRef([]);
  const frameRef = useRef(0);

  const triggerBurst = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < 18; i++)
      petalsRef.current.push(
        mkBurstPetal(clientX - rect.left, clientY - rect.top),
      );
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const W = () => canvas.width;
    const H = () => canvas.height;
    petalsRef.current = Array.from({ length: 45 }, () =>
      mkPetal(W(), H(), false),
    );

    const draw = () => {
      animId = requestAnimationFrame(draw);
      frameRef.current++;
      const w = W(),
        h = H();
      ctx.clearRect(0, 0, w, h);

      if (
        petalsRef.current.filter((p) => !p.burst).length < 45 &&
        frameRef.current % 14 === 0
      ) {
        petalsRef.current.push(mkPetal(w, h, true));
      }

      petalsRef.current = petalsRef.current.filter((p) => p.alive);

      for (const p of petalsRef.current) {
        if (p.burst) {
          p.vx *= p.drag;
          p.vy += p.gravity;
          p.vy *= p.drag;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotSpeed;
          p.life -= p.fadeSpeed;
          p.opacity = Math.max(0, p.life * 0.65);
          if (p.life <= 0 || p.y > h + 40) p.alive = false;
        } else {
          const wobble =
            Math.sin(frameRef.current * p.wobbleFreq + p.wobbleOff) *
            p.wobbleAmp;
          p.x += p.vx + wobble * 0.05;
          p.y += p.vy;
          p.rotation += p.rotSpeed;
          if (p.x < -20) p.x = w + 10;
          if (p.x > w + 20) p.x = -10;
          if (p.y > h + 20) Object.assign(p, mkPetal(w, h, true));
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const { r, g, b } = p.color;
        if (p.depth > 0.5) {
          ctx.shadowColor = `rgba(${r},${g},${b},0.15)`;
          ctx.shadowBlur = p.size * 1.5;
        }

        const grad = ctx.createRadialGradient(
          -p.size * 0.2,
          -p.size * 0.3,
          0,
          0,
          0,
          p.size * 1.2,
        );
        grad.addColorStop(
          0,
          `rgba(${Math.min(r + 40, 255)},${Math.min(g + 30, 255)},${Math.min(b + 30, 255)},${p.opacity})`,
        );
        grad.addColorStop(
          0.6,
          `rgba(${r},${g},${b},${(p.opacity * 0.85).toFixed(2)})`,
        );
        grad.addColorStop(
          1,
          `rgba(${Math.max(r - 30, 0)},${Math.max(g - 15, 0)},${Math.max(b - 15, 0)},${(p.opacity * 0.5).toFixed(2)})`,
        );

        drawPetalPath(ctx, p.size);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.shadowBlur = 0;
        drawPetalPath(ctx, p.size);
        ctx.strokeStyle = `rgba(${Math.max(r - 20, 0)},${Math.max(g - 10, 0)},${Math.max(b - 10, 0)},${(p.opacity * 0.3).toFixed(2)})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();

        ctx.restore();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [isVisible]);

  return { canvasRef, triggerBurst };
}

// ─── Countdown logic ──────────────────────────────────────────────────────────
function useCountdown(targetDateStr) {
  const calc = () => {
    if (!targetDateStr) return null;
    const target = new Date(targetDateStr).getTime();
    const diff = target - Date.now();
    if (diff <= 0)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      passed: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calc);

  useEffect(() => {
    if (!targetDateStr) return;
    const t = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDateStr]);

  return timeLeft;
}

// ─── Animated flip digit ──────────────────────────────────────────────────────
const FLIP_STYLE = `
  @keyframes ht-flip-top {
    from { transform: rotateX(0deg);   }
    to   { transform: rotateX(-90deg); }
  }
  @keyframes ht-flip-bot {
    from { transform: rotateX(90deg);  }
    to   { transform: rotateX(0deg);   }
  }
  @keyframes floatParticle {
    0%   { transform: translateY(0) scale(1);    opacity: 0; }
    15%  { opacity: 1; }
    85%  { opacity: 0.5; }
    100% { transform: translateY(-80px) scale(0.3); opacity: 0; }
  }
  @keyframes ht-pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.8); opacity: 0;   }
  }
  @keyframes ht-text-in {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ht-line-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  .ht-flip-card {
    perspective: 300px;
    position: relative;
  }
  .ht-face {
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .ht-flip-top { animation: ht-flip-top 0.25s ease-in forwards; }
  .ht-flip-bot { animation: ht-flip-bot 0.25s ease-out 0.25s forwards; }
`;

function FlipDigit({ value }) {
  const pad = String(value).padStart(2, "0");
  const prevRef = useRef(pad);
  const [flipping, setFlipping] = useState(false);
  const [prev, setPrev] = useState(pad);
  const [next, setNext] = useState(pad);

  useEffect(() => {
    if (pad !== prevRef.current) {
      setPrev(prevRef.current);
      setNext(pad);
      setFlipping(true);
      const t = setTimeout(() => {
        prevRef.current = pad;
        setFlipping(false);
      }, 520);
      return () => clearTimeout(t);
    }
  }, [pad]);

  const cardH = "clamp(64px, 10vw, 100px)";
  const cardW = "clamp(52px, 8vw, 84px)";
  const fs = "clamp(32px, 5.5vw, 58px)";

  const faceStyle = {
    width: cardW,
    height: cardH,
    background:
      "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(201,168,76,0.18)",
    borderRadius: "6px",
    fontSize: fs,
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    color: "#f5f0e8",
    letterSpacing: "-0.02em",
    backdropFilter: "blur(6px)",
  };

  return (
    <div className="ht-flip-card" style={{ width: cardW, height: cardH }}>
      {/* Static display — shown when not flipping */}
      {!flipping && (
        <div className="ht-face" style={faceStyle}>
          {pad}
        </div>
      )}

      {/* Flip animation layers */}
      {flipping && (
        <>
          {/* Top half — old number flips away */}
          <div
            className="ht-face ht-flip-top"
            style={{
              ...faceStyle,
              position: "absolute",
              inset: 0,
              transformOrigin: "bottom center",
            }}
          >
            {prev}
          </div>
          {/* Bottom half — new number flips in */}
          <div
            className="ht-face ht-flip-bot"
            style={{
              ...faceStyle,
              position: "absolute",
              inset: 0,
              transformOrigin: "top center",
              transform: "rotateX(90deg)",
            }}
          >
            {next}
          </div>
        </>
      )}

      {/* Divider line in the middle */}
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          top: "50%",
          height: "1px",
          background: "rgba(201,168,76,0.25)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Subtle screw dots */}
      <div
        style={{
          position: "absolute",
          left: 6,
          top: "50%",
          marginTop: -2,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "rgba(201,168,76,0.3)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 6,
          top: "50%",
          marginTop: -2,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "rgba(201,168,76,0.3)",
        }}
      />
    </div>
  );
}

// ─── Single countdown unit ────────────────────────────────────────────────────
function CountUnit({ value, label, highlight }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Pulse ring — only on seconds */}
        {highlight && (
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: 8,
              border: "1px solid rgba(201,168,76,0.3)",
              animation: "ht-pulse-ring 1.5s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}
        <FlipDigit value={value} />
      </div>
      <p
        style={{
          fontSize: "9px",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "rgba(201,168,76,0.55)",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
        }}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Separator dot ────────────────────────────────────────────────────────────
function Sep() {
  return (
    <div className="flex flex-col gap-1.5 pb-7">
      <div
        style={{
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "rgba(201,168,76,0.4)",
        }}
      />
      <div
        style={{
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "rgba(201,168,76,0.2)",
        }}
      />
    </div>
  );
}

// ─── Style injection ──────────────────────────────────────────────────────────
let injected = false;
function injectStyle() {
  if (injected) return;
  const s = document.createElement("style");
  s.textContent = FLIP_STYLE;
  document.head.appendChild(s);
  injected = true;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Hashtag = ({ isVisible }) => {
  useScrollReveal();
  const { settings } = useSettings();
  const animatedRef = useRef(false);
  const { canvasRef: petalCanvasRef, triggerBurst } = useRosePetals(isVisible);

  const groomNickname = settings?.groom_nickname || "Benjamin";
  const brideNickname = settings?.bride_nickname || "Angelin";
  const weddingDate = settings?.resepsi_date || "";
  const hashtag = settings?.hashtag || `#BengothisAngel`;

  const fmtDate = weddingDate
    ? weddingDate.split("-").reverse().join(" · ")
    : "31 · 05 · 2026";

  const timeLeft = useCountdown(weddingDate);

  useEffect(() => {
    injectStyle();
  }, []);

  // Entrance animation — fires once when invitation is opened
  useEffect(() => {
    if (!isVisible || animatedRef.current) return;
    animatedRef.current = true;

    const ids = [
      "ht-label",
      "ht-main-container",
      "ht-line-desktop",
      "ht-countdown",
      "ht-date",
      "ht-scroll",
    ];
    const delays = [0, 200, 500, 700, 1000, 1400];

    ids.forEach((id, i) => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      }, 80 + delays[i]);
    });

    // Spawn particles
    setTimeout(() => {
      const container = document.getElementById("hashtag-particles");
      if (!container) return;
      container.innerHTML = "";
      for (let i = 0; i < 22; i++) {
        setTimeout(() => {
          const p = document.createElement("div");
          const size = Math.random() * 3 + 1;
          p.style.cssText = `
            position:absolute; width:${size}px; height:${size}px;
            background:#C9A84C; border-radius:50%;
            left:${Math.random() * 100}%; bottom:-10px;
            opacity:${Math.random() * 0.35 + 0.1};
            animation: floatParticle ${Math.random() * 8 + 6}s ${Math.random() * 3}s ease-in infinite;
            pointer-events:none;
          `;
          container.appendChild(p);
        }, i * 110);
      }
    }, 400);
  }, [isVisible]);

  const transBase =
    "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)";

  return (
    <section
      id="section-hashtag"
      className="min-h-screen flex flex-col items-center justify-end pb-16 md:pb-24 bg-[#1a0408] relative overflow-hidden"
      onClick={(e) => triggerBurst(e.clientX, e.clientY)}
    >
      {/* ── Background layers ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-[#1a0408] via-[#2d0810] to-[#0d0204]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(10,2,4,0.85)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0d0204]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-[#0d0204] via-[#0d0204]/90 to-transparent" />
      </div>

      {/* ── Rose Petals Canvas ── */}
      <canvas
        ref={petalCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 2 }}
      />

      {/* ── Particles ── */}
      <div
        id="hashtag-particles"
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* ── Corner ornaments ── */}
      {[
        "top-8 left-8",
        "top-8 right-8 rotate-90",
        "bottom-8 left-8 -rotate-90",
        "bottom-8 right-8 rotate-180",
      ].map((cls, i) => (
        <svg
          key={i}
          className={`absolute z-30 text-gold w-14 h-14 pointer-events-none ${cls}`}
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M4 32 L4 4 L32 4" />
          <path d="M10 26 L10 10 L26 10" />
          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
        </svg>
      ))}

      {/* ── Content ── */}
      <div className="relative z-30 w-full flex flex-col items-center text-center px-6">
        {/* Label */}
        <p
          id="ht-label"
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            transition: transBase,
            fontSize: "15px",
            letterSpacing: "0.4em",
            color: "rgba(201,168,76,0.7)",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          Wedding Invitation
        </p>

        {/* Names Block — Responsive Layout */}
        <div
          id="ht-main-container"
          className="relative w-full flex flex-col items-center justify-center mb-10"
          style={{
            opacity: 0,
            transform: "translateY(40px)",
            transition: transBase,
          }}
        >
          {/* ── MOBILE VIEW: Stacked Names + Ghost & ── */}
          <div className="flex md:hidden flex-col items-center justify-center relative w-full mb-6">
            {/* Ghost "&" — Higher visibility on mobile */}
            <span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif italic text-[clamp(180px,50vw,300px)] text-gold/[0.12] pointer-events-none select-none z-0"
              style={{ lineHeight: 1 }}
            >
              &amp;
            </span>

            {/* Names */}
            <span
              className="font-script relative z-10 text-[clamp(64px,16vw,90px)] leading-[1.1] mb-2"
              style={{
                color: "#f5f0e8",
                textShadow: "0 4px 60px rgba(201,168,76,0.2)",
              }}
            >
              {groomNickname}
            </span>
            <span
              className="font-script relative z-10 text-[clamp(64px,16vw,90px)] leading-[1.1]"
              style={{
                color: "#f5f0e8",
                textShadow: "0 4px 60px rgba(201,168,76,0.2)",
              }}
            >
              {brideNickname}
            </span>
          </div>

          {/* ── DESKTOP VIEW: Horizontal Names + Original Divider ── */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <h1
              className="font-script leading-none mb-10"
              style={{
                fontSize: "clamp(80px, 8vw, 120px)",
                color: "#f5f0e8",
                textShadow: "0 4px 60px rgba(201,168,76,0.2)",
              }}
            >
              {groomNickname} &amp; {brideNickname}
            </h1>

            {/* Original Divider Line (Desktop Only) */}
            <div id="ht-line-desktop" className="mb-10">
              <svg width="240" height="8" viewBox="0 0 240 8" fill="none">
                <line
                  x1="0"
                  y1="4"
                  x2="108"
                  y2="4"
                  stroke="#C9A84C"
                  strokeWidth="0.8"
                />
                <circle cx="120" cy="4" r="3" fill="#C9A84C" />
                <line
                  x1="132"
                  y1="4"
                  x2="240"
                  y2="4"
                  stroke="#C9A84C"
                  strokeWidth="0.8"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ── COUNTDOWN ── */}
        <div
          id="ht-countdown"
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            transition: transBase,
            marginBottom: "2rem",
          }}
        >
          {!timeLeft ? (
            /* Loading skeleton */
            <div className="flex items-end gap-4 md:gap-6">
              {["--", "--", "--", "--"].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "clamp(52px,8vw,84px)",
                    height: "clamp(64px,10vw,100px)",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,168,76,0.1)",
                  }}
                />
              ))}
            </div>
          ) : timeLeft.passed ? (
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(18px,3vw,28px)",
                color: "rgba(201,168,76,0.8)",
                letterSpacing: "0.05em",
              }}
            >
              🎉 The day has come
            </p>
          ) : (
            <>
              {/* Countdown row */}
              <div className="flex items-end gap-3 md:gap-5 justify-center">
                <CountUnit value={timeLeft.days} label="Days" />
                <Sep />
                <CountUnit value={timeLeft.hours} label="Hours" />
                <Sep />
                <CountUnit value={timeLeft.minutes} label="Minutes" />
                <Sep />
                <CountUnit value={timeLeft.seconds} label="Seconds" highlight />
              </div>

              {/* Total days label */}
              {/* <p
                style={{
                  marginTop: "1.25rem",
                  fontSize: "10px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)",
                  fontFamily: "Georgia, serif",
                }}
              >
                {timeLeft.days > 0
                  ? `${timeLeft.days} day${timeLeft.days !== 1 ? "s" : ""} to go`
                  : "today is the day"}
              </p> */}
            </>
          )}
        </div>

        {/* Hashtag + date */}
        <p
          id="ht-date"
          style={{
            opacity: 0,
            transform: "translateY(10px)",
            transition: transBase,
            fontSize: "11px",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "Georgia, serif",
            marginBottom: "3rem",
          }}
        >
          {hashtag} &nbsp;&middot;&nbsp; {fmtDate}
        </p>

        {/* Scroll hint */}
        <div
          id="ht-scroll"
          style={{ opacity: 0, transition: "opacity 1s ease" }}
          className="flex flex-col items-center gap-3"
        >
          <p
            style={{
              fontSize: "9px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.4)",
              fontFamily: "Georgia, serif",
            }}
          >
            Scroll to explore
          </p>
          <svg width="1" height="40" viewBox="0 0 1 40">
            <line
              x1="0.5"
              y1="0"
              x2="0.5"
              y2="40"
              stroke="#C9A84C"
              strokeWidth="0.8"
              strokeDasharray="40"
              strokeDashoffset="40"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="40;0;40"
                dur="2s"
                begin="2s"
                repeatCount="indefinite"
              />
            </line>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hashtag;
