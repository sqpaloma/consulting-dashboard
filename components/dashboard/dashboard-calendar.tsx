"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";

interface CalendarItem {
  id: string;
  os: string;
  titulo: string;
  cliente: string;
  status: string;
  valor: string;
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

  // Processa os itens para extrair datas de prazo
  useEffect(() => {
    const itemsByDate: { [key: string]: CalendarItem[] } = {};

    processedItems.forEach((item) => {
      // Tenta extrair a data do prazo
      let prazoDate = null;

      // Primeiro, tenta usar a coluna "prazo" se existir
      if (item.prazo) {
        prazoDate = parseDate(item.prazo);
      }

      // Se não encontrar prazo, usa a data padrão
      if (!prazoDate && item.data) {
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
  }, [processedItems]);

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
          </CardTitle>
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
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, idx) => (
            <div key={idx} className="p-2 text-gray-500 font-medium">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => (
            <div key={index} className="p-2">
              {day && (
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm relative cursor-pointer transition-all ${
                    day === today
                      ? "bg-green-500 text-white"
                      : hasItemsOnDate(day)
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  {day}
                  {hasItemsOnDate(day) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {getItemsCountOnDate(day)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Hoje</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded-full mr-1"></div>
                <span>Agendamentos</span>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Clique para ver detalhes</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
