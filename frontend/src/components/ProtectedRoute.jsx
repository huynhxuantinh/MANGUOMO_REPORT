import { Navigate, useLocation } from "react-router-dom";

import useAuthStore from "../store/authStore";

function ProtectedRoute({ children, requireStaff = false }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireStaff && !user?.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
