"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { loadDashboardData } from "@/lib/dashboard-supabase-client";
import { useActivityStorage } from "./hooks/use-activity-storage";
import { useActivityData } from "./hooks/use-activity-data";
import { ActivityHeader } from "./activity-header";

import { CalendarItem } from "./types";

interface ActivityPlannerProps {
  processedItems?: CalendarItem[];
  filteredByResponsavel?: string | null;
}

export function ActivityPlanner({
  processedItems = [],
  filteredByResponsavel,
}: ActivityPlannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [databaseItems, setDatabaseItems] = useState<CalendarItem[]>([]);

  const {
    completedActivities,
    setCompletedActivities,
  } = useActivityStorage();
  const { todayActivities, getStatusColor } =
    useActivityData(processedItems, databaseItems, completedActivities);

  // Função para fazer parse de diferentes formatos de data
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    const cleanDate = dateString.toString().trim();

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
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          const [, day, month, year] = match;
          const fullYear =
            parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
          return new Date(fullYear, parseInt(month) - 1, parseInt(day));
        }
      }
    }

    if (!isNaN(Number(cleanDate)) && cleanDate.length > 4) {
      const excelDate = Number(cleanDate);
      return new Date((excelDate - 25569) * 86400 * 1000);
    }

    return null;
  };

  // Processa itens para todos os dias da semana
  const getWeekActivities = () => {
    const weekActivities: { [key: string]: CalendarItem[] } = {};
    const allItems = [...processedItems, ...databaseItems];

    allItems.forEach((item) => {
      let prazoDate = null;

      if (item.data && item.data.includes("-")) {
        prazoDate = new Date(item.data);
        if (isNaN(prazoDate.getTime())) {
          prazoDate = null;
        }
      } else if (item.prazo) {
        prazoDate = parseDate(item.prazo);
      } else if (item.data) {
        prazoDate = parseDate(item.data);
      }

      if (prazoDate) {
        const dateKey = prazoDate.toISOString().split("T")[0];
        if (!weekActivities[dateKey]) {
          weekActivities[dateKey] = [];
        }
        weekActivities[dateKey].push(item);
      }
    });

    return weekActivities;
  };

  // Função para obter o responsável real quando em execução
  const getDisplayResponsavel = (activity: CalendarItem) => {
    const statusLower = activity.status?.toLowerCase() || '';
    const isEmExecucao = statusLower.includes("execução") || 
                        statusLower.includes("execucao") || 
                        statusLower.includes("andamento");
    
    if (isEmExecucao && activity.rawData && activity.rawData.length > 0) {
      // Busca nos dados brutos se existe um executante/mecânico
      for (const rawItem of activity.rawData) {
        if (rawItem && typeof rawItem === 'object') {
          // Procura por campos que podem conter o nome do mecânico
          const possibleFields = ['executante', 'mecanico', 'responsavel_execucao', 'executor'];
          
          for (const field of possibleFields) {
            const mechanic = rawItem[field];
            if (mechanic && typeof mechanic === 'string' && mechanic.trim()) {
              // Mapeia consultores para mecânicos baseado no engineer-mapping.ts
              const mechanicName = getMechanicName(activity.responsavel || '', mechanic.trim());
              if (mechanicName !== activity.responsavel) {
                return mechanicName;
              }
            }
          }
        }
      }
    }
    
    return activity.responsavel;
  };

  // Função para obter o nome do mecânico baseado no consultor e dados
  const getMechanicName = (consultant: string, mechanicFromData: string) => {
    const consultantLower = consultant?.toLowerCase() || '';
    const mechanicUpper = mechanicFromData.toUpperCase().trim();
    
    // Times dos consultores (baseado em engineer-mapping.ts)
    const teams = {
      paloma: ['GUSTAVOBEL', 'GUILHERME', 'EDUARDO', 'YURI', 'VAGNER', 'FABIO F', 'NIVALDO'],
      lucas: ['ALEXANDRE', 'ALEXSANDRO', 'ROBERTO P', 'KAUAN', 'KAUA', 'MARCELINO', 'LEANDRO', 'RODRIGO N'],
      marcelo: ['ALZIRO', 'G SIMAO', 'HENRIQUE', 'NICOLAS C', 'DANIEL', 'RONALD', 'VINICIUS', 'DANIEL G'],
      carlinhos: ['SHEINE']
    };
    
    let relevantTeam: string[] = [];
    
    if (consultantLower.includes('paloma')) {
      relevantTeam = teams.paloma;
    } else if (consultantLower.includes('lucas')) {
      relevantTeam = teams.lucas;  
    } else if (consultantLower.includes('marcelo')) {
      relevantTeam = teams.marcelo;
    } else if (consultantLower.includes('carlinhos')) {
      relevantTeam = teams.carlinhos;
    }
    
    // Se o mecânico nos dados está no time do consultor, retorna o nome formatado
    if (relevantTeam.includes(mechanicUpper)) {
      // Formata o nome (primeira letra maiúscula, resto minúscula)
      return mechanicFromData.charAt(0).toUpperCase() + mechanicFromData.slice(1).toLowerCase();
    }
    
    return consultant; // Retorna o consultor se não encontrar mecânico válido
  };

  // Carrega dados do banco de dados
  const loadDatabaseItems = async () => {
    setIsLoading(true);
    try {
      const { items } = await loadDashboardData();

      // Converte os dados do banco para o formato do calendário
      let dbItems: CalendarItem[] = items
        .filter((item) => item.data_registro) // Só inclui itens com data_registro
        .map((item) => ({
          id: item.os,
          os: item.os,
          titulo: item.titulo || `Item ${item.os}`,
          cliente: item.cliente || "Cliente não informado",
          responsavel: item.responsavel || "Não informado",
          status: item.status,
          prazo: item.data_registro || "", // Usa data_registro como prazo
          data: item.data_registro || "",
          rawData: item.raw_data || [],
        }));

      // Aplica filtro por responsável se ativo
      if (filteredByResponsavel) {
        dbItems = dbItems.filter(
          (item) =>
            item.responsavel &&
            item.responsavel.trim() === filteredByResponsavel
        );
      }

      setDatabaseItems(dbItems);
    } catch (error) {
      console.error("Erro ao carregar dados do banco:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega dados do banco quando o componente monta ou quando o filtro muda
  useEffect(() => {
    loadDatabaseItems();
  }, [filteredByResponsavel]);

  const today = new Date();
  // Converte para horário de Brasília (UTC-3)
  const todayBrasilia = new Date(
    today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );

  return (
    <Card className="bg-white h-[650px] flex flex-col">
      <ActivityHeader
        isLoading={isLoading}
        todayActivities={todayActivities}
        todayBrasilia={todayBrasilia}
        completedActivities={completedActivities}
        onClearCompleted={() => {
          const today = new Date();
          const todayBrasilia = new Date(
            today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
          );
          const todayKey = todayBrasilia.toISOString().split("T")[0];
          localStorage.removeItem(`completedActivities_${todayKey}`);
          setCompletedActivities(new Set());
        }}
      />
      <CardContent className="flex-1 overflow-hidden p-4">
        <div className="grid grid-cols-5 gap-2 h-full">
          {['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA'].map((dayName, index) => {
            const currentDate = new Date(todayBrasilia);
            const dayOfWeek = currentDate.getDay();
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + index);
            const dayDateKey = dayDate.toISOString().split('T')[0];
            const isToday = dayDate.toDateString() === todayBrasilia.toDateString();
            const todayDateOnly = new Date(todayBrasilia);
            todayDateOnly.setHours(0, 0, 0, 0);
            const dayDateOnly = new Date(dayDate);
            dayDateOnly.setHours(0, 0, 0, 0);
            const isPastDay = dayDateOnly < todayDateOnly;
            
            const weekActivities = getWeekActivities();
            const dayActivities = weekActivities[dayDateKey] || [];

            return (
              <div key={dayName} className="border border-blue-200 rounded-lg flex flex-col h-full bg-blue-50/30">
                <div className="bg-blue-100/50 px-3 py-2 text-center border-b border-blue-200 rounded-t-lg">
                  <h3 className="text-sm font-medium text-blue-700">
                    {dayName} - {dayDate.toLocaleDateString("pt-BR", { 
                      day: "2-digit", 
                      month: "2-digit",
                      timeZone: "America/Sao_Paulo" 
                    })}
                  </h3>
                </div>
                <div className="flex-1 p-2 overflow-y-auto">
                  {dayActivities.length > 0 ? (
                    <div className="space-y-2">
                      {dayActivities.map((activity, activityIndex) => (
                        <div
                          key={`${dayDateKey}-${activity.id}-${activityIndex}`}
                          className={`p-2 rounded-md text-xs border ${
                            completedActivities.has(activity.id)
                              ? 'bg-gray-100 opacity-60 line-through border-gray-300'
                              : isPastDay
                                ? 'bg-red-100 border-red-200 shadow-sm'
                                : `shadow-sm ${getStatusColor(activity.status)}`
                          }`}
                        >
                          <div className="font-medium text-gray-800 truncate">
                            OS: {activity.os}
                          </div>
                          <div className="text-gray-600 truncate mt-1">
                            {activity.cliente}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {getDisplayResponsavel(activity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 text-xs mt-4">
                      {isToday && isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        'Sem atividades'
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
