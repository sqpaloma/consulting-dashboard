import { useState, useEffect, useRef } from "react";

import { CalendarItem } from "../types";

export function useActivityData(
  processedItems: CalendarItem[],
  databaseItems: CalendarItem[],
  completedActivities: Set<string>
) {
  const [todayActivities, setTodayActivities] = useState<CalendarItem[]>([]);
  const isInitialLoad = useRef(true);

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

  const getStatusColor = (status: string, itemDate?: string) => {
    // Verifica se o item está atrasado
    const isOverdue = (dateString: string | undefined): boolean => {
      if (!dateString) return false;
      
      let itemDateParsed = null;
      
      // Primeiro, tenta usar o campo data se estiver em formato ISO
      if (dateString && dateString.includes("-")) {
        // Para datas em formato YYYY-MM-DD, força interpretação no fuso horário local
        const dateParts = dateString.split("-");
        if (dateParts.length === 3) {
          itemDateParsed = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        } else {
          itemDateParsed = new Date(dateString);
        }
        if (isNaN(itemDateParsed.getTime())) {
          itemDateParsed = null;
        }
      } else if (dateString) {
        itemDateParsed = parseDate(dateString);
      }
      
      if (itemDateParsed) {
        const today = new Date();
        const todayBrasilia = new Date(
          today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
        );
        todayBrasilia.setHours(0, 0, 0, 0);
        itemDateParsed.setHours(0, 0, 0, 0);
        
        
        return itemDateParsed < todayBrasilia;
      }
      
      return false;
    };

    // Se o item estiver atrasado, retorna cor vermelha
    if (isOverdue(itemDate)) {
      return "bg-red-100 border-red-300"; // vermelho para itens atrasados
    }

    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("análise") ||
      statusLower.includes("analise")
    ) {
      return "bg-yellow-50 border-yellow-200"; // amarelo
    } else if (
      statusLower.includes("orçamento") ||
      statusLower.includes("orcamento")
    ) {
      return "bg-red-50 border-red-200"; // laranja avermelhado
    } else if (
      statusLower.includes("aguardando") ||
      statusLower.includes("aprovação") ||
      statusLower.includes("aprovacao")
    ) {
      return "bg-blue-50 border-blue-200"; // azul
    } else if (
      statusLower.includes("execução") ||
      statusLower.includes("execucao") ||
      statusLower.includes("andamento")
    ) {
      return "bg-purple-50 border-purple-200"; // lilas/roxo
    } else if (
      statusLower.includes("pronto") ||
      statusLower.includes("concluído") ||
      statusLower.includes("concluido")
    ) {
      return "bg-pink-50 border-pink-200"; // rosa
    } else {
      return "bg-gray-50 border-gray-200"; // cinza padrão
    }
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

    // Garante que atividades concluídas sempre fiquem no final, mesmo se não houver ordem salva
    if (completedActivitiesList.length > 0) {
      const finalPendingActivities = sortedActivities.filter(
        (activity) => !completedActivities.has(activity.id)
      );
      const finalCompletedActivities = sortedActivities.filter((activity) =>
        completedActivities.has(activity.id)
      );
      sortedActivities = [
        ...finalPendingActivities,
        ...finalCompletedActivities,
      ];
    }

    // Sempre atualiza para garantir que atividades concluídas fiquem no final
    setTodayActivities(sortedActivities);
    isInitialLoad.current = false;
  }, [processedItems, databaseItems, completedActivities]);

  return {
    todayActivities,
    setTodayActivities,
    getStatusColor,
  };
}
