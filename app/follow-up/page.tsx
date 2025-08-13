"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X, MoreHorizontal } from "lucide-react";
import {
  useDashboardItemsByCliente,
  useUniqueClientes,
} from "@/lib/convex-dashboard-client";
import { useAuth } from "@/hooks/use-auth";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";

interface DashboardItemLike {
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

function parseBRDateFlexible(
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

function extractDeadline(item: DashboardItemLike): Date | null {
  // Prioriza dataRegistro, depois campos usuais em raw_data/rawData, depois prazo
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

function extractOrcamento(item: DashboardItemLike): string | null {
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
      if (osValue && n === osValue) continue; // evita repetir OS
      return n;
    }
    return null;
  };
  const checkObj = (obj: Record<string, any>) => {
    // 1) prioriza chaves relacionadas a orçamento
    for (const k of Object.keys(obj)) {
      const lk = k.toLowerCase();
      if (keys.some((p) => lk.includes(p) || lk === p)) {
        const s = normalize(obj[k]);
        const num = pickNumber(s);
        if (num) return num;
      }
    }
    // 2) fallback: tenta qualquer campo textual
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

function extractOS(item: DashboardItemLike): string | null {
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
          // tenta extrair uma sequência numérica razoável como OS
          const m = val.match(/\b\d{3,}\b/);
          if (m?.[0]) return m[0];
        }
      }
    }
  }
  return null;
}

function getFirstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  // pega apenas a primeira palavra
  return trimmed.split(/\s+/)[0];
}

const STATUS_COLORS = [
  "#4F46E5",
  "#0EA5E9",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#14B8A6",
];

type ItemFilter = "onTime" | "overdue" | "dueSoon" | null;

export default function FollowUpPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [tabs, setTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [filter, setFilter] = useState<ItemFilter>(null);
  const [draggingName, setDraggingName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const desktopBoxRef = useRef<HTMLDivElement | null>(null);
  const mobileBoxRef = useRef<HTMLDivElement | null>(null);
  const desktopListRef = useRef<HTMLDivElement | null>(null);
  const mobileListRef = useRef<HTMLDivElement | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Auto-complete
  const uniqueClientes = useUniqueClientes() || [];
  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim();
    const remaining = uniqueClientes.filter((c) => !tabs.includes(c));
    const list = !q
      ? remaining
      : remaining.filter((c) => c.toLowerCase().includes(q));
    return list.slice(0, 100);
  }, [query, uniqueClientes, tabs]);

  // Load saved tabs per user
  useEffect(() => {
    const key = `followup_clients_${user?.userId || "__anon__"}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const arr: string[] = JSON.parse(saved);
        setTabs(arr);
        if (arr.length > 0) setActiveTab(arr[0]);
      }
    } catch {}
  }, [user?.userId]);

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

  // Auto-salvar abas quando houver mudanças
  useEffect(() => {
    const key = `followup_clients_${user?.userId || "__anon__"}`;
    try {
      localStorage.setItem(key, JSON.stringify(tabs));
    } catch {}
  }, [tabs, user?.userId]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const node = e.target as Node;
      const insideDesktop = desktopBoxRef.current?.contains(node) ?? false;
      const insideMobile = mobileBoxRef.current?.contains(node) ?? false;
      if (!insideDesktop && !insideMobile) {
        setIsSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Items for active client
  const rawItems = useDashboardItemsByCliente(activeTab || "");
  const items: DashboardItemLike[] = rawItems || [];
  const isLoadingItems = rawItems === undefined;

  // Counters
  const { onTime, overdue, dueSoon } = useMemo(() => {
    let onTime = 0;
    let overdue = 0;
    let dueSoon = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;

    for (const it of items) {
      const deadline = extractDeadline(it);
      if (!deadline || isNaN(deadline.getTime())) {
        onTime++;
        continue;
      }
      const d = new Date(deadline);
      d.setHours(0, 0, 0, 0);
      if (d < today) {
        overdue++;
      } else {
        const diff = +d - +today;
        if (diff <= fiveDaysMs) dueSoon++;
        else onTime++;
      }
    }
    return { onTime, overdue, dueSoon };
  }, [items]);

  const handleSelectSuggestion = (name: string) => {
    addClienteTab(name);
    setQuery("");
    inputRef.current?.blur();
    setIsSuggestionsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleAddCliente = () => {
    const val = query.trim();
    if (!val) return;
    addClienteTab(val);
    setQuery("");
    inputRef.current?.blur();
    setIsSuggestionsOpen(false);
    setHighlightedIndex(-1);
  };

  // Scroll highlighted item into view
  useEffect(() => {
    const list = desktopListRef.current || mobileListRef.current;
    if (!list) return;
    if (highlightedIndex < 0) return;
    const child = list.querySelectorAll('[role="option"]')[
      highlightedIndex
    ] as HTMLElement;
    if (child && typeof child.scrollIntoView === "function") {
      child.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!isSuggestionsOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsSuggestionsOpen(true);
        e.preventDefault();
      } else if (e.key === "Escape") {
        setIsSuggestionsOpen(false);
        setHighlightedIndex(-1);
        return;
      }
    }
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next >= suggestions.length ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? suggestions.length - 1 : next;
      });
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsSuggestionsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = extractDeadline(a);
      const db = extractDeadline(b);
      const ta =
        da && !isNaN(da.getTime()) ? da.getTime() : Number.POSITIVE_INFINITY;
      const tb =
        db && !isNaN(db.getTime()) ? db.getTime() : Number.POSITIVE_INFINITY;
      if (ta === tb) {
        const aos = String(a.os || "");
        const bos = String(b.os || "");
        return aos.localeCompare(bos, "pt-BR");
      }
      return ta - tb; // crescente
    });
  }, [items]);

  const categorizeItem = (
    it: DashboardItemLike
  ): "onTime" | "overdue" | "dueSoon" => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    const dl = extractDeadline(it);
    if (!dl || isNaN(dl.getTime())) return "onTime"; // sem data conta como no prazo
    const d = new Date(dl);
    d.setHours(0, 0, 0, 0);
    if (d < today) return "overdue";
    const diff = +d - +today;
    if (diff <= fiveDaysMs) return "dueSoon";
    return "onTime";
  };

  const filteredSortedItems = useMemo(() => {
    const normalize = (s: string | undefined) => (s || "").toLowerCase().trim();
    let arr = sortedItems;
    if (filter) return arr.filter((it) => categorizeItem(it) === filter);
    return arr;
  }, [sortedItems, filter]);

  const statusChartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) {
      const s = (it.status || "Sem Status").toString().trim();
      if (!s) continue;
      counts.set(s, (counts.get(s) || 0) + 1);
    }
    const arr = Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    arr.sort((a, b) => (b.value as number) - (a.value as number));
    return arr;
  }, [items]);

  const responsavelChartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) {
      const r = (it.responsavel || "Sem Responsável").toString().trim();
      if (!r) continue;
      counts.set(r, (counts.get(r) || 0) + 1);
    }
    const arr = Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    arr.sort((a, b) => (b.value as number) - (a.value as number));
    return arr.slice(0, 10); // top 10
  }, [items]);

  const uniqueStatuses = useMemo(
    () => statusChartData.map((d) => d.name),
    [statusChartData]
  );
  const uniqueResponsaveis = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      const r = (it.responsavel || "").toString().trim();
      if (r) set.add(r);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [items]);

  // quick filters removed by user request

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} copiado`, description: value });
    } catch {
      toast({ title: `Não foi possível copiar ${label}` });
    }
  };

  const handleExportCSV = () => {
    if (!filteredSortedItems.length) {
      toast({ title: "Nada para exportar" });
      return;
    }
    const rows = filteredSortedItems.map((it) => {
      const dl = extractDeadline(it);
      return {
        responsavel: it.responsavel || "",
        os: extractOS(it) || "",
        orcamento: extractOrcamento(it) || "",
        status: it.status || "",
        prazo: dl ? dl.toISOString().slice(0, 10) : "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FollowUp");
    const filename = `followup_${(activeTab || "cliente").replace(/\s+/g, "_")}.csv`;
    XLSX.writeFile(wb, filename, { bookType: "csv" as any });
    toast({ title: "CSV gerado", description: filename });
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "l" });
      doc.setFontSize(12);
      doc.text(`Follow-up - ${activeTab}`, 10, 10);
      let y = 20;
      doc.setFontSize(9);
      doc.text("Responsável", 10, y);
      doc.text("OS", 60, y);
      doc.text("Orçamento", 90, y);
      doc.text("Status", 130, y);
      doc.text("Prazo", 200, y);
      y += 6;
      filteredSortedItems.slice(0, 300).forEach((it) => {
        const dl = extractDeadline(it);
        doc.text((it.responsavel || "").toString(), 10, y);
        doc.text((extractOS(it) || "").toString(), 60, y);
        doc.text((extractOrcamento(it) || "").toString(), 90, y);
        doc.text((it.status || "").toString().slice(0, 60), 130, y);
        doc.text(dl ? dl.toLocaleDateString("pt-BR") : "", 200, y);
        y += 6;
        if (y > 190) {
          doc.addPage();
          y = 20;
        }
      });
      const filename = `followup_${(activeTab || "cliente").replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);
      toast({ title: "PDF gerado", description: filename });
    } catch (e) {
      toast({ title: "Falha ao gerar PDF" });
    }
  };

  const filterMeta = useMemo(() => {
    if (filter === "onTime") return { label: "No prazo", color: "#BBDEFB" };
    if (filter === "overdue") return { label: "Atrasados", color: "#FFCDD2" };
    if (filter === "dueSoon")
      return { label: " Essa semana (≤ 5 dias)", color: "#FFF9C4" };
    return null;
  }, [filter]);

  return (
    <ResponsiveLayout
      title="Follow-up"
      subtitle=""
      titleRight={
        <div className="hidden xl:flex items-center gap-2">
          <div className="relative" ref={desktopBoxRef}>
            <Input
              placeholder="Buscar Cliente"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-64 text-sm pl-3 pr-3 bg-white/80"
              ref={inputRef}
              onFocus={() => setIsSuggestionsOpen(true)}
              onKeyDown={handleKeyDown}
            />
            {isSuggestionsOpen && suggestions.length > 0 && (
              <div
                ref={desktopListRef}
                role="listbox"
                className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-64 overflow-y-auto"
              >
                {suggestions.map((name, idx) => (
                  <div
                    key={name}
                    role="option"
                    aria-selected={highlightedIndex === idx}
                    className={`w-full text-left px-3 py-2 text-sm cursor-pointer ${
                      highlightedIndex === idx
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectSuggestion(name)}
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddCliente}
            disabled={!query.trim()}
            variant="outline"
            className="h-8 bg-white text-blue-600 hover:bg-blue-50"
          >
            Adicionar cliente
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" /> Acompanhar por cliente
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Mais opções"
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca (mobile/tablet) */}
          <div className="xl:hidden">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1" ref={mobileBoxRef}>
                <Input
                  placeholder="Digite o nome do cliente"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-3 pr-3 bg-white/80"
                  ref={inputRef}
                  onFocus={() => setIsSuggestionsOpen(true)}
                  onKeyDown={handleKeyDown}
                />
                {isSuggestionsOpen && suggestions.length > 0 && (
                  <div
                    ref={mobileListRef}
                    role="listbox"
                    className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-64 overflow-y-auto"
                  >
                    {suggestions.map((name, idx) => (
                      <div
                        key={name}
                        role="option"
                        aria-selected={highlightedIndex === idx}
                        className={`w-full text-left px-3 py-2 text-sm cursor-pointer ${
                          highlightedIndex === idx
                            ? "bg-gray-100"
                            : "hover:bg-gray-50"
                        }`}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectSuggestion(name)}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={handleAddCliente}
                disabled={!query.trim()}
                variant="outline"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Adicionar cliente
              </Button>
            </div>
          </div>

          {/* Abas de clientes */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full overflow-x-auto">
              {tabs.length === 0 ? (
                <div className="text-sm text-muted-foreground px-2 py-1">
                  Nenhum cliente adicionado. Use a busca acima para adicionar.
                </div>
              ) : (
                tabs.map((name) => (
                  <TabsTrigger
                    key={name}
                    value={name}
                    className={`group relative max-w-[200px] pr-6 truncate ${
                      draggingName === name ? "opacity-60" : ""
                    }`}
                    title={name}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingName(name);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggingName) reorderTabs(draggingName, name);
                      setDraggingName(null);
                    }}
                    onDragEnd={() => setDraggingName(null)}
                  >
                    {getFirstName(name)}
                    <span
                      role="button"
                      aria-label={`Fechar ${name}`}
                      tabIndex={0}
                      className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:block rounded-sm p-0 hover:bg-muted cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeClienteTab(name);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          removeClienteTab(name);
                        }
                      }}
                    >
                      <X className="h-2 w-2" />
                    </span>
                  </TabsTrigger>
                ))
              )}
            </TabsList>

            {tabs.map((name) => (
              <TabsContent key={name} value={name} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Coluna esquerda: contadores + tabela */}
                  <div className="space-y-4">
                    {/* Resumo de status */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        className={`rounded-md border-2 p-4 bg-white cursor-pointer transition ring-offset-2 ${
                          filter === "onTime" ? "ring-2 ring-[#BBDEFB]" : ""
                        }`}
                        style={{ borderColor: "#BBDEFB" }}
                        onClick={() =>
                          setFilter(filter === "onTime" ? null : "onTime")
                        }
                        role="button"
                        aria-pressed={filter === "onTime"}
                        tabIndex={0}
                      >
                        <div className="text-xs uppercase tracking-wide text-gray-700">
                          No prazo
                        </div>
                        <div className="text-2xl font-semibold">{onTime}</div>
                      </div>
                      <div
                        className={`rounded-md border-2 p-4 bg-white cursor-pointer transition ring-offset-2 ${
                          filter === "overdue" ? "ring-2 ring-[#FFCDD2]" : ""
                        }`}
                        style={{ borderColor: "#FFCDD2" }}
                        onClick={() =>
                          setFilter(filter === "overdue" ? null : "overdue")
                        }
                        role="button"
                        aria-pressed={filter === "overdue"}
                        tabIndex={0}
                      >
                        <div className="text-xs uppercase tracking-wide text-gray-700">
                          Atrasados
                        </div>
                        <div className="text-2xl font-semibold">{overdue}</div>
                      </div>
                      <div
                        className={`rounded-md border-2 p-4 bg-white cursor-pointer transition ring-offset-2 ${
                          filter === "dueSoon" ? "ring-2 ring-[#FFF9C4]" : ""
                        }`}
                        style={{ borderColor: "#FFF9C4" }}
                        onClick={() =>
                          setFilter(filter === "dueSoon" ? null : "dueSoon")
                        }
                        role="button"
                        aria-pressed={filter === "dueSoon"}
                        tabIndex={0}
                      >
                        <div className="text-xs uppercase tracking-wide text-gray-700">
                          Essa semana (≤ 5 dias)
                        </div>
                        <div className="text-2xl font-semibold">{dueSoon}</div>
                      </div>
                    </div>

                    {/* filtros rápidos removidos */}

                    {/* Filtro ativo */}
                    {filterMeta && (
                      <div
                        className="flex items-center justify-between rounded-md border-2 px-3 py-2 text-sm bg-white"
                        style={{ borderColor: filterMeta.color }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Filtro ativo:</span>
                          <span>{filterMeta.label}</span>
                        </div>
                        <button
                          onClick={() => setFilter(null)}
                          className="text-xs text-gray-600 hover:underline"
                        >
                          Limpar
                        </button>
                      </div>
                    )}

                    {/* Lista de itens */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm" aria-live="polite">
                        <thead>
                          <tr className="text-left text-xs text-gray-600 border-b">
                            <th className="py-2 pr-4">Responsável</th>
                            <th className="py-2 pr-4">OS / Orçamento</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4">Prazo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoadingItems ? (
                            Array.from({ length: 8 }).map((_, i) => (
                              <tr
                                key={`skeleton-${i}`}
                                className="border-b animate-pulse"
                              >
                                <td className="py-3 pr-4">
                                  <div className="h-3 w-24 bg-gray-200 rounded" />
                                </td>
                                <td className="py-3 pr-4">
                                  <div className="h-3 w-40 bg-gray-200 rounded" />
                                </td>
                                <td className="py-3 pr-4">
                                  <div className="h-3 w-28 bg-gray-200 rounded" />
                                </td>
                                <td className="py-3 pr-4">
                                  <div className="h-3 w-24 bg-gray-200 rounded" />
                                </td>
                              </tr>
                            ))
                          ) : filteredSortedItems.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="py-4 text-muted-foreground"
                              >
                                Nenhum item encontrado para este cliente.
                              </td>
                            </tr>
                          ) : (
                            filteredSortedItems.map((it) => {
                              const dl = extractDeadline(it);
                              const prazoDisplay = dl
                                ? dl.toLocaleDateString("pt-BR")
                                : "";
                              const orc = extractOrcamento(it) || "";
                              const osStr = extractOS(it) || "-";
                              const cat = categorizeItem(it);
                              return (
                                <tr
                                  key={String(it._id) + String(it.os)}
                                  className={`border-b hover:bg-muted/40 ${cat === "overdue" ? "bg-red-50" : ""}`}
                                >
                                  <td className="py-2 pr-4">
                                    {it.responsavel || "-"}
                                  </td>
                                  <td className="py-2 pr-4">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span
                                            className="cursor-pointer hover:underline"
                                            onClick={() =>
                                              copyToClipboard("OS", osStr)
                                            }
                                          >
                                            {osStr}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Copiar OS
                                        </TooltipContent>
                                      </Tooltip>
                                      {orc && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span
                                              className="text-xs text-muted-foreground ml-2 cursor-pointer hover:underline"
                                              onClick={() =>
                                                copyToClipboard(
                                                  "Orçamento",
                                                  orc
                                                )
                                              }
                                            >
                                              • {orc}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            Copiar Orçamento
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </TooltipProvider>
                                  </td>
                                  <td className="py-2 pr-4">
                                    {it.status || "-"}
                                  </td>
                                  <td className="py-2 pr-4">{prazoDisplay}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Autosave ativado: botão removido */}
                  </div>

                  {/* Coluna direita: gráficos */}
                  <div className="space-y-4">
                    <Card
                      className="bg-white border-2"
                      style={{ borderColor: "#BBDEFB" }}
                    >
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">
                          Distribuição por Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[260px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                              >
                                {statusChartData.map((_, idx) => (
                                  <Cell
                                    key={idx}
                                    fill={
                                      STATUS_COLORS[idx % STATUS_COLORS.length]
                                    }
                                  />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="bg-white border-2"
                      style={{ borderColor: "#FFCDD2" }}
                    >
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">
                          Itens por Responsável (Top 10)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[260px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={responsavelChartData}
                              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10 }}
                                interval={0}
                                angle={-20}
                                textAnchor="end"
                                height={50}
                              />
                              <YAxis allowDecimals={false} width={24} />
                              <RechartsTooltip />
                              <Bar
                                dataKey="value"
                                fill="#3B82F6"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetContent side="right" className="w-[360px] sm:w-[420px]">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 text-sm">
            <div className="text-muted-foreground">
              Opções futuras de filtros podem vir aqui (Status, Responsável,
              Prazo, etc.).
            </div>
            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilter(null)}
              >
                Limpar filtro de prazo
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </ResponsiveLayout>
  );
}
