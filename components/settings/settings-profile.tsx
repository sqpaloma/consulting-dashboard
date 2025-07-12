"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload, Save, Eye, EyeOff, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";

interface UserSettings {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  location: string;
  company: string;
}

interface SettingsProfileProps {
  userSettings: UserSettings;
  onSettingChange: (category: string, setting: string, value: any) => void;
  userId?: Id<"users">;
}

export function SettingsProfile({
  userSettings,
  onSettingChange,
  userId,
}: SettingsProfileProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Auth hook para logout
  const { signOut } = useAuth();

  // Convex mutations
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const changeUserPassword = useMutation(api.auth.changeUserPassword);

  const handleSaveProfile = async () => {
    if (!userId) {
      toast.error("ID do usuário não encontrado");
      return;
    }

    setIsSaving(true);
    try {
      await createOrUpdateUser({
        name: userSettings.name,
        email: userSettings.email,
        phone: userSettings.phone,
        position: userSettings.position,
        department: userSettings.department,
        location: userSettings.location,
        company: userSettings.company,
      });

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!userId) {
      toast.error("ID do usuário não encontrado");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    // Validar nova senha
    if (newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error("A senha deve conter pelo menos uma letra maiúscula");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error("A senha deve conter pelo menos uma letra minúscula");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      toast.error("A senha deve conter pelo menos um número");
      return;
    }

    setIsChangingPassword(true);
    try {
      // Alterar senha
      await changeUserPassword({
        userId,
        currentPassword,
        newPassword,
      });

      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Erro ao alterar senha. Verifique a senha atual.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarUpload = () => {
    // Implementar upload de avatar aqui
    toast.info("Funcionalidade de upload de avatar em desenvolvimento");
  };

  const handleLogout = () => {
    signOut();
    toast.success("Logout realizado com sucesso!");
    // Forçar redirecionamento para a raiz que mostrará o login
    window.location.href = "/";
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <User className="h-5 w-5 mr-2" />
          Informações do Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/avatar-placeholder.jpg" />
            <AvatarFallback className="bg-blue-600 text-white text-xl">
              {userSettings.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="text-white border-white/20 bg-white/10 hover:bg-white/20"
              onClick={handleAvatarUpload}
            >
              <Upload className="h-4 w-4 mr-2" />
              Alterar Foto
            </Button>
            <p className="text-sm text-gray-300">
              JPG, PNG ou GIF. Máximo 2MB.
            </p>
          </div>
        </div>

        <Separator className="bg-white/20" />

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Nome Completo
            </Label>
            <Input
              id="name"
              value={userSettings.name}
              onChange={(e) =>
                onSettingChange("profile", "name", e.target.value)
              }
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={userSettings.email}
              onChange={(e) =>
                onSettingChange("profile", "email", e.target.value)
              }
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">
              Telefone
            </Label>
            <Input
              id="phone"
              value={userSettings.phone}
              onChange={(e) =>
                onSettingChange("profile", "phone", e.target.value)
              }
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="+55 (11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position" className="text-white">
              Cargo
            </Label>
            <Input
              id="position"
              value={userSettings.position}
              onChange={(e) =>
                onSettingChange("profile", "position", e.target.value)
              }
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Seu cargo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-white">
              Departamento
            </Label>
            <Select
              value={userSettings.department}
              onValueChange={(value) =>
                onSettingChange("profile", "department", value)
              }
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engenharia">Engenharia</SelectItem>
                <SelectItem value="Administrativo">Administrativo</SelectItem>
                <SelectItem value="Comercial">Comercial</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-white">
              Localização
            </Label>
            <Input
              id="location"
              value={userSettings.location}
              onChange={(e) =>
                onSettingChange("profile", "location", e.target.value)
              }
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Cidade, Estado"
            />
          </div>
        </div>

        {/* Save Profile Button */}
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSaveProfile}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar Perfil"}
        </Button>

        <Separator className="bg-white/20" />

        {/* Password Change */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Alterar Senha</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-white">
                Senha Atual
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                  placeholder="Digite sua senha atual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-white hover:bg-white/10"
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
              <Label htmlFor="newPassword" className="text-white">
                Nova Senha
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Digite a nova senha"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirmar Nova Senha
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              placeholder="Confirme a nova senha"
            />
          </div>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleChangePassword}
            disabled={
              isChangingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
          >
            <Save className="h-4 w-4 mr-2" />
            {isChangingPassword ? "Alterando..." : "Alterar Senha"}
          </Button>
        </div>

        <Separator className="bg-white/20" />

        {/* Logout Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Sessão</h3>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Fazer Logout</p>
              <p className="text-sm text-gray-300">
                Sair da sua conta e retornar à tela de login
              </p>
            </div>
            <Button
              variant="outline"
              className="text-red-400 border-red-400/50 bg-red-400/10 hover:bg-red-400/20 hover:text-red-300"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
