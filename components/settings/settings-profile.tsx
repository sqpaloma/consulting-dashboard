"use client";

import { useState } from "react";
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
import { User, Upload, Save, Eye, EyeOff } from "lucide-react";

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
}

export function SettingsProfile({
  userSettings,
  onSettingChange,
}: SettingsProfileProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
              PS
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="text-white border-white/20 bg-white/10"
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

          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            Alterar Senha
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
