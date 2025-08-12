"use client";

import { useMemo, useState, useEffect } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { AdminProtection } from "@/components/admin-protection";
import { useDashboardData } from "@/hooks/use-dashboard-data";
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

function getCardStyle(status: string): string {
  const s = (status || "").toLowerCase();
  if (s.includes("analise") || s.includes("análise") || s.includes("revis")) {
    return "bg-yellow-50 border-yellow-200";
  }
  // aguardando aprovação / pendente
  return "bg-rose-50 border-rose-200";
}

export default function ProgramacaoPage() {
  const { processedItems } = useDashboardData();
  const { user, isAdmin } = useAdmin();
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(
    null
  );

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

  // Filtra apenas Análise e Aguardando Aprovação
  const filtered = useMemo(() => {
    return (processedItems || []).filter((item: any) => {
      const s = (item.status || "").toLowerCase();
      const isAnalise =
        s.includes("analise") || s.includes("análise") || s.includes("revis");
      const isAprov =
        s.includes("aguard") || s.includes("pendente") || s.includes("aprova");
      return isAnalise || isAprov;
    });
  }, [processedItems]);

  const team = useMemo(
    () => getTeamForConsultant(selectedConsultant),
    [selectedConsultant]
  );

  // Agrupa itens por mecânico do time selecionado
  const itemsByMechanic = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (!selectedConsultant) return map;
    const consultantLower = selectedConsultant.toLowerCase();

    for (const mec of team) map[mec] = [];

    for (const item of filtered) {
      const respLower = (item.responsavel || "").toLowerCase();
      if (!respLower.includes(consultantLower)) continue;
      const mech = extractMechanicFromItem(item, team);
      if (mech && map[mech]) {
        map[mech].push(item);
      }
    }
    return map;
  }, [filtered, selectedConsultant, team]);

  const columnCount = Math.max(team.length, 1);

  const role = user?.role;
  const isManagerOrAbove = isAdmin || role === "gerente" || role === "diretor";

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
              processedItems={processedItems || []}
            />
          )}
        </div>

        <div className="mt-4">
          <Card className="bg-white h-[650px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-gray-800">
                {selectedConsultant
                  ? `Consultor: ${selectedConsultant}`
                  : isManagerOrAbove
                    ? "Selecione um consultor para ver a programação"
                    : "Carregando sua programação..."}
              </CardTitle>
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
                  {team.map((mec) => {
                    const items = itemsByMechanic[mec] || [];
                    return (
                      <div
                        key={mec}
                        className="flex flex-col bg-gray-50 rounded-md p-2"
                      >
                        <div className="text-xs font-semibold mb-4 flex items-center justify-between text-gray-700">
                          <div className="flex-1 text-center">
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
                              {items.map((activity, idx) => (
                                <div key={idx} className="px-1">
                                  <div
                                    className={`p-2 rounded-md text-xs border ${getCardStyle(activity.status)}`}
                                  >
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-800 truncate">
                                          {activity.titulo || activity.os}
                                        </span>
                                      </div>
                                      <div className="mt-1 text-[11px] text-gray-600 truncate">
                                        {activity.cliente}
                                      </div>
                                      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600">
                                        <span>{activity.status}</span>
                                        <span>
                                          {activity.data ||
                                            activity.prazo ||
                                            ""}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
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
