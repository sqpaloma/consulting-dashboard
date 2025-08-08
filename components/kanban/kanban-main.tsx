"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  DndContext,
  DragEndEvent,
  DragOverlay as DndDragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { KanbanColumn } from "./kanban-column";
import { TodoForm } from "./todo-form";
import { NotesSection } from "./notes-section";
import { DragOverlay } from "./drag-overlay";
import {
  filterTodosByStatus,
  buildFullDescription,
  updateDescriptionForStatus,
  extractInfoFromDescription,
} from "./todo-utils";
import { useAuth } from "@/hooks/use-auth";

export function KanbanMain() {
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTodo, setActiveTodo] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { user } = useAuth();

  const todos = useQuery(api.todos.getTodos);
  const notes = useQuery(api.notes.getNotes);

  const createTodo = useMutation(api.todos.createTodo);
  const updateTodo = useMutation(api.todos.updateTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const createNote = useMutation(api.notes.createNote);
  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);

  // Restrição de visualização: consultores (e Lucas) veem apenas os próprios itens
  const forceOwnByEmail =
    user?.email?.toLowerCase() === "lucas@novakgouveia.com.br" ||
    user?.email?.toLowerCase() === "lucas.santos@novakgouveia.com.br";
  const isConsultor = user?.role === "consultor" && !user?.isAdmin;
  const shouldForceOwn = isConsultor || forceOwnByEmail;
  const userFirstName = (user?.name || "").split(" ")[0]?.toLowerCase() || "";

  const visibleTodos = useMemo(() => {
    const all = todos || [];
    if (!shouldForceOwn || !userFirstName) return all;
    return all.filter((t: any) => {
      const { responsible } = extractInfoFromDescription(t.description || "");
      const target = (responsible || "").toString().toLowerCase();
      return target.includes(userFirstName);
    });
  }, [todos, shouldForceOwn, userFirstName]);

  const { pendingTodos, inProgressTodos, completedTodos } =
    filterTodosByStatus(visibleTodos);

  const columns = [
    {
      id: "todo",
      title: "A Fazer",
      todos: pendingTodos,
    },
    {
      id: "in-progress",
      title: "Em Processo",
      todos: inProgressTodos,
    },
    {
      id: "completed",
      title: "Concluído",
      todos: completedTodos,
    },
  ];

  const handleCreateTodo = (todoData: {
    title: string;
    description: string;
    responsible: string;
    scheduledDate: string;
  }) => {
    const fullDescription = buildFullDescription(
      todoData.description,
      todoData.responsible,
      todoData.scheduledDate
    );

    createTodo({
      title: todoData.title,
      description: fullDescription || undefined,
      priority: "medium",
    });
  };

  const handleUpdateTodo = (todoData: {
    title: string;
    description: string;
    responsible: string;
    scheduledDate: string;
  }) => {
    if (!editingTodo) return;

    const fullDescription = buildFullDescription(
      todoData.description,
      todoData.responsible,
      todoData.scheduledDate
    );

    updateTodo({
      id: editingTodo._id as any,
      title: todoData.title,
      description: fullDescription || undefined,
    });
  };

  const handleStatusChange = async (todoId: string, newStatus: string) => {
    const currentTodo = todos?.find((todo) => todo._id === todoId);
    if (!currentTodo) return;

    const { newDescription, isCompleted } = updateDescriptionForStatus(
      currentTodo.description || "",
      newStatus
    );

    await updateTodo({
      id: todoId as any,
      description: newDescription || undefined,
      completed: isCompleted,
    });
  };

  const handleDeleteTodo = async (todoId: string) => {
    await deleteTodo({ id: todoId as any });
  };

  const handleEditTodo = (todo: any) => {
    const { responsible, scheduledDate, cleanDescription } =
      extractInfoFromDescription(todo.description || "");

    setEditingTodo({
      ...todo,
      description: cleanDescription,
      responsible: responsible || "",
      scheduledDate: scheduledDate || "",
    });
  };

  const handleCreateNote = (noteData: { title: string; content: string }) => {
    createNote(noteData);
  };

  const handleUpdateNote = (
    id: string,
    noteData: { title: string; content: string }
  ) => {
    updateNote({
      id: id as any,
      ...noteData,
    });
  };

  const handleDeleteNote = (id: string) => {
    deleteNote({ id: id as any });
  };

  const handleClearCompleted = async () => {
    if (confirm("Tem certeza que deseja limpar todas as tarefas concluídas?")) {
      for (const todo of completedTodos) {
        await deleteTodo({ id: todo._id as any });
      }
    }
  };

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
        const { newDescription, isCompleted } = updateDescriptionForStatus(
          activeTodo.description || "",
          overIdStr
        );

        await updateTodo({
          id: activeTodo._id as any,
          description: newDescription || undefined,
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

  return (
    <div className="space-y-6">
      {/* Header com botões */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Tarefas</h2>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-white"
            onClick={() => setIsAddingTodo(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>

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
            <KanbanColumn
              key={column.id}
              column={column}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTodo}
              onEdit={handleEditTodo}
            />
          ))}

          <DndDragOverlay>
            {activeId && activeTodo ? (
              <DragOverlay activeTodo={activeTodo} />
            ) : null}
          </DndDragOverlay>
        </DndContext>
      </div>

      {/* Seção de Notas */}
      <NotesSection
        notes={notes || []}
        onCreateNote={handleCreateNote}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Formulário para criar/editar tarefa */}
      <TodoForm
        isOpen={isAddingTodo}
        onClose={() => setIsAddingTodo(false)}
        onSubmit={handleCreateTodo}
        title="Criar Nova Tarefa"
      />

      <TodoForm
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        onSubmit={handleUpdateTodo}
        initialData={editingTodo}
        title="Editar Tarefa"
      />
    </div>
  );
}
