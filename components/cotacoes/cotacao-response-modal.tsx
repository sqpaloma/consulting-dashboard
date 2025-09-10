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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Save, Calculator } from "lucide-react";
import { useCotacao, useCotacoes } from "@/hooks/use-cotacoes";
import { Id } from "@/convex/_generated/dataModel";

interface CotacaoResponseModalProps {
  cotacaoId: Id<"cotacoes">;
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  userId?: Id<"users">;
}

interface ItemResponse {
  itemId: Id<"cotacaoItens">;
  precoUnitario: string;
  prazoEntrega: string;
  fornecedor: string;
  observacoes: string;
}

export function CotacaoResponseModal({
  cotacaoId,
  isOpen,
  onClose,
  userRole,
  userId,
}: CotacaoResponseModalProps) {
  const { cotacao, isLoading } = useCotacao(cotacaoId);
  const { responderCotacao } = useCotacoes();
  
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [itensResposta, setItensResposta] = useState<ItemResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar respostas dos itens quando a cotação carregar
  useEffect(() => {
    if (cotacao?.itens) {
      setItensResposta(
        cotacao.itens.map(item => ({
          itemId: item._id,
          precoUnitario: item.precoUnitario?.toString() || "",
          prazoEntrega: item.prazoEntrega || "",
          fornecedor: item.fornecedor || "",
          observacoes: item.observacoes || "",
        }))
      );
    }
  }, [cotacao]);

  const updateItemResponse = (itemId: Id<"cotacaoItens">, field: keyof ItemResponse, value: string) => {
    setItensResposta(prev => 
      prev.map(item => 
        item.itemId === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = (quantidade: number, precoUnitario: string) => {
    const preco = parseFloat(precoUnitario) || 0;
    return (quantidade * preco).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getGrandTotal = () => {
    if (!cotacao?.itens) return "R$ 0,00";
    
    const total = cotacao.itens.reduce((sum, item) => {
      const resposta = itensResposta.find(r => r.itemId === item._id);
      const preco = parseFloat(resposta?.precoUnitario || "0") || 0;
      return sum + (item.quantidade * preco);
    }, 0);

    return total.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const validateForm = () => {
    // Verificar se todos os itens têm preço
    for (const resposta of itensResposta) {
      const preco = parseFloat(resposta.precoUnitario);
      if (!resposta.precoUnitario || isNaN(preco) || preco <= 0) {
        return "Todos os itens devem ter um preço unitário válido";
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
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
      const itensFormatados = itensResposta.map(resposta => ({
        itemId: resposta.itemId,
        precoUnitario: parseFloat(resposta.precoUnitario),
        prazoEntrega: resposta.prazoEntrega || undefined,
        fornecedor: resposta.fornecedor || undefined,
        observacoes: resposta.observacoes || undefined,
      }));

      await responderCotacao(
        cotacaoId,
        userId,
        itensFormatados,
        observacoesGerais || undefined
      );

      onClose();
    } catch (error) {
      console.error("Erro ao responder cotação:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Carregando cotação...</DialogTitle>
          </DialogHeader>
                     <div className="p-8 text-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
             <p className="mt-2 text-blue-900">Carregando dados da cotação...</p>
           </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!cotacao) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <p>Cotação não encontrada.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Responder Cotação #{cotacao.numeroSequencial}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
                     {/* Informações da Cotação */}
           <Card>
             <CardHeader className="bg-blue-50">
               <CardTitle className="text-lg text-blue-900">Informações da Cotação</CardTitle>
             </CardHeader>
                         <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {cotacao.numeroOS && (
                   <div>
                     <Label className="text-sm font-medium text-blue-900">Número da OS</Label>
                     <p className="mt-1 font-mono text-blue-800 font-semibold">{cotacao.numeroOS}</p>
                   </div>
                 )}
                 {cotacao.numeroOrcamento && (
                   <div>
                     <Label className="text-sm font-medium text-blue-900">Número do Orçamento</Label>
                     <p className="mt-1 font-mono text-blue-800 font-semibold">{cotacao.numeroOrcamento}</p>
                   </div>
                 )}
                 {cotacao.cliente && (
                   <div>
                     <Label className="text-sm font-medium text-blue-900">Cliente</Label>
                     <p className="mt-1 text-blue-800 font-semibold">{cotacao.cliente}</p>
                   </div>
                 )}
               </div>
               <div className="mt-4">
                 <Label className="text-sm font-medium text-blue-900">Solicitante</Label>
                 <p className="mt-1 text-blue-800 font-semibold">{cotacao.solicitante?.name}</p>
               </div>
            </CardContent>
          </Card>

          {/* Itens para Cotação */}
          <Card>
                         <CardHeader className="flex flex-row items-center justify-between bg-blue-50">
               <CardTitle className="text-lg text-blue-900">Itens para Cotação</CardTitle>
               <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border-2 border-blue-600">
                 <Calculator className="h-4 w-4 text-blue-600" />
                 <span className="text-lg font-bold text-blue-900">
                   Total: {getGrandTotal()}
                 </span>
               </div>
             </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                                     <TableHeader>
                     <TableRow className="bg-blue-50">
                       <TableHead className="min-w-[120px] text-blue-900 font-semibold">Código</TableHead>
                       <TableHead className="min-w-[200px] text-blue-900 font-semibold">Descrição</TableHead>
                       <TableHead className="w-20 text-blue-900 font-semibold">Qtd</TableHead>
                       <TableHead className="w-32 text-blue-900 font-semibold">Preço Unit. *</TableHead>
                       <TableHead className="w-32 text-blue-900 font-semibold">Total</TableHead>
                       <TableHead className="min-w-[120px] text-blue-900 font-semibold">Prazo</TableHead>
                       <TableHead className="min-w-[150px] text-blue-900 font-semibold">Fornecedor</TableHead>
                       <TableHead className="min-w-[150px] text-blue-900 font-semibold">Observações</TableHead>
                     </TableRow>
                   </TableHeader>
                  <TableBody>
                    {cotacao.itens?.map((item, index) => {
                      const resposta = itensResposta.find(r => r.itemId === item._id);
                                             return (
                         <TableRow key={item._id} className="hover:bg-blue-25">
                           <TableCell className="font-mono font-semibold text-blue-900">
                             {item.codigoPeca}
                           </TableCell>
                           <TableCell className="text-blue-800">{item.descricao}</TableCell>
                           <TableCell className="text-center font-semibold text-blue-900">
                             {item.quantidade}
                           </TableCell>
                                                     <TableCell>
                             <Input
                               type="number"
                               step="0.01"
                               min="0"
                               placeholder="0,00"
                               value={resposta?.precoUnitario || ""}
                               onChange={(e) => updateItemResponse(item._id, "precoUnitario", e.target.value)}
                               className="w-full border-blue-300 focus:border-blue-600 focus:ring-blue-600"
                               required
                             />
                           </TableCell>
                           <TableCell className="font-semibold text-blue-800 bg-blue-50">
                             {calculateTotal(item.quantidade, resposta?.precoUnitario || "0")}
                           </TableCell>
                                                     <TableCell>
                             <Input
                               placeholder="Ex: 15 dias"
                               value={resposta?.prazoEntrega || ""}
                               onChange={(e) => updateItemResponse(item._id, "prazoEntrega", e.target.value)}
                               className="w-full border-blue-300 focus:border-blue-600 focus:ring-blue-600"
                             />
                           </TableCell>
                           <TableCell>
                             <Input
                               placeholder="Nome do fornecedor"
                               value={resposta?.fornecedor || ""}
                               onChange={(e) => updateItemResponse(item._id, "fornecedor", e.target.value)}
                               className="w-full border-blue-300 focus:border-blue-600 focus:ring-blue-600"
                             />
                           </TableCell>
                           <TableCell>
                             <Input
                               placeholder="Observações"
                               value={resposta?.observacoes || ""}
                               onChange={(e) => updateItemResponse(item._id, "observacoes", e.target.value)}
                               className="w-full border-blue-300 focus:border-blue-600 focus:ring-blue-600"
                             />
                           </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

                     {/* Observações Gerais */}
           <Card>
             <CardHeader className="bg-blue-50">
               <CardTitle className="text-lg text-blue-900">Observações Gerais</CardTitle>
             </CardHeader>
             <CardContent>
               <Textarea
                 placeholder="Observações gerais sobre a cotação respondida..."
                 value={observacoesGerais}
                 onChange={(e) => setObservacoesGerais(e.target.value)}
                 rows={4}
                 className="border-blue-300 focus:border-blue-600 focus:ring-blue-600 placeholder-blue-400"
               />
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
               className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
             >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando Resposta...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enviar Resposta
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 