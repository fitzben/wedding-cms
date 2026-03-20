import { Navigate, useLocation } from 'react-router-dom';
import * as authService from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuth = authService.isAuthenticated();
  const user = authService.getAdminUser();
  const location = useLocation();

  if (!isAuth) {
    // Redirect to login but save the current location to redirect back after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If user doesn't have the required role, redirect to a safe page
    // For parents, the only safe page is guests
    if (user?.role === 'parents') {
      return <Navigate to="/admin/guests" replace />;
    }
    // Default fallback
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
