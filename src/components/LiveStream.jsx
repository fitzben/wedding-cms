import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Icon } from "@iconify/react";

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes ls-pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(2);   opacity: 0; }
  }
  @keyframes ls-live-dot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  @keyframes ls-scan {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes ls-grain {
    0%, 100% { transform: translate(0, 0); }
    20%  { transform: translate(-1%, -1%); }
    40%  { transform: translate(1%, 0%); }
    60%  { transform: translate(-1%, 1%); }
    80%  { transform: translate(0%, -1%); }
  }
  @keyframes ls-countdown-in {
    from { opacity: 0; transform: scale(0.92) translateY(12px); filter: blur(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
  }

  .ls-grain-layer {
    position: absolute; inset: 0; pointer-events: none; z-index: 1; overflow: hidden;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-size: 180px; opacity: 0.04;
    animation: ls-grain 0.4s steps(1) infinite;
  }
  .ls-scan-line {
    position: absolute; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.08) 30%, rgba(201,168,76,0.15) 50%, rgba(201,168,76,0.08) 70%, transparent 100%);
    animation: ls-scan 8s linear infinite; z-index: 2; pointer-events: none;
  }
  .ls-live-dot { animation: ls-live-dot 1.2s ease-in-out infinite; }
  .ls-pulse { animation: ls-pulse-ring 2s ease-out infinite; }
  .ls-pulse-2 { animation: ls-pulse-ring 2s ease-out 0.7s infinite; }
  .ls-countdown-unit { animation: ls-countdown-in 0.8s cubic-bezier(0.16,1,0.3,1) both; }
`;

let injected = false;
function inject() {
  if (injected) return;
  const s = document.createElement("style");
  s.textContent = STYLES;
  document.head.appendChild(s);
  injected = true;
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  upcoming: {
    label: "Upcoming",
    dot: "bg-gold",
    text: "text-gold",
    border: "border-gold/20",
    bg: "bg-gold/5",
    pulse: false,
  },
  live: {
    label: "Live Now",
    dot: "bg-red-500",
    text: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/8",
    pulse: true,
  },
  replay: {
    label: "Replay",
    dot: "bg-white/30",
    text: "text-white/30",
    border: "border-white/10",
    bg: "bg-white/5",
    pulse: false,
  },
};

// ─── Countdown to stream ──────────────────────────────────────────────────────
function useStreamCountdown(startStr) {
  const calc = () => {
    if (!startStr) return null;
    const diff = new Date(startStr).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    if (!startStr) return;
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [startStr]);
  return t;
}

// ─── Countdown display ────────────────────────────────────────────────────────
function CountdownUnit({ value, label, delay }) {
  const pad = String(value).padStart(2, "0");
  return (
    <div
      className="ls-countdown-unit flex flex-col items-center gap-2"
      style={{ animationDelay: delay }}
    >
      <div
        style={{
          width: "clamp(54px, 9vw, 78px)",
          height: "clamp(60px, 10vw, 86px)",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        {/* Mid line */}
        <div
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            top: "50%",
            height: 1,
            background: "rgba(201,168,76,0.15)",
          }}
        />
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(26px, 4.5vw, 42px)",
            color: "#f5f0e8",
            letterSpacing: "-0.02em",
          }}
        >
          {pad}
        </span>
      </div>
      <p
        style={{
          fontSize: 9,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(201,168,76,0.45)",
          fontFamily: "Georgia, serif",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function Sep() {
  return (
    <div className="flex flex-col gap-1 pb-7">
      <div
        style={{
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "rgba(201,168,76,0.35)",
        }}
      />
      <div
        style={{
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "rgba(201,168,76,0.15)",
        }}
      />
    </div>
  );
}

// ─── YouTube embed URL builder ────────────────────────────────────────────────
function getYtId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/live\/)([^?&/]+)/);
  return m ? m[1] : null;
}

// ─── Format datetime ──────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return "";
  try {
    return (
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(str)) + " WIB"
    );
  } catch {
    return str;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const LiveStream = ({ settings }) => {
  const {
    stream_url,
    stream_label,
    stream_start,
    stream_end,
    stream_embed_enabled,
  } = settings || {};

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const countdown = useStreamCountdown(stream_start);

  const [status, setStatus] = useState("upcoming");

  useEffect(() => {
    inject();
  }, []);

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const start = stream_start ? new Date(stream_start).getTime() : null;
      const end = stream_end ? new Date(stream_end).getTime() : null;
      if (!start) setStatus("upcoming");
      else if (now < start) setStatus("upcoming");
      else if (end && now > end) setStatus("replay");
      else setStatus("live");
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [stream_start, stream_end]);

  if (!stream_url) return null;

  const ytId = getYtId(stream_url);
  const embedUrl = ytId
    ? `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`
    : null;
  const showEmbed =
    (stream_embed_enabled === true || stream_embed_enabled === "true") &&
    embedUrl;
  const cfg = STATUS[status] || STATUS.upcoming;

  // Animation variants
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };
  const item = {
    hidden: { opacity: 0, y: 36, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="section-livestream"
      className="relative overflow-hidden py-28 md:py-40"
      style={{ background: "#0c0a08" }}
    >
      {/* ── Background layers ── */}
      <div className="ls-grain-layer" />
      <div className="ls-scan-line" />

      {/* Radial glow center */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(61,5,16,0.5) 0%, transparent 70%)",
        }}
      />
      {/* Gold accent orb top-right */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "rgba(201,168,76,0.04)",
          filter: "blur(100px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Corner ornaments ── */}
      {[
        { cls: "top-6 left-6", rotate: "" },
        { cls: "top-6 right-6", rotate: "rotate-90" },
        { cls: "bottom-6 left-6", rotate: "-rotate-90" },
        { cls: "bottom-6 right-6", rotate: "rotate-180" },
      ].map(({ cls, rotate }, i) => (
        <svg
          key={i}
          className={`absolute ${cls} ${rotate} w-10 h-10 pointer-events-none z-10`}
          viewBox="0 0 40 40"
          fill="none"
          stroke="rgba(201,168,76,0.25)"
          strokeWidth="0.8"
        >
          <path d="M2 20 L2 2 L20 2" />
          <path d="M6 16 L6 6 L16 6" />
        </svg>
      ))}

      {/* ── Content ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative z-10 max-w-4xl mx-auto px-6"
      >
        {/* Status badge */}
        <motion.div variants={item} className="flex justify-center mb-10">
          <div
            className={`relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-sm ${cfg.bg} ${cfg.border}`}
          >
            {cfg.pulse && (
              <>
                <div
                  className={`ls-pulse absolute inset-0 rounded-full border ${cfg.border}`}
                />
                <div
                  className={`ls-pulse-2 absolute inset-0 rounded-full border ${cfg.border}`}
                />
              </>
            )}
            <span className="relative flex items-center gap-2">
              <span
                className={`${cfg.dot} ${cfg.pulse ? "ls-live-dot" : ""} w-1.5 h-1.5 rounded-full inline-block`}
              />
              <span
                className={`${cfg.text} text-[9px] font-black uppercase tracking-[0.35em]`}
              >
                {cfg.label}
              </span>
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          variants={item}
          className="font-serif text-center leading-none tracking-tight mb-6"
          style={{
            fontSize: "clamp(44px, 7vw, 96px)",
            color: "#f5f0e8",
            fontStyle: "italic",
            textShadow: "0 4px 60px rgba(201,168,76,0.15)",
          }}
        >
          {stream_label || "Live Streaming"}
        </motion.h2>

        {/* Gold divider */}
        <motion.div
          variants={item}
          className="flex items-center justify-center gap-5 mb-14"
        >
          <div
            style={{
              flex: 1,
              maxWidth: 80,
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(201,168,76,0.4))",
            }}
          />
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z"
              fill="rgba(201,168,76,0.5)"
            />
          </svg>
          <div
            style={{
              flex: 1,
              maxWidth: 80,
              height: 1,
              background:
                "linear-gradient(to left, transparent, rgba(201,168,76,0.4))",
            }}
          />
        </motion.div>

        {/* ── Countdown (only when upcoming) ── */}
        {/* {status === "upcoming" && countdown && (
          <motion.div variants={item} className="mb-14">
            <p
              style={{
                textAlign: "center",
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.2)",
                marginBottom: "1.25rem",
                fontFamily: "Georgia, serif",
              }}
            >
              Dimulai dalam
            </p>
            <div className="flex items-end justify-center gap-3 md:gap-5">
              <CountdownUnit value={countdown.days} label="Hari" delay="0s" />
              <Sep />
              <CountdownUnit
                value={countdown.hours}
                label="Jam"
                delay="0.08s"
              />
              <Sep />
              <CountdownUnit
                value={countdown.minutes}
                label="Menit"
                delay="0.16s"
              />
              <Sep />
              <CountdownUnit
                value={countdown.seconds}
                label="Detik"
                delay="0.24s"
              />
            </div>
          </motion.div>
        )} */}

        {/* ── Date info ── */}
        {stream_start && (
          <motion.div variants={item} className="flex justify-center mb-14">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 24px",
                borderRadius: 999,
                background: "rgba(201,168,76,0.06)",
                border: "1px solid rgba(201,168,76,0.15)",
              }}
            >
              <Icon
                icon="solar:calendar-date-bold-duotone"
                style={{ color: "rgba(201,168,76,0.7)", fontSize: 16 }}
              />
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                }}
              >
                {fmtDate(stream_start)}
              </span>
            </div>
          </motion.div>
        )}

        {/* ── Player / CTA ── */}
        <motion.div variants={item}>
          {showEmbed ? (
            /* ── Embed player — cinematic frame ── */
            <div style={{ position: "relative" }}>
              {/* Outer glow */}
              <div
                style={{
                  position: "absolute",
                  inset: -2,
                  background:
                    "linear-gradient(135deg, rgba(201,168,76,0.3), rgba(61,5,16,0.5), rgba(201,168,76,0.15))",
                  borderRadius: 20,
                  filter: "blur(1px)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  background: "#0c0a08",
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid rgba(201,168,76,0.1)",
                  boxShadow: "0 40px 120px -20px rgba(0,0,0,0.8)",
                }}
              >
                {/* Film strip top */}
                <div
                  style={{
                    height: 28,
                    background: "rgba(0,0,0,0.6)",
                    borderBottom: "1px solid rgba(201,168,76,0.08)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 12px",
                    gap: 8,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background:
                          i === 0
                            ? "rgba(255,100,80,0.7)"
                            : i === 1
                              ? "rgba(255,200,60,0.7)"
                              : "rgba(80,200,80,0.7)",
                      }}
                    />
                  ))}
                  <div style={{ flex: 1 }} />
                  <span
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.2)",
                      letterSpacing: "0.2em",
                      fontFamily: "monospace",
                    }}
                  >
                    LIVE · {new Date().getFullYear()}
                  </span>
                </div>
                {/* Iframe */}
                <div className="aspect-video">
                  <iframe
                    src={embedUrl}
                    title={stream_label || "Wedding Live Stream"}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="w-full h-full"
                    frameBorder="0"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ── Direct link CTA ── */
            <div className="flex flex-col items-center gap-10">
              {/* Animated play icon */}
              <div style={{ position: "relative", width: 100, height: 100 }}>
                <div className="ls-pulse absolute inset-0 rounded-full border border-gold/20" />
                <div className="ls-pulse-2 absolute inset-0 rounded-full border border-gold/10" />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "rgba(201,168,76,0.06)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Icon
                    icon="solar:play-bold"
                    style={{ fontSize: 36, color: "rgba(201,168,76,0.8)" }}
                  />
                </div>
              </div>

              {/* CTA button */}
              <motion.a
                href={stream_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 40px",
                  border: "1px solid rgba(201,168,76,0.35)",
                  borderRadius: 4,
                  color: "#f5f0e8",
                  fontSize: 11,
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  letterSpacing: "0.1em",
                  background: "rgba(201,168,76,0.06)",
                  backdropFilter: "blur(8px)",
                  textDecoration: "none",
                  transition: "background 0.3s ease, border-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(201,168,76,0.12)";
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(201,168,76,0.06)";
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)";
                }}
              >
                <Icon
                  icon="solar:play-bold"
                  style={{ color: "rgba(201,168,76,0.8)", fontSize: 14 }}
                />
                Saksikan Live Stream
              </motion.a>
            </div>
          )}
        </motion.div>

        {/* Footer note */}
        <motion.p
          variants={item}
          style={{
            textAlign: "center",
            marginTop: "4rem",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
          }}
        >
          Your presence in spirit is our greatest blessing
        </motion.p>
      </motion.div>
    </section>
  );
};

export default LiveStream;
