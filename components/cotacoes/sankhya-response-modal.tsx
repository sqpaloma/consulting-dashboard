"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";
import { useCotacoes } from "@/hooks/use-cotacoes";
import { MessageSquare } from "lucide-react";

interface SankhyaResponseModalProps {
  pendenciaId: Id<"pendenciasCadastro">;
  isOpen: boolean;
  onClose: () => void;
  userId?: Id<"users">;
  pendenciaData?: {
    numeroSequencial: number;
    codigo: string;
    descricao: string;
    marca?: string;
    solicitante?: { name: string };
  };
}

export function SankhyaResponseModal({
  pendenciaId,
  isOpen,
  onClose,
  userId,
  pendenciaData,
}: SankhyaResponseModalProps) {
  const [codigoSankhya, setCodigoSankhya] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { responderPendencia } = useCotacoes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !codigoSankhya.trim()) return;

    setIsLoading(true);
    try {
      await responderPendencia(
        pendenciaId,
        userId,
        codigoSankhya.trim(),
        observacoes.trim() || undefined
      );
      
      // Limpar formulário e fechar modal
      setCodigoSankhya("");
      setObservacoes("");
      onClose();
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCodigoSankhya("");
      setObservacoes("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Responder Pendência de Cadastro
            {pendenciaData && (
              <span className="text-sm font-mono text-blue-300">
                #{pendenciaData.numeroSequencial}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Informe o código Sankhya cadastrado para esta peça.
          </DialogDescription>
        </DialogHeader>

        {pendenciaData && (
          <div className="bg-blue-800/30 border border-blue-700 p-4 rounded-lg space-y-2 text-sm">
            <div>
              <span className="font-semibold text-blue-300">Código solicitado:</span>{" "}
              <span className="font-mono text-white">{pendenciaData.codigo}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-300">Descrição:</span>{" "}
              <span className="text-blue-100">{pendenciaData.descricao}</span>
            </div>
            {pendenciaData.marca && (
              <div>
                <span className="font-semibold text-blue-300">Marca:</span>{" "}
                <span className="text-blue-100">{pendenciaData.marca}</span>
              </div>
            )}
            <div>
              <span className="font-semibold text-blue-300">Solicitante:</span>{" "}
              <span className="text-blue-100">{pendenciaData.solicitante?.name}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigoSankhya" className="text-blue-300">
              Código Sankhya <span className="text-red-400">*</span>
            </Label>
            <Input
              id="codigoSankhya"
              value={codigoSankhya}
              onChange={(e) => setCodigoSankhya(e.target.value)}
              placeholder="Digite o código Sankhya cadastrado"
              disabled={isLoading}
              required
              className="font-mono bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-blue-300">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais sobre o cadastro..."
              disabled={isLoading}
              rows={3}
              className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-blue-600 text-blue-200 hover:bg-blue-800 hover:text-blue-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !codigoSankhya.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "Respondendo..." : "Responder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}