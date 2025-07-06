"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Download,
  Upload,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Building,
} from "lucide-react";

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState({
    // Profile
    name: "Paloma Silva",
    email: "paloma.silva@novakgouveia.com",
    phone: "+55 (11) 99999-9999",
    position: "Consultora Senior",
    department: "Engenharia",
    location: "São Paulo, SP",
    company: "Novak & Gouveia",

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    calendarReminders: true,
    projectUpdates: true,
    weeklyReports: false,

    // Privacy
    profileVisibility: "public",
    dataSharing: false,
    analyticsTracking: true,

    // Appearance
    theme: "dark",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",

    // System
    autoSave: true,
    backupFrequency: "daily",
    sessionTimeout: "30min",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSettingChange = (
    category: string,
    setting: string,
    value: any
  ) => {
    setUserSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    console.log("Settings saved:", userSettings);
  };

  const handleExportData = () => {
    // Export user data
    console.log("Exporting data...");
  };

  const handleImportData = () => {
    // Import user data
    console.log("Importing data...");
  };

  const handleDeleteAccount = () => {
    // Delete account confirmation
    if (
      confirm(
        "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
      )
    ) {
      console.log("Account deletion requested");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Header title="Configurações" />

        {/* Main Content */}
        <div className="space-y-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm">
              <TabsTrigger
                value="profile"
                className="text-white data-[state=active]:bg-gray-50"
              >
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="text-white data-[state=active]:bg-gray-50"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="text-white data-[state=active]:bg-gray-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacidade
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="text-white data-[state=active]:bg-gray-50"
              >
                <Palette className="h-4 w-4 mr-2" />
                Aparência
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="text-white data-[state=active]:bg-gray-50"
              >
                <Database className="h-4 w-4 mr-2" />
                Sistema
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
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
                          handleSettingChange("profile", "name", e.target.value)
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
                          handleSettingChange(
                            "profile",
                            "email",
                            e.target.value
                          )
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
                          handleSettingChange(
                            "profile",
                            "phone",
                            e.target.value
                          )
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
                          handleSettingChange(
                            "profile",
                            "position",
                            e.target.value
                          )
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
                          handleSettingChange("profile", "department", value)
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engenharia">Engenharia</SelectItem>
                          <SelectItem value="Administrativo">
                            Administrativo
                          </SelectItem>
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
                          handleSettingChange(
                            "profile",
                            "location",
                            e.target.value
                          )
                        }
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="Cidade, Estado"
                      />
                    </div>
                  </div>

                  <Separator className="bg-white/20" />

                  {/* Password Change */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Alterar Senha
                    </h3>
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
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Configurações de Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">
                          Notificações por E-mail
                        </Label>
                        <p className="text-sm text-gray-300">
                          Receba notificações importantes por e-mail
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          handleSettingChange(
                            "notifications",
                            "emailNotifications",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">Notificações Push</Label>
                        <p className="text-sm text-gray-300">
                          Receba notificações em tempo real
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.pushNotifications}
                        onCheckedChange={(checked) =>
                          handleSettingChange(
                            "notifications",
                            "pushNotifications",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">
                          Lembretes do Calendário
                        </Label>
                        <p className="text-sm text-gray-300">
                          Lembretes para eventos e compromissos
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.calendarReminders}
                        onCheckedChange={(checked) =>
                          handleSettingChange(
                            "notifications",
                            "calendarReminders",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">
                          Atualizações de Projetos
                        </Label>
                        <p className="text-sm text-gray-300">
                          Notificações sobre mudanças em projetos
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.projectUpdates}
                        onCheckedChange={(checked) =>
                          handleSettingChange(
                            "notifications",
                            "projectUpdates",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">
                          Relatórios Semanais
                        </Label>
                        <p className="text-sm text-gray-300">
                          Receba relatórios semanais por e-mail
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.weeklyReports}
                        onCheckedChange={(checked) =>
                          handleSettingChange(
                            "notifications",
                            "weeklyReports",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Configurações de Privacidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">
                        Visibilidade do Perfil
                      </Label>
                      <Select
                        value={userSettings.profileVisibility}
                        onValueChange={(value) =>
                          handleSettingChange(
                            "privacy",
                            "profileVisibility",
                            value
                          )
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Público</SelectItem>
                          <SelectItem value="private">Privado</SelectItem>
                          <SelectItem value="team">Apenas Equipe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">
                          Compartilhamento de Dados
                        </Label>
                        <p className="text-sm text-gray-300">
                          Permitir compartilhamento de dados para melhorias
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.dataSharing}
                        onCheckedChange={(checked) =>
                          handleSettingChange("privacy", "dataSharing", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">
                          Rastreamento de Analytics
                        </Label>
                        <p className="text-sm text-gray-300">
                          Coletar dados de uso para melhorias
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.analyticsTracking}
                        onCheckedChange={(checked) =>
                          handleSettingChange(
                            "privacy",
                            "analyticsTracking",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Configurações de Aparência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white">Tema</Label>
                      <Select
                        value={userSettings.theme}
                        onValueChange={(value) =>
                          handleSettingChange("appearance", "theme", value)
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="auto">Automático</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Idioma</Label>
                      <Select
                        value={userSettings.language}
                        onValueChange={(value) =>
                          handleSettingChange("appearance", "language", value)
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">
                            Português (Brasil)
                          </SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Fuso Horário</Label>
                      <Select
                        value={userSettings.timezone}
                        onValueChange={(value) =>
                          handleSettingChange("appearance", "timezone", value)
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Sao_Paulo">
                            São Paulo (GMT-3)
                          </SelectItem>
                          <SelectItem value="America/New_York">
                            New York (GMT-5)
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            London (GMT+0)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Formato de Data</Label>
                      <Select
                        value={userSettings.dateFormat}
                        onValueChange={(value) =>
                          handleSettingChange("appearance", "dateFormat", value)
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Formato de Hora</Label>
                      <Select
                        value={userSettings.timeFormat}
                        onValueChange={(value) =>
                          handleSettingChange("appearance", "timeFormat", value)
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 horas</SelectItem>
                          <SelectItem value="24h">24 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Configurações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">
                          Salvamento Automático
                        </Label>
                        <p className="text-sm text-gray-300">
                          Salvar alterações automaticamente
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.autoSave}
                        onCheckedChange={(checked) =>
                          handleSettingChange("system", "autoSave", checked)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Frequência de Backup</Label>
                      <Select
                        value={userSettings.backupFrequency}
                        onValueChange={(value) =>
                          handleSettingChange(
                            "system",
                            "backupFrequency",
                            value
                          )
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">A cada hora</SelectItem>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Timeout da Sessão</Label>
                      <Select
                        value={userSettings.sessionTimeout}
                        onValueChange={(value) =>
                          handleSettingChange("system", "sessionTimeout", value)
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15min">15 minutos</SelectItem>
                          <SelectItem value="30min">30 minutos</SelectItem>
                          <SelectItem value="1h">1 hora</SelectItem>
                          <SelectItem value="4h">4 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator className="bg-white/20" />

                  {/* Data Management */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Gerenciamento de Dados
                    </h3>

                    <div className="flex flex-wrap gap-4">
                      <Button
                        variant="outline"
                        className="text-white border-white/20 hover:bg-white/10"
                        onClick={handleExportData}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Dados
                      </Button>

                      <Button
                        variant="outline"
                        className="text-white border-white/20 hover:bg-white/10"
                        onClick={handleImportData}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Dados
                      </Button>

                      <Button
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Conta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              onClick={handleSaveSettings}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
