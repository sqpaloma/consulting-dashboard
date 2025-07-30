"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import { FixedSizeList as List } from "react-window";

export function CalendarMain() {
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  // Estados para drag and drop
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTodo, setActiveTodo] = useState<any>(null);

  // Configuração dos sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    responsible: "",
    scheduledDate: "",
  });

  const todos = useQuery(api.todos.getTodos);
  const notes = useQuery(api.notes.getNotes);

  const createTodo = useMutation(api.todos.createTodo);
  const updateTodo = useMutation(api.todos.updateTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const createNote = useMutation(api.notes.createNote);
  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);

  // Filtros para as três colunas separadas usando marcadores especiais
  const pendingTodos =
    todos?.filter(
      (todo) =>
        !todo.completed &&
        (!todo.description || !todo.description.includes("[EM_PROCESSO]"))
    ) || [];
  const inProgressTodos =
    todos?.filter(
      (todo) =>
        !todo.completed &&
        todo.description &&
        todo.description.includes("[EM_PROCESSO]")
    ) || [];
  const completedTodos = todos?.filter((todo) => todo.completed) || [];

  const columns = [
    {
      id: "todo",
      title: "A Fazer",
      color: "bg-gray-50",
      todos: pendingTodos,
    },
    {
      id: "in-progress",
      title: "Em Processo",
      color: "bg-gray-50",
      todos: inProgressTodos,
    },
    {
      id: "completed",
      title: "Concluído",
      color: "bg-gray-50",
      todos: completedTodos,
    },
  ];

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;
    if (!newTodo.responsible.trim()) {
      alert("Por favor, preencha o responsável");
      return;
    }
    if (!newTodo.scheduledDate) {
      alert("Por favor, selecione uma data agendada");
      return;
    }

    // Solução temporária: incluir responsável e data na descrição
    let fullDescription = newTodo.description || "";
    if (newTodo.responsible) {
      fullDescription += `\nResponsável: ${newTodo.responsible}`;
    }
    if (newTodo.scheduledDate) {
      fullDescription += `\nData Agendada: ${newTodo.scheduledDate}`;
    }

    await createTodo({
      title: newTodo.title,
      description: fullDescription.trim() || undefined,
      priority: "medium",
    });

    setNewTodo({
      title: "",
      description: "",
      responsible: "",
      scheduledDate: "",
    });
    setIsAddingTodo(false);
  };

  const handleStatusChange = async (todoId: string, newStatus: string) => {
    // Buscar a tarefa atual para obter a descrição
    const currentTodo = todos?.find((todo) => todo._id === todoId);
    if (!currentTodo) return;

    // Extrair informações existentes da descrição
    const { responsible, scheduledDate, cleanDescription } =
      extractInfoFromDescription(currentTodo.description || "");
    let newDescription = cleanDescription || "";
    let isCompleted = false;

    if (newStatus === "completed") {
      isCompleted = true;
      // Remover marcador se existir, mantendo responsável e data
      newDescription = newDescription.replace("[EM_PROCESSO]", "").trim();
      if (responsible) {
        newDescription += `\nResponsável: ${responsible}`;
      }
      if (scheduledDate) {
        newDescription += `\nData Agendada: ${scheduledDate}`;
      }
    } else if (newStatus === "in-progress") {
      // Adicionar marcador se não existir, mantendo responsável e data
      if (!newDescription.includes("[EM_PROCESSO]")) {
        newDescription = newDescription
          ? `${newDescription} [EM_PROCESSO]`
          : "[EM_PROCESSO]";
      }
      if (responsible) {
        newDescription += `\nResponsável: ${responsible}`;
      }
      if (scheduledDate) {
        newDescription += `\nData Agendada: ${scheduledDate}`;
      }
    } else if (newStatus === "todo") {
      // Remover marcador se existir, mantendo responsável e data
      newDescription = newDescription.replace("[EM_PROCESSO]", "").trim();
      if (responsible) {
        newDescription += `\nResponsável: ${responsible}`;
      }
      if (scheduledDate) {
        newDescription += `\nData Agendada: ${scheduledDate}`;
      }
    }

    await updateTodo({
      id: todoId as any,
      description: newDescription.trim() || undefined,
      completed: isCompleted,
    });
  };

  const handleDeleteTodo = async (todoId: string) => {
    await deleteTodo({ id: todoId as any });
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    await createNote({
      title: newNote.title,
      content: newNote.content,
    });

    setNewNote({ title: "", content: "" });
    setIsAddingNote(false);
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !newNote.title.trim() || !newNote.content.trim())
      return;

    await updateNote({
      id: editingNote as any,
      title: newNote.title,
      content: newNote.content,
    });

    setNewNote({ title: "", content: "" });
    setEditingNote(null);
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo || !newTodo.title.trim()) return;
    if (!newTodo.responsible.trim()) {
      alert("Por favor, preencha o responsável");
      return;
    }
    if (!newTodo.scheduledDate) {
      alert("Por favor, selecione uma data agendada");
      return;
    }

    // Solução temporária: incluir responsável e data na descrição
    let fullDescription = newTodo.description || "";
    if (newTodo.responsible) {
      fullDescription += `\nResponsável: ${newTodo.responsible}`;
    }
    if (newTodo.scheduledDate) {
      fullDescription += `\nData Agendada: ${newTodo.scheduledDate}`;
    }

    await updateTodo({
      id: editingTodo as any,
      title: newTodo.title,
      description: fullDescription.trim() || undefined,
    });

    setNewTodo({
      title: "",
      description: "",
      responsible: "",
      scheduledDate: "",
    });
    setEditingTodo(null);
  };

  const handleClearCompleted = async () => {
    if (confirm("Tem certeza que deseja limpar todas as tarefas concluídas?")) {
      const completedTodos = todos?.filter((todo) => todo.completed) || [];

      for (const todo of completedTodos) {
        await deleteTodo({ id: todo._id as any });
      }
    }
  };

  // Funções para drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    const allTodos = [...pendingTodos, ...inProgressTodos, ...completedTodos];
    const todo = allTodos.find((t) => t._id === active.id);
    setActiveTodo(todo);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveTodo(null);
      return;
    }

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    if (activeIdStr !== overIdStr) {
      const allTodos = [...pendingTodos, ...inProgressTodos, ...completedTodos];
      const activeTodo = allTodos.find((t) => t._id === activeIdStr);

      if (activeTodo) {
        // Extrair informações existentes da descrição
        const { responsible, scheduledDate, cleanDescription } =
          extractInfoFromDescription(activeTodo.description || "");
        let newDescription = cleanDescription || "";
        let isCompleted = false;

        // Determinar o novo status baseado na coluna onde foi solto
        if (overIdStr === "in-progress") {
          // Adicionar marcador se não existir, mantendo responsável e data
          if (!newDescription.includes("[EM_PROCESSO]")) {
            newDescription = newDescription
              ? `${newDescription} [EM_PROCESSO]`
              : "[EM_PROCESSO]";
          }
          // Manter responsável e data se existirem
          if (responsible) {
            newDescription += `\nResponsável: ${responsible}`;
          }
          if (scheduledDate) {
            newDescription += `\nData Agendada: ${scheduledDate}`;
          }
        } else if (overIdStr === "completed") {
          isCompleted = true;
          // Remover marcador se existir, mantendo responsável e data
          newDescription = newDescription.replace("[EM_PROCESSO]", "").trim();
          if (responsible) {
            newDescription += `\nResponsável: ${responsible}`;
          }
          if (scheduledDate) {
            newDescription += `\nData Agendada: ${scheduledDate}`;
          }
        } else if (overIdStr === "todo") {
          // Remover marcador se existir, mantendo responsável e data
          newDescription = newDescription.replace("[EM_PROCESSO]", "").trim();
          if (responsible) {
            newDescription += `\nResponsável: ${responsible}`;
          }
          if (scheduledDate) {
            newDescription += `\nData Agendada: ${scheduledDate}`;
          }
        }

        await updateTodo({
          id: activeTodo._id as any,
          description: newDescription.trim() || undefined,
          completed: isCompleted,
        });
      }
    }

    setActiveId(null);
    setActiveTodo(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveTodo(null);
  };

  // Função para extrair responsável e data da descrição
  const extractInfoFromDescription = (description: string) => {
    const responsibleMatch = description.match(/Responsável: (.+)/);
    const dateMatch = description.match(/Data Agendada: (.+)/);

    const responsible = responsibleMatch ? responsibleMatch[1] : null;
    const scheduledDate = dateMatch ? dateMatch[1] : null;
    const cleanDescription = description
      .replace(/Responsável: .+\n?/g, "")
      .replace(/Data Agendada: .+\n?/g, "")
      .trim();

    return { responsible, scheduledDate, cleanDescription };
  };

  // Componente para renderizar cada card de tarefa simplificado
  const TodoCard = ({
    todo,
    onStatusChange,
    onDelete,
  }: {
    todo: any;
    onStatusChange: (id: string, status: string) => void;
    onDelete: (id: string) => void;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: todo._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const { responsible, scheduledDate, cleanDescription } =
      extractInfoFromDescription(todo.description || "");

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white rounded-lg border border-gray-200 p-3 mb-2 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() =>
                onStatusChange(todo._id, todo.completed ? "todo" : "completed")
              }
              className="mt-1"
            />
            <div className="flex-1">
              <h3
                className={`font-medium text-sm ${todo.completed ? "line-through text-gray-500" : "text-gray-900"}`}
              >
                {todo.title}
              </h3>
              {cleanDescription && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {cleanDescription.replace("[EM_PROCESSO]", "").trim()}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {responsible && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {responsible}
                  </span>
                )}
                {scheduledDate && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {new Date(scheduledDate).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const { responsible, scheduledDate, cleanDescription } =
                  extractInfoFromDescription(todo.description || "");
                setEditingTodo(todo._id);
                setNewTodo({
                  title: todo.title,
                  description: cleanDescription,
                  responsible: responsible || "",
                  scheduledDate: scheduledDate || "",
                });
              }}
              className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(todo._id)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Componente para renderizar cada item na lista virtualizada
  const TodoItem = ({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties;
    data: {
      todos: any[];
      onStatusChange: (id: string, status: string) => void;
      onDelete: (id: string) => void;
    };
  }) => {
    const todo = data.todos[index];
    if (!todo) return null;

    return (
      <div style={style}>
        <TodoCard
          todo={todo}
          onStatusChange={data.onStatusChange}
          onDelete={data.onDelete}
        />
      </div>
    );
  };

  // Componente para coluna droppable
  const DroppableColumn = ({ column }: { column: any }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: column.id,
    });

    return (
      <div
        ref={setNodeRef}
        className={`rounded-lg p-4 bg-gray-50 border border-gray-200 transition-colors ${
          isOver ? "bg-gray-100 border-gray-300" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
            {column.todos.length}
          </span>
        </div>

        <div
          className="space-y-2"
          style={{ height: "400px", overflow: "hidden" }}
        >
          <SortableContext
            items={column.todos.map((todo: any) => todo._id)}
            strategy={verticalListSortingStrategy}
          >
            <List
              height={400}
              itemCount={column.todos.length}
              itemSize={80}
              width="100%"
              itemData={{
                todos: column.todos,
                onStatusChange: handleStatusChange,
                onDelete: handleDeleteTodo,
              }}
            >
              {TodoItem}
            </List>
          </SortableContext>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com botões */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Tarefas</h2>
        <div className="flex items-center gap-3">
          <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white">
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTodo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newTodo.title}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, title: e.target.value })
                    }
                    placeholder="Digite o título da tarefa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={newTodo.description}
                    onChange={(e) =>
                      setNewTodo({ ...newTodo, description: e.target.value })
                    }
                    placeholder="Digite uma descrição"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsible">Responsável *</Label>
                    <Input
                      id="responsible"
                      value={newTodo.responsible}
                      onChange={(e) =>
                        setNewTodo({ ...newTodo, responsible: e.target.value })
                      }
                      placeholder="Nome do responsável"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Data Agendada *</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={newTodo.scheduledDate}
                      onChange={(e) =>
                        setNewTodo({
                          ...newTodo,
                          scheduledDate: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      required
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

          {completedTodos.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCompleted}
              className="bg-white"
              title="Limpar Concluídas"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Seção Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {columns.map((column) => (
            <DroppableColumn key={column.id} column={column} />
          ))}

          <DragOverlay>
            {activeId && activeTodo ? (
              <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-lg opacity-90">
                <div className="flex items-start gap-2">
                  <Checkbox checked={activeTodo.completed} className="mt-1" />
                  <div>
                    <h3
                      className={`font-medium text-sm ${activeTodo.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                    >
                      {activeTodo.title}
                    </h3>
                    {(() => {
                      const { responsible, scheduledDate, cleanDescription } =
                        extractInfoFromDescription(
                          activeTodo.description || ""
                        );
                      return (
                        <>
                          {cleanDescription && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {cleanDescription
                                .replace("[EM_PROCESSO]", "")
                                .trim()}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {responsible && (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {responsible}
                              </span>
                            )}
                            {scheduledDate && (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {new Date(scheduledDate).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </span>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Seção de Notas */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Notas</h3>
          <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nova Nota
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Nota</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note-title">Título</Label>
                  <Input
                    id="note-title"
                    value={newNote.title}
                    onChange={(e) =>
                      setNewNote({ ...newNote, title: e.target.value })
                    }
                    placeholder="Digite o título da nota"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note-content">Conteúdo</Label>
                  <Textarea
                    id="note-content"
                    value={newNote.content}
                    onChange={(e) =>
                      setNewNote({ ...newNote, content: e.target.value })
                    }
                    placeholder="Digite o conteúdo da nota"
                    rows={5}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingNote(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Nota</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes?.map((note) => (
            <Card key={note._id} className="h-fit">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{note.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingNote(note._id);
                        setNewNote({
                          title: note.title,
                          content: note.content,
                        });
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNote({ id: note._id as any })}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {note.content}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(note.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog para editar nota */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nota</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateNote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-note-title">Título</Label>
              <Input
                id="edit-note-title"
                value={newNote.title}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-note-content">Conteúdo</Label>
              <Textarea
                id="edit-note-content"
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                rows={5}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingNote(null)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar tarefa */}
      <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTodo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={newTodo.title}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, title: e.target.value })
                }
                placeholder="Digite o título da tarefa"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Textarea
                id="edit-description"
                value={newTodo.description}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, description: e.target.value })
                }
                placeholder="Digite uma descrição"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-responsible">Responsável *</Label>
                <Input
                  id="edit-responsible"
                  value={newTodo.responsible}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, responsible: e.target.value })
                  }
                  placeholder="Nome do responsável"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-scheduledDate">Data Agendada *</Label>
                <Input
                  id="edit-scheduledDate"
                  type="date"
                  value={newTodo.scheduledDate}
                  onChange={(e) =>
                    setNewTodo({ ...newTodo, scheduledDate: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingTodo(null)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
