"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  isUploading?: boolean;
  placeholder?: string;
  required?: boolean;
}

export function FileUpload({
  label,
  accept = ".pdf,.doc,.docx",
  maxSizeMB = 10,
  onFileSelect,
  selectedFile,
  isUploading = false,
  placeholder = "Selecione um arquivo...",
  required = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Validar tamanho
    const maxSize = maxSizeMB * 1024 * 1024; // Converter MB para bytes
    if (file.size > maxSize) {
      return `Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB`;
    }

    // Validar tipo de arquivo
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedTypes.some(type => 
      type === fileExtension || 
      (type.startsWith('.') && fileExtension === type)
    );

    if (!isValidType) {
      return `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const clearFile = () => {
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-blue-300">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      
      {/* Área de upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer
          ${dragOver 
            ? 'border-blue-400 bg-blue-800/20' 
            : 'border-blue-600 bg-blue-800/10'
          }
          ${error ? 'border-red-500' : ''}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-800/20'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                <p className="text-xs text-blue-300">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            {!isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                <p className="text-sm text-blue-300">Processando arquivo...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">{placeholder}</p>
                  <p className="text-xs text-blue-300">
                    Clique ou arraste um arquivo aqui
                  </p>
                  <p className="text-xs text-blue-400 mt-1">
                    Máximo {maxSizeMB}MB - {accept}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-sm text-red-400 flex items-center space-x-1">
          <X className="h-4 w-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}