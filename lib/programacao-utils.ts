// Helpers for Programação page
export const TEAMS_BY_CONSULTANT: Record<string, string[]> = {
  "paloma-hidraulicos": ["GUSTAVOBEL", "EDUARDO", "YURI", "GUILHERME"],
  "paloma-engrenagens": ["VAGNER", "FABIO F", "NIVALDO"],
  "lucas-bomba": ["ALEXANDRE", "ALEXSANDRO", "ROBERTO P", "KAUA", "MARCELINO"],
  "lucas-comandos": ["LEANDRO", "RODRIGO N", "LUISMIGUEL"],
  marcelo: [
    "ALZIRO",
    "G SIMAO",
    "HENRIQUE",
    "NICOLAS C",
    "DANIEL",
    "RONALD",
    "VINICIUS",
    "DANIEL G",
  ],
  carlinhos: ["SHEINE"],
};

export function getTeamForConsultant(name?: string | null): string[] {
  const n = (name || "").toLowerCase();
  if (!n) return [];
  if (n.includes("paloma")) {
    return [
      ...TEAMS_BY_CONSULTANT["paloma-hidraulicos"],
      ...TEAMS_BY_CONSULTANT["paloma-engrenagens"],
    ];
  }
  if (n.includes("lucas")) {
    return [
      ...TEAMS_BY_CONSULTANT["lucas-bomba"],
      ...TEAMS_BY_CONSULTANT["lucas-comandos"],
    ];
  }
  if (n.includes("marcelo")) return TEAMS_BY_CONSULTANT.marcelo;
  if (n.includes("carlinhos")) return TEAMS_BY_CONSULTANT.carlinhos;
  return [];
}

export function getDepartmentsForConsultant(
  name?: string | null
): { key: string; label: string }[] {
  const n = (name || "").toLowerCase();
  if (!n) return [];
  if (n.includes("paloma")) {
    return [
      { key: "paloma-hidraulicos", label: "Hidráulicos" },
      { key: "paloma-engrenagens", label: "Engrenagens" },
    ];
  }
  if (n.includes("lucas")) {
    return [
      { key: "lucas-bomba", label: "Bomba" },
      { key: "lucas-comandos", label: "Comandos" },
    ];
  }
  return [];
}

export function extractMechanicFromItem(item: any, team: string[]): string | null {
  if (!item || !Array.isArray(item.rawData)) return null;
  const teamSet = new Set(team.map((t) => t.toUpperCase().trim()));

  for (const val of item.rawData) {
    if (val && typeof val === "object") {
      const possibleFields = [
        "executante",
        "mecanico",
        "mecânico",
        "responsavel_execucao",
        "executor",
      ];
      for (const f of possibleFields) {
        const v = (val as any)[f];
        if (typeof v === "string" && v.trim()) {
          const up = v.toUpperCase().trim();
          if (teamSet.has(up)) return up;
        }
      }
      for (const k of Object.keys(val)) {
        const v = (val as any)[k];
        if (typeof v === "string" && v.trim()) {
          const up = v.toUpperCase().trim();
          if (teamSet.has(up)) return up;
        }
      }
    } else if (typeof val === "string") {
      const up = val.toUpperCase().trim();
      if (teamSet.has(up)) return up;
    }
  }
  return null;
}

export function formatPersonName(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isAnaliseStatus(status: string): boolean {
  const s = (status || "").toLowerCase();
  return s.includes("analise") || s.includes("análise") || s.includes("revis");
}

export function isExecucaoStatus(status: string): boolean {
  const s = (status || "").toLowerCase();
  return s.includes("execu");
}

export function parseDateLike(value?: string | null): Date | null {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  const dm = v.match(/^([0-3]?\d)[\/\-]([0-1]?\d)[\/\-](\d{2,4})$/);
  if (dm) {
    const d = parseInt(dm[1], 10);
    const m = parseInt(dm[2], 10) - 1;
    const y = parseInt(dm[3].length === 2 ? `20${dm[3]}` : dm[3], 10);
    const date = new Date(y, m, d);
    return isNaN(date.getTime()) ? null : date;
  }
  const iso = new Date(v);
  return isNaN(iso.getTime()) ? null : iso;
}

export function getDueDate(activity: any): Date | null {
  return (
    parseDateLike(activity?.data) || parseDateLike(activity?.prazo) || null
  );
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDueLabel(due: Date | null): {
  label: string;
  isOverdue: boolean;
} {
  if (!due) return { label: "Sem data", isOverdue: false };
  const today = startOfDay(new Date());
  const onlyDay = startOfDay(due);
  const diffMs = onlyDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0)
    return { label: `Há ${Math.abs(diffDays)} dia(s)`, isOverdue: true };
  if (diffDays === 0) return { label: "Hoje", isOverdue: false };
  if (diffDays === 1) return { label: "Amanhã", isOverdue: false };
  return { label: `Em ${diffDays} dia(s)`, isOverdue: false };
}

export function getCardStyle(status: string): string {
  const s = (status || "").toLowerCase();
  if (isAnaliseStatus(s)) {
    return "bg-yellow-50 border border-yellow-200 border-l-4 border-l-yellow-400";
  }
  if (isExecucaoStatus(s)) {
    return "bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-400";
  }
  return "bg-gray-50 border border-gray-200 border-l-4 border-l-gray-400";
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 6;
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getTodayItems(items: any[]): any[] {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return items.filter((item) => {
    const dueDate = getDueDate(item);
    if (!dueDate) return false;
    const itemDate = startOfDay(dueDate);
    return itemDate.getTime() === today.getTime();
  });
}

export function getThisWeekItems(items: any[]): any[] {
  const today = new Date();
  const startWeek = getStartOfWeek(today);
  const endWeek = getEndOfWeek(today);
  
  return items.filter((item) => {
    const dueDate = getDueDate(item);
    if (!dueDate) return false;
    const itemDate = dueDate.getTime();
    return itemDate >= startWeek.getTime() && itemDate <= endWeek.getTime();
  });
}