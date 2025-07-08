"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("calendar");

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="todos" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Tarefas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
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
                        <Dialog
                          open={isAddingEvent}
                          onOpenChange={setIsAddingEvent}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Novo Evento
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
                                  <Label htmlFor="event-duration">
                                    Duração
                                  </Label>
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
                        if (!day)
                          return (
                            <div
                              key={index}
                              className="min-h-[120px] p-2"
                            ></div>
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
                          currentDate.getFullYear() ===
                            new Date().getFullYear();

                        return (
                          <div key={index} className="min-h-[120px] p-2">
                            <div
                              className={`w-full h-full border rounded-lg p-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50"
                                  : isToday
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                              onClick={() => setSelectedDate(dateStr)}
                            >
                              <div
                                className={`text-sm font-medium mb-1 ${isToday ? "text-green-600" : "text-gray-800"}`}
                              >
                                {day}
                              </div>
                              <div className="space-y-1">
                                {dayEvents.slice(0, 1).map((event) => (
                                  <div
                                    key={event._id}
                                    className={`text-xs p-1 rounded text-white truncate ${event.color}`}
                                  >
                                    {event.time} {event.title}
                                  </div>
                                ))}
                                {dayTodos.slice(0, 1).map((todo) => (
                                  <div
                                    key={todo._id}
                                    className="text-xs p-1 rounded bg-orange-100 text-orange-800 truncate"
                                  >
                                    📝 {todo.title}
                                  </div>
                                ))}
                                {dayEvents.length + dayTodos.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{dayEvents.length + dayTodos.length - 2}{" "}
                                    mais
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-800">
                      {selectedDate
                        ? `${formatDate(selectedDate)}`
                        : "Selecione uma data"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDate ? (
                      <div className="space-y-4">
                        {selectedEvents.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">
                              Eventos
                            </h5>
                            {selectedEvents.map((event) => (
                              <div
                                key={event._id}
                                className="border-l-4 border-blue-500 pl-4 py-2 mb-2"
                              >
                                <h4 className="font-semibold text-gray-800">
                                  {event.title}
                                </h4>
                                <div className="space-y-1 mt-1 text-sm text-gray-600">
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
                            ))}
                          </div>
                        )}

                        {selectedTodos.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">
                              Tarefas
                            </h5>
                            {selectedTodos.map((todo) => (
                              <div
                                key={todo._id}
                                className="flex items-center space-x-2 py-2"
                              >
                                <Checkbox
                                  checked={todo.completed}
                                  onCheckedChange={() =>
                                    handleToggleComplete(todo._id)
                                  }
                                />
                                <span
                                  className={`text-sm ${todo.completed ? "line-through text-gray-500" : "text-gray-800"}`}
                                >
                                  {todo.title}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${getPriorityColor(todo.priority)}`}
                                >
                                  {todo.priority === "high"
                                    ? "Alta"
                                    : todo.priority === "medium"
                                      ? "Média"
                                      : "Baixa"}
                                </Badge>
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="todos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-gray-800">
                        Lista de Tarefas
                      </CardTitle>
                      <Dialog
                        open={isAddingTodo}
                        onOpenChange={setIsAddingTodo}
                      >
                        <DialogTrigger asChild>
                          <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nova Tarefa
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Nova Tarefa</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleCreateTodo}
                            className="space-y-4"
                          >
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
                              <Label htmlFor="todo-description">
                                Descrição
                              </Label>
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
                                <Label htmlFor="todo-priority">
                                  Prioridade
                                </Label>
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
                                    <SelectItem value="medium">
                                      Média
                                    </SelectItem>
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
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingTodos?.map((todo) => (
                        <div
                          key={todo._id}
                          className="p-4 rounded-lg border bg-white border-gray-200 hover:border-gray-300 transition-all"
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
                                  <h4 className="font-medium text-gray-800">
                                    {todo.title}
                                  </h4>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${getPriorityColor(todo.priority)}`}
                                  >
                                    {todo.priority === "high"
                                      ? "Alta"
                                      : todo.priority === "medium"
                                        ? "Média"
                                        : "Baixa"}
                                  </Badge>
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
                              onClick={() =>
                                deleteTodo({ id: todo._id as any })
                              }
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
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
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Pendentes</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {pendingTodos?.length || 0}
                          </p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Concluídas</p>
                          <p className="text-2xl font-bold text-green-600">
                            {completedTodos?.length || 0}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {completedTodos && completedTodos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-800">
                        Concluídas Recentemente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {completedTodos.slice(0, 5).map((todo) => (
                          <div
                            key={todo._id}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="line-through text-gray-500">
                              {todo.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
