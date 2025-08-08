"use client";

import { Trash2, ListTodo } from "lucide-react";

interface MessageItemProps {
  message: any;
  onDelete: () => void;
  onCreateTodo: () => void;
}

export function MessageItem({
  message,
  onDelete,
  onCreateTodo,
}: MessageItemProps) {
  return (
    <div
      className={`flex ${
        message.isOwn ? "justify-end" : "justify-start"
      } group`}
    >
      <div className="flex items-center space-x-2">
        {message.isOwn && (
          <>
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-200"
              title="Deletar mensagem"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </button>
            <button
              onClick={onCreateTodo}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-blue-200"
              title="Criar todo desta mensagem"
            >
              <ListTodo className="h-3 w-3 text-blue-500" />
            </button>
          </>
        )}
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            message.isOwn
              ? "bg-blue-500/80 text-white"
              : "bg-white/10 text-white"
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <p
            className={`text-xs mt-1 ${
              message.isOwn ? "text-blue-100" : "text-white/70"
            }`}
          >
            {message.timestamp}
          </p>
        </div>
        {!message.isOwn && (
          <>
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-200"
              title="Deletar mensagem"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </button>
            <button
              onClick={onCreateTodo}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-blue-200"
              title="Criar todo desta mensagem"
            >
              <ListTodo className="h-3 w-3 text-blue-500" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
