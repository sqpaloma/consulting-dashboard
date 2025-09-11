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
import { Loader2, Upload, FileText, X, Plus, Minus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface CadastroPecaFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PecaData {
  codigo: string;
  descricao: string;
  marca: string;
  observacoes: string;
}

export function CadastroPecaForm({ isOpen, onClose }: CadastroPecaFormProps) {
  const { user } = useAuth();
  const [tipoAgrupamento, setTipoAgrupamento] = useState<"maquina" | "componente">("maquina");
  const [nomeAgrupamento, setNomeAgrupamento] = useState("");
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [pecas, setPecas] = useState<PecaData[]>([
    { codigo: "", descricao: "", marca: "", observacoes: "" }
  ]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const criarPendenciaCadastro = useMutation(api.cotacoes.criarPendenciaCadastro);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const adicionarPeca = () => {
    setPecas([...pecas, { codigo: "", descricao: "", marca: "", observacoes: "" }]);
  };

  const removerPeca = (index: number) => {
    if (pecas.length > 1) {
      setPecas(pecas.filter((_, i) => i !== index));
    }
  };

  const atualizarPeca = (index: number, field: keyof PecaData, value: string) => {
    const novasPecas = [...pecas];
    novasPecas[index][field] = value;
    setPecas(novasPecas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se há ao menos uma peça com código e descrição
    const pecasValidas = pecas.filter(p => p.codigo.trim() && p.descricao.trim());
    if (pecasValidas.length === 0) {
      toast.error("É necessário preencher pelo menos uma peça com código e descrição");
      return;
    }

    // Se há múltiplas peças, validar nome do agrupamento
    if (pecasValidas.length > 1 && !nomeAgrupamento.trim()) {
      toast.error(`Nome da ${tipoAgrupamento} é obrigatório para múltiplas peças`);
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

      // Criar uma solicitação para cada peça válida
      const resultados = [];
      for (const peca of pecasValidas) {
        const observacoesCombinadas = [
          pecasValidas.length > 1 ? `${tipoAgrupamento.charAt(0).toUpperCase() + tipoAgrupamento.slice(1)}: ${nomeAgrupamento}` : '',
          peca.observacoes.trim(),
          observacoesGerais.trim()
        ].filter(Boolean).join(' | ');

        const result = await criarPendenciaCadastro({
          codigo: peca.codigo.trim(),
          descricao: peca.descricao.trim(),
          marca: peca.marca.trim() || undefined,
          observacoes: observacoesCombinadas || undefined,
          solicitanteId: user.userId,
          anexoStorageId: fileStorageId,
          anexoNome: selectedFile?.name,
        });
        
        resultados.push(result);
      }

      const numerosSequenciais = resultados.map(r => r.numeroSequencial).join(", ");
      toast.success(`Solicitação${resultados.length > 1 ? 'ões' : ''} #${numerosSequenciais} criada${resultados.length > 1 ? 's' : ''} com sucesso! O setor de compras será notificado.`);
      
      // Reset form
      setPecas([{ codigo: "", descricao: "", marca: "", observacoes: "" }]);
      setNomeAgrupamento("");
      setObservacoesGerais("");
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
      setPecas([{ codigo: "", descricao: "", marca: "", observacoes: "" }]);
      setNomeAgrupamento("");
      setObservacoesGerais("");
      setTipoAgrupamento("maquina");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
            Solicitação de Cadastro de Peça{pecas.length > 1 ? 's' : ''}
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Crie uma solicitação para o setor de compras cadastrar uma nova peça. 
            Para múltiplas peças, elas devem ser da mesma máquina ou componente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Seção de agrupamento - só aparece se há mais de uma peça */}
          {pecas.length > 1 && (
            <div className="bg-blue-800/30 p-3 rounded-lg border border-blue-700 space-y-3">
              <Label className="text-blue-300 text-sm font-semibold">
                Agrupamento <span className="text-red-400">*</span>
              </Label>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={tipoAgrupamento === "maquina" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTipoAgrupamento("maquina")}
                  disabled={isSubmitting}
                  className={tipoAgrupamento === "maquina" 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "border-blue-600 text-blue-300 hover:bg-blue-800"
                  }
                >
                  Máquina
                </Button>
                <Button
                  type="button"
                  variant={tipoAgrupamento === "componente" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTipoAgrupamento("componente")}
                  disabled={isSubmitting}
                  className={tipoAgrupamento === "componente" 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "border-blue-600 text-blue-300 hover:bg-blue-800"
                  }
                >
                  Componente
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-300 text-sm">
                  Nome da {tipoAgrupamento} <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={nomeAgrupamento}
                  onChange={(e) => setNomeAgrupamento(e.target.value)}
                  placeholder={`Ex: ${tipoAgrupamento === "maquina" ? "Torno CNC ABC123" : "Motor de Avanço X"}`}
                  disabled={isSubmitting}
                  className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                />
              </div>
            </div>
          )}

          {/* Lista de peças */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-blue-300 text-sm font-semibold">
                Peças ({pecas.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarPeca}
                disabled={isSubmitting}
                className="border-green-600 text-green-400 hover:bg-green-900/20"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {pecas.map((peca, index) => (
              <div key={index} className="bg-blue-800/20 p-3 rounded-lg border border-blue-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300 text-sm font-medium">
                    Peça {index + 1}
                  </span>
                  {pecas.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerPeca(index)}
                      disabled={isSubmitting}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-blue-300 text-xs">
                      Código <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={peca.codigo}
                      onChange={(e) => atualizarPeca(index, "codigo", e.target.value)}
                      placeholder="Ex: ABC123"
                      disabled={isSubmitting}
                      className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-300 text-xs">Marca</Label>
                    <Input
                      value={peca.marca}
                      onChange={(e) => atualizarPeca(index, "marca", e.target.value)}
                      placeholder="Ex: Bosch, SKF"
                      disabled={isSubmitting}
                      className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-blue-300 text-xs">
                    Descrição <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    value={peca.descricao}
                    onChange={(e) => atualizarPeca(index, "descricao", e.target.value)}
                    placeholder="Descrição detalhada da peça"
                    disabled={isSubmitting}
                    rows={2}
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-blue-300 text-xs">Observações</Label>
                  <Textarea
                    value={peca.observacoes}
                    onChange={(e) => atualizarPeca(index, "observacoes", e.target.value)}
                    placeholder="Observações específicas desta peça..."
                    disabled={isSubmitting}
                    rows={1}
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Observações gerais */}
          <div className="space-y-2">
            <Label className="text-blue-300">Observações Gerais</Label>
            <Textarea
              value={observacoesGerais}
              onChange={(e) => setObservacoesGerais(e.target.value)}
              placeholder="Observações que se aplicam a todas as peças..."
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