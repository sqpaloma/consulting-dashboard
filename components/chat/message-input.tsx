"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Smile, Paperclip, X, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "./emoji-picker";

interface AttachedFile {
  file: File;
  id: string;
  type: 'image' | 'file';
  url: string;
}

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string | ((prev: string) => string)) => void;
  onSendMessage: () => void;
  onSendAttachment: (files: AttachedFile[], message?: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function MessageInput({
  newMessage,
  setNewMessage,
  onSendMessage,
  onSendAttachment,
  onKeyPress,
}: MessageInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev: string) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        const id = Math.random().toString(36).substring(7);
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'file';
        newFiles.push({ file, id, type, url });
      }
    });

    setAttachedFiles(prev => [...prev, ...newFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file: File): boolean => {
    // Max 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Tamanho máximo: 10MB');
      return false;
    }

    // Allowed types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não suportado');
      return false;
    }

    return true;
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleSend = () => {
    if (attachedFiles.length > 0) {
      onSendAttachment(attachedFiles, newMessage.trim() || undefined);
      setAttachedFiles([]);
      setNewMessage('');
    } else if (newMessage.trim()) {
      onSendMessage();
    }
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

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      attachedFiles.forEach(file => URL.revokeObjectURL(file.url));
    };
  }, []);

  return (
    <div className="p-4 border-t flex-shrink-0 relative">
      {/* Attachment Previews */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachedFiles.map((file) => (
            <div key={file.id} className="relative group">
              {file.type === 'image' ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img 
                    src={file.url} 
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 pr-8 relative">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700 max-w-32 truncate">
                    {file.file.name}
                  </span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
        
        {/* File Upload Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          title="Anexar arquivo"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex-1">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              } else {
                onKeyPress(e);
              }
            }}
            className="text-gray-800 placeholder:text-gray-400 bg-white"
          />
        </div>
        <Button
          onClick={handleSend}
          size="icon"
          disabled={!newMessage.trim() && attachedFiles.length === 0}
          className="bg-white text-white hover:bg-white/90 disabled:opacity-50"
        >
          <Send className="h-4 w-4 text-blue-600" />
        </Button>
      </div>
    </div>
  );
}
