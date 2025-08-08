"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User } from "lucide-react";
import {
  DEPARTAMENTOS,
  getDepartamentoByResponsavel,
  getResponsavelInfo,
} from "./types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DepartamentoInfoProps {
  processedItems: any[];
  filteredByResponsavel?: string | null;
  className?: string;
}

// Helpers locais de time dos consultores (mecânicos)
const TEAMS_BY_CONSULTANT: Record<string, string[]> = {
  paloma: [
    "GUSTAVOBEL",
    "GUILHERME",
    "EDUARDO",
    "YURI",
    "VAGNER",
    "FABIO F",
    "NIVALDO",
  ],
  lucas: [
    "ALEXANDRE",
    "ALEXSANDRO",
    "ROBERTO P",
    "KAUAN",
    "KAUA",
    "MARCELINO",
    "LEANDRO",
    "RODRIGO N",
  ],
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

function getTeamForConsultant(name: string | undefined | null): string[] {
  const n = (name || "").toLowerCase();
  if (n.includes("paloma")) return TEAMS_BY_CONSULTANT.paloma;
  if (n.includes("lucas")) return TEAMS_BY_CONSULTANT.lucas;
  if (n.includes("marcelo")) return TEAMS_BY_CONSULTANT.marcelo;
  if (n.includes("carlinhos")) return TEAMS_BY_CONSULTANT.carlinhos;
  return [];
}

function formatPersonName(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseBRDate(input: string): Date | null {
  if (!input) return null;
  // Try ISO or Date.parse first
  const direct = new Date(input);
  if (!isNaN(direct.getTime())) return direct;
  // Try dd/MM/yyyy
  const m = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const y = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
    const dt = new Date(y, mo, d, 23, 59, 59);
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

function isInExecution(status: string | undefined | null): boolean {
  const s = (status || "").toLowerCase();
  return (
    s.includes("execu") || // cobre "execução" e "execucao"
    s.includes("em andamento") ||
    s.includes("fazendo")
  );
}

function isOverdue(item: any): boolean {
  const dueStr = (item.data_registro || item.prazo || "").toString().trim();
  const due = parseBRDate(dueStr);
  if (!due) return false;
  const today = new Date();
  // Comparar somente data
  const dueYMD = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const todayYMD = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return dueYMD.getTime() < todayYMD.getTime();
}

function extractMechanicFromItem(
  item: any,
  consultantName: string,
  team: string[]
): string | null {
  if (!item) return null;
  const teamSet = new Set(team.map((t) => t.toUpperCase().trim()));
  // rawData pode ser array ou array de objetos
  const raw = item.rawData;
  if (!raw) return null;

  // Se for um array "linha" (strings ou valores)
  if (Array.isArray(raw)) {
    for (const val of raw) {
      if (val == null) continue;
      const s = val.toString().toUpperCase().trim();
      if (teamSet.has(s)) return s;
    }
  }

  // Se for um array de objetos
  if (Array.isArray(raw)) {
    for (const val of raw) {
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
        // Se não achou em campos conhecidos, varre todos os valores string
        for (const k of Object.keys(val)) {
          const v = (val as any)[k];
          if (typeof v === "string" && v.trim()) {
            const up = v.toUpperCase().trim();
            if (teamSet.has(up)) return up;
          }
        }
      }
    }
  }

  return null;
}

function computeMechanicCounts(
  processedItems: any[],
  consultantName: string,
  mechanicUpper: string,
  team: string[]
): { execCount: number; overdueCount: number } {
  const consultantLower = (consultantName || "").toLowerCase().trim();
  let execCount = 0;
  let overdueCount = 0;

  for (const item of processedItems) {
    const respLower = (item.responsavel || "").toLowerCase();
    if (!respLower.includes(consultantLower)) continue;
    if (!isInExecution(item.status)) continue;

    const mech = extractMechanicFromItem(item, consultantName, team);
    if (!mech) continue;
    if (mech !== mechanicUpper) continue;

    execCount += 1;
    if (isOverdue(item)) overdueCount += 1;
  }

  return { execCount, overdueCount };
}

export function DepartamentoInfo({
  processedItems,
  filteredByResponsavel,
  className,
}: DepartamentoInfoProps) {
  const getDepartamentoStats = () => {
    if (filteredByResponsavel) {
      const responsavelInfo = getResponsavelInfo(filteredByResponsavel);
      const departamento = getDepartamentoByResponsavel(filteredByResponsavel);

      if (!responsavelInfo) return null as any;

      const itensDoResponsavel = processedItems.filter(
        (item) =>
          item.responsavel?.toLowerCase() ===
          filteredByResponsavel.toLowerCase()
      );

      return {
        responsavel: responsavelInfo,
        departamento,
        totalItens: itensDoResponsavel.length,
        itensCompletos: itensDoResponsavel.filter((item) => {
          const status = item.status?.toLowerCase() || "";
          return (
            status.includes("pronto") ||
            status.includes("concluído") ||
            status.includes("concluido") ||
            status.includes("finalizado") ||
            status.includes("entregue") ||
            status.includes("completo")
          );
        }).length,
      } as any;
    }

    // Estatísticas gerais por departamento
    const statsPorDepartamento = DEPARTAMENTOS.map((dep) => {
      const itensDoDepto = processedItems.filter((item) => {
        const itemResponsavel = item.responsavel?.toLowerCase() || "";
        return itemResponsavel === dep.responsavel.toLowerCase();
      });

      const itensCompletos = itensDoDepto.filter((item) => {
        const status = item.status?.toLowerCase() || "";
        return (
          status.includes("pronto") ||
          status.includes("concluído") ||
          status.includes("concluido") ||
          status.includes("finalizado") ||
          status.includes("entregue") ||
          status.includes("completo")
        );
      });

      return {
        ...dep,
        totalItens: itensDoDepto.length,
        itensCompletos: itensCompletos.length,
      };
    });

    return { statsPorDepartamento } as any;
  };

  const stats: any = getDepartamentoStats();

  if (!stats) return null;

  if ("responsavel" in stats) {
    // Visão individual do responsável
    const {
      responsavel,
      departamento,
      totalItens = 0,
      itensCompletos = 0,
    } = stats as {
      responsavel: any;
      departamento: any;
      totalItens?: number;
      itensCompletos?: number;
    };

    const teamList = !responsavel.isGerente
      ? getTeamForConsultant(responsavel.nome)
      : [];

    return (
      <Card
        className={`bg-white border-gray-200 text-gray-900 flex flex-col h-full ${className || ""}`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {responsavel.isGerente ? (
              <Building className="h-5 w-5 text-amber-400" />
            ) : (
              <User className="h-5 w-5 text-blue-400" />
            )}
            {responsavel.nome}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {responsavel.isGerente ? "Posição" : "Departamento"}:
            </p>
            <p className="font-medium text-gray-900">
              {responsavel.isGerente
                ? "Gerente Geral"
                : departamento?.nome || responsavel.departamento}
            </p>
          </div>

          {departamento && !responsavel.isGerente && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Descrição:</p>
              <p className="text-sm text-gray-700">{departamento.descricao}</p>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-center">
              <p className="text-xs text-gray-600 mr-2">Total de Itens:</p>
              <p className="text-lg font-bold text-gray-900">{totalItens}</p>
            </div>
          </div>

          {!responsavel.isGerente && teamList.length > 0 && (
            <Accordion type="single" collapsible className="w-full pt-2">
              <AccordionItem value="team">
                <AccordionTrigger className="text-sm">
                  Ver mecânicos do time
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col gap-2">
                    {teamList.map((m) => {
                      const mechanicUpper = m.toUpperCase();
                      const counts = computeMechanicCounts(
                        processedItems,
                        responsavel.nome,
                        mechanicUpper,
                        teamList
                      );
                      return (
                        <li
                          key={m}
                          className="text-sm text-gray-700 flex items-center justify-between"
                        >
                          <span>{formatPersonName(m)}</span>
                          <span className="text-xs">
                            <span className="text-gray-700 font-medium mr-2">
                              {counts.execCount}
                            </span>
                            <span className="text-red-600 font-semibold">
                              {counts.overdueCount}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
      </Card>
    );
  }

  // Visão geral dos departamentos
  return (
    <Card
      className={`bg-white border-gray-200 text-gray-900 flex flex-col h-full ${className || ""}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5 text-amber-400" />
          Departamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <Accordion type="multiple" className="w-full">
          {stats.statsPorDepartamento
            .filter((dep: any) => dep.totalItens > 0)
            .sort((a: any, b: any) => b.totalItens - a.totalItens)
            .map((dep: any) => {
              const team = getTeamForConsultant(dep.responsavel);
              return (
                <AccordionItem key={dep.id} value={dep.id}>
                  <AccordionTrigger className="px-3">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {dep.responsavel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 text-left">
                          {dep.nome}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-right">
                            <p className="text-xs text-gray-500">Total:</p>
                            <p className="text-sm font-bold text-gray-900">
                              {dep.totalItens}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  {team.length > 0 && (
                    <AccordionContent>
                      <div className="px-3">
                        <p className="text-xs text-gray-600 mb-2">
                          Mecânicos do time
                        </p>
                        <ul className="flex flex-col gap-2">
                          {team.map((m) => {
                            const mechanicUpper = m.toUpperCase();
                            const counts = computeMechanicCounts(
                              processedItems,
                              dep.responsavel,
                              mechanicUpper,
                              team
                            );
                            return (
                              <li
                                key={m}
                                className="text-sm text-gray-700 flex items-center justify-between"
                              >
                                <span>{formatPersonName(m)}</span>
                                <span className="text-xs">
                                  <span className="text-gray-700 font-medium mr-2">
                                    {counts.execCount}
                                  </span>
                                  <span className="text-red-600 font-semibold">
                                    {counts.overdueCount}
                                  </span>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </AccordionContent>
                  )}
                </AccordionItem>
              );
            })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
