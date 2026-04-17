import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Maintenance from './pages/Maintenance';
import useSettings from './hooks/useSettings';
import * as authService from './services/authService';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import {
  AdminLayout,
  AdminLogin,
  AdminDashboard,
  AdminGuests,
  AdminRSVP,
  AdminGallery,
  AdminOurJourney,
  AdminGifts,
  AdminWishes,
  AdminSettings,
  AdminGuestGroups
} from './pages/admin';

const AdminIndexRedirect = () => {
  const user = authService.getAdminUser();
  // admin & partner → dashboard, parents → guests
  const defaultPath = user?.role === 'parents' ? 'guests' : 'dashboard';
  return <Navigate to={defaultPath} replace />;
};

function App() {
  const { settings, loading } = useSettings();

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
            path="/"
            element={settings.maintenance_mode ? <Maintenance settings={settings} /> : <Landing />}
        />
        <Route
            path="/invite/:guestSlug"
            element={settings.maintenance_mode ? <Maintenance settings={settings} /> : <Home />}
        />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminIndexRedirect />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute resource="dashboard">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="guests"
            element={
              <ProtectedRoute resource="guests">
                <AdminGuests />
              </ProtectedRoute>
            }
          />
          <Route
            path="rsvp"
            element={
              <ProtectedRoute resource="rsvp">
                <AdminRSVP />
              </ProtectedRoute>
            }
          />
          <Route
            path="gallery"
            element={
              <ProtectedRoute resource="gallery">
                <AdminGallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="our-journey"
            element={
              <ProtectedRoute resource="journey">
                <AdminOurJourney />
              </ProtectedRoute>
            }
          />
          <Route
            path="guest-groups"
            element={
              <ProtectedRoute resource="groups">
                <AdminGuestGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="gifts"
            element={
              <ProtectedRoute resource="gifts">
                <AdminGifts />
              </ProtectedRoute>
            }
          />
          <Route
            path="wishes"
            element={
              <ProtectedRoute resource="wishes">
                <AdminWishes />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute resource="settings">
                <AdminSettings />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;