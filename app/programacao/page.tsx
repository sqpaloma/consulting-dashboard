"use client";

import { useMemo, useState, useEffect } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { AdminProtection } from "@/components/admin-protection";
import { useDashboardData } from "@/lib/convex-dashboard-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsavelFilter } from "@/components/dashboard/responsavel-filter";
import { useAdmin } from "@/hooks/use-admin";
import { MechanicColumn } from "@/components/programacao/mechanic-column";
import { ProgramacaoFilters } from "@/components/programacao/programacao-filters";
import {
  TEAMS_BY_CONSULTANT,
  getTeamForConsultant,
  getDepartmentsForConsultant,
  extractMechanicFromItem,
  isAnaliseStatus,
  isExecucaoStatus,
  getDueDate,
  startOfDay,
  getTodayItems,
  getThisWeekItems,
} from "@/lib/programacao-utils";

export default function ProgramacaoPage() {
  const dashboardData = useDashboardData();
  const { user, isAdmin } = useAdmin();
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("programacao:statusFilter") || "execucao"
      : "execucao"
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [databaseItems, setDatabaseItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

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
    const allowed = new Set(["execucao", "atrasados"]);
    if (!allowed.has(statusFilter)) setStatusFilter("execucao");
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

  // Aplicar filtro ativo (analise | execucao | atrasados) e filtro de data
  const visibleItems = useMemo(() => {
    let filtered = deptItems;

    // Aplicar filtro de status
    if (statusFilter === "analise")
      filtered = filtered.filter((i) => isAnaliseStatus(i.status));
    else if (statusFilter === "execucao")
      filtered = filtered.filter((i) => isExecucaoStatus(i.status));
    else if (statusFilter === "atrasados")
      filtered = filtered.filter((i) => {
        const d = getDueDate(i);
        return d
          ? startOfDay(d).getTime() < startOfDay(new Date()).getTime()
          : false;
      });

    // Aplicar filtro de data
    if (dateFilter === "today") {
      filtered = getTodayItems(filtered);
    } else if (dateFilter === "week") {
      filtered = getThisWeekItems(filtered);
    }

    return filtered;
  }, [deptItems, statusFilter, dateFilter]);

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
    return [...team]
      .filter((mechanic) => (itemsByMechanic[mechanic] || []).length > 0)
      .sort((a, b) => {
        const ca = (itemsByMechanic[a] || []).length;
        const cb = (itemsByMechanic[b] || []).length;
        if (cb !== ca) return cb - ca;
        return a.localeCompare(b);
      });
  }, [team, itemsByMechanic]);

  // Items for today and this week (for counts)
  const todayItems = useMemo(() => getTodayItems(deptItems), [deptItems]);
  const thisWeekItems = useMemo(() => getThisWeekItems(deptItems), [deptItems]);

  const columnCount = Math.max(columns.length, 1);

  const role = user?.role;
  const isManagerOrAbove = isAdmin || role === "gerente" || role === "diretor";

  return (
    <AdminProtection
      allowedRoles={["consultor", "gerente", "diretor", "admin"]}
    >
      <ResponsiveLayout fullWidth={true}>
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
          <Card className="bg-white h-[800px] flex flex-col w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-gray-800">
                  {selectedConsultant
                    ? ""
                    : isManagerOrAbove
                      ? "Selecione um consultor para ver a programação"
                      : "Carregando sua programação..."}
                </CardTitle>
              </div>
              {selectedConsultant && (
                <div className="mt-3">
                  <ProgramacaoFilters
                    departments={departments}
                    selectedDepartment={selectedDepartment}
                    onDepartmentChange={setSelectedDepartment}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    kpis={kpis}
                    totalItems={deptItems.length}
                    showDepartmentFilter={departments.length > 1 && isManagerOrAbove}
                    dateFilter={dateFilter}
                    onDateFilterChange={setDateFilter}
                    todayCount={todayItems.length}
                    weekCount={thisWeekItems.length}
                    consultant={selectedConsultant}
                    mechanics={columns.map(col => ({
                      name: col,
                      items: itemsByMechanic[col] || []
                    }))}
                  />
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
                  {columns.map((colKey) => (
                    <MechanicColumn
                      key={colKey}
                      mechanic={colKey}
                      items={itemsByMechanic[colKey] || []}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    </AdminProtection>
  );
}
