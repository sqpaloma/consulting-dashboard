"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import {
  useDashboardItemsByCliente,
  useUniqueClientes,
} from "@/lib/convex-dashboard-client";
import { useAuth } from "@/hooks/use-auth";

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

export default function FollowUpPage() {
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [tabs, setTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  // Auto-complete
  const uniqueClientes = useUniqueClientes() || [];
  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return uniqueClientes.slice(0, 10);
    return uniqueClientes
      .filter((c) => c.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, uniqueClientes]);

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

  const saveTabs = () => {
    const key = `followup_clients_${user?.userId || "__anon__"}`;
    localStorage.setItem(key, JSON.stringify(tabs));
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
    setQuery(name);
    addClienteTab(name);
  };

  const handleAddCliente = () => addClienteTab(query);

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
                    className="truncate max-w-[200px]"
                  >
                    {name}
                  </TabsTrigger>
                ))
              )}
            </TabsList>

            {tabs.map((name) => (
              <TabsContent key={name} value={name} className="space-y-4">
                {/* Resumo de status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    className="rounded-md border p-4"
                    style={{ backgroundColor: "#BBDEFB" }}
                  >
                    <div className="text-xs uppercase tracking-wide text-gray-700">
                      No prazo
                    </div>
                    <div className="text-2xl font-semibold">{onTime}</div>
                  </div>
                  <div
                    className="rounded-md border p-4"
                    style={{ backgroundColor: "#FFCDD2" }}
                  >
                    <div className="text-xs uppercase tracking-wide text-gray-700">
                      Atrasados
                    </div>
                    <div className="text-2xl font-semibold">{overdue}</div>
                  </div>
                  <div
                    className="rounded-md border p-4"
                    style={{ backgroundColor: "#FFF9C4" }}
                  >
                    <div className="text-xs uppercase tracking-wide text-gray-700">
                      Vão atrasar (≤ 5 dias)
                    </div>
                    <div className="text-2xl font-semibold">{dueSoon}</div>
                  </div>
                </div>

                {/* Lista de itens */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-600 border-b">
                        <th className="py-2 pr-4">Responsável</th>
                        <th className="py-2 pr-4">OS</th>
                        <th className="py-2 pr-4">Orçamento</th>
                        <th className="py-2 pr-4">Prazo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 text-muted-foreground"
                          >
                            Nenhum item encontrado para este cliente.
                          </td>
                        </tr>
                      ) : (
                        items.map((it) => {
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
                              <td className="py-2 pr-4">{orc}</td>
                              <td className="py-2 pr-4">{prazoDisplay}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Salvar clientes */}
                <div className="pt-2 flex justify-end">
                  <Button onClick={saveTabs}>Salvar clientes</Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </ResponsiveLayout>
  );
}
