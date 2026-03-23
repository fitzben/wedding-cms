import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Hero from '../components/Hero';
import Hashtag from '../components/Hashtag';
import { BatakDivider, ManadoDivider } from '../components/Dividers';
import CoupleIntro from '../components/CoupleIntro';
import Journey from '../components/Journey';
import EventDetails from '../components/EventDetails';
import Gallery from '../components/Gallery';
import RSVP from '../components/RSVP';
import GiftRegistry from '../components/GiftRegistry';
import Footer from '../components/Footer';
import MusicPlayer from '../components/MusicPlayer';
import CustomCursor from '../components/CustomCursor';
import LoadingScreen from '../components/LoadingScreen';
import useGuest from '../hooks/useGuest';
import useSettings from '../hooks/useSettings';
import useAudioControl from '../hooks/useAudioControl';

const Home = () => {
  const { guestSlug } = useParams();
  const { guest, loading } = useGuest(guestSlug);
  const { settings } = useSettings();
  const audioRef = useAudioControl();
  const [invitationOpened, setInvitationOpened] = useState(false);
  const guestName = guest?.display_name || 'Guest Name';
  console.log({ guest })

  // Toggle flags (default true for safety if settings not loaded yet)
  const isRsvpEnabled = settings?.rsvp_enabled !== false;
  const isGiftEnabled = settings?.gift_enabled !== false;
  const eventAccess = guest?.resolved_event_access

  useEffect(() => {
    // Prevent browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // Force scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    // Lock scroll initially until invitation is opened
    if (!invitationOpened) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
      // Ensure we stay at the top while locked, just in case
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = 'auto';
      document.body.style.height = '';
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [invitationOpened]);

  return (
    <div className="bg-offwhite text-charcoal font-sans antialiased selection:bg-maroon selection:text-offwhite relative overflow-x-hidden min-h-screen">
      <audio
        ref={audioRef}
        src="https://res.cloudinary.com/dpsaoeync/video/upload/v1773335681/Unplanned_Melody_rfgslq.mp3"
        loop
      />
      <LoadingScreen isLoading={loading} />
      <CustomCursor />

      <div className={`fade-in ${!loading ? 'show' : ''}`}>
        {/* Global Film Grain */}
        <div className="fixed inset-0 z-50 film-grain pointer-events-none"></div>

        {/* Hero Entrance */}
        <Hero
          guestName={guestName}
          onOpenInvitation={() => {
            setInvitationOpened(true);
            if (audioRef.current) {
              audioRef.current.play().catch((err) =>
                console.warn('Audio play failed:', err)
              );
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

          <EventDetails
            eventAccess={eventAccess}
            settings={settings}
          />

          <ManadoDivider className="bg-offwhite pt-[100px]" />

          <Gallery />
          {isRsvpEnabled && <RSVP />}

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