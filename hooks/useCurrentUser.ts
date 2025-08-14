"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";

// Hook para gerenciar o usuário atual
export function useCurrentUser() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const email = authUser?.email;

  const userData = useQuery(
    api.users.getUserByEmail,
    email ? { email } : "skip"
  );

  return {
    user: userData?.user,
    settings: userData?.settings,
    isLoading: authLoading || userData === undefined,
  };
}

// Hook para gerenciar usuário por ID
export function useUserById(userId: Id<"users">) {
  const userData = useQuery(api.users.getUserById, {
    userId,
  });

  return {
    user: userData?.user,
    settings: userData?.settings,
    isLoading: userData === undefined,
  };
}
