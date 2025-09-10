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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Responder Pendência de Cadastro
            {pendenciaData && (
              <span className="text-sm font-mono text-blue-600">
                #{pendenciaData.numeroSequencial}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Informe o código Sankhya cadastrado para esta peça.
          </DialogDescription>
        </DialogHeader>

        {pendenciaData && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
            <div>
              <span className="font-semibold text-blue-800">Código solicitado:</span>{" "}
              <span className="font-mono">{pendenciaData.codigo}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-800">Descrição:</span>{" "}
              {pendenciaData.descricao}
            </div>
            {pendenciaData.marca && (
              <div>
                <span className="font-semibold text-blue-800">Marca:</span>{" "}
                {pendenciaData.marca}
              </div>
            )}
            <div>
              <span className="font-semibold text-blue-800">Solicitante:</span>{" "}
              {pendenciaData.solicitante?.name}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigoSankhya">
              Código Sankhya <span className="text-red-500">*</span>
            </Label>
            <Input
              id="codigoSankhya"
              value={codigoSankhya}
              onChange={(e) => setCodigoSankhya(e.target.value)}
              placeholder="Digite o código Sankhya cadastrado"
              disabled={isLoading}
              required
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais sobre o cadastro..."
              disabled={isLoading}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !codigoSankhya.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Respondendo..." : "Responder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}