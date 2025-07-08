"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
import {
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit,
} from "lucide-react";
import { api } from "@/convex/_generated/api";

interface CalendarTodoListProps {
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
}

export function CalendarTodoList({
  selectedDate,
  onDateSelect,
}: CalendarTodoListProps) {
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: selectedDate || "",
    category: "",
  });

  const todos = useQuery(api.todos.getTodos);
  const pendingTodos = useQuery(api.todos.getPendingTodos);
  const completedTodos = useQuery(api.todos.getCompletedTodos);
  const todosForDate = selectedDate
    ? useQuery(api.todos.getTodosByDueDate, { dueDate: selectedDate })
    : [];

  const createTodo = useMutation(api.todos.createTodo);
  const updateTodo = useMutation(api.todos.updateTodo);
  const toggleTodoComplete = useMutation(api.todos.toggleTodoComplete);
  const deleteTodo = useMutation(api.todos.deleteTodo);

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
      dueDate: selectedDate || "",
      category: "",
    });
    setIsAddingTodo(false);
  };

  const handleToggleComplete = async (todoId: string) => {
    await toggleTodoComplete({ id: todoId as any });
  };

  const handleDeleteTodo = async (todoId: string) => {
    await deleteTodo({ id: todoId as any });
  };

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-3 w-3" />;
      case "medium":
        return <Calendar className="h-3 w-3" />;
      case "low":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Header com botão para adicionar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          {selectedDate
            ? `Tarefas para ${formatDate(selectedDate)}`
            : "Todas as Tarefas"}
        </h2>
        <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTodo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Digite o título da tarefa"
                  value={newTodo.title}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição opcional"
                  value={newTodo.description}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
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
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  placeholder="Categoria opcional"
                  value={newTodo.category}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, category: e.target.value })
                  }
                />
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

      {/* Lista de tarefas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedDate ? "Tarefas do Dia" : "Tarefas Pendentes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(selectedDate ? todosForDate : pendingTodos)?.map((todo) => (
              <div
                key={todo._id}
                className={`p-4 rounded-lg border transition-all ${
                  todo.completed
                    ? "bg-gray-50 border-gray-200"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo._id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4
                          className={`font-medium ${todo.completed ? "line-through text-gray-500" : "text-gray-800"}`}
                        >
                          {todo.title}
                        </h4>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getPriorityColor(todo.priority)}`}
                        >
                          <span className="flex items-center gap-1">
                            {getPriorityIcon(todo.priority)}
                            {todo.priority === "high"
                              ? "Alta"
                              : todo.priority === "medium"
                                ? "Média"
                                : "Baixa"}
                          </span>
                        </Badge>
                      </div>
                      {todo.description && (
                        <p
                          className={`text-sm ${todo.completed ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {todo.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {todo.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(todo.dueDate)}
                          </span>
                        )}
                        {todo.category && (
                          <Badge variant="outline" className="text-xs">
                            {todo.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTodo(todo._id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {(selectedDate ? todosForDate?.length : pendingTodos?.length) ===
              0 && (
              <p className="text-gray-500 text-center py-8">
                {selectedDate
                  ? "Nenhuma tarefa para esta data"
                  : "Nenhuma tarefa pendente"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {!selectedDate && (
        <div className="grid grid-cols-2 gap-4">
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
      )}
    </div>
  );
}
