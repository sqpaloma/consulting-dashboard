"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateUserForm } from "./create-user-form";
import { UserPlus, Users } from "lucide-react";

export function SettingsUserManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    // Aqui você pode adicionar lógica para atualizar a lista de usuários
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Users className="h-5 w-5" />
            Gerenciamento de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showCreateForm ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Gerencie os usuários do sistema. Apenas administradores podem
                criar novos usuários.
              </p>

              <div className="flex justify-start">
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Novo Usuário
                </Button>
              </div>
            </div>
          ) : (
            <CreateUserForm
              onCancel={() => setShowCreateForm(false)}
              onSuccess={handleCreateSuccess}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
