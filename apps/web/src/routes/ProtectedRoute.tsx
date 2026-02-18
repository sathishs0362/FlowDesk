import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { UserRole } from '../types/domain';
import { useAuth } from '../hooks/auth';

interface ProtectedRouteProps {
  roles?: UserRole[];
}

export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard/projects" replace />;
  }

  return <Outlet />;
};
