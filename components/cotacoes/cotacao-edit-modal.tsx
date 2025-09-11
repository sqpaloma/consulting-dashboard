"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X } from "lucide-react";
import { useCotacao, useCotacoes } from "@/hooks/use-cotacoes";
import { Id } from "@/convex/_generated/dataModel";

interface CotacaoEditModalProps {
  cotacaoId: Id<"cotacoes">;
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  userId?: Id<"users">;
  onSave?: () => void;
}

export function CotacaoEditModal({
  cotacaoId,
  isOpen,
  onClose,
  userRole,
  userId,
  onSave,
}: CotacaoEditModalProps) {
  const { cotacao, isLoading } = useCotacao(cotacaoId);
  const { editarItens } = useCotacoes();
  
  const [isEditing, setIsEditing] = useState(true); // Sempre inicia no modo de edição
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    numeroOS: "",
    numeroOrcamento: "",
    cliente: "",
    observacoes: "",
  });
  const [itens, setItens] = useState<any[]>([]);

  useEffect(() => {
    if (cotacao) {
      console.log("Carregando cotação:", cotacao);
      setFormData({
        numeroOS: cotacao.numeroOS || "",
        numeroOrcamento: cotacao.numeroOrcamento || "",
        cliente: cotacao.cliente || "",
        observacoes: cotacao.observacoes || "",
      });
      console.log("Itens da cotação:", cotacao.itens);
      setItens(cotacao.itens || []);
    }
  }, [cotacao]);

  const handleItemChange = (index: number, field: string, value: string | number) => {
    console.log(`Alterando item ${index}, campo ${field}, novo valor:`, value);
    setItens(prev => {
      const newItens = prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      );
      console.log("Itens após alteração:", newItens);
      return newItens;
    });
  };

  const handleSave = async () => {
    if (!userId || !cotacao) {
      console.log("Erro: userId ou cotacao não encontrados", { userId, cotacao });
      return;
    }

    console.log("Iniciando salvamento...");
    console.log("CotacaoId:", cotacaoId);
    console.log("UserId:", userId);
    console.log("UserRole:", userRole);
    console.log("Status da cotação:", cotacao.status);
    console.log("Solicitante da cotação:", cotacao.solicitanteId);
    console.log("Itens originais:", cotacao.itens);
    console.log("Itens editados:", itens);

    setIsSaving(true);
    try {
      // Preparar itens para edição
      const itensParaEdicao = itens.map(item => ({
        itemId: item._id,
        codigoPeca: item.codigoPeca,
        descricao: item.descricao,
        quantidade: item.quantidade,
        observacoes: item.observacoes || "",
      }));

      console.log("Itens para edição:", itensParaEdicao);

      await editarItens(cotacaoId, userId, itensParaEdicao);
      console.log("Edição concluída com sucesso!");
      onSave?.(); // Chama callback se fornecido
      onClose();
    } catch (error) {
      console.error("Erro ao editar cotação:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Edit className="h-6 w-6" />
              Carregando...
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2">Carregando cotação...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!cotacao) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Edit className="h-6 w-6" />
              Erro
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-red-300">Cotação não encontrada.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Editar Cotação #{cotacao.numeroSequencial}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informações gerais */}
          <div className="p-4 bg-blue-800/30 border border-blue-700 rounded-lg">
            <h3 className="font-semibold text-white mb-3">Informações Gerais</h3>
            <div className="grid grid-cols-2 gap-4">
              {cotacao.numeroOS && (
                <div>
                  <span className="text-sm text-blue-300 font-medium">OS:</span>
                  <p className="text-white font-semibold">{cotacao.numeroOS}</p>
                </div>
              )}
              {cotacao.cliente && (
                <div>
                  <span className="text-sm text-blue-300 font-medium">Cliente:</span>
                  <p className="text-white font-semibold">{cotacao.cliente}</p>
                </div>
              )}
            </div>
          </div>

          {/* Itens */}
          <div className="p-4 bg-blue-800/30 border border-blue-700 rounded-lg">
            <h3 className="font-semibold text-white mb-3">Itens ({itens.length})</h3>
            <div className="space-y-3">
              {itens.map((item, index) => (
                <div key={item._id} className="border border-blue-600 p-4 rounded-lg bg-blue-800/20">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-blue-300">Código:</Label>
                      <Input
                        value={item.codigoPeca}
                        onChange={(e) => handleItemChange(index, "codigoPeca", e.target.value)}
                        className="bg-blue-800 border-blue-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-blue-300">Descrição:</Label>
                      <Input
                        value={item.descricao}
                        onChange={(e) => handleItemChange(index, "descricao", e.target.value)}
                        className="bg-blue-800 border-blue-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-blue-300">Quantidade:</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, "quantidade", parseInt(e.target.value) || 1)}
                        className="bg-blue-800 border-blue-600 text-white"
                      />
                    </div>
                  </div>
                  
                  {item.precoUnitario && (
                    <div className="mt-3 grid grid-cols-3 gap-4 bg-blue-900/30 p-3 rounded">
                      <div>
                        <span className="text-sm text-blue-300 font-medium">Preço Unit.:</span>
                        <p className="font-semibold text-green-400">
                          {item.precoUnitario.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </p>
                      </div>
                      {item.prazoEntrega && (
                        <div>
                          <span className="text-sm text-blue-300 font-medium">Prazo:</span>
                          <p className="text-blue-100 font-medium">{item.prazoEntrega}</p>
                        </div>
                      )}
                      {item.fornecedor && (
                        <div>
                          <span className="text-sm text-blue-300 font-medium">Fornecedor:</span>
                          <p className="text-blue-100 font-medium">{item.fornecedor}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSaving}
              className="border-blue-600 text-blue-200 hover:bg-blue-800 hover:text-blue-100"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}