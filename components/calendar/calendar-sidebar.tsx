"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarEvent } from "./calendar-event";
import { CalendarTodo } from "./calendar-todo";

interface CalendarSidebarProps {
  selectedDate: string | null;
  selectedEvents: any[];
  selectedTodos: any[];
  formatDate: (dateString: string) => string;
  onToggleTodo?: (todoId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onDeleteTodo?: (todoId: string) => void;
}

export function CalendarSidebar({
  selectedDate,
  selectedEvents,
  selectedTodos,
  formatDate,
  onToggleTodo,
  onDeleteEvent,
  onDeleteTodo,
}: CalendarSidebarProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800">
          {selectedDate ? formatDate(selectedDate) : "Selecione uma data"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedDate ? (
          <div className="space-y-4">
            {/* Eventos */}
            {selectedEvents.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Eventos</h5>
                <div className="space-y-2">
                  {selectedEvents.map((event) => (
                    <CalendarEvent
                      key={event._id}
                      event={event}
                      onDelete={onDeleteEvent}
                      compact={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tarefas */}
            {selectedTodos.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Tarefas</h5>
                <div className="space-y-2">
                  {selectedTodos.map((todo) => (
                    <CalendarTodo
                      key={todo._id}
                      todo={todo}
                      onToggle={onToggleTodo}
                      onDelete={onDeleteTodo}
                      compact={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem quando não há eventos ou tarefas */}
            {selectedEvents.length === 0 && selectedTodos.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Nenhum evento ou tarefa nesta data
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Clique em uma data para ver detalhes
          </p>
        )}
      </CardContent>
    </Card>
  );
}
