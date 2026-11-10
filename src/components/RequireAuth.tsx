import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminMaster } from "../utils/starterFreePlan";

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { user, loading, role, isSuperadmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isMaster = isAdminMaster(user.email);
  const effectiveRole = isMaster || isSuperadmin || role === 'superadmin' ? 'admin' : (role || 'client');

  if (allowedRoles && allowedRoles.length > 0) {
    // If the route allows 'admin', any admin or superadmin is granted full access
    const hasAdminAccess = allowedRoles.includes('admin') && (effectiveRole === 'admin' || isMaster || isSuperadmin);
    const hasDirectRole = allowedRoles.includes(effectiveRole) || allowedRoles.includes(role);

    if (!hasAdminAccess && !hasDirectRole) {
      const destination = effectiveRole === 'superadmin' ? '/admin' : `/${effectiveRole}`;
      return <Navigate to={destination} replace />;
    }
  }

  return <>{children}</>;
}
