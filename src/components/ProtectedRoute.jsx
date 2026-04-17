import { Navigate, useLocation } from 'react-router-dom';
import * as authService from '../services/authService';
import usePermissions from '../hooks/admin/usePermissions';

const ProtectedRoute = ({ children, resource }) => {
  const isAuth = authService.isAuthenticated();
  const location = useLocation();
  const { can, loading } = usePermissions();

  if (!isAuth) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Saat permissions masih loading, render children dulu
  // Backend tetap enforce akses — ini hanya untuk UX agar tidak flicker
  if (loading) return children;

  // Jika route punya resource requirement, cek permission
  if (resource && !can(resource)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
