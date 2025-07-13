"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsProfile } from "./settings-profile";
import { SettingsNotifications } from "./settings-notifications";
import { SettingsPrivacy } from "./settings-privacy";
import { SettingsAppearance } from "./settings-appearance";
import { SettingsSystem } from "./settings-system";
import { SettingsDataManagement } from "./settings-data-management";

import { Id } from "@/convex/_generated/dataModel";
import {
  Bell,
  Database,
  FileSpreadsheet,
  Palette,
  Shield,
  User,
  Users,
} from "lucide-react";
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
  onSettingChange: (category: string, setting: string, value: any) => void;
  defaultTab?: string;
  userId?: Id<"users">;
}

export function SettingsTabs({
  userSettings,
  onSettingChange,
  defaultTab = "profile",
  userId,
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-7 bg-white/10 backdrop-blur-sm">
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
          value="data"
          className="text-white data-[state=active]:bg-gray-50"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Dados
        </TabsTrigger>
        <TabsTrigger
          value="system"
          className="text-white data-[state=active]:bg-gray-50"
        >
          <Database className="h-4 w-4 mr-2" />
          Sistema
        </TabsTrigger>
        <TabsTrigger
          value="users"
          className="text-white data-[state=active]:bg-gray-50"
        >
          <Users className="h-4 w-4 mr-2" />
          Usuários
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <SettingsProfile
          userSettings={userSettings}
          onSettingChange={onSettingChange}
          userId={userId}
        />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <SettingsNotifications
          userSettings={userSettings}
          onSettingChange={onSettingChange}
        />
      </TabsContent>

      <TabsContent value="privacy" className="space-y-6">
        <SettingsPrivacy
          userSettings={userSettings}
          onSettingChange={onSettingChange}
        />
      </TabsContent>

      <TabsContent value="appearance" className="space-y-6">
        <SettingsAppearance
          userSettings={userSettings}
          onSettingChange={onSettingChange}
        />
      </TabsContent>

      <TabsContent value="data" className="space-y-6">
        <SettingsDataManagement />
      </TabsContent>

      <TabsContent value="system" className="space-y-6">
        <SettingsSystem
          userSettings={userSettings}
          onSettingChange={onSettingChange}
        />
      </TabsContent>

      <TabsContent value="users" className="space-y-6">
        <SettingsUserManagement />
      </TabsContent>
    </Tabs>
  );
}
