"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  calendarReminders: boolean;
  projectUpdates: boolean;
  weeklyReports: boolean;
}

interface SettingsNotificationsProps {
  userSettings: NotificationSettings;
  onSettingChange: (category: string, setting: string, value: any) => void;
}

export function SettingsNotifications({
  userSettings,
  onSettingChange,
}: SettingsNotificationsProps) {
  return (
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
              <Label className="text-white">Notificações por E-mail</Label>
              <p className="text-sm text-gray-300">
                Receba notificações importantes por e-mail
              </p>
            </div>
            <Switch
              checked={userSettings.emailNotifications}
              onCheckedChange={(checked) =>
                onSettingChange("notifications", "emailNotifications", checked)
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
                onSettingChange("notifications", "pushNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Lembretes do Calendário</Label>
              <p className="text-sm text-gray-300">
                Lembretes para eventos e compromissos
              </p>
            </div>
            <Switch
              checked={userSettings.calendarReminders}
              onCheckedChange={(checked) =>
                onSettingChange("notifications", "calendarReminders", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Atualizações de Projetos</Label>
              <p className="text-sm text-gray-300">
                Notificações sobre mudanças em projetos
              </p>
            </div>
            <Switch
              checked={userSettings.projectUpdates}
              onCheckedChange={(checked) =>
                onSettingChange("notifications", "projectUpdates", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Relatórios Semanais</Label>
              <p className="text-sm text-gray-300">
                Receba relatórios semanais por e-mail
              </p>
            </div>
            <Switch
              checked={userSettings.weeklyReports}
              onCheckedChange={(checked) =>
                onSettingChange("notifications", "weeklyReports", checked)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
