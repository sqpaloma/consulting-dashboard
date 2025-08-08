"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { UserPlus, Eye, EyeOff, Save, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface CreateUserFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function CreateUserForm({ onCancel, onSuccess }: CreateUserFormProps) {
  const { user: currentUser } = useAuth();
  const createUserByAdmin = useMutation(api.auth.createUserByAdmin);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    position: "",
    department: "",
    isAdmin: false,
    role: "consultor" as
      | "consultor"
      | "qualidade_pcp"
      | "gerente"
      | "diretor"
      | "admin",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Usuário não autenticado");
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createUserByAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        position: formData.position || undefined,
        department: formData.department || undefined,
        isAdmin: formData.isAdmin,
        role: formData.role,
        createdByUserId: currentUser.userId,
      });

      toast.success("Usuário criado com sucesso!");
      onSuccess();

      // Limpar formulário
      setFormData({
        name: "",
        email: "",
        password: "",
        position: "",
        department: "",
        isAdmin: false,
        role: "consultor",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar usuário"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <UserPlus className="h-5 w-5" />
          Criar Novo Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="usuario@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Senha do usuário"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                placeholder="Cargo do usuário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="servicos">Serviços</SelectItem>
                  <SelectItem value="engenharia">
                    Engenharia e Assistência
                  </SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Papel (Perfil)</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultor">Consultor</SelectItem>
                  <SelectItem value="qualidade_pcp">Qualidade e PCP</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="diretor">Diretor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Define o acesso às páginas e dados.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Usuário</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onCheckedChange={(checked) =>
                    handleInputChange("isAdmin", checked as boolean)
                  }
                />
                <Label htmlFor="isAdmin" className="text-sm">
                  Usuário Administrador
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                Administradores têm acesso às configurações e análises
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Usuário
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
