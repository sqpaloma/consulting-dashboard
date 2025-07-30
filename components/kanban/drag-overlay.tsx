"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { extractInfoFromDescription } from "./todo-utils";

interface DragOverlayProps {
  activeTodo: any;
}

export function DragOverlay({ activeTodo }: DragOverlayProps) {
  if (!activeTodo) return null;

  const { responsible, scheduledDate, cleanDescription } =
    extractInfoFromDescription(activeTodo.description || "");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-lg opacity-90">
      <div className="flex items-start gap-2">
        <Checkbox checked={activeTodo.completed} className="mt-1" />
        <div>
          <h3
            className={`font-medium text-sm ${activeTodo.completed ? "line-through text-gray-500" : "text-gray-900"}`}
          >
            {activeTodo.title}
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
    </div>
  );
}
