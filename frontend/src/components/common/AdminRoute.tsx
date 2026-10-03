import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppSelector } from '../../store/store';

export interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Guards the admin area: requires an authenticated user whose role is admin.
 * Signed out visitors are sent to login, signed in customers to their profile.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}

export default AdminRoute;