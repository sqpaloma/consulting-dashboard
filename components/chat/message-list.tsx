"use client";

import { FixedSizeList as VirtualList, ListOnScrollProps } from "react-window";
import { MessageItem } from "./message-item";

interface MessageListProps {
  messages: any[];
  onDeleteMessage: (id: string) => void;
  onCreateTodoFromMessage: (messageId: string, content: string) => void;
  // Optional ref to control scroll (scrollToItem)
  listRef?: React.Ref<any>;
  // Optional container height and item size
  height?: number;
  itemSize?: number;
}

export function MessageList({
  messages,
  onDeleteMessage,
  onCreateTodoFromMessage,
  listRef,
  height = 450,
  itemSize = 96,
}: MessageListProps) {
  const itemCount = messages?.length || 0;

  return (
    <VirtualList
      ref={listRef as any}
      height={height}
      width={"100%"}
      itemCount={itemCount}
      itemSize={itemSize}
    >
      {({ index, style }) => {
        const message = messages[index];
        return (
          <div style={style} key={message?.id || index} className="px-4">
            <MessageItem
              message={message}
              onDelete={() => onDeleteMessage(message.id)}
              onCreateTodo={() =>
                onCreateTodoFromMessage(message.id, message.content)
              }
            />
          </div>
        );
      }}
    </VirtualList>
  );
}
