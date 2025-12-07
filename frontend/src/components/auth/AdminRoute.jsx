// src/components/auth/AdminRoute.jsx
import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // adjust to your auth hook/context

export default function AdminRoute() {
  const { user, loading } = useAuth(); // implement useAuth to return user and loading

  if (loading) return <div>Loading…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  return <Outlet />; // renders nested admin routes
}
