"use client";

import { useState, useEffect } from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "./emoji-picker";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string | ((prev: string) => string)) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function MessageInput({
  newMessage,
  setNewMessage,
  onSendMessage,
  onKeyPress,
}: MessageInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev: string) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Fechar emoji picker quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showEmojiPicker && !target.closest(".emoji-picker-container")) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div className="p-4 border-t flex-shrink-0 relative">
      <div className="flex items-center space-x-2">
        <div className="relative emoji-picker-container">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* Emoji Picker */}
          {showEmojiPicker && <EmojiPicker onEmojiSelect={handleEmojiSelect} />}
        </div>
        <div className="flex-1">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={onKeyPress}
          />
        </div>
        <Button onClick={onSendMessage} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
