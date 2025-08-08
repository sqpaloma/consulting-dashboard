"use client";

import { useAuth } from "./use-auth";

export function useAdmin() {
  const { user, isAuthenticated } = useAuth();

  const isAdminFlag = user?.isAdmin === true;
  const isAdminRole = user?.role === "admin";
  const isPalomaAdmin = user?.email === "paloma.silva@novakgouveia.com.br";

  return {
    isAdmin: isAdminFlag || isAdminRole || isPalomaAdmin,
    isAuthenticated,
    user,
    canAccessAdminPages:
      isAuthenticated && (isAdminFlag || isAdminRole || isPalomaAdmin),
  };
}
