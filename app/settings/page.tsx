"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  SettingsTabs,
  UserSettings,
} from "@/components/settings/settings-tabs";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings>({
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Header title="Configurações" />

        {/* Main Content */}
        <div className="space-y-6">
          <SettingsTabs
            userSettings={userSettings}
            onSettingChange={handleSettingChange}
          />

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
