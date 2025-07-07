"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadDashboardData } from "@/lib/dashboard-supabase-client";

interface CalendarItem {
  id: string;
  os: string;
  titulo: string;
  cliente: string;
  status: string;
  prazo: string;
  data: string;
  rawData: any[];
}

interface ActivityPlannerProps {
  processedItems?: CalendarItem[];
}

export function ActivityPlanner({ processedItems = [] }: ActivityPlannerProps) {
  const [todayActivities, setTodayActivities] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [databaseItems, setDatabaseItems] = useState<CalendarItem[]>([]);

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  // Carrega dados do banco de dados
  const loadDatabaseItems = async () => {
    setIsLoading(true);
    try {
      const { items } = await loadDashboardData();

      // Converte os dados do banco para o formato do calendário
      const dbItems: CalendarItem[] = items
        .filter((item) => item.data_registro) // Só inclui itens com data_registro
        .map((item) => ({
          id: item.os,
          os: item.os,
          titulo: item.titulo || `Item ${item.os}`,
          cliente: item.cliente || "Cliente não informado",
          status: item.status,
          prazo: item.data_registro || "", // Usa data_registro como prazo
          data: item.data_registro || "",
          rawData: item.raw_data || [],
        }));

      setDatabaseItems(dbItems);
    } catch (error) {
      console.error("Erro ao carregar dados do banco:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega dados do banco quando o componente monta
  useEffect(() => {
    loadDatabaseItems();
  }, []);

  // Processa os itens para extrair atividades do dia atual
  useEffect(() => {
    const today = new Date();
    const todayKey = today.toISOString().split("T")[0]; // YYYY-MM-DD

    // Combina dados da planilha com dados do banco
    const allItems = [...processedItems, ...databaseItems];

    const activitiesForToday = allItems.filter((item) => {
      // Tenta extrair a data do prazo
      let prazoDate = null;

      // Primeiro, tenta usar o campo data_registro se for do banco
      if (item.data && item.data.includes("-")) {
        // Se a data está em formato ISO (YYYY-MM-DD), usa diretamente
        prazoDate = new Date(item.data);
        if (isNaN(prazoDate.getTime())) {
          prazoDate = null;
        }
      } else if (item.prazo) {
        // Se tem prazo, tenta fazer parse
        prazoDate = parseDate(item.prazo);
      } else if (item.data) {
        // Se não tem prazo, usa a data padrão
        prazoDate = parseDate(item.data);
      }

      if (prazoDate) {
        const itemDateKey = prazoDate.toISOString().split("T")[0];
        return itemDateKey === todayKey;
      }

      return false;
    });

    setTodayActivities(activitiesForToday);
  }, [processedItems, databaseItems]);

  // Função para fazer parse de diferentes formatos de data
  const parseDate = (dateString: string): Date | null => {
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

    // Se for um número (data do Excel)
    if (!isNaN(Number(cleanDate)) && cleanDate.length > 4) {
      const excelDate = Number(cleanDate);
      return new Date((excelDate - 25569) * 86400 * 1000);
    }

    return null;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("concluído") ||
      statusLower.includes("concluido")
    ) {
      return "bg-green-50 border-green-200";
    } else if (
      statusLower.includes("andamento") ||
      statusLower.includes("execução") ||
      statusLower.includes("execucao")
    ) {
      return "bg-blue-50 border-blue-200";
    } else if (
      statusLower.includes("pendente") ||
      statusLower.includes("aguardando")
    ) {
      return "bg-blue-50 border-blue-200";
    } else if (
      statusLower.includes("revisão") ||
      statusLower.includes("revisao") ||
      statusLower.includes("análise") ||
      statusLower.includes("analise")
    ) {
      return "bg-orange-50 border-orange-200";
    } else {
      return "bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const today = new Date();

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-gray-800 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Planejador de Atividades Diárias
            {isLoading && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDatabaseItems}
              disabled={isLoading}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {isLoading ? "Carregando..." : "Atualizar"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {formatDate(today)} - {todayActivities.length} atividade(s)
          agendada(s)
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {timeSlots.map((time) => (
            <div key={time} className="flex-shrink-0 text-center">
              <div className="text-sm text-gray-500 mb-4">{time}</div>
              <div className="w-24 h-2 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>

        <div className="space-y-3 mt-6">
          {todayActivities.length > 0 ? (
            todayActivities.map((activity, index) => (
              <div
                key={`activity-${activity.id}-${index}`}
                className={`rounded-lg p-4 border ${getStatusColor(
                  activity.status
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {activity.titulo}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>OS: {activity.os}</span>
                      <span>Cliente: {activity.cliente}</span>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.prazo}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status.toLowerCase().includes("concluído") ||
                          activity.status.toLowerCase().includes("concluido")
                            ? "bg-green-100 text-green-800"
                            : activity.status
                                .toLowerCase()
                                .includes("andamento") ||
                              activity.status
                                .toLowerCase()
                                .includes("execução") ||
                              activity.status.toLowerCase().includes("execucao")
                            ? "bg-blue-100 text-blue-800"
                            : activity.status
                                .toLowerCase()
                                .includes("pendente") ||
                              activity.status
                                .toLowerCase()
                                .includes("aguardando")
                            ? "bg-blue-100 text-blue-800"
                            : activity.status
                                .toLowerCase()
                                .includes("revisão") ||
                              activity.status
                                .toLowerCase()
                                .includes("revisao") ||
                              activity.status
                                .toLowerCase()
                                .includes("análise") ||
                              activity.status.toLowerCase().includes("analise")
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Avatar className="w-8 h-8 border-2 border-white">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {activity.cliente.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Carregando atividades...</span>
                </div>
              ) : (
                <div>
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma atividade agendada para hoje</p>
                  <p className="text-sm mt-1">
                    As atividades do calendário aparecerão aqui automaticamente
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
