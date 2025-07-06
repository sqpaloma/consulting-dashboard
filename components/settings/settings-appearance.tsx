"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette } from "lucide-react";

interface AppearanceSettings {
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

interface SettingsAppearanceProps {
  userSettings: AppearanceSettings;
  onSettingChange: (category: string, setting: string, value: any) => void;
}

export function SettingsAppearance({
  userSettings,
  onSettingChange,
}: SettingsAppearanceProps) {
  return (
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
                onSettingChange("appearance", "theme", value)
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
                onSettingChange("appearance", "language", value)
              }
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
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
                onSettingChange("appearance", "timezone", value)
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
                <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Formato de Data</Label>
            <Select
              value={userSettings.dateFormat}
              onValueChange={(value) =>
                onSettingChange("appearance", "dateFormat", value)
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
                onSettingChange("appearance", "timeFormat", value)
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
  );
}
