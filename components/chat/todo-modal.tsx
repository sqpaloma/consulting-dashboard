"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-chat";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TodoModalProps {
  selectedMessage: {
    id: string;
    content: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: () => void;
}

export function TodoModal({
  selectedMessage,
  onClose,
  onSuccess,
  onError,
}: TodoModalProps) {
  const currentUser = useCurrentUser();
  const [todoForm, setTodoForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    category: "",
  });

  const createTodo = useMutation(api.todos.createTodo);

  useEffect(() => {
    if (selectedMessage) {
      const content = selectedMessage.content || '';
      
      // Create a meaningful title
      let title = '';
      if (content.length > 0) {
        title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      } else {
        title = 'Tarefa do Chat';
      }

      setTodoForm({
        title,
        description: content,
        priority: "medium",
        dueDate: "",
        category: "Chat",
      });
    }
  }, [selectedMessage]);

  const handleTodoSubmit = async () => {
    if (!todoForm.title.trim()) {
      onError();
      return;
    }

    if (!currentUser?.id) {
      onError();
      return;
    }

    try {
      await createTodo({
        title: todoForm.title,
        description: todoForm.description,
        priority: todoForm.priority,
        dueDate: todoForm.dueDate || undefined,
        category: todoForm.category || undefined,
        userId: currentUser.id,
      });

      onSuccess();
    } catch (error) {
      onError();
    }
  };

  const handleModalClose = () => {
    setTodoForm({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      category: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Criar Todo</h3>
          <Button variant="ghost" size="icon" onClick={handleModalClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="todo-title">Título</Label>
            <Input
              id="todo-title"
              value={todoForm.title}
              onChange={(e) =>
                setTodoForm({ ...todoForm, title: e.target.value })
              }
              placeholder="Título do todo"
            />
          </div>

          <div>
            <Label htmlFor="todo-description">Descrição</Label>
            <Textarea
              id="todo-description"
              value={todoForm.description}
              onChange={(e) =>
                setTodoForm({ ...todoForm, description: e.target.value })
              }
              placeholder="Descrição do todo"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="todo-priority">Prioridade</Label>
            <Select
              value={todoForm.priority}
              onValueChange={(value) =>
                setTodoForm({ ...todoForm, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="todo-dueDate">Data de Vencimento</Label>
            <Input
              id="todo-dueDate"
              type="date"
              value={todoForm.dueDate}
              onChange={(e) =>
                setTodoForm({ ...todoForm, dueDate: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="todo-category">Categoria</Label>
            <Input
              id="todo-category"
              value={todoForm.category}
              onChange={(e) =>
                setTodoForm({ ...todoForm, category: e.target.value })
              }
              placeholder="Categoria do todo"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={handleModalClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleTodoSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Criar Todo
          </Button>
        </div>
      </div>
    </div>
  );
}
