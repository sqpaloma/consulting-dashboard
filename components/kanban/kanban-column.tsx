"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FixedSizeList as List } from "react-window";
import { TodoCard } from "./todo-card";

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    todos: any[];
  };
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: any) => void;
}

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
    onEdit: (todo: any) => void;
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
        onEdit={data.onEdit}
      />
    </div>
  );
};

export function KanbanColumn({
  column,
  onStatusChange,
  onDelete,
  onEdit,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-4 bg-transparent border border-white/30 text-white transition-colors ${
        isOver ? "border-white/50" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">{column.title}</h3>
        <span className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded-full border border-white/20">
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
            itemSize={86}
            width="100%"
            itemData={{
              todos: column.todos,
              onStatusChange,
              onDelete,
              onEdit,
            }}
          >
            {TodoItem}
          </List>
        </SortableContext>
      </div>
    </div>
  );
}
