"use client";

import { useRef } from "react";
import { VariableSizeList as VirtualList } from "react-window";
import { MessageItem } from "./message-item";

interface MessageListProps {
  messages: any[];
  onDeleteMessage: (id: string) => void;
  onCreateTodoFromMessage: (messageId: string, content: string) => void;
  // Optional ref to control scroll (scrollToItem)
  listRef?: React.Ref<any>;
  // Container height
  height?: number;
}

export function MessageList({
  messages,
  onDeleteMessage,
  onCreateTodoFromMessage,
  listRef,
  height = 450,
}: MessageListProps) {
  const itemHeightsRef = useRef<number[]>([]);
  const GAP_PX = 12; // espaçamento fixo entre mensagens

  const getItemSize = (index: number) => itemHeightsRef.current[index] ?? 100;

  return (
    <VirtualList
      ref={listRef as any}
      height={height}
      width={"100%"}
      itemCount={messages?.length || 0}
      itemSize={getItemSize}
      overscanCount={8}
    >
      {({ index, style }) => {
        const message = messages[index];

        const setRowRef = (el: HTMLDivElement | null) => {
          if (!el) return;
          const measured = Math.ceil(el.getBoundingClientRect().height);
          const size = measured + GAP_PX; // adiciona gap fixo
          if (itemHeightsRef.current[index] !== size) {
            itemHeightsRef.current[index] = size;
            const refObj = listRef as any;
            if (refObj?.current?.resetAfterIndex) {
              refObj.current.resetAfterIndex(index);
            }
          }
        };

        return (
          <div style={style} key={message?.id || index} className="px-4">
            <div ref={setRowRef}>
              <MessageItem
                message={message}
                onDelete={() => onDeleteMessage(message.id)}
                onCreateTodo={() =>
                  onCreateTodoFromMessage(message.id, message.content)
                }
              />
            </div>
          </div>
        );
      }}
    </VirtualList>
  );
}
