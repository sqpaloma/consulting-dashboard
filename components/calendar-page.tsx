"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)); // Janeiro 2025
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

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

  const events = [
    {
      id: 1,
      title: "Reunião de Equipe",
      date: 9,
      time: "09:00",
      duration: "1h",
      location: "Sala de Reuniões",
      participants: ["João", "Sarah", "Miguel"],
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Apresentação Cliente",
      date: 12,
      time: "14:00",
      duration: "2h",
      location: "Online",
      participants: ["Paloma", "Cliente A"],
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Revisão de Projeto",
      date: 15,
      time: "10:30",
      duration: "1h 30min",
      location: "Escritório",
      participants: ["Paloma", "Lisa"],
      color: "bg-purple-500",
    },
    {
      id: 4,
      title: "Workshop Estratégia",
      date: 21,
      time: "08:00",
      duration: "4h",
      location: "Auditório",
      participants: ["Toda Equipe"],
      color: "bg-orange-500",
    },
    {
      id: 5,
      title: "Entrega Final",
      date: 25,
      time: "16:00",
      duration: "1h",
      location: "Online",
      participants: ["Paloma", "Cliente B"],
      color: "bg-red-500",
    },
    {
      id: 6,
      title: "Planejamento Mensal",
      date: 30,
      time: "11:00",
      duration: "2h",
      location: "Sala de Reuniões",
      participants: ["Equipe Gestão"],
      color: "bg-indigo-500",
    },
  ];

  const getEventsForDate = (date: number) => {
    return events.filter((event) => event.date === date);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Header title="Calendário" />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card className="bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-gray-800">
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Novo Evento
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateMonth("prev")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateMonth("next")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-3 text-center text-sm font-semibold text-gray-600 border-b"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const dayEvents = day ? getEventsForDate(day) : [];
                    const isSelected = selectedDate === day;
                    const isToday = day === 15; // Simulando hoje como dia 15

                    return (
                      <div key={index} className="min-h-[120px] p-2">
                        {day && (
                          <div
                            className={`w-full h-full border rounded-lg p-2 cursor-pointer transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : isToday
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                            onClick={() => setSelectedDate(day)}
                          >
                            <div
                              className={`text-sm font-medium mb-1 ${
                                isToday ? "text-green-600" : "text-gray-800"
                              }`}
                            >
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded text-white truncate ${event.color}`}
                                >
                                  {event.time} {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{dayEvents.length - 2} mais
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Details Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                  {selectedDate
                    ? `Eventos - ${selectedDate} de ${
                        monthNames[currentDate.getMonth()]
                      }`
                    : "Selecione uma data"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        <h4 className="font-semibold text-gray-800">
                          {event.title}
                        </h4>
                        <div className="space-y-1 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-2" />
                            {event.time} ({event.duration})
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-2" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-2" />
                            {event.participants.join(", ")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {selectedDate
                      ? "Nenhum evento nesta data"
                      : "Clique em uma data para ver os eventos"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                  Resumo do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total de Eventos
                    </span>
                    <span className="font-semibold text-gray-800">
                      {events.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reuniões</span>
                    <span className="font-semibold text-gray-800">4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Apresentações</span>
                    <span className="font-semibold text-gray-800">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Horas Agendadas
                    </span>
                    <span className="font-semibold text-gray-800">
                      12h 30min
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${event.color}`}
                      ></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.date} de {monthNames[currentDate.getMonth()]} -{" "}
                          {event.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
