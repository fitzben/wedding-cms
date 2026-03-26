import { useState, useEffect, useCallback, useRef } from "react";
import Masonry from "react-masonry-css";
import { useScrollReveal } from "../hooks/useScrollReveal";
import {
  getGallerySections,
  getGalleryMedia,
} from "../services/galleryService";
import LogoLoader from "./LogoLoader";

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ items, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const current = items[index];

  const prev = useCallback(
    (e) => {
      e?.stopPropagation();
      setIndex((i) => (i - 1 + items.length) % items.length);
    },
    [items.length],
  );

  const next = useCallback(
    (e) => {
      e?.stopPropagation();
      setIndex((i) => (i + 1) % items.length);
    },
    [items.length],
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  // Touch swipe handlers
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      // Only trigger if horizontal swipe dominates
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx < 0) next();
        else prev();
      }
      touchStartX.current = null;
      touchStartY.current = null;
    },
    [prev, next],
  );

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(10,8,6,0.92)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button
        onClick={onClose}
        type="button"
        className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all"
        style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
        aria-label="Close"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Counter */}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 text-xs tracking-widest font-light"
        style={{
          color: "rgba(255,255,255,0.5)",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
        }}
      >
        {index + 1} / {items.length}
      </div>

      {/* Prev - hidden on mobile (use swipe instead) */}
      {items.length > 1 && (
        <button
          onClick={prev}
          type="button"
          className="absolute left-4 md:left-8 z-10 w-11 h-11 rounded-full items-center justify-center transition-all hover:scale-110 hidden md:flex"
          style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
          aria-label="Previous"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-5xl max-h-[85vh] w-full mx-4 md:mx-24"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "lightboxIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {current.media_type === "video" ? (
          <video
            key={current.id}
            src={current.public_url}
            controls
            autoPlay
            className="max-h-[80vh] max-w-full mx-auto rounded-xl shadow-2xl block"
            style={{ objectFit: "contain" }}
          />
        ) : (
          <img
            key={current.id}
            src={current.public_url}
            alt={current.caption || "Wedding moment"}
            className="max-h-[80vh] max-w-full mx-auto rounded-xl shadow-2xl block"
            style={{ objectFit: "contain" }}
          />
        )}

        {/* Caption */}
        {current.caption && (
          <p
            className="text-center mt-4 text-sm font-light tracking-wide"
            style={{
              color: "rgba(255,255,255,0.6)",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {current.caption}
          </p>
        )}
      </div>

      {/* Next - hidden on mobile (use swipe instead) */}
      {items.length > 1 && (
        <button
          onClick={next}
          type="button"
          className="absolute right-4 md:right-8 z-10 w-11 h-11 rounded-full items-center justify-center transition-all hover:scale-110 hidden md:flex"
          style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
          aria-label="Next"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Swipe hint - mobile only, fades out */}
      {items.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:hidden"
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "11px",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            letterSpacing: "0.05em",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          swipe to navigate
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      )}

      <style>{`
        @keyframes lightboxIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
const breakpointCols = {
  default: 3,
  1024: 3,
  768: 2,
  480: 2,
  0: 2,
};

const Gallery = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  // expandStep: 0 = initial (2 mobile / 3 desktop)
  //             1 = expanded (4 mobile / 6 desktop)
  const [expandStep, setExpandStep] = useState(0);

  // keep legacy alias so JSX refs below still work
  const hasExpandedOnce = expandStep >= 1;

  useScrollReveal([media, loading, expandStep, currentIndex]);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const sections = await getGallerySections();
        const gallerySection =
          sections.find((s) => s.key === "gallery") || sections[0];
        if (gallerySection) {
          const items = await getGalleryMedia(gallerySection.id);
          setMedia(items);
        }
      } catch (error) {
        console.error("Error loading gallery:", error);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  // Mobile: 2 → 4 → carousel; Desktop: 3 → 6 → carousel
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const initialItems = isMobile ? 2 : 3;
  const expandedItems = isMobile ? 4 : 6;

  // Calculate how many items to show based on expandStep
  const visibleMedia = [];
  const itemsToShow = expandStep === 0 ? initialItems : expandedItems;
  const canExpand = media.length > initialItems;
  const canCarousel = media.length > expandedItems;
  const showPagination =
    (expandStep === 0 && canExpand) ||
    (isMobile && expandStep >= 1 && canCarousel);

  if (media.length > 0) {
    const numItems = Math.min(itemsToShow, media.length);
    for (let i = 0; i < numItems; i++) {
      visibleMedia.push(media[(currentIndex + i) % media.length]);
    }
  }

  const restoreScrollY = (scrollY) => {
    // Keep the user within the gallery section on mobile.
    if (!isMobile || typeof window === "undefined") return;
    if (scrollY === null || scrollY === undefined) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "auto" });
    });
  };

  const rotateNextWithScroll = (scrollYToRestore) => {
    if (isAnimating || !canCarousel) return;
    setIsAnimating(true);
    restoreScrollY(scrollYToRestore);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + expandedItems) % media.length);
      setIsAnimating(false);
      restoreScrollY(scrollYToRestore);
    }, 300);
  };

  const rotatePrevWithScroll = (scrollYToRestore) => {
    if (isAnimating || !canCarousel) return;
    setIsAnimating(true);
    restoreScrollY(scrollYToRestore);
    setTimeout(() => {
      setCurrentIndex(
        (prev) => (prev - expandedItems + media.length) % media.length,
      );
      setIsAnimating(false);
      restoreScrollY(scrollYToRestore);
    }, 300);
  };

  const handleNext = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const scrollY = isMobile ? window.scrollY : null;

    // Step 0: expand initial grid to full set.
    if (expandStep === 0) {
      setExpandStep(1);
      restoreScrollY(scrollY);
      return;
    }

    // Step 1: rotate (mobile uses the bottom button to do this).
    rotateNextWithScroll(scrollY);
  };

  const handlePrev = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const scrollY = isMobile ? window.scrollY : null;

    // Step 1 only (mobile uses the bottom button to do this).
    rotatePrevWithScroll(scrollY);
  };

  return (
    <section id="section-gallery" className="pb-[100px] bg-offwhite relative">
      {/* Lightbox */}
      {lightbox.open && (
        <Lightbox
          items={media}
          initialIndex={lightbox.index}
          onClose={() => setLightbox({ open: false, index: 0 })}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Heading */}
        <div className="text-center mb-14 obs-hide obs-up flex justify-center">
          <h2 className="font-serif text-5xl tracking-tight text-maroon italic font-normal obs-hide obs-letter-spacing">
            Moments
          </h2>
        </div>

        {/* Gallery Wrapper */}
        <div
          className="relative transition-all duration-700 ease-in-out"
          style={{
            minHeight: hasExpandedOnce ? "var(--gallery-expanded-min-h, 645px)" : "0px",
            maxHeight: hasExpandedOnce
              ? "none"
              : "var(--gallery-initial-max-h, 420px)",
            overflow: hasExpandedOnce ? "visible" : "hidden",
          }}
        >
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <LogoLoader
                text="Loading moments..."
                size={64}
                textClassName="text-maroon/50 font-serif italic text-xl"
              />
            </div>
          ) : media.length > 0 ? (
            <div
              className={`transition-all duration-300 ease-in-out ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
            >
              <Masonry
                key={currentIndex}
                breakpointCols={breakpointCols}
                className="gallery-masonry-grid"
                columnClassName="gallery-masonry-column"
              >
                {visibleMedia.map((item, idx) => (
                  <div
                    key={`${item.id}-${currentIndex}`}
                    className={`gallery-item obs-scale ${expandStep === 0 ? "obs-hide" : "active"}`}
                    style={{ animationDelay: `${(idx % 9) * 60}ms` }}
                    onClick={() => {
                      // Find real index in media array for lightbox
                      const realIndex = media.findIndex(
                        (m) => m.id === item.id,
                      );
                      setLightbox({
                        open: true,
                        index: realIndex >= 0 ? realIndex : 0,
                      });
                    }}
                  >
                    {item.media_type === "video" ? (
                      <video
                        src={item.public_url}
                        muted
                        playsInline
                        className="gallery-media"
                      />
                    ) : (
                      <img
                        src={item.public_url}
                        alt={item.caption || "Wedding moment"}
                        className="gallery-media"
                        loading="lazy"
                      />
                    )}

                    {/* Hover overlay */}
                    <div className="gallery-overlay">
                      <div className="gallery-expand-icon">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        >
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      </div>
                      {item.caption && (
                        <p className="gallery-caption">{item.caption}</p>
                      )}
                    </div>
                  </div>
                ))}
              </Masonry>
            </div>
          ) : (
            <div className="py-20 text-center text-charcoal/40 font-light italic">
              Photos are being curated with love...
            </div>
          )}

          {/* Desktop carousel arrows (no "Previous/Next Moments" buttons). */}
          {!isMobile && canCarousel && expandStep >= 1 && (
            <>
              <button
                onClick={handlePrev}
                type="button"
                disabled={isAnimating}
                aria-label="Previous moments"
                className="absolute top-1/2 -translate-y-1/2 left-2 md:left-8 z-20 w-11 h-11 rounded-full flex items-center justify-center border border-maroon/20 bg-offwhite/70 backdrop-blur-sm text-maroon hover:border-maroon/40 transition-all disabled:opacity-50"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                type="button"
                disabled={isAnimating}
                aria-label="Next moments"
                className="absolute top-1/2 -translate-y-1/2 right-2 md:right-8 z-20 w-11 h-11 rounded-full flex items-center justify-center border border-maroon/20 bg-offwhite/70 backdrop-blur-sm text-maroon hover:border-maroon/40 transition-all disabled:opacity-50"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Gradient Fade Overlay - Always visible at bottom of fixed height container */}
          {media.length > itemsToShow && (
            <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-10 bg-gradient-to-t from-offwhite via-offwhite/80 to-transparent" />
          )}
        </div>

        {/* Pagination Buttons */}
        {showPagination && (
          <div className="flex justify-center items-center gap-4 mt-8 pb-12 obs-hide obs-up">
            {/* Desktop: only show the expansion CTA. Carousel is driven by arrows above. */}
            {expandStep === 0 && (
              <button
                onClick={handleNext}
                type="button"
                disabled={isAnimating || !canExpand}
                className="group relative px-10 py-4 border border-maroon/20 rounded-full overflow-hidden transition-all duration-500 hover:border-maroon/40 disabled:opacity-50 disabled:hidden"
              >
                <div className="absolute inset-0 bg-maroon opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" />
                <span className="relative z-10 font-serif italic text-maroon text-lg tracking-wide flex items-center gap-3">
                  View More Moments
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                  </svg>
                </span>
              </button>
            )}

            {/* Mobile: keep Next/Previous controls for the carousel rotation. */}
            {isMobile && expandStep >= 1 && canCarousel && (
              <>
                <button
                  onClick={handlePrev}
                  type="button"
                  disabled={isAnimating}
                  className="px-6 py-3 border border-maroon/20 rounded-full text-maroon font-serif italic hover:border-maroon/40 transition-all text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  type="button"
                  disabled={isAnimating || !canCarousel}
                  className="group relative px-10 py-4 border border-maroon/20 rounded-full overflow-hidden transition-all duration-500 hover:border-maroon/40 disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-maroon opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" />
                  <span className="relative z-10 font-serif italic text-maroon text-lg tracking-wide flex items-center gap-3">
                    Next Moments
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14m-6-6l6 6-6 6" />
                    </svg>
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        /* Responsive initial max-height (clips at 2 items mobile, 3 items desktop) */
        :root {
          --gallery-initial-max-h: 340px;
          --gallery-expanded-max-h: 1100px;
        }
        @media (min-width: 768px) {
          :root {
            --gallery-initial-max-h: 420px;
            --gallery-expanded-min-h: 700px;
          }
        }

        /* Masonry layout */
        .gallery-masonry-grid {
          display: flex;
          gap: 10px;
          width: 100%;
        }
        @media (min-width: 768px) {
          .gallery-masonry-grid { gap: 14px; }
        }
        .gallery-masonry-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        @media (min-width: 768px) {
          .gallery-masonry-column { gap: 14px; }
        }

        /* Gallery item */
        .gallery-item {
          position: relative;
          overflow: hidden;
          border-radius: 6px;
          cursor: pointer;
          break-inside: avoid;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);
        }

        /* Media (image/video) */
        .gallery-media {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.6s ease;
          filter: brightness(0.98);
        }
        .gallery-item:hover .gallery-media {
          transform: scale(1.06);
          filter: brightness(1.02);
        }

        /* Hover overlay */
        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(30,15,10,0.55) 0%, rgba(30,15,10,0) 50%);
          opacity: 0;
          transition: opacity 0.4s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 14px;
        }
        .gallery-item:hover .gallery-overlay {
          opacity: 1;
        }

        /* Expand icon */
        .gallery-expand-icon {
          align-self: flex-end;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transform: scale(0.7) rotate(-10deg);
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .gallery-item:hover .gallery-expand-icon {
          transform: scale(1) rotate(0deg);
        }

        /* Caption */
        .gallery-caption {
          font-family: Georgia, serif;
          font-style: italic;
          font-size: 12px;
          font-weight: 300;
          color: rgba(255,255,255,0.88);
          letter-spacing: 0.02em;
          line-height: 1.4;
          background: rgba(0,0,0,0.25);
          backdrop-filter: blur(4px);
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          align-self: flex-start;
        }
      `}</style>
    </section>
  );
};

export default Gallery;
