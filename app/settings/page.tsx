"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { Button } from "@/components/ui/button";
import {
  SettingsTabs,
  UserSettings,
} from "@/components/settings/settings-tabs";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AdminProtection } from "@/components/admin-protection";

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

  // Carregar configurações do usuário quando disponíveis
  useEffect(() => {
    if (user) {
      setUserSettings((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        position: user.position || "",
        department: user.department || "",
        location: user.location || "",
        company: user.company || "",
        ...settings,
      }));
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
    try {
      // Separar dados do usuário das configurações
      const userData = {
        name: userSettings.name,
        email: userSettings.email,
        phone: userSettings.phone,
        position: userSettings.position,
        department: userSettings.department,
        location: userSettings.location,
        company: userSettings.company,
      };

      const settingsData = {
        userId: user!._id,
        emailNotifications: userSettings.emailNotifications,
        pushNotifications: userSettings.pushNotifications,
        calendarReminders: userSettings.calendarReminders,
        projectUpdates: userSettings.projectUpdates,
        weeklyReports: userSettings.weeklyReports,
        profileVisibility: userSettings.profileVisibility,
        dataSharing: userSettings.dataSharing,
        analyticsTracking: userSettings.analyticsTracking,
        theme: userSettings.theme,
        language: userSettings.language,
        timezone: userSettings.timezone,
        dateFormat: userSettings.dateFormat,
        timeFormat: userSettings.timeFormat,
        autoSave: userSettings.autoSave,
        backupFrequency: userSettings.backupFrequency,
        sessionTimeout: userSettings.sessionTimeout,
      };

      // Criar ou atualizar usuário
      await createOrUpdateUser(userData);

      // Atualizar configurações
      await updateUserSettings(settingsData);

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <ResponsiveLayout title="Configurações">
        <div className="flex items-center justify-center py-20">
          <div className="text-white">Carregando...</div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout title="Configurações">
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
    </ResponsiveLayout>
  );
}

export default function SettingsPage() {
  return (
    <AdminProtection>
      <Suspense
        fallback={
          <ResponsiveLayout title="Configurações">
            <div className="flex items-center justify-center py-20">
              <div className="text-white">Carregando...</div>
            </div>
          </ResponsiveLayout>
        }
      >
        <SettingsPageContent />
      </Suspense>
    </AdminProtection>
  );
}
