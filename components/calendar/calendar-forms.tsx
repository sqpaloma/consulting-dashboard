"use client";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface EventFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    location: string;
    participants: string[];
    color: string;
  };
  onEventChange: (event: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EventForm({
  isOpen,
  onOpenChange,
  event,
  onEventChange,
  onSubmit,
}: EventFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Título</Label>
            <Input
              id="event-title"
              placeholder="Digite o título do evento"
              value={event.title}
              onChange={(e) =>
                onEventChange({
                  ...event,
                  title: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-description">Descrição</Label>
            <Textarea
              id="event-description"
              placeholder="Descrição opcional"
              value={event.description}
              onChange={(e) =>
                onEventChange({
                  ...event,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-date">Data</Label>
            <Input
              id="event-date"
              type="date"
              value={event.date}
              onChange={(e) =>
                onEventChange({
                  ...event,
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
                value={event.time}
                onChange={(e) =>
                  onEventChange({
                    ...event,
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
                value={event.duration}
                onChange={(e) =>
                  onEventChange({
                    ...event,
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
              value={event.location}
              onChange={(e) =>
                onEventChange({
                  ...event,
                  location: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-color">Cor</Label>
            <Select
              value={event.color}
              onValueChange={(value) =>
                onEventChange({ ...event, color: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bg-blue-500">Azul</SelectItem>
                <SelectItem value="bg-green-500">Verde</SelectItem>
                <SelectItem value="bg-red-500">Vermelho</SelectItem>
                <SelectItem value="bg-purple-500">Roxo</SelectItem>
                <SelectItem value="bg-orange-500">Laranja</SelectItem>
                <SelectItem value="bg-indigo-500">Índigo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Criar Evento</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface TodoFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  todo: {
    title: string;
    description: string;
    priority: string;
    dueDate: string;
    category: string;
  };
  onTodoChange: (todo: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function TodoForm({
  isOpen,
  onOpenChange,
  todo,
  onTodoChange,
  onSubmit,
}: TodoFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="todo-title">Título</Label>
            <Input
              id="todo-title"
              placeholder="Digite o título da tarefa"
              value={todo.title}
              onChange={(e) =>
                onTodoChange({
                  ...todo,
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
              value={todo.description}
              onChange={(e) =>
                onTodoChange({
                  ...todo,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="todo-priority">Prioridade</Label>
              <Select
                value={todo.priority}
                onValueChange={(value) =>
                  onTodoChange({ ...todo, priority: value })
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
              <Label htmlFor="todo-dueDate">Data de Vencimento</Label>
              <Input
                id="todo-dueDate"
                type="date"
                value={todo.dueDate}
                onChange={(e) =>
                  onTodoChange({
                    ...todo,
                    dueDate: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="todo-category">Categoria</Label>
            <Input
              id="todo-category"
              placeholder="Categoria opcional"
              value={todo.category}
              onChange={(e) =>
                onTodoChange({
                  ...todo,
                  category: e.target.value,
                })
              }
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Criar Tarefa</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
