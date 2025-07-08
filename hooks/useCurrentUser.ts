import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Hook para gerenciar o usuário atual
export function useCurrentUser() {
  // Por enquanto, vamos usar um email fixo para demonstração
  // Em produção, você pegaria isso do sistema de autenticação
  const currentUserEmail = "paloma.silva@novakgouveia.com";

  const userData = useQuery(api.users.getUserByEmail, {
    email: currentUserEmail,
  });

  return {
    user: userData?.user,
    settings: userData?.settings,
    isLoading: userData === undefined,
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
