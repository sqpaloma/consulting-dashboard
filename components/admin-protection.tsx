"use client";

import { ReactNode } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { ResponsiveLayout } from "@/components/responsive-layout";

interface AdminProtectionProps {
  children: ReactNode;
}

export function AdminProtection({ children }: AdminProtectionProps) {
  const { canAccessAdminPages, isAuthenticated, user } = useAdmin();

  if (!isAuthenticated) {
    return (
      <ResponsiveLayout title="Acesso Negado">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Você precisa estar logado para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </ResponsiveLayout>
    );
  }

  if (!canAccessAdminPages) {
    return (
      <ResponsiveLayout title="Acesso Restrito">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Acesso Restrito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Apenas administradores podem acessar esta página.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Usuário atual: {user?.name} ({user?.email})
            </p>
          </CardContent>
        </Card>
      </ResponsiveLayout>
    );
  }

  return <>{children}</>;
}
