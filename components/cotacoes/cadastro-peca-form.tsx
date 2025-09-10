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
import { Loader2, Upload, FileText, X } from "lucide-react";
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Solicitação de Cadastro de Peça</DialogTitle>
          <DialogDescription>
            Crie uma solicitação para o setor de compras cadastrar uma nova peça. 
            Você pode anexar um PDF com informações adicionais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">
              Código da Peça <span className="text-red-500">*</span>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">
              Descrição <span className="text-red-500">*</span>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input
              id="marca"
              value={formData.marca}
              onChange={(e) =>
                setFormData({ ...formData, marca: e.target.value })
              }
              placeholder="Ex: Bosch, SKF, etc."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Informações adicionais sobre a peça..."
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Anexar PDF (Opcional)</Label>
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
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar PDF
                </Button>
              ) : (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-900 truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-blue-600 ml-2">
                      ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Solicitação...
                </>
              ) : (
                "Criar Solicitação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}