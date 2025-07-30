"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Calendar, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadDashboardData } from "@/lib/dashboard-supabase-client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CalendarItem {
  id: string;
  os: string;
  titulo: string;
  cliente: string;
  responsavel?: string;
  status: string;
  prazo: string;
  data: string;
  rawData: any[];
}

interface ActivityPlannerProps {
  processedItems?: CalendarItem[];
  filteredByResponsavel?: string | null;
}

// Componente para o card arrastável
function SortableActivityCard({
  activity,
  index,
  completedActivities,
  getStatusColor,
  completeActivity,
  uncompleteActivity,
}: {
  activity: CalendarItem;
  index: number;
  completedActivities: Set<string>;
  getStatusColor: (status: string) => string;
  completeActivity: (id: string) => void;
  uncompleteActivity: (id: string) => void;
}) {
  const isCompleted = completedActivities.has(activity.id);
  const shouldDisableDrag = isCompleted;
  const [isDragging, setIsDragging] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dndIsDragging,
  } = useSortable({
    id: activity.id,
    disabled: shouldDisableDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: dndIsDragging ? 0.5 : 1,
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Se o clique foi em um botão, não inicia o drag
    if ((e.target as HTMLElement).closest("button")) {
      e.stopPropagation();
      return;
    }

    // Marca que pode ser um drag
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Se moveu o mouse, é um drag
    setIsDragging(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Se o clique foi em um botão, não executa a ação do card
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    // Se não estava arrastando, executa a ação de concluir
    if (!isDragging) {
      if (completedActivities.has(activity.id)) {
        uncompleteActivity(activity.id);
      } else {
        completeActivity(activity.id);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(shouldDisableDrag ? {} : attributes)}
      {...(shouldDisableDrag ? {} : listeners)}
      className={`rounded-lg p-4 border transition-all duration-200 hover:shadow-md ${
        completedActivities.has(activity.id)
          ? "bg-green-50 border-green-200 opacity-75"
          : getStatusColor(activity.status)
      } ${dndIsDragging ? "shadow-lg" : ""} ${
        shouldDisableDrag
          ? "cursor-not-allowed"
          : "cursor-grab active:cursor-grabbing"
      }`}
      title={
        shouldDisableDrag
          ? "Atividade concluída - não pode ser movida"
          : completedActivities.has(activity.id)
            ? "Clique em qualquer lugar para desmarcar como concluída"
            : "Clique em qualquer lugar para marcar como concluída"
      }
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{activity.titulo}</h4>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
            <span>OS: {activity.os}</span>
            <span>Cliente: {activity.cliente}</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {activity.prazo}
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                completedActivities.has(activity.id)
                  ? "bg-green-100 text-green-800"
                  : activity.status.toLowerCase().includes("concluído") ||
                      activity.status.toLowerCase().includes("concluido")
                    ? "bg-green-100 text-green-800"
                    : activity.status.toLowerCase().includes("andamento") ||
                        activity.status.toLowerCase().includes("execução") ||
                        activity.status.toLowerCase().includes("execucao")
                      ? "bg-blue-100 text-blue-800"
                      : activity.status.toLowerCase().includes("pendente") ||
                          activity.status.toLowerCase().includes("aguardando")
                        ? "bg-blue-100 text-blue-800"
                        : activity.status.toLowerCase().includes("revisão") ||
                            activity.status.toLowerCase().includes("revisao") ||
                            activity.status.toLowerCase().includes("análise") ||
                            activity.status.toLowerCase().includes("analise")
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
              }`}
            >
              {completedActivities.has(activity.id)
                ? "CONCLUÍDO"
                : activity.status}
            </span>
            {completedActivities.has(activity.id) && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Concluído
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (completedActivities.has(activity.id)) {
                uncompleteActivity(activity.id);
              } else {
                completeActivity(activity.id);
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            data-no-dnd="true"
            className={`p-2 rounded-full transition-all duration-200 pointer-events-auto ${
              completedActivities.has(activity.id)
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={
              completedActivities.has(activity.id)
                ? "Desmarcar como concluída"
                : "Marcar como concluída"
            }
          >
            {completedActivities.has(activity.id) ? (
              <div className="w-4 h-4 flex items-center justify-center">✓</div>
            ) : (
              <div className="w-4 h-4 flex items-center justify-center">○</div>
            )}
          </button>
          <div className="relative group">
            <Avatar className="w-8 h-8 border-2 border-white transition-all duration-200">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                {activity.cliente.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivityPlanner({
  processedItems = [],
  filteredByResponsavel,
}: ActivityPlannerProps) {
  const [todayActivities, setTodayActivities] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [databaseItems, setDatabaseItems] = useState<CalendarItem[]>([]);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(
    new Set()
  );
  const [activityOrder, setActivityOrder] = useState<string[]>([]);

  // Configuração dos sensors para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduzido para ser mais responsivo
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Função para lidar com o fim do drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTodayActivities((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Salva apenas a ordem das atividades pendentes no localStorage
        const today = new Date();
        // Converte para horário de Brasília (UTC-3)
        const todayBrasilia = new Date(
          today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
        );
        const todayKey = todayBrasilia.toISOString().split("T")[0];
        const pendingOrderIds = newOrder
          .filter((item) => !completedActivities.has(item.id))
          .map((item) => item.id);
        localStorage.setItem(
          `activityOrder_${todayKey}`,
          JSON.stringify(pendingOrderIds)
        );

        return newOrder;
      });
    }
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
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega dados do banco quando o componente monta ou quando o filtro muda
  useEffect(() => {
    loadDatabaseItems();
  }, [filteredByResponsavel]);

  // Carrega atividades concluídas do localStorage
  useEffect(() => {
    const today = new Date();
    // Converte para horário de Brasília (UTC-3)
    const todayBrasilia = new Date(
      today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const todayKey = todayBrasilia.toISOString().split("T")[0]; // YYYY-MM-DD

    // Limpa atividades concluídas de dias anteriores
    const cleanupOldCompletedActivities = () => {
      try {
        const keys = Object.keys(localStorage);
        const completedKeys = keys.filter((key) =>
          key.startsWith("completedActivities_")
        );

        completedKeys.forEach((key) => {
          const dateKey = key.replace("completedActivities_", "");
          if (dateKey !== todayKey) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error("Erro ao limpar atividades antigas:", error);
      }
    };

    cleanupOldCompletedActivities();

    try {
      const stored = localStorage.getItem(`completedActivities_${todayKey}`);
      if (stored) {
        const completedIds = JSON.parse(stored);
        setCompletedActivities(new Set(completedIds));
      }
    } catch (error) {
      console.error("Erro ao carregar atividades concluídas:", error);
    }
  }, []);

  // Função para marcar uma atividade como concluída
  const completeActivity = (activityId: string) => {
    const today = new Date();
    // Converte para horário de Brasília (UTC-3)
    const todayBrasilia = new Date(
      today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const todayKey = todayBrasilia.toISOString().split("T")[0];

    setCompletedActivities((prev) => {
      const newSet = new Set([...prev, activityId]);

      // Salva no localStorage
      try {
        localStorage.setItem(
          `completedActivities_${todayKey}`,
          JSON.stringify([...newSet])
        );
      } catch (error) {
        console.error("Erro ao salvar atividade concluída:", error);
      }

      return newSet;
    });
  };

  // Função para desmarcar uma atividade como concluída
  const uncompleteActivity = (activityId: string) => {
    const today = new Date();
    // Converte para horário de Brasília (UTC-3)
    const todayBrasilia = new Date(
      today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const todayKey = todayBrasilia.toISOString().split("T")[0];

    setCompletedActivities((prev) => {
      const newSet = new Set(prev);
      newSet.delete(activityId);

      // Salva no localStorage
      try {
        localStorage.setItem(
          `completedActivities_${todayKey}`,
          JSON.stringify([...newSet])
        );
      } catch (error) {
        console.error("Erro ao salvar atividade desmarcada:", error);
      }

      return newSet;
    });
  };

  // Processa os itens para extrair atividades do dia atual
  useEffect(() => {
    const today = new Date();
    // Converte para horário de Brasília (UTC-3)
    const todayBrasilia = new Date(
      today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const todayKey = todayBrasilia.toISOString().split("T")[0]; // YYYY-MM-DD

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

    // Sempre separa atividades concluídas e não concluídas
    const pendingActivities = activitiesForToday.filter(
      (activity) => !completedActivities.has(activity.id)
    );
    const completedActivitiesList = activitiesForToday.filter((activity) =>
      completedActivities.has(activity.id)
    );
    let sortedActivities = [...pendingActivities, ...completedActivitiesList];

    // Aplica a ordem salva no localStorage apenas para atividades pendentes
    try {
      const savedOrder = localStorage.getItem(`activityOrder_${todayKey}`);
      if (savedOrder) {
        const orderIds = JSON.parse(savedOrder);

        // Filtra apenas os IDs de atividades pendentes que ainda existem
        const validOrderIds = orderIds.filter((id: string) =>
          pendingActivities.some((activity) => activity.id === id)
        );

        // Reordena apenas as atividades pendentes baseado na ordem salva
        if (validOrderIds.length > 0) {
          const orderedPendingActivities: CalendarItem[] = [];

          // Adiciona primeiro as atividades pendentes na ordem salva
          validOrderIds.forEach((id: string) => {
            const activity = pendingActivities.find((a) => a.id === id);
            if (activity) {
              orderedPendingActivities.push(activity);
            }
          });

          // Adiciona as atividades pendentes que não estão na ordem salva (novas atividades)
          pendingActivities.forEach((activity) => {
            if (!validOrderIds.includes(activity.id)) {
              orderedPendingActivities.push(activity);
            }
          });

          // Combina atividades pendentes ordenadas + concluídas no final
          sortedActivities = [
            ...orderedPendingActivities,
            ...completedActivitiesList,
          ];
        }
      }
    } catch (error) {
      console.error("Erro ao carregar ordem das atividades:", error);
    }

    setTodayActivities(sortedActivities);
  }, [processedItems, databaseItems, completedActivities]);

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
      timeZone: "America/Sao_Paulo",
    });
  };

  const today = new Date();
  // Converte para horário de Brasília (UTC-3)
  const todayBrasilia = new Date(
    today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );

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
            {completedActivities.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  // Converte para horário de Brasília (UTC-3)
                  const todayBrasilia = new Date(
                    today.toLocaleString("en-US", {
                      timeZone: "America/Sao_Paulo",
                    })
                  );
                  const todayKey = todayBrasilia.toISOString().split("T")[0];
                  localStorage.removeItem(`completedActivities_${todayKey}`);
                  setCompletedActivities(new Set());
                }}
                className="text-xs text-red-600 hover:text-red-700"
                title="Limpar todas as atividades concluídas"
              >
                Limpar Concluídas
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {formatDate(todayBrasilia)} - {todayActivities.length} atividade(s)
          agendada(s)
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todayActivities.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={todayActivities.map((activity) => activity.id)}
                strategy={verticalListSortingStrategy}
              >
                {todayActivities.map((activity, index) => (
                  <SortableActivityCard
                    key={`activity-${activity.id}-${index}`}
                    activity={activity}
                    index={index}
                    completedActivities={completedActivities}
                    getStatusColor={getStatusColor}
                    completeActivity={completeActivity}
                    uncompleteActivity={uncompleteActivity}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
