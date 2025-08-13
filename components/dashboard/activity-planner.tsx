"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FixedSizeList as List } from "react-window";
import { useDashboardData } from "@/lib/convex-dashboard-client";
import { useActivityStorage } from "./hooks/use-activity-storage";
import { useActivityData } from "./hooks/use-activity-data";
import { ActivityHeader } from "./activity-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EllipsisVertical, Share2, ListTodo } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { useChat, useSearchUsers } from "@/hooks/use-chat";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TodoForm } from "@/components/kanban/todo-form";

import { CalendarItem } from "./types";

interface ActivityPlannerProps {
  processedItems?: CalendarItem[];
  filteredByResponsavel?: string | null;
}

export function ActivityPlanner({
  processedItems = [],
  filteredByResponsavel,
}: ActivityPlannerProps) {
  const dashboardData = useDashboardData();
  const [isLoading, setIsLoading] = useState(false);
  const [databaseItems, setDatabaseItems] = useState<CalendarItem[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareActivity, setShareActivity] = useState<CalendarItem | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState("");
  const [redirectToChat, setRedirectToChat] = useState(true);
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [todoInitialData, setTodoInitialData] = useState<
    | {
        title: string;
        description: string;
        responsible: string;
        scheduledDate: string;
      }
    | undefined
  >(undefined);

  const { completedActivities, setCompletedActivities } = useActivityStorage();
  const { todayActivities, getStatusColor } = useActivityData(
    processedItems,
    databaseItems,
    completedActivities
  );

  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { sendMessage, createDirectConversation } = useChat(
    user?.userId as any
  );
  const searchResults = useSearchUsers(
    userSearch,
    user?.userId as any,
    8
  ) as any;
  const createTodo = useMutation(api.todos.createTodo);

  useEffect(() => {
    const onResize = () =>
      setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Flag global: consultores (e exceções por email) veem apenas seus próprios itens
  const forceOwnByEmail =
    user?.email?.toLowerCase() === "lucas@novakgouveia.com.br" ||
    user?.email?.toLowerCase() === "lucas.santos@novakgouveia.com.br";
  const isConsultor = user?.role === "consultor" && !isAdmin;
  const shouldForceOwn = isAdmin ? false : isConsultor || forceOwnByEmail;
  const isGiovanniManager =
    user?.email?.toLowerCase() === "giovanni.gamero@novakgouveia.com.br";

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

  // Função para obter o responsável real quando em execução/analise
  const getDisplayResponsavel = (activity: CalendarItem) => {
    const statusLower = activity.status?.toLowerCase() || "";
    const isRelevant =
      statusLower.includes("execução") ||
      statusLower.includes("execucao") ||
      statusLower.includes("andamento") ||
      statusLower.includes("análise") ||
      statusLower.includes("analise") ||
      statusLower.includes("revisão") ||
      statusLower.includes("revisao");

    if (isRelevant && activity.rawData && activity.rawData.length > 0) {
      for (const rawItem of activity.rawData) {
        if (rawItem && typeof rawItem === "object") {
          const possibleFields = [
            "executante",
            "mecanico",
            "responsavel_execucao",
            "executor",
          ];

          for (const field of possibleFields) {
            const mechanic = (rawItem as any)[field];
            if (mechanic && typeof mechanic === "string" && mechanic.trim()) {
              const mechanicName = getMechanicName(
                activity.responsavel || "",
                mechanic.trim()
              );
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
    const consultantLower = consultant?.toLowerCase() || "";
    const mechanicUpper = mechanicFromData.toUpperCase().trim();

    const teams = {
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
    } as Record<string, string[]>;

    let relevantTeam: string[] = [];

    if (consultantLower.includes("paloma")) {
      relevantTeam = teams.paloma;
    } else if (consultantLower.includes("lucas")) {
      relevantTeam = teams.lucas;
    } else if (consultantLower.includes("marcelo")) {
      relevantTeam = teams.marcelo;
    } else if (consultantLower.includes("carlinhos")) {
      relevantTeam = teams.carlinhos;
    }

    if (relevantTeam.includes(mechanicUpper)) {
      return (
        mechanicFromData.charAt(0).toUpperCase() +
        mechanicFromData.slice(1).toLowerCase()
      );
    }

    return consultant;
  };

  // Carrega dados do banco de dados
  const loadDatabaseItems = async () => {
    setIsLoading(true);
    try {
      const items = dashboardData?.items || [];

      // Converte os dados do banco para o formato do calendário
      let dbItems: CalendarItem[] = items
        .filter((item) => item.dataRegistro)
        .map((item) => ({
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

      // Aplica filtro por consultor logado (quando aplicável)
      if (shouldForceOwn && user?.name) {
        const ownFirstName = user.name.split(" ")[0]?.toLowerCase();
        dbItems = dbItems.filter((item) =>
          (item.responsavel || "")
            .toString()
            .toLowerCase()
            .includes(ownFirstName)
        );
      }

      // Aplica filtro por responsável manual, se ativo e não estiver forçando próprio
      if (!shouldForceOwn && filteredByResponsavel) {
        dbItems = dbItems.filter(
          (item) =>
            item.responsavel &&
            item.responsavel.trim() === filteredByResponsavel
        );
      }

      // Filtro padrão: sem filtro manual, exibir itens do próprio usuário
      // EXCEÇÃO: Giovanni (gerente) vê o geral por padrão
      if (
        !shouldForceOwn &&
        !filteredByResponsavel &&
        user?.name &&
        !isGiovanniManager &&
        !isAdmin
      ) {
        const ownFirstName = user.name.split(" ")[0]?.toLowerCase();
        dbItems = dbItems.filter((item) =>
          (item.responsavel || "")
            .toString()
            .toLowerCase()
            .includes(ownFirstName)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filteredByResponsavel,
    shouldForceOwn,
    user?.name,
    user?.email,
    isAdmin,
    dashboardData,
  ]);

  const today = new Date();
  const todayBrasilia = new Date(
    today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );

  const weekActivities = getWeekActivities();

  const getCurrentWeek = (date: Date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return { start: monday, end: friday };
  };

  const formatWeekRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      timeZone: "America/Sao_Paulo",
    });
    const endStr = end.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });
    return `${startStr} - ${endStr}`;
  };

  const handleShare = async () => {
    if (!shareActivity || !selectedUserId) return;
    try {
      const conversationId = await createDirectConversation(
        selectedUserId as any
      );
      if (!conversationId) return;
      const { start, end } = getCurrentWeek(todayBrasilia);
      const weekStr = formatWeekRange(start, end);
      const details = `OS ${shareActivity.os} - ${shareActivity.titulo}\nCliente: ${shareActivity.cliente}\nResponsável: ${shareActivity.responsavel}\nStatus: ${shareActivity.status}\nSemana: ${weekStr}`;
      const content = `${shareMessage.trim() ? shareMessage.trim() + "\n\n" : ""}${details}`;
      await sendMessage(conversationId as any, content);
      setShareDialogOpen(false);
      setShareActivity(null);
      setUserSearch("");
      setSelectedUserId(null);
      setShareMessage("");
      if (redirectToChat) {
        window.location.href = `/organize?conv=${conversationId}`;
      }
    } catch (e) {
      // noop
    }
  };

  const openTaskModal = (activity: CalendarItem) => {
    const scheduled = (activity.data || activity.prazo || "").slice(0, 10);
    setTodoInitialData({
      title: `Agenda: OS ${activity.os} - ${activity.titulo}`,
      description: `Cliente: ${activity.cliente}`,
      responsible: activity.responsavel || "",
      scheduledDate: scheduled,
    });
    setTodoModalOpen(true);
  };

  const handleSubmitTodo = async (formData: {
    title: string;
    description: string;
    responsible: string;
    scheduledDate: string;
  }) => {
    await createTodo({
      title: formData.title,
      description:
        `${formData.description || ""}\nResponsável: ${formData.responsible}\nData Agendada: ${formData.scheduledDate}`.trim(),
      priority: "medium",
      category: "Agenda",
      dueDate: formData.scheduledDate,
    } as any);
  };

  return (
    <Card className="bg-white h-[650px] flex flex-col">
      <ActivityHeader
        isLoading={isLoading}
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
      <CardContent className="flex-1 overflow-hidden p-4 pb-4">
        {/* Mobile/Tablet: vertical scroll; Desktop: 5 columns */}
        <div className="h-full lg:grid lg:grid-cols-5 lg:gap-2">
          <div className="lg:hidden h-full">
            <List
              height={500}
              width="100%"
              itemCount={5}
              itemSize={250}
              itemData={{
                days: ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"],
                weekActivities,
                completedActivities,
                todayBrasilia,
                isDesktop,
                getStatusColor,
                getDisplayResponsavel,
                setShareActivity,
                setShareDialogOpen,
                openTaskModal,
              }}
            >
              {({ index, style, data }) => {
                const dayName = data.days[index];
                const currentDate = new Date(todayBrasilia);
                const dayOfWeek = currentDate.getDay();
                const dayDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate() -
                    dayOfWeek +
                    (dayOfWeek === 0 ? -6 : 1) +
                    index
                );
                const dayDateKey = dayDate.toISOString().split("T")[0];
                const isToday =
                  dayDate.toDateString() === data.todayBrasilia.toDateString();
                const activitiesForDay = data.weekActivities[dayDateKey] || [];

                return (
                  <div style={style} className="pb-2">
                    <div className="flex flex-col bg-gray-50 rounded-md p-2 h-full">
                      <div
                        className={`text-xs font-semibold mb-4 flex items-center justify-between ${isToday ? "text-blue-600" : "text-gray-700"}`}
                      >
                        <div className="flex-1 text-center">{dayName}</div>
                        <div className="bg-gray-200 text-gray-600 rounded-full px-2 py-1 text-xs min-w-[20px] text-center">
                          {activitiesForDay.length}
                        </div>
                      </div>
                      <div className="flex-1 min-h-0">
                        {activitiesForDay.length > 0 ? (
                          <List
                            height={200}
                            width={"100%"}
                            itemCount={activitiesForDay.length}
                            itemSize={110}
                            itemData={{
                              activities: activitiesForDay,
                              completed: data.completedActivities,
                            }}
                          >
                            {({
                              index: actIndex,
                              style: actStyle,
                              data: actData,
                            }) => {
                              const activity: CalendarItem =
                                actData.activities[actIndex];
                              const isCompleted = (
                                actData.completed as Set<string>
                              ).has(activity.id);
                              const consultant = activity.responsavel || "—";
                              const maybeMechanic =
                                data.getDisplayResponsavel(activity) || "—";
                              const statusLower =
                                activity.status?.toLowerCase() || "";
                              const showMechanic =
                                (statusLower.includes("exec") ||
                                  statusLower.includes("análise") ||
                                  statusLower.includes("analise") ||
                                  statusLower.includes("revis")) &&
                                maybeMechanic &&
                                maybeMechanic !== consultant;

                              return (
                                <div style={actStyle} className="px-1">
                                  <div
                                    className={`p-2 rounded-md text-xs border ${isCompleted ? "bg-gray-100 opacity-60 line-through border-gray-300" : data.getStatusColor(activity.status, activity.data || activity.prazo)}`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium text-gray-800 truncate">
                                            {activity.titulo || activity.os}
                                          </span>
                                        </div>
                                        <div className="mt-1 text-[11px] text-gray-600 truncate">
                                          {activity.cliente}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                                          <span className="truncate">
                                            {consultant}
                                          </span>
                                          {showMechanic && (
                                            <span className="text-gray-400">
                                              •
                                            </span>
                                          )}
                                          {showMechanic && (
                                            <span className="truncate">
                                              {maybeMechanic}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0"
                                          >
                                            <EllipsisVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="end"
                                          className="w-56"
                                        >
                                          <DropdownMenuItem
                                            onClick={() => {
                                              data.setShareActivity(activity);
                                              data.setShareDialogOpen(true);
                                            }}
                                          >
                                            <Share2 className="h-4 w-4 mr-2" />{" "}
                                            Compartilhar via chat
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              data.openTaskModal(activity)
                                            }
                                          >
                                            <ListTodo className="h-4 w-4 mr-2" />{" "}
                                            Adicionar tarefa (Agenda)
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600">
                                      <span>{activity.status}</span>
                                      <span>
                                        {activity.data || activity.prazo || ""}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          </List>
                        ) : (
                          <div className="text-xs text-gray-400 text-center py-6">
                            Sem atividades
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            </List>
          </div>

          {/* Desktop layout - original grid */}
          <div className="hidden lg:contents">
            {["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"].map(
              (dayName: string, index: number) => {
                const currentDate = new Date(todayBrasilia);
                const dayOfWeek = currentDate.getDay();
                const dayDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate() -
                    dayOfWeek +
                    (dayOfWeek === 0 ? -6 : 1) +
                    index
                );
                const dayDateKey = dayDate.toISOString().split("T")[0];
                const isToday =
                  dayDate.toDateString() === todayBrasilia.toDateString();
                const activitiesForDay = weekActivities[dayDateKey] || [];

                return (
                  <div
                    key={dayName}
                    className="flex flex-col bg-gray-50 rounded-md p-2"
                  >
                    <div
                      className={`text-xs font-semibold mb-4 flex items-center justify-between ${isToday ? "text-blue-600" : "text-gray-700"}`}
                    >
                      <div className="flex-1 text-center">{dayName}</div>
                      <div className="bg-gray-200 text-gray-600 rounded-full px-2 py-1 text-xs min-w-[20px] text-center">
                        {activitiesForDay.length}
                      </div>
                    </div>
                    <div className="flex-1 min-h-0">
                      {activitiesForDay.length > 0 ? (
                        <List
                          height={450}
                          width={"100%"}
                          itemCount={activitiesForDay.length}
                          itemSize={110}
                          itemData={{
                            activities: activitiesForDay,
                            completed: completedActivities,
                          }}
                        >
                          {({ index, style, data }) => {
                            const activity: CalendarItem =
                              data.activities[index];
                            const isCompleted = (
                              data.completed as Set<string>
                            ).has(activity.id);
                            const consultant = activity.responsavel || "—";
                            const maybeMechanic =
                              getDisplayResponsavel(activity) || "—";
                            const statusLower =
                              activity.status?.toLowerCase() || "";
                            const showMechanic =
                              (statusLower.includes("exec") ||
                                statusLower.includes("análise") ||
                                statusLower.includes("analise") ||
                                statusLower.includes("revis")) &&
                              maybeMechanic &&
                              maybeMechanic !== consultant;

                            return (
                              <div style={style} className="px-1">
                                <div
                                  className={`p-2 rounded-md text-xs border ${isCompleted ? "bg-gray-100 opacity-60 line-through border-gray-300" : getStatusColor(activity.status, activity.data || activity.prazo)}`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-800 truncate">
                                          {activity.titulo || activity.os}
                                        </span>
                                      </div>
                                      <div className="mt-1 text-[11px] text-gray-600 truncate">
                                        {activity.cliente}
                                      </div>
                                      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                                        <span className="truncate">
                                          {consultant}
                                        </span>
                                        {showMechanic && (
                                          <span className="text-gray-400">
                                            •
                                          </span>
                                        )}
                                        {showMechanic && (
                                          <span className="truncate">
                                            {maybeMechanic}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 shrink-0"
                                        >
                                          <EllipsisVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="w-56"
                                      >
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setShareActivity(activity);
                                            setShareDialogOpen(true);
                                          }}
                                        >
                                          <Share2 className="h-4 w-4 mr-2" />{" "}
                                          Compartilhar via chat
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            openTaskModal(activity)
                                          }
                                        >
                                          <ListTodo className="h-4 w-4 mr-2" />{" "}
                                          Adicionar tarefa (Agenda)
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600">
                                    <span>{activity.status}</span>
                                    <span>
                                      {activity.data || activity.prazo || ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        </List>
                      ) : (
                        <div className="text-xs text-gray-400 text-center py-6">
                          Sem atividades
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </CardContent>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar via chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="Escreva uma mensagem (opcional)"
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              className="min-h-24"
            />
            <Input
              placeholder="Buscar usuário..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <div className="max-h-56 overflow-auto border rounded">
              {(Array.isArray(searchResults) ? searchResults : []).map(
                (u: any) => (
                  <button
                    key={u.id || u._id}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${selectedUserId === u._id ? "bg-gray-100" : ""}`}
                    onClick={() => setSelectedUserId(u.id || u._id)}
                  >
                    {u.name}{" "}
                    <span className="text-xs text-gray-500">{u.email}</span>
                  </button>
                )
              )}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch
                id="redirect-chat"
                checked={redirectToChat}
                onCheckedChange={setRedirectToChat}
              />
              <Label htmlFor="redirect-chat" className="text-sm text-gray-600">
                Abrir página de agenda após enviar
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleShare}
              disabled={!selectedUserId || !shareActivity}
            >
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de tarefa */}
      <TodoForm
        isOpen={todoModalOpen}
        onClose={() => setTodoModalOpen(false)}
        onSubmit={handleSubmitTodo}
        initialData={todoInitialData}
        title="Nova Tarefa da Agenda"
      />
    </Card>
  );
}
