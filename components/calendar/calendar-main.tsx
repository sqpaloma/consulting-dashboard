"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Trash2,
  ListTodo,
} from "lucide-react";
import { api } from "@/convex/_generated/api";

export function CalendarMain() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "1h",
    location: "",
    participants: [] as string[],
    color: "bg-blue-500",
  });

  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    category: "",
  });

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

  // Queries do Convex
  const events = useQuery(api.events.getEventsByMonth, {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });
  const todos = useQuery(api.todos.getTodos);
  const pendingTodos = useQuery(api.todos.getPendingTodos);
  const completedTodos = useQuery(api.todos.getCompletedTodos);

  // Mutations do Convex
  const createEvent = useMutation(api.events.createEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);
  const createTodo = useMutation(api.todos.createTodo);
  const updateTodo = useMutation(api.todos.updateTodo);
  const toggleTodoComplete = useMutation(api.todos.toggleTodoComplete);
  const deleteTodo = useMutation(api.todos.deleteTodo);

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
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const formatDateForDB = (year: number, month: number, day: number) => {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getEventsForDate = (day: number) => {
    if (!events) return [];
    const dateStr = formatDateForDB(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      day
    );
    return events.filter((event) => event.date === dateStr);
  };

  const getTodosForDate = (day: number) => {
    if (!todos) return [];
    const dateStr = formatDateForDB(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      day
    );
    return todos.filter((todo) => todo.dueDate === dateStr);
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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date) return;

    await createEvent({
      title: newEvent.title,
      description: newEvent.description || undefined,
      date: newEvent.date,
      time: newEvent.time,
      duration: newEvent.duration,
      location: newEvent.location,
      participants: newEvent.participants,
      color: newEvent.color,
    });

    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      duration: "1h",
      location: "",
      participants: [],
      color: "bg-blue-500",
    });
    setIsAddingEvent(false);
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    await createTodo({
      title: newTodo.title,
      description: newTodo.description || undefined,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate || undefined,
      category: newTodo.category || undefined,
    });

    setNewTodo({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      category: "",
    });
    setIsAddingTodo(false);
  };

  const handleToggleComplete = async (todoId: string) => {
    await toggleTodoComplete({ id: todoId as any });
  };

  const selectedDateStr = selectedDate;
  const selectedEvents = selectedDateStr
    ? events?.filter((event) => event.date === selectedDateStr) || []
    : [];
  const selectedTodos = selectedDateStr
    ? todos?.filter((todo) => todo.dueDate === selectedDateStr) || []
    : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header title="Calendário & Tarefas" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendário - Lado Esquerdo */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border-0 shadow-sm">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </h2>
                  <div className="flex items-center space-x-1">
                    <Dialog
                      open={isAddingEvent}
                      onOpenChange={setIsAddingEvent}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Evento
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Novo Evento</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={handleCreateEvent}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="event-title">Título</Label>
                            <Input
                              id="event-title"
                              placeholder="Digite o título do evento"
                              value={newEvent.title}
                              onChange={(e) =>
                                setNewEvent({
                                  ...newEvent,
                                  title: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-date">Data</Label>
                            <Input
                              id="event-date"
                              type="date"
                              value={newEvent.date}
                              onChange={(e) =>
                                setNewEvent({
                                  ...newEvent,
                                  date: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="event-time">Hora</Label>
                              <Input
                                id="event-time"
                                type="time"
                                value={newEvent.time}
                                onChange={(e) =>
                                  setNewEvent({
                                    ...newEvent,
                                    time: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="event-duration">Duração</Label>
                              <Input
                                id="event-duration"
                                placeholder="Ex: 1h, 30min"
                                value={newEvent.duration}
                                onChange={(e) =>
                                  setNewEvent({
                                    ...newEvent,
                                    duration: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-location">Local</Label>
                            <Input
                              id="event-location"
                              placeholder="Local do evento"
                              value={newEvent.location}
                              onChange={(e) =>
                                setNewEvent({
                                  ...newEvent,
                                  location: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsAddingEvent(false)}
                            >
                              Cancelar
                            </Button>
                            <Button type="submit">Criar Evento</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateMonth("prev")}
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateMonth("next")}
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-2 text-center text-xs font-medium text-gray-500"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    if (!day)
                      return (
                        <div key={index} className="aspect-square p-1"></div>
                      );

                    const dayEvents = getEventsForDate(day);
                    const dayTodos = getTodosForDate(day);
                    const dateStr = formatDateForDB(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      day
                    );
                    const isSelected = selectedDate === dateStr;
                    const isToday =
                      day === new Date().getDate() &&
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear();

                    return (
                      <div key={index} className="aspect-square p-1">
                        <div
                          className={`w-full h-full rounded-lg p-2 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-blue-50 border border-blue-200"
                              : isToday
                                ? "bg-green-50 border border-green-200"
                                : "hover:bg-gray-50 border border-transparent"
                          }`}
                          onClick={() => setSelectedDate(dateStr)}
                        >
                          <div
                            className={`text-sm font-medium mb-1 ${
                              isToday
                                ? "text-green-600"
                                : isSelected
                                  ? "text-blue-600"
                                  : "text-gray-700"
                            }`}
                          >
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 1).map((event) => (
                              <div
                                key={event._id}
                                className="text-xs p-1 rounded bg-blue-100 text-blue-700 truncate"
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayTodos.slice(0, 1).map((todo) => (
                              <div
                                key={todo._id}
                                className="text-xs p-1 rounded bg-orange-100 text-orange-700 truncate"
                              >
                                {todo.title}
                              </div>
                            ))}
                            {dayEvents.length + dayTodos.length > 1 && (
                              <div className="text-xs text-gray-400">
                                +{dayEvents.length + dayTodos.length - 1}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Eventos do Dia Selecionado */}
            <div className="bg-white rounded-lg border-0 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedDate
                    ? `${formatDate(selectedDate)}`
                    : "Selecione uma data"}
                </h3>

                {selectedDate ? (
                  <div className="space-y-4">
                    {selectedEvents.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-500 mb-3">
                          Eventos
                        </h5>
                        {selectedEvents.map((event) => (
                          <div
                            key={event._id}
                            className="p-3 bg-gray-50 rounded-lg mb-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {event.title}
                                </h4>
                                <div className="space-y-1 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-2" />
                                    {event.time} ({event.duration})
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center">
                                      <MapPin className="h-3 w-3 mr-2" />
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteEvent({ id: event._id })}
                                className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedTodos.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-500 mb-3">
                          Tarefas
                        </h5>
                        {selectedTodos.map((todo) => (
                          <div
                            key={todo._id}
                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-2"
                          >
                            <Checkbox
                              checked={todo.completed}
                              onCheckedChange={() =>
                                handleToggleComplete(todo._id)
                              }
                            />
                            <span
                              className={`text-sm flex-1 ${
                                todo.completed
                                  ? "line-through text-gray-500"
                                  : "text-gray-800"
                              }`}
                            >
                              {todo.title}
                            </span>
                            <div
                              className={`text-xs px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}
                            >
                              {todo.priority === "high"
                                ? "Alta"
                                : todo.priority === "medium"
                                  ? "Média"
                                  : "Baixa"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedEvents.length === 0 &&
                      selectedTodos.length === 0 && (
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
              </div>
            </div>
          </div>

          {/* Tarefas - Lado Direito */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border-0 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Lista de Tarefas
                  </h2>
                  <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nova Tarefa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Nova Tarefa</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateTodo} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="todo-title">Título</Label>
                          <Input
                            id="todo-title"
                            placeholder="Digite o título da tarefa"
                            value={newTodo.title}
                            onChange={(e) =>
                              setNewTodo({
                                ...newTodo,
                                title: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="todo-description">Descrição</Label>
                          <Textarea
                            id="todo-description"
                            placeholder="Descrição opcional"
                            value={newTodo.description}
                            onChange={(e) =>
                              setNewTodo({
                                ...newTodo,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="todo-priority">Prioridade</Label>
                            <Select
                              value={newTodo.priority}
                              onValueChange={(value) =>
                                setNewTodo({ ...newTodo, priority: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="medium">Média</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="todo-dueDate">
                              Data de Vencimento
                            </Label>
                            <Input
                              id="todo-dueDate"
                              type="date"
                              value={newTodo.dueDate}
                              onChange={(e) =>
                                setNewTodo({
                                  ...newTodo,
                                  dueDate: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddingTodo(false)}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">Criar Tarefa</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-3">
                  {pendingTodos?.map((todo) => (
                    <div
                      key={todo._id}
                      className="p-4 bg-gray-50 rounded-lg transition-all hover:bg-gray-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() =>
                              handleToggleComplete(todo._id)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">
                                {todo.title}
                              </h4>
                              <div
                                className={`text-xs px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}
                              >
                                {todo.priority === "high"
                                  ? "Alta"
                                  : todo.priority === "medium"
                                    ? "Média"
                                    : "Baixa"}
                              </div>
                            </div>
                            {todo.description && (
                              <p className="text-sm text-gray-600">
                                {todo.description}
                              </p>
                            )}
                            {todo.dueDate && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(todo.dueDate)}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTodo({ id: todo._id as any })}
                          className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingTodos?.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma tarefa pendente
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Estatísticas das Tarefas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border-0 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {pendingTodos?.length || 0}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg border-0 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Concluídas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {completedTodos?.length || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Tarefas Concluídas Recentemente */}
            {completedTodos && completedTodos.length > 0 && (
              <div className="bg-white rounded-lg border-0 shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Concluídas Recentemente
                  </h3>
                  <div className="space-y-2">
                    {completedTodos.slice(0, 5).map((todo) => (
                      <div
                        key={todo._id}
                        className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="line-through text-gray-500">
                          {todo.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
