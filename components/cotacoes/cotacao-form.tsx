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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
    fornecedor: "",
    solicitarInfoTecnica: false,
  });

  const [itens, setItens] = useState<CotacaoItem[]>([
    {
      codigoPeca: "",
      descricao: "",
      quantidade: 1,
      observacoes: "",
      precisaCadastro: false,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index: number, field: keyof CotacaoItem, value: string | number | boolean) => {
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
      precisaCadastro: false,
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
        fornecedor: "",
        solicitarInfoTecnica: false,
      });
      setItens([{
        codigoPeca: "",
        descricao: "",
        quantidade: 1,
        observacoes: "",
        precisaCadastro: false,
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
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Nova Cotação #{proximoNumero || "..."}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Informações gerais */}
          <div className="p-3 sm:p-4 bg-blue-800/30 border border-blue-700 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Informações Gerais</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroOS" className="text-blue-300">Número da OS</Label>
                  <Input
                    id="numeroOS"
                    value={formData.numeroOS}
                    onChange={(e) => handleInputChange("numeroOS", e.target.value)}
                    placeholder="Ex: OS-2024-001"
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numeroOrcamento" className="text-blue-300">Número do Orçamento</Label>
                  <Input
                    id="numeroOrcamento"
                    value={formData.numeroOrcamento}
                    onChange={(e) => handleInputChange("numeroOrcamento", e.target.value)}
                    placeholder="Ex: ORC-2024-001"
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cliente" className="text-blue-300">Cliente</Label>
                  <Input
                    id="cliente"
                    value={formData.cliente}
                    onChange={(e) => handleInputChange("cliente", e.target.value)}
                    placeholder="Nome do cliente"
                    className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fornecedor" className="text-blue-300">Fornecedor Preferencial</Label>
                  <Select value={formData.fornecedor} onValueChange={(value) => handleInputChange("fornecedor", value)}>
                    <SelectTrigger className="bg-blue-800 border-blue-600 text-white">
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rexroth">Rexroth</SelectItem>
                      <SelectItem value="danfoss">Danfoss</SelectItem>
                      <SelectItem value="handok">Handok</SelectItem>
                      <SelectItem value="parker">Parker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="solicitarInfoTecnica"
                      checked={formData.solicitarInfoTecnica}
                      onCheckedChange={(checked) => handleInputChange("solicitarInfoTecnica", checked === true)}
                    />
                    <Label htmlFor="solicitarInfoTecnica" className="text-sm font-normal text-blue-300">
                      Solicitar informação técnica
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-blue-300">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  placeholder="Observações gerais sobre a cotação..."
                  rows={3}
                  className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Itens */}
          <div className="p-3 sm:p-4 bg-blue-800/30 border border-blue-700 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">Itens para Cotação</h3>
              <Button
                type="button"
                onClick={addItem}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
            <div>
              <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow className="hover:!bg-transparent border-blue-700">
                      <TableHead className="w-[150px] text-blue-300 px-2 sm:px-4 text-xs sm:text-sm">Código da Peça *</TableHead>
                      <TableHead className="min-w-[200px] text-blue-300 px-2 sm:px-4 text-xs sm:text-sm">Descrição *</TableHead>
                      <TableHead className="w-[100px] text-blue-300 px-2 sm:px-4 text-xs sm:text-sm">Quantidade *</TableHead>
                      <TableHead className="w-[120px] text-blue-300 px-2 sm:px-4 text-xs sm:text-sm">Cadastro</TableHead>
                      <TableHead className="min-w-[150px] text-blue-300 px-2 sm:px-4 text-xs sm:text-sm">Observações</TableHead>
                      <TableHead className="w-[80px] text-blue-300 px-2 sm:px-4 text-xs sm:text-sm">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item, index) => (
                      <TableRow key={index} className="border-blue-700/50 hover:bg-blue-800/30">
                        <TableCell className="px-2 sm:px-4">
                          <Input
                            value={item.codigoPeca}
                            onChange={(e) => handleItemChange(index, "codigoPeca", e.target.value)}
                            placeholder="Código"
                            className="w-full bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                          />
                        </TableCell>
                        <TableCell className="px-2 sm:px-4">
                          <Input
                            value={item.descricao}
                            onChange={(e) => handleItemChange(index, "descricao", e.target.value)}
                            placeholder="Descrição da peça"
                            className="w-full bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                          />
                        </TableCell>
                        <TableCell className="px-2 sm:px-4">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => handleItemChange(index, "quantidade", parseInt(e.target.value) || 1)}
                            className="w-full bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                          />
                        </TableCell>
                        <TableCell className="px-2 sm:px-4">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={item.precisaCadastro || false}
                              onCheckedChange={(checked) => handleItemChange(index, "precisaCadastro", !!checked)}
                              className="border-blue-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4">
                          <Input
                            value={item.observacoes || ""}
                            onChange={(e) => handleItemChange(index, "observacoes", e.target.value)}
                            placeholder="Observações"
                            className="w-full bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                          />
                        </TableCell>
                        <TableCell className="px-2 sm:px-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={itens.length === 1}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-blue-600 text-blue-300 hover:bg-blue-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
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