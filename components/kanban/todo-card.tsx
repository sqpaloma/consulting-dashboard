"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit3, Trash2 } from "lucide-react";
import { extractInfoFromDescription } from "./todo-utils";

interface TodoCardProps {
  todo: any;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: any) => void;
}

export function TodoCard({
  todo,
  onStatusChange,
  onDelete,
  onEdit,
}: TodoCardProps) {
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
            onClick={() => onEdit(todo)}
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
}
