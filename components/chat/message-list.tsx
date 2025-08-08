"use client";

import { Trash2, ListTodo } from "lucide-react";
import { MessageItem } from "./message-item";

interface MessageListProps {
  messages: any[];
  onDeleteMessage: (id: string) => void;
  onCreateTodoFromMessage: (messageId: string, content: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({
  messages,
  onDeleteMessage,
  onCreateTodoFromMessage,
  messagesEndRef,
}: MessageListProps) {
  return (
    <div
      id="chat-messages-container"
      className="overflow-y-auto p-4 h-[450px] bg-transparent"
    >
      <div className="space-y-4">
        {messages?.map((message: any) => (
          <MessageItem
            key={message.id}
            message={message}
            onDelete={() => onDeleteMessage(message.id)}
            onCreateTodo={() =>
              onCreateTodoFromMessage(message.id, message.content)
            }
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
