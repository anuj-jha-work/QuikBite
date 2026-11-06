import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useContext(AdminAuthContext);

  if (loading) {
    return <div className="admin-page-state">Loading admin panel...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
