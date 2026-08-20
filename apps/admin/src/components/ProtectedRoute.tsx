import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { admin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-gray-200 border-t-brand-dark rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;

  return <Outlet />;
}
