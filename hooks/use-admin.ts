"use client";

import { useAuth } from "./use-auth";

export function useAdmin() {
  const { user, isAuthenticated } = useAuth();

  const isAdmin = user?.isAdmin === true;
  const isPalomaAdmin = user?.email === "paloma.silva@novakgouveia.com.br";

  return {
    isAdmin: isAdmin || isPalomaAdmin,
    isAuthenticated,
    user,
    canAccessAdminPages: isAuthenticated && (isAdmin || isPalomaAdmin),
  };
}
