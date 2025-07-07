"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, RefreshCw } from "lucide-react";
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

interface DashboardCalendarProps {
  processedItems?: CalendarItem[];
  onDateClick?: (date: string, items: CalendarItem[]) => void;
}

export function DashboardCalendar({
  processedItems = [],
  onDateClick,
}: DashboardCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarItems, setCalendarItems] = useState<{
    [key: string]: CalendarItem[];
  }>({});
  const [databaseItems, setDatabaseItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Processa os itens para extrair datas de prazo
  useEffect(() => {
    const itemsByDate: { [key: string]: CalendarItem[] } = {};

    // Combina dados da planilha com dados do banco
    const allItems = [...processedItems, ...databaseItems];

    allItems.forEach((item) => {
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
        const dateKey = prazoDate.toISOString().split("T")[0]; // YYYY-MM-DD
        if (!itemsByDate[dateKey]) {
          itemsByDate[dateKey] = [];
        }
        itemsByDate[dateKey].push(item);
      }
    });

    setCalendarItems(itemsByDate);
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

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const calendarDays = [];

  // Dias vazios no início
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const today = new Date().getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getMonthName = (month: number) => {
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    return months[month];
  };

  const handleDateClick = (day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    const itemsForDate = calendarItems[dateKey] || [];

    if (itemsForDate.length > 0) {
      setSelectedDate(dateKey);
      if (onDateClick) {
        onDateClick(dateKey, itemsForDate);
      }
    }
  };

  const hasItemsOnDate = (day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    return calendarItems[dateKey] && calendarItems[dateKey].length > 0;
  };

  const getItemsCountOnDate = (day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    return calendarItems[dateKey] ? calendarItems[dateKey].length : 0;
  };

  const isDatePastToday = (day: number) => {
    const itemDate = new Date(currentYear, currentMonth, day);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return itemDate < todayDate;
  };

  const isDateFutureToday = (day: number) => {
    const itemDate = new Date(currentYear, currentMonth, day);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return itemDate > todayDate;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-800 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Próximos Agendamentos
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
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-gray-700">
            {getMonthName(currentMonth)} {currentYear}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 p-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                aspect-square p-2 text-center text-sm cursor-pointer rounded-lg
                ${
                  day === null
                    ? "invisible"
                    : day === today &&
                      currentMonth === new Date().getMonth() &&
                      currentYear === new Date().getFullYear()
                    ? "bg-blue-100 text-blue-600 font-bold"
                    : hasItemsOnDate(day) && isDatePastToday(day)
                    ? "bg-red-100 text-red-800 font-medium hover:bg-red-200"
                    : hasItemsOnDate(day) && isDateFutureToday(day)
                    ? "bg-green-100 text-green-800 font-medium hover:bg-green-200"
                    : hasItemsOnDate(day)
                    ? "bg-blue-100 text-blue-600 font-medium hover:bg-blue-200"
                    : "hover:bg-gray-100 text-gray-700"
                }
                ${
                  selectedDate ===
                  `${currentYear}-${String(currentMonth + 1).padStart(
                    2,
                    "0"
                  )}-${String(day).padStart(2, "0")}`
                    ? "ring-2 ring-blue-500"
                    : ""
                }
              `}
              onClick={() => day && handleDateClick(day)}
            >
              {day}
              {day && hasItemsOnDate(day) && (
                <div
                  className={`w-1 h-1 rounded-full mx-auto mt-1 ${
                    day === today &&
                    currentMonth === new Date().getMonth() &&
                    currentYear === new Date().getFullYear()
                      ? "bg-blue-500"
                      : isDatePastToday(day)
                      ? "bg-red-500"
                      : isDateFutureToday(day)
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
