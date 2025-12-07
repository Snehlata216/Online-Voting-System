// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

/**
 * Drop-in ProtectedRoute update
 * - Keeps your existing route usage unchanged
 * - Supports role as: string, comma-separated string, or array
 * - If role is omitted, any authenticated user is allowed
 * - Preserves attempted location in state when redirecting to /login
 * - Redirects unauthorized users to home (change to /forbidden if you have a 403 page)
 */
export default function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Not authenticated -> redirect to login and preserve where they tried to go
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Normalize allowed roles into an array. Empty array means "no restriction".
  const allowedRoles = Array.isArray(role)
    ? role
    : typeof role === "string"
    ? role.split(",").map((r) => r.trim()).filter(Boolean)
    : [];

  // If roles specified and user's role is not included -> redirect to home (or 403)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Authorized — render children
  return <>{children}</>;
}
