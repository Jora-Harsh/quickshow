// src/components/admin/ProtectedAdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedAdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // or loader

  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />; // block non-admin
  }

  return <Outlet />; // render nested admin pages
};

export default ProtectedAdminRoute;
