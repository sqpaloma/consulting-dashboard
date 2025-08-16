export interface DashboardItemLike {
  _id?: string;
  os?: string;
  titulo?: string;
  cliente?: string;
  responsavel?: string;
  status?: string;
  dataRegistro?: string;
  prazo?: string;
  rawData?: any;
  raw_data?: any;
}

export function parseBRDateFlexible(
  dateString: string | null | undefined
): Date | null {
  if (!dateString) return null;
  const clean = dateString.toString().trim();
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/mm/yyyy
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // dd-mm-yyyy
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // yyyy-mm-dd
    /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // dd/mm/yy
  ];
  for (const fmt of formats) {
    const m = clean.match(fmt);
    if (m) {
      if (fmt.source.includes("yyyy")) {
        const [, d, mth, y] = m;
        return new Date(parseInt(y), parseInt(mth) - 1, parseInt(d));
      } else if (
        fmt.source.endsWith("/(\\d{2})$") ||
        fmt.source.endsWith("-(\\d{4})$")
      ) {
        // handled by branches above; keep for completeness
      } else {
        const [, d, mth, y] = m;
        const fullYear =
          parseInt(y) < 50 ? 2000 + parseInt(y) : 1900 + parseInt(y);
        return new Date(fullYear, parseInt(mth) - 1, parseInt(d));
      }
    }
  }
  if (clean.includes("-") && clean.length === 10) {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) return d;
  }
  if (!isNaN(Number(clean)) && clean.length > 4) {
    const excel = Number(clean);
    return new Date((excel - 25569) * 86400 * 1000);
  }
  return null;
}

export function extractDeadline(item: DashboardItemLike): Date | null {
  if (item.dataRegistro) {
    const d = new Date(item.dataRegistro);
    if (!isNaN(d.getTime())) return d;
  }
  const raw = (item as any).raw_data ?? item.rawData;
  const tryFields = [
    "prazo",
    "data_registro",
    "data_prazo",
    "deadline",
    "data",
  ];
  if (raw) {
    if (typeof raw === "object" && !Array.isArray(raw)) {
      for (const k of tryFields) {
        const v = raw[k];
        if (v) {
          const d = parseBRDateFlexible(String(v));
          if (d) return d;
        }
      }
    }
    if (Array.isArray(raw)) {
      for (const val of raw) {
        if (val && typeof val === "object") {
          for (const k of tryFields) {
            if ((val as any)[k]) {
              const d = parseBRDateFlexible(String((val as any)[k]));
              if (d) return d;
            }
          }
        } else if (typeof val === "string") {
          const d = parseBRDateFlexible(val);
          if (d) return d;
        }
      }
    }
  }
  if (item.prazo) {
    const d = parseBRDateFlexible(item.prazo);
    if (d) return d;
  }
  return null;
}

export function extractOrcamento(item: DashboardItemLike): string | null {
  const raw = (item as any).raw_data ?? item.rawData;
  const osValue = (extractOS(item) || "").toString().trim();
  const keys = [
    "orcamento",
    "orçamento",
    "nro orc",
    "numero orc",
    "num orc",
    "orc",
    "titulo",
    "title",
  ];
  const normalize = (v: any) =>
    v == null
      ? ""
      : v
          .toString()
          .trim()
          .replace(/^\"+|\"+$/g, "");
  const pickNumber = (s: string): string | null => {
    if (!s) return null;
    const nums = s.match(/\d{3,}/g) || [];
    for (const n of nums) {
      if (osValue && n === osValue) continue;
      return n;
    }
    return null;
  };
  const checkObj = (obj: Record<string, any>) => {
    for (const k of Object.keys(obj)) {
      const lk = k.toLowerCase();
      if (keys.some((p) => lk.includes(p) || lk === p)) {
        const s = normalize(obj[k]);
        const num = pickNumber(s);
        if (num) return num;
      }
    }
    for (const k of Object.keys(obj)) {
      const s = normalize(obj[k]);
      const num = pickNumber(s);
      if (num) return num;
    }
    return null;
  };
  if (raw) {
    if (typeof raw === "object" && !Array.isArray(raw)) {
      const v = checkObj(raw);
      if (v) return v;
    }
    if (Array.isArray(raw)) {
      for (const val of raw) {
        if (val && typeof val === "object") {
          const v = checkObj(val as Record<string, any>);
          if (v) return v;
        } else if (typeof val === "string") {
          const s = normalize(val);
          const num = pickNumber(s);
          if (num) return num;
        }
      }
    }
  }
  return null;
}

export function extractOS(item: DashboardItemLike): string | null {
  if (item.os) return String(item.os);
  const raw = (item as any).raw_data ?? item.rawData;
  const keys = [
    "os",
    "ordem_servico",
    "ordem de servico",
    "ordem de serviço",
    "nro os",
    "numero os",
    "num os",
    "o.s.",
  ];
  const checkObj = (obj: Record<string, any>) => {
    for (const k of Object.keys(obj)) {
      const lk = k.toLowerCase();
      if (keys.some((p) => lk.includes(p) || lk === p)) {
        const v = obj[k];
        if (v == null) continue;
        const s = v.toString().trim();
        if (s) return s;
      }
    }
    return null;
  };
  if (raw) {
    if (typeof raw === "object" && !Array.isArray(raw)) {
      const v = checkObj(raw);
      if (v) return v;
    }
    if (Array.isArray(raw)) {
      for (const val of raw) {
        if (val && typeof val === "object") {
          const v = checkObj(val as Record<string, any>);
          if (v) return v;
        } else if (typeof val === "string") {
          const m = val.match(/\b\d{3,}\b/);
          if (m?.[0]) return m[0];
        }
      }
    }
  }
  return null;
}

export function getFirstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0];
}

export type ItemFilter = "onTime" | "overdue" | "dueSoon" | null;

export function categorizeItem(
  it: DashboardItemLike
): "onTime" | "overdue" | "dueSoon" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
  const dl = extractDeadline(it);
  if (!dl || isNaN(dl.getTime())) return "onTime";
  const d = new Date(dl);
  d.setHours(0, 0, 0, 0);
  if (d < today) return "overdue";
  const diff = +d - +today;
  if (diff <= fiveDaysMs) return "dueSoon";
  return "onTime";
}

export const STATUS_COLORS = [
  "#4F46E5",
  "#0EA5E9",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#14B8A6",
];