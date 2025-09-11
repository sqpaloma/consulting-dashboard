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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ShoppingCart, X, Plus, Minus } from "lucide-react";
import { useCotacao, useCotacoes } from "@/hooks/use-cotacoes";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface CotacaoApprovalModalProps {
  cotacaoId: Id<"cotacoes">;
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  userId?: Id<"users">;
}

interface ItemToApprove {
  itemId: Id<"cotacaoItens">;
  codigoPeca: string;
  descricao: string;
  quantidade: number;
  quantidadeAprovada: number;
  precoUnitario: number;
  precoTotal: number;
  prazoEntrega?: string;
  fornecedor?: string;
  observacoes?: string;
  selected: boolean;
}

export function CotacaoApprovalModal({
  cotacaoId,
  isOpen,
  onClose,
  userRole,
  userId,
}: CotacaoApprovalModalProps) {
  const { cotacao, isLoading } = useCotacao(cotacaoId);
  const { aprovarCotacao, finalizarCompra } = useCotacoes();
  
  const [itensToApprove, setItensToApprove] = useState<ItemToApprove[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar itens quando a cotação carregar
  useEffect(() => {
    if (cotacao?.itens) {
      const itens: ItemToApprove[] = cotacao.itens.map((item: any) => ({
        itemId: item._id,
        codigoPeca: item.codigoPeca,
        descricao: item.descricao,
        quantidade: item.quantidade,
        quantidadeAprovada: item.quantidade, // Inicializa com a quantidade total
        precoUnitario: item.precoUnitario || 0,
        precoTotal: (item.precoUnitario || 0) * item.quantidade,
        prazoEntrega: item.prazoEntrega,
        fornecedor: item.fornecedor,
        observacoes: item.observacoes,
        selected: true, // Inicializa todos selecionados
      }));
      setItensToApprove(itens);
    }
  }, [cotacao]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  // Atualizar seleção de item
  const handleItemSelection = (itemId: Id<"cotacaoItens">, selected: boolean) => {
    setItensToApprove(prev => prev.map(item => 
      item.itemId === itemId ? { ...item, selected } : item
    ));
  };

  // Atualizar quantidade aprovada
  const handleQuantityChange = (itemId: Id<"cotacaoItens">, novaQuantidade: number) => {
    setItensToApprove(prev => prev.map(item => {
      if (item.itemId === itemId) {
        const quantidade = Math.max(0, Math.min(novaQuantidade, item.quantidade));
        return {
          ...item,
          quantidadeAprovada: quantidade,
          precoTotal: quantidade * item.precoUnitario,
        };
      }
      return item;
    }));
  };

  // Incrementar/decrementar quantidade
  const adjustQuantity = (itemId: Id<"cotacaoItens">, delta: number) => {
    const item = itensToApprove.find(i => i.itemId === itemId);
    if (item) {
      const newQuantity = Math.max(0, Math.min(item.quantidadeAprovada + delta, item.quantidade));
      handleQuantityChange(itemId, newQuantity);
    }
  };

  // Calcular totais
  const itensSelecionados = itensToApprove.filter(item => item.selected && item.quantidadeAprovada > 0);
  const valorTotalSelecionado = itensSelecionados.reduce((total, item) => total + item.precoTotal, 0);

  // Aprovar cotação para compra
  const handleAprovar = async () => {
    if (!userId || !cotacao) {
      toast.error("Usuário não identificado");
      return;
    }

    const itensSelecionados = itensToApprove.filter(item => item.selected && item.quantidadeAprovada > 0);
    
    if (itensSelecionados.length === 0) {
      toast.error("Selecione pelo menos um item para aprovar");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Aprovar a cotação com o solicitante original
      await aprovarCotacao(cotacaoId, cotacao.solicitanteId, observacoes);
      
      toast.success("Cotação aprovada para compra!");
      onClose();
    } catch (error) {
      console.error("Erro ao aprovar cotação:", error);
      toast.error(`Erro ao aprovar cotação: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !cotacao) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Carregando Cotação
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando cotação...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Aprovar Cotação #{cotacao.numeroSequencial}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Cotação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-800/30 border border-blue-700 rounded-lg">
            <div>
              <Label className="text-blue-300">Cliente</Label>
              <p className="text-white">{cotacao.cliente || "Não informado"}</p>
            </div>
            <div>
              <Label className="text-blue-300">Solicitante</Label>
              <p className="text-white">{cotacao.solicitante?.name}</p>
            </div>
            <div>
              <Label className="text-blue-300">Data</Label>
              <p className="text-white">{formatDate(cotacao.createdAt)}</p>
            </div>
            {cotacao.numeroOS && (
              <div>
                <Label className="text-blue-300">Número OS</Label>
                <p className="text-white">{cotacao.numeroOS}</p>
              </div>
            )}
            {cotacao.numeroOrcamento && (
              <div>
                <Label className="text-blue-300">Número Orçamento</Label>
                <p className="text-white">{cotacao.numeroOrcamento}</p>
              </div>
            )}
            {cotacao.fornecedor && (
              <div>
                <Label className="text-blue-300">Fornecedor Preferencial</Label>
                <p className="text-white">{cotacao.fornecedor}</p>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <p className="text-yellow-200 text-sm">
              <strong>Instruções:</strong> Selecione os itens que deseja aprovar e ajuste as quantidades conforme necessário. 
              Após a aprovação, a cotação ficará disponível para compra pela equipe de compras.
            </p>
          </div>

          {/* Lista de Itens */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Itens da Cotação</h3>
            
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="hover:!bg-transparent border-blue-700">
                    <TableHead className="text-blue-300 w-12">Comprar</TableHead>
                    <TableHead className="text-blue-300">Código</TableHead>
                    <TableHead className="text-blue-300">Descrição</TableHead>
                    <TableHead className="text-blue-300">Qtd. Cotada</TableHead>
                    <TableHead className="text-blue-300">Qtd. Aprovar</TableHead>
                    <TableHead className="text-blue-300">Preço Unit.</TableHead>
                    <TableHead className="text-blue-300">Total</TableHead>
                    <TableHead className="text-blue-300">Fornecedor</TableHead>
                    <TableHead className="text-blue-300">Prazo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensToApprove.map((item) => (
                    <TableRow key={item.itemId} className="border-blue-700/50 hover:bg-blue-800/30">
                      <TableCell>
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={(checked) => handleItemSelection(item.itemId, !!checked)}
                          className="border-blue-400"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.codigoPeca}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-white">{item.descricao}</p>
                          {item.observacoes && (
                            <p className="text-xs text-blue-300">{item.observacoes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantidade}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustQuantity(item.itemId, -1)}
                            disabled={!item.selected || item.quantidadeAprovada <= 0}
                            className="h-8 w-8 p-0 border-blue-600"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantidadeAprovada}
                            onChange={(e) => handleQuantityChange(item.itemId, parseInt(e.target.value) || 0)}
                            disabled={!item.selected}
                            min={0}
                            max={item.quantidade}
                            className="w-16 text-center bg-blue-800 border-blue-600 text-white"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustQuantity(item.itemId, 1)}
                            disabled={!item.selected || item.quantidadeAprovada >= item.quantidade}
                            className="h-8 w-8 p-0 border-blue-600"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.precoUnitario)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={item.selected && item.quantidadeAprovada > 0 ? "text-green-400" : "text-gray-400"}>
                          {formatCurrency(item.precoTotal)}
                        </span>
                      </TableCell>
                      <TableCell>{item.fornecedor || "-"}</TableCell>
                      <TableCell>{item.prazoEntrega || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Resumo */}
            <div className="flex justify-between items-center p-4 bg-blue-800/30 border border-blue-700 rounded-lg">
              <div>
                <p className="text-blue-300">Itens selecionados: {itensSelecionados.length}</p>
                <p className="text-blue-300">Total de itens cotados: {itensToApprove.length}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-300">Valor total aprovado:</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(valorTotalSelecionado)}
                </p>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label className="text-blue-300">Observações da Aprovação</Label>
            <Textarea
              placeholder="Adicione observações sobre a aprovação desta cotação..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
              rows={3}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t border-blue-700">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-blue-600 text-blue-300 hover:bg-blue-800"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleAprovar}
              disabled={isSubmitting || itensSelecionados.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aprovando...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Aprovar Cotação ({itensSelecionados.length} itens)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}