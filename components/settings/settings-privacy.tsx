"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";

interface PrivacySettings {
  profileVisibility: string;
  dataSharing: boolean;
  analyticsTracking: boolean;
}

interface SettingsPrivacyProps {
  userSettings: PrivacySettings;
  onSettingChange: (category: string, setting: string, value: any) => void;
}

export function SettingsPrivacy({
  userSettings,
  onSettingChange,
}: SettingsPrivacyProps) {
  return (
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
            <Label className="text-white">Visibilidade do Perfil</Label>
            <Select
              value={userSettings.profileVisibility}
              onValueChange={(value) =>
                onSettingChange("privacy", "profileVisibility", value)
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
              <Label className="text-white">Compartilhamento de Dados</Label>
              <p className="text-sm text-gray-300">
                Permitir compartilhamento de dados para melhorias
              </p>
            </div>
            <Switch
              checked={userSettings.dataSharing}
              onCheckedChange={(checked) =>
                onSettingChange("privacy", "dataSharing", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Rastreamento de Analytics</Label>
              <p className="text-sm text-gray-300">
                Coletar dados de uso para melhorias
              </p>
            </div>
            <Switch
              checked={userSettings.analyticsTracking}
              onCheckedChange={(checked) =>
                onSettingChange("privacy", "analyticsTracking", checked)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
