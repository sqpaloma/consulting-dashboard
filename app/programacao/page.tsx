"use client";

import { useMemo, useState, useEffect } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { AdminProtection } from "@/components/admin-protection";
import { useDashboardData } from "@/lib/convex-dashboard-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsavelFilter } from "@/components/dashboard/responsavel-filter";
import { useAdmin } from "@/hooks/use-admin";

// Helpers locais (times por consultor + extração de mecânico dos itens)
const TEAMS_BY_CONSULTANT: Record<string, string[]> = {
  "paloma-hidraulicos": ["GUSTAVOBEL", "EDUARDO", "YURI", "GUILHERME"],
  "paloma-engrenagens": ["VAGNER", "FABIO F", "NIVALDO"],
  "lucas-bomba": ["ALEXANDRE", "ALEXSANDRO", "ROBERTO P", "KAUA", "MARCELINO"],
  "lucas-comandos": ["LEANDRO", "RODRIGO N"],
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

function getTeamForConsultant(name?: string | null): string[] {
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

function getDepartmentsForConsultant(
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

function extractMechanicFromItem(item: any, team: string[]): string | null {
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

function formatPersonName(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isAnaliseStatus(status: string): boolean {
  const s = (status || "").toLowerCase();
  return s.includes("analise") || s.includes("análise") || s.includes("revis");
}

function isExecucaoStatus(status: string): boolean {
  const s = (status || "").toLowerCase();
  return s.includes("execu");
}

function parseDateLike(value?: string | null): Date | null {
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

function getDueDate(activity: any): Date | null {
  return (
    parseDateLike(activity?.data) || parseDateLike(activity?.prazo) || null
  );
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDueLabel(due: Date | null): {
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

function getCardStyle(status: string): string {
  const s = (status || "").toLowerCase();
  if (isAnaliseStatus(s)) {
    return "bg-yellow-50 border border-yellow-200 border-l-4 border-l-yellow-400";
  }
  if (isExecucaoStatus(s)) {
    return "bg-emerald-50 border border-emerald-200 border-l-4 border-l-emerald-400";
  }
  return "bg-gray-50 border border-gray-200 border-l-4 border-l-gray-400";
}

export default function ProgramacaoPage() {
  const dashboardData = useDashboardData();
  const { user, isAdmin } = useAdmin();
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("programacao:statusFilter") || "analise"
      : "analise"
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [databaseItems, setDatabaseItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Restaurar consultor salvo
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("programacao:selectedConsultant");
    if (saved && !selectedConsultant) {
      setSelectedConsultant(saved);
    }
  }, [selectedConsultant]);

  // Restaurar departamento salvo ao trocar de consultor
  useEffect(() => {
    if (!selectedConsultant || typeof window === "undefined") return;
    const key = `programacao:dept:${selectedConsultant.toLowerCase()}`;
    const savedDept = localStorage.getItem(key);
    setSelectedDepartment(savedDept || null);
  }, [selectedConsultant]);

  // Sanitiza filtro salvo para os permitidos
  useEffect(() => {
    const allowed = new Set(["all", "analise", "execucao", "atrasados"]);
    if (!allowed.has(statusFilter)) setStatusFilter("analise");
    if (statusFilter === "execução") setStatusFilter("execucao");
  }, []);

  // Definir automaticamente o responsável do próprio consultor ao entrar
  useEffect(() => {
    if (!user) return;
    const role = user.role;
    const isConsultant = role === "consultor" && !isAdmin;

    if (isConsultant) {
      const ownFirstName = user.name?.split(" ")[0] || "";
      if (ownFirstName && !selectedConsultant) {
        setSelectedConsultant(ownFirstName);
      }
    }
  }, [user, isAdmin, selectedConsultant]);

  // Carrega itens do banco de dados (mesma fonte do ActivityPlanner)
  useEffect(() => {
    const loadDb = async () => {
      setIsLoading(true);
      try {
        const items = (dashboardData as any)?.items || [];
        const dbItems = items
          .filter((item: any) => item.dataRegistro)
          .map((item: any) => ({
            id: item.os,
            os: item.os,
            titulo: item.titulo || `Item ${item.os}`,
            cliente: item.cliente || "Cliente não informado",
            responsavel: item.responsavel || "Não informado",
            status: item.status,
            prazo: item.dataRegistro || "",
            data: item.dataRegistro || "",
            rawData: item.rawData || [],
          }));
        setDatabaseItems(dbItems);
      } catch (e) {
        // noop
      } finally {
        setIsLoading(false);
      }
    };
    loadDb();
  }, [dashboardData]);

  // Persistir preferências
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedConsultant)
      localStorage.setItem(
        "programacao:selectedConsultant",
        selectedConsultant
      );
  }, [selectedConsultant]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (statusFilter)
      localStorage.setItem("programacao:statusFilter", statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedConsultant || typeof window === "undefined") return;
    const key = `programacao:dept:${selectedConsultant.toLowerCase()}`;
    if (selectedDepartment) localStorage.setItem(key, selectedDepartment);
    else localStorage.removeItem(key);
  }, [selectedDepartment, selectedConsultant]);

  // Subconjunto por status (apenas Análise e Execução)
  const statusSubset = useMemo(() => {
    return (databaseItems || []).filter((item: any) => {
      return isAnaliseStatus(item.status) || isExecucaoStatus(item.status);
    });
  }, [databaseItems]);

  // Itens do consultor selecionado
  const consultantItems = useMemo(() => {
    if (!selectedConsultant) return [] as any[];
    const consultantLower = selectedConsultant.toLowerCase();
    return statusSubset.filter((item: any) => {
      const respLower = (item.responsavel || "").toLowerCase();
      return respLower.includes(consultantLower);
    });
  }, [statusSubset, selectedConsultant]);

  // Departamentos do consultor e time filtrado
  const departments = useMemo(
    () => getDepartmentsForConsultant(selectedConsultant),
    [selectedConsultant]
  );

  const team = useMemo(() => {
    const hasDepartments = (departments || []).length > 1;
    const roleNow = user?.role;
    const canChooseDept =
      isAdmin || roleNow === "gerente" || roleNow === "diretor";
    if (canChooseDept && hasDepartments && selectedDepartment) {
      return TEAMS_BY_CONSULTANT[selectedDepartment] || [];
    }
    return getTeamForConsultant(selectedConsultant);
  }, [
    departments,
    selectedDepartment,
    selectedConsultant,
    user?.role,
    isAdmin,
  ]);

  // Itens do consultor filtrados pelo departamento (mecânicos do time atual)
  const deptItems = useMemo(() => {
    if (!selectedConsultant) return [] as any[];
    return consultantItems.filter((item) => {
      const mech = extractMechanicFromItem(item, team);
      return !!(mech && team.includes(mech));
    });
  }, [consultantItems, team, selectedConsultant]);

  // KPIs (somente análise, execução, atrasados)
  const kpis = useMemo(() => {
    let analise = 0;
    let execucao = 0;
    let atrasados = 0;
    for (const it of deptItems) {
      if (isAnaliseStatus(it.status)) analise++;
      if (isExecucaoStatus(it.status)) execucao++;
      const due = getDueDate(it);
      if (due && startOfDay(due).getTime() < startOfDay(new Date()).getTime())
        atrasados++;
    }
    return { analise, execucao, atrasados };
  }, [deptItems]);

  // Aplicar filtro ativo (analise | execucao | atrasados)
  const visibleItems = useMemo(() => {
    if (statusFilter === "all") return deptItems;
    if (statusFilter === "analise")
      return deptItems.filter((i) => isAnaliseStatus(i.status));
    if (statusFilter === "execucao")
      return deptItems.filter((i) => isExecucaoStatus(i.status));
    if (statusFilter === "atrasados")
      return deptItems.filter((i) => {
        const d = getDueDate(i);
        return d
          ? startOfDay(d).getTime() < startOfDay(new Date()).getTime()
          : false;
      });
    return deptItems;
  }, [deptItems, statusFilter]);

  // Se usuário não for gerente/admin, garantir que não há seleção de departamento persistida
  useEffect(() => {
    const roleNow = user?.role;
    const canChooseDept =
      isAdmin || roleNow === "gerente" || roleNow === "diretor";
    if (!canChooseDept && selectedDepartment) {
      setSelectedDepartment(null);
    }
  }, [user?.role, isAdmin]);

  // Agrupa itens por mecânico do time selecionado
  const itemsByMechanic = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (!selectedConsultant) return map;

    for (const mec of team) map[mec] = [];

    for (const item of visibleItems) {
      const mech = extractMechanicFromItem(item, team);
      if (mech && map[mech]) map[mech].push(item);
    }
    return map;
  }, [visibleItems, selectedConsultant, team]);

  const columns = useMemo(() => {
    return [...team].sort((a, b) => {
      const ca = (itemsByMechanic[a] || []).length;
      const cb = (itemsByMechanic[b] || []).length;
      if (cb !== ca) return cb - ca;
      return a.localeCompare(b);
    });
  }, [team, itemsByMechanic]);

  const columnCount = Math.max(columns.length, 1);

  const role = user?.role;
  const isManagerOrAbove = isAdmin || role === "gerente" || role === "diretor";

  function StatusChip({ value }: { value: string }) {
    const analise = isAnaliseStatus(value);
    const exec = isExecucaoStatus(value);
    const color = analise
      ? "bg-yellow-100 text-yellow-800"
      : exec
        ? "bg-emerald-100 text-emerald-800"
        : "bg-gray-100 text-gray-700";
    const dot = analise
      ? "bg-yellow-500"
      : exec
        ? "bg-emerald-500"
        : "bg-gray-400";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${color}`}
      >
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
        {value}
      </span>
    );
  }

  function FilterChip({ id, label }: { id: string; label: string }) {
    const active = statusFilter === id;
    return (
      <button
        onClick={() => setStatusFilter(id)}
        className={`px-2 py-1 rounded-md text-xs border transition-colors ${
          active
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <AdminProtection
      allowedRoles={["consultor", "gerente", "diretor", "admin"]}
    >
      <ResponsiveLayout>
        <div className="mt-6 sm:mt-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Programação</h1>
          {isManagerOrAbove && (
            <ResponsavelFilter
              onFilterChange={(r) => setSelectedConsultant(r)}
              processedItems={databaseItems}
            />
          )}
        </div>

        <div className="mt-4">
          <Card className="bg-white h-[800px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-gray-800">
                  {selectedConsultant
                    ? `Consultor: ${selectedConsultant}`
                    : isManagerOrAbove
                      ? "Selecione um consultor para ver a programação"
                      : "Carregando sua programação..."}
                </CardTitle>
                {selectedConsultant &&
                  departments.length > 1 &&
                  isManagerOrAbove && (
                    <div className="flex items-center">
                      <label
                        className="text-xs text-gray-600 mr-2"
                        htmlFor="deptSelect"
                      >
                        Departamento:
                      </label>
                      <select
                        id="deptSelect"
                        className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700"
                        value={selectedDepartment || ""}
                        onChange={(e) =>
                          setSelectedDepartment(e.target.value || null)
                        }
                      >
                        <option value="">Todos</option>
                        {departments.map((d) => (
                          <option key={d.key} value={d.key}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
              </div>
              {selectedConsultant && (
                <div className="mt-3 flex flex-wrap items-center gap-2 justify-end">
                  <div className="flex items-center gap-2">
                    <label
                      className="text-xs text-gray-600"
                      htmlFor="statusSelect"
                    >
                      Status:
                    </label>
                    <select
                      id="statusSelect"
                      className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Todos ({deptItems.length})</option>
                      <option value="analise">Análise ({kpis.analise})</option>
                      <option value="execucao">
                        Em execução ({kpis.execucao})
                      </option>
                      <option value="atrasados">
                        Atrasados ({kpis.atrasados})
                      </option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className="px-2 py-1 rounded-md text-xs border bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-4">
              {!selectedConsultant ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  {isManagerOrAbove ? "Nenhum consultor selecionado" : ""}
                </div>
              ) : (
                <div
                  className="h-full grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  }}
                >
                  {columns.map((colKey) => {
                    const mec = colKey;
                    const rawItems = itemsByMechanic[colKey] || [];
                    const items = [...rawItems].sort((a, b) => {
                      const da = getDueDate(a);
                      const db = getDueDate(b);
                      const ta = da ? startOfDay(da).getTime() : Infinity;
                      const tb = db ? startOfDay(db).getTime() : Infinity;
                      if (ta !== tb) return ta - tb; // data crescente
                      const sa = a.status || "";
                      const sb = b.status || "";
                      const saScore = isAnaliseStatus(sa)
                        ? 0
                        : isExecucaoStatus(sa)
                          ? 1
                          : 2;
                      const sbScore = isAnaliseStatus(sb)
                        ? 0
                        : isExecucaoStatus(sb)
                          ? 1
                          : 2;
                      return saScore - sbScore;
                    });
                    return (
                      <div
                        key={colKey}
                        className="flex flex-col bg-gray-50 rounded-md p-2 h-full overflow-hidden"
                      >
                        <div className="text-xs font-semibold mb-4 flex items-center justify-between text-gray-700 sticky top-0 z-10 bg-gray-50">
                          <div
                            className="flex-1 text-center"
                            title={formatPersonName(mec)}
                          >
                            {formatPersonName(mec)}
                          </div>
                          <div className="bg-gray-200 text-gray-600 rounded-full px-2 py-1 text-xs min-w-[20px] text-center">
                            {items.length}
                          </div>
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto">
                          {items.length === 0 ? (
                            <div className="text-xs text-gray-400 text-center py-6">
                              Sem atividades
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {items.map((activity, idx) => {
                                const due = getDueDate(activity);
                                const { label: dueLabel, isOverdue } =
                                  formatDueLabel(due);
                                const titleFull =
                                  activity.titulo || activity.os;
                                const clientFull = activity.cliente;
                                const cardStyle = isOverdue
                                  ? "bg-red-50 border border-red-200 border-l-4 border-l-red-500"
                                  : getCardStyle(activity.status);
                                return (
                                  <div key={idx} className="px-1">
                                    <div
                                      className={`p-2 rounded-md text-xs ${cardStyle}`}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                          <span
                                            className="font-medium text-gray-800 truncate"
                                            title={titleFull}
                                          >
                                            {activity.titulo || activity.os}
                                          </span>
                                          <StatusChip value={activity.status} />
                                        </div>
                                        <div
                                          className="mt-1 text-[11px] text-gray-600 truncate"
                                          title={clientFull}
                                        >
                                          {activity.cliente}
                                        </div>
                                        <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600">
                                          <span
                                            className={
                                              isOverdue
                                                ? "text-red-600 font-medium"
                                                : ""
                                            }
                                          >
                                            {dueLabel}
                                          </span>
                                          <span>
                                            {activity.data ||
                                              activity.prazo ||
                                              ""}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    </AdminProtection>
  );
}
