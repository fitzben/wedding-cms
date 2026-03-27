import LogoLoader from "../components/LogoLoader";
import { useEffect, useRef, useState } from "react";

// Floating particle
const Particle = ({ style }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

// 3D Geometric Mesh Canvas
const GeometricMesh = ({ mousePos }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Build 3D icosphere-like points on two nested shells
    const buildPoints = (count, radius) =>
      Array.from({ length: count }, (_, i) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        return {
          ox: radius * Math.sin(phi) * Math.cos(theta),
          oy: radius * Math.sin(phi) * Math.sin(theta),
          oz: radius * Math.cos(phi),
        };
      });

    const outer = buildPoints(80, 320);
    const inner = buildPoints(40, 180);
    const allPoints = [...outer, ...inner];

    // Edges: connect nearby points
    const edges = [];
    for (let i = 0; i < allPoints.length; i++) {
      for (let j = i + 1; j < allPoints.length; j++) {
        const a = allPoints[i],
          b = allPoints[j];
        const dist = Math.sqrt(
          (a.ox - b.ox) ** 2 + (a.oy - b.oy) ** 2 + (a.oz - b.oz) ** 2,
        );
        const threshold =
          i < outer.length && j < outer.length
            ? 135
            : i >= outer.length && j >= outer.length
              ? 120
              : 160;
        if (dist < threshold) edges.push([i, j]);
      }
    }

    const project = (x, y, z, fov = 700) => {
      const scale = fov / (fov + z);
      return {
        sx: x * scale + canvas.width / 2,
        sy: y * scale + canvas.height / 2,
        scale,
      };
    };

    const rotate = (p, rx, ry, rz) => {
      let { ox: x, oy: y, oz: z } = p;
      // X
      let y2 = y * Math.cos(rx) - z * Math.sin(rx);
      let z2 = y * Math.sin(rx) + z * Math.cos(rx);
      // Y
      let x3 = x * Math.cos(ry) + z2 * Math.sin(ry);
      let z3 = -x * Math.sin(ry) + z2 * Math.cos(ry);
      // Z
      let x4 = x3 * Math.cos(rz) - y2 * Math.sin(rz);
      let y4 = x3 * Math.sin(rz) + y2 * Math.cos(rz);
      return { x: x4, y: y4, z: z3 };
    };

    const draw = () => {
      timeRef.current += 0.004;
      const t = timeRef.current;

      // Base slow rotation + mouse tilt
      const rx = t * 0.3 + mousePos.current.y * 0.5;
      const ry = t * 0.5 + mousePos.current.x * 0.5;
      const rz = t * 0.1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Project all points
      const projected = allPoints.map((p) => {
        const r = rotate(p, rx, ry, rz);
        return { ...project(r.x, r.y, r.z), z: r.z };
      });

      // Draw edges
      edges.forEach(([ai, bi]) => {
        const a = projected[ai],
          b = projected[bi];
        const avgZ = (a.z + b.z) / 2;
        const depthFactor = (avgZ + 320) / 640; // 0..1
        const isOuter = ai < outer.length && bi < outer.length;
        const alpha = depthFactor * (isOuter ? 0.18 : 0.28);

        const grad = ctx.createLinearGradient(a.sx, a.sy, b.sx, b.sy);
        const goldAlpha = alpha * 0.9;
        const blueAlpha = alpha * 0.6;
        grad.addColorStop(0, `rgba(251,191,36,${goldAlpha})`);
        grad.addColorStop(0.5, `rgba(180,160,255,${blueAlpha})`);
        grad.addColorStop(1, `rgba(251,191,36,${goldAlpha})`);

        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = grad;
        ctx.lineWidth = depthFactor * (isOuter ? 0.7 : 0.9);
        ctx.stroke();
      });

      // Draw nodes
      projected.forEach((p, i) => {
        const isOuter = i < outer.length;
        const depthFactor = (p.z + 320) / 640;
        const r = depthFactor * (isOuter ? 1.8 : 2.4);
        const alpha = depthFactor * (isOuter ? 0.5 : 0.75);

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = isOuter
          ? `rgba(251,191,36,${alpha})`
          : `rgba(200,180,255,${alpha})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0.85,
      }}
    />
  );
};

const Maintenance = ({ settings }) => {
  const message =
    settings?.maintenance_message ||
    "We're carefully crafting every detail of our special day. The invitation will be ready very soon — please check back shortly.";

  const mousePosRef = useRef({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [revealed, setRevealed] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 1.5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 6 + Math.random() * 8,
      opacity: 0.12 + Math.random() * 0.25,
    })),
  );

  // Entrance reveal
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Parallax on mouse move
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
    mousePosRef.current = pos;
    setMousePos(pos);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .maintenance-root {
          position: fixed; inset: 0;
          background: #060608;
          color: #f5f0e8;
          font-family: 'Jost', sans-serif;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          cursor: default;
        }

        /* ── Noise texture overlay ── */
        .maintenance-root::before {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.035;
          pointer-events: none; z-index: 0;
        }

        /* ── Ambient blobs ── */
        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(100px); pointer-events: none; z-index: 0;
          transition: transform 1.2s cubic-bezier(0.16,1,0.3,1);
        }
        .blob-amber {
          width: 55vw; height: 55vw;
          top: -20%; left: -15%;
          background: radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%);
        }
        .blob-blue {
          width: 50vw; height: 50vw;
          bottom: -18%; right: -12%;
          background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
        }
        .blob-rose {
          width: 35vw; height: 35vw;
          top: 35%; left: 60%;
          background: radial-gradient(circle, rgba(244,114,182,0.07) 0%, transparent 70%);
        }

        /* ── Particle float ── */
        @keyframes floatUp {
          0%   { transform: translateY(0px) scale(1); opacity: var(--op); }
          50%  { transform: translateY(-28px) scale(1.1); opacity: calc(var(--op) * 1.4); }
          100% { transform: translateY(0px) scale(1); opacity: var(--op); }
        }
        .particle { animation: floatUp var(--dur) ease-in-out infinite; animation-delay: var(--delay); }

        /* ── Shimmer line ── */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-line {
          height: 1px; width: 120px; margin: 0 auto;
          background: linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.7) 50%, transparent 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        /* ── Status pill ── */
        @keyframes pingDot {
          0%    { transform: scale(1); opacity: 0.8; }
          70%   { transform: scale(2.2); opacity: 0; }
          100%  { transform: scale(1); opacity: 0; }
        }
        .ping { animation: pingDot 1.8s ease-out infinite; }

        /* ── Entrance animations ── */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reveal { opacity: 0; }
        .revealed .reveal-1 { animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.1s forwards; }
        .revealed .reveal-2 { animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.35s forwards; }
        .revealed .reveal-3 { animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.6s forwards; }
        .revealed .reveal-4 { animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.85s forwards; }
        .revealed .reveal-5 { animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 1.1s forwards; }

        /* ── Corner ornaments ── */
        .corner {
          position: absolute; width: 48px; height: 48px;
          opacity: 0.2; pointer-events: none;
        }
        .corner svg { width: 100%; height: 100%; }
        .corner-tl { top: 24px; left: 24px; }
        .corner-tr { top: 24px; right: 24px; transform: scaleX(-1); }
        .corner-bl { bottom: 24px; left: 24px; transform: scaleY(-1); }
        .corner-br { bottom: 24px; right: 24px; transform: scale(-1); }

        /* ── Hover lift on card ── */
        .inner-card {
          transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }

        /* ── Glow on logo hover ── */
        .logo-wrap:hover .logo-glow {
          opacity: 0.6 !important;
          transform: scale(1.3) translateY(4px);
        }
        .logo-glow {
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        /* ── Date tag ── */
        .date-ornament {
          display: inline-flex; align-items: center; gap: 10px;
          color: rgba(251,191,36,0.55);
          font-family: 'Jost', sans-serif;
          font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase;
        }
        .date-ornament::before,
        .date-ornament::after {
          content: ''; display: block;
          width: 24px; height: 1px;
          background: rgba(251,191,36,0.4);
        }

        /* ── Italic script accent ── */
        .script-accent {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 1.05rem;
          color: rgba(251,191,36,0.55);
          letter-spacing: 0.05em;
        }
      `}</style>

      <div
        className={`maintenance-root ${revealed ? "revealed" : ""}`}
        onMouseMove={handleMouseMove}
      >
        {/* 3D Interactive Geometric Mesh */}
        <GeometricMesh mousePos={mousePosRef} />
        {/* Ambient blobs — parallax */}
        <div
          className="blob blob-amber"
          style={{
            transform: `translate(${mousePos.x * -18}px, ${mousePos.y * -12}px)`,
          }}
        />
        <div
          className="blob blob-blue"
          style={{
            transform: `translate(${mousePos.x * 14}px, ${mousePos.y * 10}px)`,
          }}
        />
        <div
          className="blob blob-rose"
          style={{
            transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -16}px)`,
          }}
        />

        {/* Floating particles */}
        {particles.map((p) => (
          <Particle
            key={p.id}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background:
                p.id % 3 === 0
                  ? "rgba(251,191,36,0.6)"
                  : p.id % 3 === 1
                    ? "rgba(255,255,255,0.4)"
                    : "rgba(244,114,182,0.4)",
              "--op": p.opacity,
              "--dur": `${p.duration}s`,
              "--delay": `${p.delay}s`,
            }}
            className="particle"
          />
        ))}

        {/* Corner ornaments */}
        {["corner-tl", "corner-tr", "corner-bl", "corner-br"].map((cls) => (
          <div key={cls} className={`corner ${cls}`}>
            <svg
              viewBox="0 0 48 48"
              fill="none"
              stroke="rgba(251,191,36,0.8)"
              strokeWidth="1"
            >
              <path d="M2 46 L2 2 L46 2" />
              <path d="M2 14 L8 8 L14 2" />
              <circle
                cx="2"
                cy="2"
                r="2"
                fill="rgba(251,191,36,0.8)"
                stroke="none"
              />
            </svg>
          </div>
        ))}

        {/* ── Main content ── */}
        <div
          className="inner-card relative z-10 flex flex-col items-center text-center px-8"
          style={{
            transform: `perspective(800px) rotateX(${mousePos.y * -1.5}deg) rotateY(${mousePos.x * 1.5}deg)`,
            maxWidth: 560,
            width: "100%",
            gap: 0,
          }}
        >
          {/* Script top accent */}
          <div className="reveal reveal-1" style={{ marginBottom: 20 }}>
            <span className="script-accent">You are cordially invited</span>
          </div>

          {/* Logo */}
          <div
            className="reveal reveal-2 logo-wrap"
            style={{ marginBottom: 36, position: "relative" }}
          >
            <div
              className="logo-glow"
              style={{
                position: "absolute",
                inset: -8,
                background:
                  "radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)",
                borderRadius: "50%",
                opacity: 0.3,
              }}
            />
            <LogoLoader size="lg" />
          </div>

          {/* Headline */}
          <div className="reveal reveal-2" style={{ marginBottom: 20 }}>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.4rem, 6vw, 3.8rem)",
                fontWeight: 300,
                letterSpacing: "0.04em",
                lineHeight: 1.1,
                color: "#f5f0e8",
              }}
            >
              Under Maintenance
            </h1>
          </div>

          {/* Name band */}
          <div className="reveal reveal-3" style={{ marginBottom: 28 }}>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
                fontWeight: 300,
                color: "rgba(251,191,36,0.75)",
                letterSpacing: "0.06em",
              }}
            >
              Benjamin &amp; Angelin
            </p>
          </div>

          {/* Shimmer divider */}
          <div className="reveal reveal-3" style={{ marginBottom: 28 }}>
            <div className="shimmer-line" />
          </div>

          {/* Message */}
          <div
            className="reveal reveal-4"
            style={{ marginBottom: 36, maxWidth: 400 }}
          >
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 200,
                fontSize: "clamp(0.85rem, 2.2vw, 1rem)",
                color: "rgba(245,240,232,0.55)",
                lineHeight: 1.85,
                letterSpacing: "0.02em",
              }}
            >
              {message}
            </p>
          </div>

          {/* Status pill */}
          <div className="reveal reveal-4" style={{ marginBottom: 44 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 22px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(251,191,36,0.2)",
                borderRadius: 999,
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Animated dot */}
              <span
                style={{
                  position: "relative",
                  width: 10,
                  height: 10,
                  display: "flex",
                }}
              >
                <span
                  className="ping"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "rgba(251,191,36,0.5)",
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#fbbf24",
                    display: "block",
                  }}
                />
              </span>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "rgba(245,240,232,0.7)",
                  fontWeight: 400,
                }}
              >
                Site Update in Progress
              </span>
            </div>
          </div>

          {/* Date ornament footer */}
          <div className="reveal reveal-5">
            <div className="date-ornament">Wedding Invitation</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Maintenance;
