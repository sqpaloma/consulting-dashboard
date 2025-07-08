"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  SettingsTabs,
  UserSettings,
} from "@/components/settings/settings-tabs";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [defaultTab, setDefaultTab] = useState<string>("profile");

  // Usar hook do Convex para dados do usuário
  const { user, settings, isLoading } = useCurrentUser();

  const [userSettings, setUserSettings] = useState<UserSettings>({
    // Profile
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    location: "",
    company: "",

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

  // Convex mutations
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const updateUserSettings = useMutation(api.users.updateUserSettings);

  useEffect(() => {
    if (
      tabParam &&
      [
        "profile",
        "notifications",
        "privacy",
        "appearance",
        "data",
        "system",
      ].includes(tabParam)
    ) {
      setDefaultTab(tabParam);
    }
  }, [tabParam]);

  // Atualizar estado local quando os dados do Convex carregarem
  useEffect(() => {
    if (user && settings) {
      setUserSettings({
        // Profile
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        position: user.position || "",
        department: user.department || "",
        location: user.location || "",
        company: user.company || "",

        // Notifications
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        calendarReminders: settings.calendarReminders,
        projectUpdates: settings.projectUpdates,
        weeklyReports: settings.weeklyReports,

        // Privacy
        profileVisibility: settings.profileVisibility,
        dataSharing: settings.dataSharing,
        analyticsTracking: settings.analyticsTracking,

        // Appearance
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,

        // System
        autoSave: settings.autoSave,
        backupFrequency: settings.backupFrequency,
        sessionTimeout: settings.sessionTimeout,
      });
    }
  }, [user, settings]);

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

  const handleSaveSettings = async () => {
    if (!user?._id) {
      toast.error("ID do usuário não encontrado");
      return;
    }

    try {
      // Salvar informações do perfil
      await createOrUpdateUser({
        name: userSettings.name,
        email: userSettings.email,
        phone: userSettings.phone,
        position: userSettings.position,
        department: userSettings.department,
        location: userSettings.location,
        company: userSettings.company,
      });

      // Salvar configurações
      await updateUserSettings({
        userId: user._id,
        // Notifications
        emailNotifications: userSettings.emailNotifications,
        pushNotifications: userSettings.pushNotifications,
        calendarReminders: userSettings.calendarReminders,
        projectUpdates: userSettings.projectUpdates,
        weeklyReports: userSettings.weeklyReports,
        // Privacy
        profileVisibility: userSettings.profileVisibility,
        dataSharing: userSettings.dataSharing,
        analyticsTracking: userSettings.analyticsTracking,
        // Appearance
        theme: userSettings.theme,
        language: userSettings.language,
        timezone: userSettings.timezone,
        dateFormat: userSettings.dateFormat,
        timeFormat: userSettings.timeFormat,
        // System
        autoSave: userSettings.autoSave,
        backupFrequency: userSettings.backupFrequency,
        sessionTimeout: userSettings.sessionTimeout,
      });

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Header title="Configurações" />
          <div className="flex items-center justify-center py-20">
            <div className="text-white">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

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
            defaultTab={defaultTab}
            userId={user?._id}
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

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Header title="Configurações" />
            <div className="flex items-center justify-center py-20">
              <div className="text-white">Carregando...</div>
            </div>
          </div>
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
