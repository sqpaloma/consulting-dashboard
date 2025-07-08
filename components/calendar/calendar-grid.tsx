"use client";

import { CalendarEvent } from "./calendar-event";
import { CalendarTodo } from "./calendar-todo";

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: string | null;
  onDateSelect: (dateStr: string) => void;
  events: any[];
  todos: any[];
  getEventsForDate: (day: number) => any[];
  getTodosForDate: (day: number) => any[];
  formatDateForDB: (year: number, month: number, day: number) => string;
}

export function CalendarGrid({
  currentDate,
  selectedDate,
  onDateSelect,
  events,
  todos,
  getEventsForDate,
  getTodosForDate,
  formatDateForDB,
}: CalendarGridProps) {
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

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-4">
      {/* Header dos dias da semana */}
      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-gray-600 border-b"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="min-h-[120px] p-2"></div>;
          }

          const dayEvents = getEventsForDate(day);
          const dayTodos = getTodosForDate(day);
          const dateStr = formatDateForDB(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            day
          );
          const isSelected = selectedDate === dateStr;
          const isTodayDay = isToday(day);

          return (
            <div key={index} className="min-h-[120px] p-2">
              <div
                className={`w-full h-full border rounded-lg p-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : isTodayDay
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => onDateSelect(dateStr)}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isTodayDay ? "text-green-600" : "text-gray-800"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 1).map((event) => (
                    <CalendarEvent
                      key={event._id}
                      event={event}
                      compact={true}
                    />
                  ))}
                  {dayTodos.slice(0, 1).map((todo) => (
                    <CalendarTodo key={todo._id} todo={todo} compact={true} />
                  ))}
                  {dayEvents.length + dayTodos.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length + dayTodos.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
