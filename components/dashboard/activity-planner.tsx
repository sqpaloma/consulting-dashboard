"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { loadDashboardData } from "@/lib/dashboard-supabase-client";
import { useActivityStorage } from "./hooks/use-activity-storage";
import { useActivityData } from "./hooks/use-activity-data";
import { useActivityDragAndDrop } from "./hooks/use-activity-drag-and-drop";
import { ActivityHeader } from "./activity-header";
import { ActivityCard } from "./activity-card";

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
    completeActivity,
    uncompleteActivity,
    setCompletedActivities,
  } = useActivityStorage();
  const { todayActivities, setTodayActivities, getStatusColor } =
    useActivityData(processedItems, databaseItems, completedActivities);
  const { sensors, handleDragEnd } = useActivityDragAndDrop(
    todayActivities,
    completedActivities,
    setTodayActivities
  );

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
    <Card className="bg-white mt-3">
      <ActivityHeader
        isLoading={isLoading}
        todayActivities={todayActivities}
        todayBrasilia={todayBrasilia}
        completedActivities={completedActivities}
        onRefresh={loadDatabaseItems}
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
      <CardContent>
        <div className="space-y-3">
          {todayActivities.length > 0 ? (
            <ActivityCard
              activities={todayActivities}
              completedActivities={completedActivities}
              getStatusColor={getStatusColor}
              completeActivity={completeActivity}
              uncompleteActivity={uncompleteActivity}
              sensors={sensors}
              onDragEnd={handleDragEnd}
            />
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
