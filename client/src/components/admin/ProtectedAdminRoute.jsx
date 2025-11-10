// src/components/admin/ProtectedAdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const ProtectedAdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // optional loading screen

  // Redirect non-admins to home page
  if (!user || !user.isAdmin) return <Navigate to="/" replace />;

  return <Outlet />; // render nested admin routes
};

export default ProtectedAdminRoute;
