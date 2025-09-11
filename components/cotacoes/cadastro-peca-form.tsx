"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, Upload, FileText, X, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface CadastroPecaFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CadastroPecaForm({ isOpen, onClose }: CadastroPecaFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    marca: "",
    observacoes: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const criarPendenciaCadastro = useMutation(api.cotacoes.criarPendenciaCadastro);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo.trim() || !formData.descricao.trim()) {
      toast.error("Código e descrição são obrigatórios");
      return;
    }

    if (!user?.userId) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let fileStorageId: string | undefined = undefined;
      
      // Se há arquivo, fazer upload
      if (selectedFile) {
        const uploadUrl = await generateUploadUrl();
        
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        
        if (!result.ok) {
          throw new Error("Falha no upload do arquivo");
        }
        
        const { storageId } = await result.json();
        fileStorageId = storageId;
      }

      const result = await criarPendenciaCadastro({
        codigo: formData.codigo.trim(),
        descricao: formData.descricao.trim(),
        marca: formData.marca.trim() || undefined,
        observacoes: formData.observacoes.trim() || undefined,
        solicitanteId: user.userId,
        anexoStorageId: fileStorageId,
        anexoNome: selectedFile?.name,
      });

      toast.success(`Solicitação #${result.numeroSequencial} criada com sucesso! O setor de compras será notificado.`);
      setFormData({ codigo: "", descricao: "", marca: "", observacoes: "" });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    } catch (error) {
      console.error("Erro ao criar pendência:", error);
      toast.error("Erro ao criar pendência. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é PDF
      if (file.type !== "application/pdf") {
        toast.error("Por favor, selecione apenas arquivos PDF");
        e.target.value = "";
        return;
      }
      
      // Verificar tamanho (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("O arquivo deve ter no máximo 10MB");
        e.target.value = "";
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ codigo: "", descricao: "", marca: "", observacoes: "" });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
            Solicitação de Cadastro de Peça
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Crie uma solicitação para o setor de compras cadastrar uma nova peça. 
            Você pode anexar um PDF com informações adicionais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo" className="text-blue-300">
              Código da Peça <span className="text-red-400">*</span>
            </Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) =>
                setFormData({ ...formData, codigo: e.target.value })
              }
              placeholder="Ex: ABC123"
              disabled={isSubmitting}
              required
              className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-blue-300">
              Descrição <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Descrição detalhada da peça"
              disabled={isSubmitting}
              required
              rows={3}
              className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marca" className="text-blue-300">Marca</Label>
            <Input
              id="marca"
              value={formData.marca}
              onChange={(e) =>
                setFormData({ ...formData, marca: e.target.value })
              }
              placeholder="Ex: Bosch, SKF, etc."
              disabled={isSubmitting}
              className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-blue-300">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Informações adicionais sobre a peça..."
              disabled={isSubmitting}
              rows={2}
              className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-blue-300">Anexar PDF (Opcional)</Label>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                disabled={isSubmitting}
                className="hidden"
              />
              
              {!selectedFile ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="w-full border-blue-600 text-blue-300 hover:bg-blue-800"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar PDF
                </Button>
              ) : (
                <div className="flex items-center justify-between p-3 bg-blue-800/30 border border-blue-700 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-300 mr-2" />
                    <span className="text-sm text-white truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-blue-300 ml-2">
                      ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isSubmitting}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 sm:space-x-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-blue-600 text-blue-300 hover:bg-blue-800"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Solicitação...
                </>
              ) : (
                "Criar Solicitação"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}