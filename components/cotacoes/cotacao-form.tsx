"use client";

import React, { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Save } from "lucide-react";
import { useCotacoes } from "@/hooks/use-cotacoes";
import { Id } from "@/convex/_generated/dataModel";
import type { CotacaoItem } from "@/hooks/use-cotacoes";

interface CotacaoFormProps {
  isOpen: boolean;
  onClose: () => void;
  solicitanteId?: Id<"users">;
}

export function CotacaoForm({ isOpen, onClose, solicitanteId }: CotacaoFormProps) {
  const { criarCotacao, proximoNumero, isLoading } = useCotacoes();
  
  const [formData, setFormData] = useState({
    numeroOS: "",
    numeroOrcamento: "",
    cliente: "",
    observacoes: "",
  });

  const [itens, setItens] = useState<CotacaoItem[]>([
    {
      codigoPeca: "",
      descricao: "",
      quantidade: 1,
      observacoes: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index: number, field: keyof CotacaoItem, value: string | number) => {
    setItens(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItens(prev => [...prev, {
      codigoPeca: "",
      descricao: "",
      quantidade: 1,
      observacoes: "",
    }]);
  };

  const removeItem = (index: number) => {
    if (itens.length > 1) {
      setItens(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    // Pelo menos um campo de identificação deve estar preenchido
    if (!formData.numeroOS && !formData.numeroOrcamento && !formData.cliente) {
      return "Preencha pelo menos um campo: Número da OS, Orçamento ou Cliente";
    }

    // Todos os itens devem ter código e descrição
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      if (!item.codigoPeca.trim()) {
        return `Item ${i + 1}: Código da peça é obrigatório`;
      }
      if (!item.descricao.trim()) {
        return `Item ${i + 1}: Descrição é obrigatória`;
      }
      if (item.quantidade <= 0) {
        return `Item ${i + 1}: Quantidade deve ser maior que zero`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!solicitanteId) {
      alert("Erro: Usuário não identificado");
      return;
    }

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);

    try {
      await criarCotacao({
        ...formData,
        itens: itens.filter(item => item.codigoPeca.trim() && item.descricao.trim()),
      }, solicitanteId);

      // Limpar formulário
      setFormData({
        numeroOS: "",
        numeroOrcamento: "",
        cliente: "",
        observacoes: "",
      });
      setItens([{
        codigoPeca: "",
        descricao: "",
        quantidade: 1,
        observacoes: "",
      }]);
      
      onClose();
    } catch (error) {
      console.error("Erro ao criar cotação:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Cotação #{proximoNumero || "..."}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroOS">Número da OS</Label>
                  <Input
                    id="numeroOS"
                    value={formData.numeroOS}
                    onChange={(e) => handleInputChange("numeroOS", e.target.value)}
                    placeholder="Ex: OS-2024-001"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numeroOrcamento">Número do Orçamento</Label>
                  <Input
                    id="numeroOrcamento"
                    value={formData.numeroOrcamento}
                    onChange={(e) => handleInputChange("numeroOrcamento", e.target.value)}
                    placeholder="Ex: ORC-2024-001"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Input
                    id="cliente"
                    value={formData.cliente}
                    onChange={(e) => handleInputChange("cliente", e.target.value)}
                    placeholder="Nome do cliente"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  placeholder="Observações gerais sobre a cotação..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Itens */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Itens para Cotação</CardTitle>
              <Button
                type="button"
                onClick={addItem}
                size="sm"
                className="bg-white text-blue-900 hover:bg-blue-50 font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Código da Peça *</TableHead>
                      <TableHead className="min-w-[200px]">Descrição *</TableHead>
                      <TableHead className="w-[100px]">Quantidade *</TableHead>
                      <TableHead className="min-w-[150px]">Observações</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.codigoPeca}
                            onChange={(e) => handleItemChange(index, "codigoPeca", e.target.value)}
                            placeholder="Código"
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.descricao}
                            onChange={(e) => handleItemChange(index, "descricao", e.target.value)}
                            placeholder="Descrição da peça"
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => handleItemChange(index, "quantidade", parseInt(e.target.value) || 1)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.observacoes || ""}
                            onChange={(e) => handleItemChange(index, "observacoes", e.target.value)}
                            placeholder="Observações"
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={itens.length === 1}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-blue-900 hover:bg-blue-50 font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Cotação
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 