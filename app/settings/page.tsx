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
    if (tabParam) setDefaultTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (user && settings) {
      setUserSettings((prev) => ({
        ...prev,
        // Profile
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        position: user.position || prev.position,
        department: user.department || prev.department,
        location: user.location || prev.location,
        company: user.company || prev.company,
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
      }));
    }
  }, [user, settings]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setUserSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await createOrUpdateUser({
        name: userSettings.name,
        email: userSettings.email,
        phone: userSettings.phone || undefined,
        position: userSettings.position || undefined,
        department: userSettings.department || undefined,
        location: userSettings.location || undefined,
        company: userSettings.company || undefined,
        avatarUrl: undefined,
      });

      await updateUserSettings({
        userId: user._id,
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
      });

      toast.success("Configurações atualizadas com sucesso");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
  };

  return (
    <ResponsiveLayout title="Configurações">
      <SettingsTabs
        userSettings={userSettings}
        onSettingChange={handleSettingChange}
        defaultTab={defaultTab}
        userId={user?._id}
      />
      <div className="flex justify-end mt-4">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" /> Salvar Alterações
        </Button>
      </div>
    </ResponsiveLayout>
  );
}

export default function SettingsPage() {
  return (
    <AdminProtection allowedRoles={["admin"]}>
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
