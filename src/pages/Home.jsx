import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Hero from "../components/Hero";
import Hashtag from "../components/Hashtag";
import { BatakDivider, ManadoDivider } from "../components/Dividers";
import CoupleIntro from "../components/CoupleIntro";
import Journey from "../components/Journey";
import EventDetails from "../components/EventDetails";
import Gallery from "../components/Gallery";
import RSVP from "../components/RSVP";
import GiftRegistry from "../components/GiftRegistry";
import Footer from "../components/Footer";
import MusicPlayer from "../components/MusicPlayer";
import CustomCursor from "../components/CustomCursor";
import LoadingScreen from "../components/LoadingScreen";
import LogoLoader from "../components/LogoLoader";
import useGuest from "../hooks/useGuest";
import useSettings from "../hooks/useSettings";
import useAudioControl from "../hooks/useAudioControl";

const Home = () => {
  const { guestSlug } = useParams();
  const { guest, loading } = useGuest(guestSlug);
  const { settings, loading: settingsLoading } = useSettings();
  const audioRef = useAudioControl();
  const [invitationOpened, setInvitationOpened] = useState(false);
  const [transitionRendered, setTransitionRendered] = useState(false);
  const [transitionVisible, setTransitionVisible] = useState(false);
  const guestName = guest?.display_name || "Guest Name";

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

  return (
    <div className="bg-offwhite text-charcoal font-sans antialiased selection:bg-maroon selection:text-offwhite relative overflow-x-hidden min-h-screen">
      <audio
        ref={audioRef}
        src="https://res.cloudinary.com/dpsaoeync/video/upload/v1773335681/Unplanned_Melody_rfgslq.mp3"
        loop
      />
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
              audioRef.current
                .play()
                .catch((err) => console.warn("Audio play failed:", err));
            }
          }}
        />

        {/* The rest of the content - wrapped in main */}
        <main id="main-content">
          <Hashtag isVisible={invitationOpened} />

          <BatakDivider className="bg-ivory py-8" />

          <CoupleIntro />
          <Journey />

          <BatakDivider className="bg-offwhite z-20 py-8 relative" />

          <EventDetails eventAccess={eventAccess} settings={settings} />

          <ManadoDivider className="bg-offwhite pt-[100px]" />

          <Gallery />
          {isRsvpEnabled && (
            <RSVP 
              guest={guest}
              guestName={guestName} 
              maxPax={guest?.pax_allowed || 2} 
            />
          )}

          <ManadoDivider className="bg-ivory pt-[100px]" />

          {isGiftEnabled && <GiftRegistry />}
          <Footer />
        </main>

        {/* Persistent Floating Music Player */}
        <MusicPlayer isVisible={invitationOpened} audioRef={audioRef} />
      </div>
    </div>
  );
};

export default Home;
