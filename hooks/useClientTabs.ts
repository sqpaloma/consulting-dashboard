import { useEffect, useState } from "react";

export function useClientTabs(userId?: string) {
  const [tabs, setTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  // Load saved tabs per user
  useEffect(() => {
    const key = `followup_clients_${userId || "__anon__"}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const arr: string[] = JSON.parse(saved);
        setTabs(arr);
        if (arr.length > 0) setActiveTab(arr[0]);
      }
    } catch {}
  }, [userId]);

  // Auto-save tabs when they change
  useEffect(() => {
    const key = `followup_clients_${userId || "__anon__"}`;
    try {
      localStorage.setItem(key, JSON.stringify(tabs));
    } catch {}
  }, [tabs, userId]);

  const addClienteTab = (name: string) => {
    const val = name.trim();
    if (!val) return;
    setTabs((prev) => {
      if (prev.includes(val)) {
        setActiveTab(val);
        return prev;
      }
      const next = [...prev, val];
      setActiveTab(val);
      return next;
    });
  };

  const removeClienteTab = (name: string) => {
    setTabs((prev) => {
      const next = prev.filter((n) => n !== name);
      if (activeTab === name) {
        setActiveTab(next[0] || "");
      }
      return next;
    });
  };

  const reorderTabs = (sourceName: string, targetName: string) => {
    if (!sourceName || !targetName || sourceName === targetName) return;
    setTabs((prev) => {
      const srcIdx = prev.indexOf(sourceName);
      const tgtIdx = prev.indexOf(targetName);
      if (srcIdx === -1 || tgtIdx === -1) return prev;
      const next = [...prev];
      next.splice(srcIdx, 1);
      next.splice(tgtIdx, 0, sourceName);
      return next;
    });
  };

  return {
    tabs,
    activeTab,
    setActiveTab,
    addClienteTab,
    removeClienteTab,
    reorderTabs,
  };
}