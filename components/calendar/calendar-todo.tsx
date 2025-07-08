"use client";

import { Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface CalendarTodoProps {
  todo: {
    _id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: string;
    dueDate?: string;
    category?: string;
  };
  onToggle?: (todoId: string) => void;
  onDelete?: (todoId: string) => void;
  compact?: boolean;
}

export function CalendarTodo({
  todo,
  onToggle,
  onDelete,
  compact = false,
}: CalendarTodoProps) {
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return "Normal";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  if (compact) {
    return (
      <div className="text-xs p-1 rounded bg-orange-100 text-orange-800 truncate">
        📝 {todo.title}
      </div>
    );
  }

  return (
    <Card className="border-gray-200 hover:border-gray-300 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => onToggle?.(todo._id)}
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
                  {getPriorityLabel(todo.priority)}
                </Badge>
              </div>
              {todo.description && (
                <p
                  className={`text-sm ${todo.completed ? "line-through text-gray-400" : "text-gray-600"}`}
                >
                  {todo.description}
                </p>
              )}
              {todo.dueDate && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(todo.dueDate)}
                </p>
              )}
              {todo.category && (
                <Badge variant="outline" className="text-xs">
                  {todo.category}
                </Badge>
              )}
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(todo._id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
