"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsProfile } from "./settings-profile";
import { SettingsNotifications } from "./settings-notifications";
import { SettingsDataManagement } from "./settings-data-management";

import { Id } from "@/convex/_generated/dataModel";
import { useAdmin } from "@/hooks/use-admin";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, FileSpreadsheet, User, Users } from "lucide-react";
import { SettingsUserManagement } from "./settings-user-management";

export interface UserSettings {
  // Profile
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  location: string;
  company: string;

  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  calendarReminders: boolean;
  projectUpdates: boolean;
  weeklyReports: boolean;

  // Privacy
  profileVisibility: string;
  dataSharing: boolean;
  analyticsTracking: boolean;

  // Appearance
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;

  // System
  autoSave: boolean;
  backupFrequency: string;
  sessionTimeout: string;
}

interface SettingsTabsProps {
  userSettings: UserSettings;
  onSettingChange: (key: keyof UserSettings, value: any) => void;
  defaultTab?: string;
  userId?: Id<"users">;
  isLoading?: boolean;
}

export function SettingsTabs({
  userSettings,
  onSettingChange,
  defaultTab = "profile",
  userId,
  isLoading = false,
}: SettingsTabsProps) {
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const allowedTabs = isAdmin
    ? ["profile", "notifications", "data", "users"]
    : ["profile", "notifications"];

  const initialTab = allowedTabs.includes(defaultTab) ? defaultTab : "profile";

  const adaptOnChange = (_category: string, setting: string, value: any) => {
    onSettingChange(setting as keyof UserSettings, value);
  };

  const onTabChange = (value: string) => {
    const search = new URLSearchParams(params?.toString());
    search.set("tab", value);
    router.replace(`${pathname}?${search.toString()}`);
  };

  const listBase =
    "grid w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-1";
  const triggerBase =
    "text-white/80 hover:text-white data-[state=active]:text-white data-[state=active]:bg-white/20 rounded-lg transition-colors";

  return (
    <Tabs
      defaultValue={initialTab}
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList
        className={`${listBase} ${isAdmin ? "grid-cols-4" : "grid-cols-2"}`}
      >
        <TabsTrigger value="profile" className={triggerBase}>
          <User className="h-4 w-4 mr-2" />
          Perfil
        </TabsTrigger>
        <TabsTrigger value="notifications" className={triggerBase}>
          <Bell className="h-4 w-4 mr-2" />
          Notificações
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="data" className={triggerBase}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Dados
          </TabsTrigger>
        )}
        {isAdmin && (
          <TabsTrigger value="users" className={triggerBase}>
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <SettingsProfile
          userSettings={userSettings}
          onSettingChange={adaptOnChange}
          userId={userId}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <SettingsNotifications
          userSettings={userSettings}
          onSettingChange={adaptOnChange}
        />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="data" className="space-y-6">
          <SettingsDataManagement />
        </TabsContent>
      )}

      {isAdmin && (
        <TabsContent value="users" className="space-y-6">
          <SettingsUserManagement />
        </TabsContent>
      )}
    </Tabs>
  );
}
