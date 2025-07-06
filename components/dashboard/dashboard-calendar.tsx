"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DashboardCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)); // Janeiro 2025

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

  const highlightedDays = [9, 12, 21, 25, 30];
  const today = 15;

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-800">
            Próximos Agendamentos
          </CardTitle>
        </div>
        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-gray-700">Jan 2025</span>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
            <div key={idx} className="p-2 text-gray-500 font-medium">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => (
            <div key={index} className="p-2">
              {day && (
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                    day === today
                      ? "bg-green-500 text-white"
                      : highlightedDays.includes(day)
                      ? "bg-green-200 text-gray-800"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {day}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
