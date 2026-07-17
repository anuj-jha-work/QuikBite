import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const ProtectedRoute = () => {
  const { user, loading } = useContext(StoreContext);
  const location = useLocation();

  if (loading) {
    return <div className="container page-state">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
