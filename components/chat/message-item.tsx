"use client";

import { Trash2, ListTodo, Download, Eye, FileText, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url?: string;
}

interface MessageItemProps {
  message: {
    id: string;
    content: string;
    attachments?: Attachment[];
    messageType: string;
    isOwn: boolean;
    timestamp: string;
  };
  onDelete: () => void;
  onCreateTodo: () => void;
}

export function MessageItem({
  message,
  onDelete,
  onCreateTodo,
}: MessageItemProps) {
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (mimeType: string): boolean => {
    return mimeType.startsWith('image/');
  };

  const handleDownload = (attachment: Attachment) => {
    if (attachment.url) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div
        className={`flex ${
          message.isOwn ? "justify-end" : "justify-start"
        } group`}
      >
        <div className="flex items-start space-x-2">
          {message.isOwn && (
            <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onDelete}
                className="p-1 rounded-full hover:bg-red-200"
                title="Deletar mensagem"
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </button>
              <button
                onClick={onCreateTodo}
                className="p-1 rounded-full hover:bg-blue-200"
                title="Criar todo desta mensagem"
              >
                <ListTodo className="h-3 w-3 text-blue-500" />
              </button>
            </div>
          )}
          
          <div className="max-w-xs lg:max-w-md">
            {/* Text content */}
            {message.content && (
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.isOwn
                    ? "bg-blue-500/80 text-white"
                    : "bg-white/10 text-white"
                } ${message.attachments && message.attachments.length > 0 ? 'mb-2' : ''}`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="space-y-2">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className={`rounded-lg overflow-hidden ${
                    message.isOwn ? "bg-blue-600/60" : "bg-white/10"
                  }`}>
                    {isImage(attachment.mimeType) && attachment.url ? (
                      <div className="relative">
                        <img
                          src={attachment.url}
                          alt={attachment.fileName}
                          className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setShowImagePreview(attachment.url!)}
                        />
                        <div className="absolute bottom-2 right-2 flex space-x-1">
                          <button
                            onClick={() => setShowImagePreview(attachment.url!)}
                            className="p-1 bg-black/50 rounded-full hover:bg-black/70 text-white"
                            title="Ver imagem"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDownload(attachment)}
                            className="p-1 bg-black/50 rounded-full hover:bg-black/70 text-white"
                            title="Baixar imagem"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 flex items-center space-x-3">
                        <FileText className={`h-8 w-8 ${
                          message.isOwn ? "text-white" : "text-white/70"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            message.isOwn ? "text-white" : "text-white"
                          }`}>
                            {attachment.fileName}
                          </p>
                          <p className={`text-xs ${
                            message.isOwn ? "text-blue-100" : "text-white/70"
                          }`}>
                            {formatFileSize(attachment.fileSize)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownload(attachment)}
                          className={`p-1 rounded-full hover:bg-white/20 ${
                            message.isOwn ? "text-white" : "text-white/70"
                          }`}
                          title="Baixar arquivo"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <p
              className={`text-xs mt-1 ${
                message.isOwn ? "text-blue-100" : "text-white/70"
              } ${message.isOwn ? "text-right" : "text-left"}`}
            >
              {message.timestamp}
            </p>
          </div>

          {!message.isOwn && (
            <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onDelete}
                className="p-1 rounded-full hover:bg-red-200"
                title="Deletar mensagem"
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </button>
              <button
                onClick={onCreateTodo}
                className="p-1 rounded-full hover:bg-blue-200"
                title="Criar todo desta mensagem"
              >
                <ListTodo className="h-3 w-3 text-blue-500" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowImagePreview(null)}
        >
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={showImagePreview}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
