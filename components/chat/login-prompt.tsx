"use client";

import { ResponsiveLayout } from "@/components/responsive-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoginPrompt() {
  return (
    <ResponsiveLayout title="Chat">
      <div className="flex items-center justify-center h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Faça login para usar o chat
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Você precisa estar logado para acessar o chat
            </p>
            <Button onClick={() => (window.location.href = "/auth")}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}
