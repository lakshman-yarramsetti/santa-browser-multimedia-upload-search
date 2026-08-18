import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute() {
  const { user, initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return (
      <p className="page-message">
        Checking your session…
      </p>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}