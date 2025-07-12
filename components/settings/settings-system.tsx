"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Database, Download, Upload, Trash2 } from "lucide-react";

interface SystemSettings {
  autoSave: boolean;
  backupFrequency: string;
  sessionTimeout: string;
}

interface SettingsSystemProps {
  userSettings: SystemSettings;
  onSettingChange: (category: string, setting: string, value: any) => void;
}

export function SettingsSystem({
  userSettings,
  onSettingChange,
}: SettingsSystemProps) {
  const handleExportData = () => {
    // Export user data
  };

  const handleImportData = () => {
    // Import user data
  };

  const handleDeleteAccount = () => {
    // Delete account confirmation
    if (
      confirm(
        "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
      )
    ) {
    }
  };

  return (
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
              <Label className="text-white">Salvamento Automático</Label>
              <p className="text-sm text-gray-300">
                Salvar alterações automaticamente
              </p>
            </div>
            <Switch
              checked={userSettings.autoSave}
              onCheckedChange={(checked) =>
                onSettingChange("system", "autoSave", checked)
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Frequência de Backup</Label>
            <Select
              value={userSettings.backupFrequency}
              onValueChange={(value) =>
                onSettingChange("system", "backupFrequency", value)
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
                onSettingChange("system", "sessionTimeout", value)
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
              className="text-white border-white/20 bg-white/10"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>

            <Button
              variant="outline"
              className="text-white border-white/20 bg-white/10"
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
  );
}
