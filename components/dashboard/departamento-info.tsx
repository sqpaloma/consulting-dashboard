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
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DepartamentoInfoProps {
  processedItems: any[];
  filteredByResponsavel?: string | null;
  className?: string;
}

// Helpers locais de time dos consultores (mecânicos)
const TEAMS_BY_CONSULTANT: Record<string, string[]> = {
  "paloma-pistoes": ["GUSTAVOBEL", "EDUARDO", "YURI", "GUILHERME"],
  "paloma-hidraulicos": ["GUSTAVOBEL", "EDUARDO", "YURI", "GUILHERME"],
  "paloma-engrenagens": ["GUSTAVOBEL", "EDUARDO", "YURI", "GUILHERME"],
  "rafael-engrenagens": ["VAGNER", "FABIO F", "NIVALDO"],
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
  avulsos: ["OUTROS", "GERAL"],
};

function getTeamForConsultant(
  name: string | undefined | null,
  departmentType?: string
): string[] {
  const n = (name || "").toLowerCase();
  if (n.includes("paloma")) {
    if (departmentType === "hidraulicos")
      return TEAMS_BY_CONSULTANT["paloma-pistoes"];
    if (departmentType === "engrenagens")
      return TEAMS_BY_CONSULTANT["rafael-engrenagens"];
    return [
      ...TEAMS_BY_CONSULTANT["paloma-pistoes"],
      ...TEAMS_BY_CONSULTANT["rafael-engrenagens"],
    ];
  }
  if (n.includes("lucas")) {
    if (departmentType === "bomba") return TEAMS_BY_CONSULTANT["lucas-bomba"];
    if (departmentType === "comandos")
      return TEAMS_BY_CONSULTANT["lucas-comandos"];
    return [
      ...TEAMS_BY_CONSULTANT["lucas-bomba"],
      ...TEAMS_BY_CONSULTANT["lucas-comandos"],
    ];
  }
  if (n.includes("marcelo")) return TEAMS_BY_CONSULTANT.marcelo;
  if (n.includes("carlinhos")) return TEAMS_BY_CONSULTANT.carlinhos;
  if (n.includes("avulso") || n.includes("geral") || n.includes("outros"))
    return TEAMS_BY_CONSULTANT.avulsos;
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

// Função para fazer parse de diferentes formatos de data (baseada no dashboard-metrics.tsx)
function parseBRDate(dateString: string): Date | null {
  if (!dateString) return null;

  // Remove espaços extras
  const cleanDate = dateString.toString().trim();

  // Tenta diferentes formatos
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/mm/yyyy
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // dd-mm-yyyy
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // yyyy-mm-dd
    /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // dd/mm/yy
  ];

  for (const format of formats) {
    const match = cleanDate.match(format);
    if (match) {
      if (format.source.includes("yyyy")) {
        // Formato com ano completo
        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Formato com ano abreviado
        const [, day, month, year] = match;
        const fullYear =
          parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
        return new Date(fullYear, parseInt(month) - 1, parseInt(day));
      }
    }
  }

  // Se for uma data ISO (YYYY-MM-DD), usa diretamente
  if (cleanDate.includes("-") && cleanDate.length === 10) {
    const date = new Date(cleanDate);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Se for um número (data do Excel)
  if (!isNaN(Number(cleanDate)) && cleanDate.length > 4) {
    const excelDate = Number(cleanDate);
    return new Date((excelDate - 25569) * 86400 * 1000);
  }

  return null;
}

// Extrai número de orçamento do item (de raw_data ou rawData)
function extractOrcamentoFromItem(item: any): string | null {
  const raw: any = item?.raw_data || item?.rawData;
  if (!raw) return null;

  const checkObject = (obj: Record<string, any>) => {
    for (const key of Object.keys(obj)) {
      const k = key.toLowerCase();
      if (
        k.includes("orcamento") ||
        k.includes("orçamento") ||
        k.includes("nro orc") ||
        k.includes("numero orc") ||
        k.includes("num orc") ||
        k === "orc" ||
        k === "orcamento"
      ) {
        const v = obj[key];
        if (v == null) continue;
        const s = v.toString().trim();
        if (s) return s;
      }
    }
    return null;
  };

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const fromObj = checkObject(raw as Record<string, any>);
    if (fromObj) return fromObj;
  }

  if (Array.isArray(raw)) {
    for (const val of raw) {
      if (val && typeof val === "object") {
        const found = checkObject(val as Record<string, any>);
        if (found) return found;
      } else if (typeof val === "string") {
        const lower = val.toLowerCase();
        if (lower.includes("orc") || lower.includes("orç")) {
          const m = val.match(/\d{3,}/);
          if (m && m[0]) return m[0];
        }
      }
    }
  }

  return null;
}

function formatPrazoDisplay(prazoStr: string | null | undefined): string {
  if (!prazoStr) return "N/A";
  const d = parseBRDate(prazoStr.toString());
  if (d && !isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
  return prazoStr.toString();
}

function isInExecution(status: string | undefined | null): boolean {
  const s = (status || "").toLowerCase();
  return (
    s.includes("execu") || // cobre "execução" e "execucao"
    s.includes("em andamento") ||
    s.includes("fazendo")
  );
}

// Função para verificar se um item está atrasado (baseada no dashboard-metrics.tsx)
function isOverdue(item: any): boolean {
  let deadlineDate = null;

  // Tenta usar data_registro primeiro
  if (item.data_registro) {
    deadlineDate = new Date(item.data_registro);
  } else if (item.raw_data?.prazo) {
    deadlineDate = parseBRDate(item.raw_data.prazo);
  } else if (item.rawData) {
    // Se rawData é array, procura por campos de data
    if (Array.isArray(item.rawData)) {
      for (const val of item.rawData) {
        if (val && typeof val === "object") {
          const possibleDateFields = [
            "prazo",
            "data_registro",
            "data_prazo",
            "deadline",
          ];
          for (const field of possibleDateFields) {
            if ((val as any)[field]) {
              deadlineDate = parseBRDate((val as any)[field]);
              if (deadlineDate) break;
            }
          }
        } else if (val && typeof val === "string") {
          // Se é string que pode ser uma data
          const testDate = parseBRDate(val);
          if (testDate) {
            deadlineDate = testDate;
            break;
          }
        }
        if (deadlineDate) break;
      }
    }
    // Se não encontrou e item tem prazo diretamente
    if (!deadlineDate && item.prazo) {
      deadlineDate = parseBRDate(item.prazo);
    }
  }

  if (!deadlineDate || isNaN(deadlineDate.getTime())) {
    return false; // Se não tem data válida, considera no prazo
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  (deadlineDate as Date).setHours(0, 0, 0, 0);

  return (deadlineDate as Date) < today;
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

function computeDepartmentTotals(
  processedItems: any[],
  consultantName: string,
  team: string[]
): { totalExecCount: number; totalOverdueCount: number } {
  const consultantLower = (consultantName || "").toLowerCase().trim();
  let totalExecCount = 0;
  let totalOverdueCount = 0;

  for (const item of processedItems) {
    const respLower = (item.responsavel || "").toLowerCase();
    if (!respLower.includes(consultantLower)) continue;
    if (!isInExecution(item.status)) continue;

    const mech = extractMechanicFromItem(item, consultantName, team);
    if (!mech) continue;

    totalExecCount += 1;
    if (isOverdue(item)) totalOverdueCount += 1;
  }

  return { totalExecCount, totalOverdueCount };
}

interface MechanicItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    mechanics: string[];
    processedItems: any[];
    consultantName: string;
    teamList: string[];
  };
}

const MechanicItem = ({ index, style, data }: MechanicItemProps) => {
  const { mechanics, processedItems, consultantName, teamList } = data;
  const m = mechanics[index];
  const mechanicUpper = m.toUpperCase();
  const counts = computeMechanicCounts(
    processedItems,
    consultantName,
    mechanicUpper,
    teamList
  );

  return (
    <div style={style}>
      <li className="text-sm text-gray-700 flex items-center justify-between px-1">
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
    </div>
  );
};

interface DepartmentSectionProps {
  title: string;
  mechanics: string[];
  processedItems: any[];
  consultantName: string;
  teamList: string[];
}

const DepartmentSection = ({
  title,
  mechanics,
  processedItems,
  consultantName,
  teamList,
}: DepartmentSectionProps) => {
  const itemData = {
    mechanics,
    processedItems,
    consultantName,
    teamList,
  };

  const departmentTotals = computeDepartmentTotals(
    processedItems,
    consultantName,
    mechanics
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-blue-300">
        <p className="text-xs text-gray-600 font-medium">{title}</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-700 font-medium">
            {departmentTotals.totalExecCount}
          </span>
          <span className="text-red-600 font-semibold">
            {departmentTotals.totalOverdueCount}
          </span>
        </div>
      </div>
      <ul className="flex flex-col gap-0">
        {mechanics.length > 5 ? (
          <div style={{ height: "120px", width: "100%" }}>
            <AutoSizer disableHeight>
              {({ width }: { width: number }) => (
                <List
                  height={120}
                  width={width}
                  itemCount={mechanics.length}
                  itemSize={24}
                  itemData={itemData}
                >
                  {MechanicItem}
                </List>
              )}
            </AutoSizer>
          </div>
        ) : (
          mechanics.map((m) => {
            const mechanicUpper = m.toUpperCase();
            const counts = computeMechanicCounts(
              processedItems,
              consultantName,
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
          })
        )}
      </ul>
    </div>
  );
};

interface DepartmentItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    departments: any[];
    processedItems: any[];
    getTeamForConsultant: (name: string) => string[];
  };
}

const DepartmentItem = ({ index, style, data }: DepartmentItemProps) => {
  const { departments, processedItems, getTeamForConsultant } = data;
  const dep = departments[index];
  const team = getTeamForConsultant(dep.responsavel);
  const depTotals = computeDepartmentTotals(
    processedItems,
    dep.responsavel,
    team
  );

  return (
    <div style={style}>
      <AccordionItem key={dep.id} value={dep.id}>
        <AccordionTrigger className="px-3 no-underline hover:no-underline [&[data-state=open]]:no-underline">
          <div className="flex w-full items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">
                  {dep.responsavel}
                </span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-right">
                  <p className="text-xs text-gray-500">Total:</p>
                  <p className="text-sm font-bold text-blue-600">
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
              {dep.responsavel.toLowerCase().includes("paloma") ? (
                <div className="space-y-4">
                  <DepartmentSection
                    title="Pistões"
                    mechanics={TEAMS_BY_CONSULTANT["paloma-pistoes"]}
                    processedItems={processedItems}
                    consultantName={dep.responsavel}
                    teamList={team}
                  />
                  <DepartmentSection
                    title="Engrenagens"
                    mechanics={TEAMS_BY_CONSULTANT["rafael-engrenagens"]}
                    processedItems={processedItems}
                    consultantName={dep.responsavel}
                    teamList={team}
                  />
                </div>
              ) : dep.responsavel.toLowerCase().includes("lucas") ? (
                <div className="space-y-4">
                  <DepartmentSection
                    title="Bomba e Motores de Grande Porte"
                    mechanics={TEAMS_BY_CONSULTANT["lucas-bomba"]}
                    processedItems={processedItems}
                    consultantName={dep.responsavel}
                    teamList={team}
                  />
                  <DepartmentSection
                    title="Comandos Hidráulicos de Grande Porte"
                    mechanics={TEAMS_BY_CONSULTANT["lucas-comandos"]}
                    processedItems={processedItems}
                    consultantName={dep.responsavel}
                    teamList={team}
                  />
                </div>
              ) : dep.responsavel.toLowerCase().includes("avulso") ? (
                <DepartmentSection
                  title="Pessoas Avulsas"
                  mechanics={TEAMS_BY_CONSULTANT["avulsos"]}
                  processedItems={processedItems}
                  consultantName={dep.responsavel}
                  teamList={team}
                />
              ) : (
                <DepartmentSection
                  title="Mecânicos do time"
                  mechanics={team}
                  processedItems={processedItems}
                  consultantName={dep.responsavel}
                  teamList={team}
                />
              )}
            </div>
          </AccordionContent>
        )}
      </AccordionItem>
    </div>
  );
};

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
      <>
        <Card
          className={`bg-white border-gray-200 text-gray-900 flex flex-col ${className || ""}`}
          style={{ height: "520px" }}
        >
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex w-full items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-3">
                {responsavel.isGerente ? (
                  <Building className="h-5 w-5 text-amber-400" />
                ) : (
                  <User className="h-5 w-5 text-blue-400" />
                )}
                {responsavel.nome}
                <span className="text-lg font-bold text-blue-600">
                  {totalItens}
                </span>
              </CardTitle>
              <Link
                href={`/programacao?consultor=${encodeURIComponent(responsavel.nome)}`}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-blue-600 text-blue-700 hover:bg-blue-50"
                >
                  Programação
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 space-y-3">
              {responsavel.isGerente && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Posição:</p>
                  <p className="font-medium text-gray-900">Gerente Geral</p>
                </div>
              )}
            </div>

            {!responsavel.isGerente && teamList.length > 0 && (
              <div className="flex-1 pt-2 overflow-hidden">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full h-full"
                  defaultValue="team"
                >
                  <AccordionItem value="team" className="h-full">
                    <AccordionTrigger className="text-sm no-underline hover:no-underline [&[data-state=open]]:no-underline">
                      Time
                    </AccordionTrigger>
                    <AccordionContent className="overflow-hidden">
                      <div
                        style={{ maxHeight: "300px" }}
                        className="overflow-y-auto"
                      >
                        {responsavel.nome.toLowerCase().includes("paloma") ? (
                          <div className="space-y-4">
                            <DepartmentSection
                              title="Bombas e Motores Hidráulicos"
                              mechanics={
                                TEAMS_BY_CONSULTANT["paloma-pistoes"]
                              }
                              processedItems={processedItems}
                              consultantName={responsavel.nome}
                              teamList={teamList}
                            />
                            <DepartmentSection
                              title="Bombas e Motores de Engrenagens"
                              mechanics={
                                TEAMS_BY_CONSULTANT["rafael-engrenagens"]
                              }
                              processedItems={processedItems}
                              consultantName={responsavel.nome}
                              teamList={teamList}
                            />
                          </div>
                        ) : responsavel.nome.toLowerCase().includes("lucas") ? (
                          <div className="space-y-4">
                            <DepartmentSection
                              title="Bomba e Motores de Grande Porte"
                              mechanics={TEAMS_BY_CONSULTANT["lucas-bomba"]}
                              processedItems={processedItems}
                              consultantName={responsavel.nome}
                              teamList={teamList}
                            />
                            <DepartmentSection
                              title="Comandos Hidráulicos de Grande Porte"
                              mechanics={TEAMS_BY_CONSULTANT["lucas-comandos"]}
                              processedItems={processedItems}
                              consultantName={responsavel.nome}
                              teamList={teamList}
                            />
                          </div>
                        ) : responsavel.nome
                            .toLowerCase()
                            .includes("avulso") ? (
                          <DepartmentSection
                            title="Pessoas Avulsas"
                            mechanics={TEAMS_BY_CONSULTANT["avulsos"]}
                            processedItems={processedItems}
                            consultantName={responsavel.nome}
                            teamList={teamList}
                          />
                        ) : (
                          <DepartmentSection
                            title="Mecânicos do time"
                            mechanics={teamList}
                            processedItems={processedItems}
                            consultantName={responsavel.nome}
                            teamList={teamList}
                          />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      </>
    );
  }

  // Visão geral dos departamentos
  return (
    <>
      <Card
        className={`bg-white border-gray-200 text-gray-900 flex flex-col ${className || ""}`}
        style={{ height: "520px" }}
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex w-full items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5 text-amber-400" />
              Departamentos
            </CardTitle>
            <Link href="/programacao">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-blue-600 text-blue-700 hover:bg-blue-50"
              >
                Programação
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {(() => {
            const filteredDepartments = stats.statsPorDepartamento
              .filter((dep: any) => dep.totalItens > 0)
              .sort((a: any, b: any) => b.totalItens - a.totalItens);

            const departmentData = {
              departments: filteredDepartments,
              processedItems,
              getTeamForConsultant,
            };

            return (
              <div className="h-full overflow-hidden">
                <Accordion type="single" collapsible className="w-full h-full">
                  {filteredDepartments.length > 8 ? (
                    <div className="h-full" style={{ width: "100%" }}>
                      <AutoSizer disableHeight>
                        {({ width }: { width: number }) => (
                          <List
                            height={428}
                            width={width}
                            itemCount={filteredDepartments.length}
                            itemSize={80}
                            itemData={departmentData}
                          >
                            {DepartmentItem}
                          </List>
                        )}
                      </AutoSizer>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto">
                      {filteredDepartments.map((dep: any) => {
                        const team = getTeamForConsultant(dep.responsavel);
                        const depTotals = computeDepartmentTotals(
                          processedItems,
                          dep.responsavel,
                          team
                        );
                        return (
                          <AccordionItem key={dep.id} value={dep.id}>
                            <AccordionTrigger className="px-3 no-underline hover:no-underline [&[data-state=open]]:no-underline">
                              <div className="flex w-full items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-gray-900">
                                      {dep.responsavel}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-right">
                                      <p className="text-xs text-gray-500">
                                        Total:
                                      </p>
                                      <p className="text-sm font-bold text-blue-600">
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
                                  {dep.responsavel
                                    .toLowerCase()
                                    .includes("paloma") ? (
                                    <div className="space-y-4">
                                      <DepartmentSection
                                        title="Pistões"
                                        mechanics={
                                          TEAMS_BY_CONSULTANT[
                                            "paloma-pistoes"
                                          ]
                                        }
                                        processedItems={processedItems}
                                        consultantName={dep.responsavel}
                                        teamList={team}
                                      />
                                      <DepartmentSection
                                        title="Engrenagens"
                                        mechanics={
                                          TEAMS_BY_CONSULTANT[
                                            "rafael-engrenagens"
                                          ]
                                        }
                                        processedItems={processedItems}
                                        consultantName={dep.responsavel}
                                        teamList={team}
                                      />
                                    </div>
                                  ) : dep.responsavel
                                      .toLowerCase()
                                      .includes("lucas") ? (
                                    <div className="space-y-4">
                                      <DepartmentSection
                                        title="Bomba e Motores de Grande Porte"
                                        mechanics={
                                          TEAMS_BY_CONSULTANT["lucas-bomba"]
                                        }
                                        processedItems={processedItems}
                                        consultantName={dep.responsavel}
                                        teamList={team}
                                      />
                                      <DepartmentSection
                                        title="Comandos Hidráulicos de Grande Porte"
                                        mechanics={
                                          TEAMS_BY_CONSULTANT["lucas-comandos"]
                                        }
                                        processedItems={processedItems}
                                        consultantName={dep.responsavel}
                                        teamList={team}
                                      />
                                    </div>
                                  ) : dep.responsavel
                                      .toLowerCase()
                                      .includes("avulso") ? (
                                    <DepartmentSection
                                      title="Pessoas Avulsas"
                                      mechanics={TEAMS_BY_CONSULTANT["avulsos"]}
                                      processedItems={processedItems}
                                      consultantName={dep.responsavel}
                                      teamList={team}
                                    />
                                  ) : (
                                    <DepartmentSection
                                      title="Mecânicos do time"
                                      mechanics={team}
                                      processedItems={processedItems}
                                      consultantName={dep.responsavel}
                                      teamList={team}
                                    />
                                  )}
                                </div>
                              </AccordionContent>
                            )}
                          </AccordionItem>
                        );
                      })}
                    </div>
                  )}
                </Accordion>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </>
  );
}
