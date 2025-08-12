"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X } from "lucide-react";
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
  const keys = [
    "orcamento",
    "orçamento",
    "nro orc",
    "numero orc",
    "num orc",
    "orc",
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
          const low = val.toLowerCase();
          if (low.includes("orc") || low.includes("orç")) {
            const m = val.match(/\d{3,}/);
            if (m?.[0]) return m[0];
          }
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

  const [query, setQuery] = useState("");
  const [tabs, setTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [filter, setFilter] = useState<ItemFilter>(null);
  const [draggingName, setDraggingName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-complete
  const uniqueClientes = useUniqueClientes() || [];
  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim();
    const remaining = uniqueClientes.filter((c) => !tabs.includes(c));
    if (!q) return remaining.slice(0, 10);
    return remaining.filter((c) => c.toLowerCase().includes(q)).slice(0, 10);
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
  const items: DashboardItemLike[] =
    useDashboardItemsByCliente(activeTab || "") || [];

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
  };

  const handleAddCliente = () => {
    const val = query.trim();
    if (!val) return;
    addClienteTab(val);
    setQuery("");
    inputRef.current?.blur();
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
    if (!filter) return sortedItems;
    return sortedItems.filter((it) => categorizeItem(it) === filter);
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

  const filterMeta = useMemo(() => {
    if (filter === "onTime") return { label: "No prazo", color: "#BBDEFB" };
    if (filter === "overdue") return { label: "Atrasados", color: "#FFCDD2" };
    if (filter === "dueSoon")
      return { label: "Vão atrasar (≤ 5 dias)", color: "#FFF9C4" };
    return null;
  }, [filter]);

  return (
    <ResponsiveLayout
      title="Follow-up"
      subtitle="Acompanhe por cliente"
      titleRight={
        <div className="hidden xl:flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Buscar Cliente"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-64 text-sm pl-3 pr-3"
              ref={inputRef}
            />
            {query && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow">
                {suggestions.map((name) => (
                  <button
                    key={name}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => handleSelectSuggestion(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddCliente}
            disabled={!query.trim()}
            className="h-8"
          >
            Adicionar cliente
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca (mobile/tablet) */}
          <div className="xl:hidden">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  placeholder="Digite o nome do cliente"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-3 pr-3"
                  ref={inputRef}
                />
                {query && suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow">
                    {suggestions.map((name) => (
                      <button
                        key={name}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                        onClick={() => handleSelectSuggestion(name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleAddCliente} disabled={!query.trim()}>
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
                          Vão atrasar (≤ 5 dias)
                        </div>
                        <div className="text-2xl font-semibold">{dueSoon}</div>
                      </div>
                    </div>

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
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-gray-600 border-b">
                            <th className="py-2 pr-4">Responsável</th>
                            <th className="py-2 pr-4">OS</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4">Orçamento</th>
                            <th className="py-2 pr-4">Prazo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSortedItems.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
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
                              return (
                                <tr
                                  key={String(it._id) + String(it.os)}
                                  className="border-b hover:bg-muted/40"
                                >
                                  <td className="py-2 pr-4">
                                    {it.responsavel || "-"}
                                  </td>
                                  <td className="py-2 pr-4">{it.os || "-"}</td>
                                  <td className="py-2 pr-4">
                                    {it.status || "-"}
                                  </td>
                                  <td className="py-2 pr-4">{orc}</td>
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
    </ResponsiveLayout>
  );
}
