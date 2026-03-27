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
  AdminGifts,
  AdminWishes,
  AdminSettings,
  AdminGuestGroups
} from './pages/admin';

const AdminIndexRedirect = () => {
  const user = authService.getAdminUser();
  return <Navigate to={user?.role === 'parents' ? 'guests' : 'dashboard'} replace />;
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
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="guests"
            element={
              <ProtectedRoute allowedRoles={['admin', 'parents']}>
                <AdminGuests />
              </ProtectedRoute>
            }
          />
          <Route
            path="rsvp"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRSVP />
              </ProtectedRoute>
            }
          />
          <Route
            path="gallery"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminGallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="guest-groups"
            element={
              <ProtectedRoute allowedRoles={['admin', 'parents']}>
                <AdminGuestGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="gifts"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminGifts />
              </ProtectedRoute>
            }
          />
          <Route
            path="wishes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminWishes />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
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