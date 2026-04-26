import { useState, useEffect, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import Hero from "../components/Hero";
import Hashtag from "../components/Hashtag";
import { BatakDivider, ManadoDivider } from "../components/Dividers";
import useGuest from "../hooks/useGuest";
import useSettings from "../hooks/useSettings";
import useAudioControl from "../hooks/useAudioControl";
import CustomCursor from "../components/CustomCursor";
import LoadingScreen from "../components/LoadingScreen";
import LogoLoader from "../components/LogoLoader";

// Lazy load sections below the fold
const CoupleIntro = lazy(() => import("../components/CoupleIntro"));
const Journey = lazy(() => import("../components/Journey"));
const EventDetails = lazy(() => import("../components/EventDetails"));
const LiveStream = lazy(() => import("../components/LiveStream"));
const DressCode = lazy(() => import("../components/DressCode"));
const Gallery = lazy(() => import("../components/Gallery"));
const RSVP = lazy(() => import("../components/RSVP"));
const GiftRegistry = lazy(() => import("../components/GiftRegistry"));
const Footer = lazy(() => import("../components/Footer"));
const MusicPlayer = lazy(() => import("../components/MusicPlayer"));

// Placeholder for lazy-loaded sections
const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center opacity-30">
    <LogoLoader size={48} />
  </div>
);

const Home = () => {
  const { guestSlug } = useParams();
  const { guest, loading, notFound } = useGuest(guestSlug);
  const { settings, loading: settingsLoading } = useSettings();
  const audioRef = useAudioControl();
  const [invitationOpened, setInvitationOpened] = useState(false);
  const [transitionRendered, setTransitionRendered] = useState(false);
  const [transitionVisible, setTransitionVisible] = useState(false);
  const [audioSource, setAudioSource] = useState("");
  const guestName = guest?.enable_display_name
    ? guest.display_name
    : guest
      ? `${guest.first_name} ${guest.last_name}`.trim()
      : "Guest Name";

  // Toggle flags (default true for safety if settings not loaded yet)
  const isRsvpEnabled = settings?.rsvp_enabled !== false;
  const isGiftEnabled = settings?.gift_enabled !== false;
  const eventAccess = guest?.resolved_event_access;

  useEffect(() => {
    // Prevent browser scroll restoration
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    // Force scroll to top on mount
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    // Lock scroll initially until invitation is opened
    if (!invitationOpened) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";
      // Ensure we stay at the top while locked, just in case
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "auto";
      document.body.style.height = "";
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [invitationOpened]);

  // Handle Security: Not Found / Not Invited
  if (!loading && !settingsLoading && notFound) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Aesthetic Background Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-maroon/5 rounded-full blur-[120px] animate-pulse-slow" />

        <div className="max-w-md relative z-10 space-y-8 fade-in show">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border border-maroon/20 flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-maroon/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                <path d="M12 8V12" />
                <path d="M12 16H12.01" />
              </svg>
            </div>
            <h1 className="font-serif text-4xl text-maroon italic">
              Invitation Not Found
            </h1>
            <div className="w-12 h-px bg-gold my-6" />
            <p className="text-charcoal/60 font-light leading-relaxed">
              We couldn't find an invitation matching this link. Please ensure
              the URL is correct or contact the couple for assistance.
            </p>
          </div>

          <a
            href="/"
            className="inline-block px-8 py-3 bg-maroon text-ivory rounded-full text-sm font-medium tracking-widest hover:bg-maroon/90 transition-all shadow-lg shadow-maroon/20"
          >
            RETURN HOME
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-offwhite text-charcoal font-sans antialiased selection:bg-maroon selection:text-offwhite relative overflow-x-hidden min-h-screen">
      <audio ref={audioRef} src={audioSource} loop />
      <LoadingScreen isLoading={loading || settingsLoading} />

      {/* Inter-Section Transition Overlay */}
      {transitionRendered && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-offwhite transition-opacity duration-700 pointer-events-none ${
            transitionVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="animate-pulse">
            <LogoLoader
              text="Entering moments..."
              size={72}
              textClassName="text-maroon/50 font-serif italic text-lg tracking-widest mt-6"
            />
          </div>
        </div>
      )}

      <CustomCursor />

      <div className={`fade-in ${!loading ? "show" : ""}`}>
        {/* Global Film Grain */}
        <div className="fixed inset-0 z-50 film-grain pointer-events-none"></div>

        {/* Hero Entrance */}
        <Hero
          guestName={guestName}
          onOpenInvitation={() => {
            // Stage 1: Mount overlay and wait a tick
            setTransitionRendered(true);
            setTimeout(() => {
              // Stage 2: Fade in the overlay
              setTransitionVisible(true);

              // Stage 3: After fade-in (600ms), start the section switch behind the overlay
              setTimeout(() => {
                setInvitationOpened(true);

                // Stage 4: Maintain overlay for 1.2s to process layout/images
                setTimeout(() => {
                  setTransitionVisible(false); // fade out

                  // Stage 5: Unmount overlay after fade completes (700ms)
                  setTimeout(() => setTransitionRendered(false), 700);
                }, 1200);
              }, 600);
            }, 20);

            if (audioRef.current) {
              // Set audio source only when opening invitation
              if (!audioSource) {
                setAudioSource(
                  "https://res.cloudinary.com/dpsaoeync/video/upload/v1773335681/Unplanned_Melody_rfgslq.mp3",
                );
              }

              // Use a slight delay to ensure source is set before playing
              setTimeout(() => {
                audioRef.current
                  .play()
                  .catch((err) => console.warn("Audio play failed:", err));
              }, 100);
            }
          }}
        />

        {/* The rest of the content - wrapped in main */}
        <main id="main-content">
          <Hashtag isVisible={invitationOpened} />

          <BatakDivider className="bg-ivory py-8" />

          <Suspense fallback={<SectionLoader />}>
            <CoupleIntro />
            <Journey />
          </Suspense>

          <BatakDivider className="bg-offwhite z-20 py-8 relative" />

          <Suspense fallback={<SectionLoader />}>
            <EventDetails eventAccess={eventAccess} settings={settings} />
            <LiveStream settings={settings} />
            <DressCode settings={settings} />
          </Suspense>

          <ManadoDivider className="bg-offwhite pt-[100px]" />

          <Suspense fallback={<SectionLoader />}>
            <Gallery />
            {isRsvpEnabled && (
              <RSVP
                guest={guest}
                guestName={guestName}
                maxPax={guest?.pax_allowed || 2}
                eventAccess={eventAccess}
              />
            )}
          </Suspense>

          <ManadoDivider className="bg-ivory pt-[100px]" />

          <Suspense fallback={<SectionLoader />}>
            {isGiftEnabled && <GiftRegistry />}
            <Footer />
          </Suspense>
        </main>

        {/* Persistent Floating Music Player */}
        <Suspense fallback={null}>
          <MusicPlayer isVisible={invitationOpened} audioRef={audioRef} />
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
