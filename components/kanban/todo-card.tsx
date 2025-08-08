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
  } as React.CSSProperties;

  const { responsible, scheduledDate, cleanDescription } =
    extractInfoFromDescription(todo.description || "");

  const isCompleted = !!todo.completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-lg border border-white/30 bg-white/25 p-3 text-white cursor-grab active:cursor-grabbing hover:bg-white/30 transition-colors h-[96px]"
    >
      <div className="flex items-start justify-between h-full">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() =>
              onStatusChange(todo._id, isCompleted ? "todo" : "completed")
            }
            className="mt-1 border-white/40 data-[state=checked]:bg-green-500"
          />
          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium text-sm break-words truncate ${
                isCompleted ? "line-through text-white/50" : "text-white"
              }`}
              title={todo.title}
            >
              {todo.title}
            </h3>
            {cleanDescription && (
              <p className="text-xs text-white/70 mt-1 break-words line-clamp-2">
                {cleanDescription.replace("[EM_PROCESSO]", "").trim()}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
              {responsible && (
                <span
                  className="flex items-center gap-1 truncate"
                  title={responsible}
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span className="truncate">{responsible}</span>
                </span>
              )}
              {scheduledDate && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {new Date(scheduledDate).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 self-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(todo)}
            className="h-6 w-6 p-0 text-white/70 hover:text-white"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(todo._id)}
            className="h-6 w-6 p-0 text-red-300 hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
