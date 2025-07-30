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
