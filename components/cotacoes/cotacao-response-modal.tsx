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
import { MessageSquare, Save, Calculator, Copy, Loader2 } from "lucide-react";
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
  codigoSankhya: string; // Código Sankhya para itens que precisam de cadastro
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
          codigoSankhya: item.codigoSankhya || "", // Inicializar com valor existente ou vazio
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

  const copyToClipboard = async () => {
    if (!cotacao) return;

    let texto = `COTAÇÃO #${cotacao.numeroSequencial}\n`;
    texto += `********************************\n\n`;
    
    texto += `Data: ${new Date(cotacao.createdAt).toLocaleDateString('pt-BR')}\n\n`;
    
    texto += `ITENS SOLICITADOS:\n`;
    texto += `********************************\n`;
    
    cotacao.itens?.forEach((item, index) => {
      texto += `\n${index + 1}. ${item.codigoPeca}\n`;
      texto += `   ${item.descricao}\n`;
      texto += `   Quantidade: ${item.quantidade}\n`;
      if (item.observacoes) {
        texto += `   Observações: ${item.observacoes}\n`;
      }
    });
    
    if (cotacao.observacoes) {
      texto += `\nOBSERVAÇÕES GERAIS:\n`;
      texto += `${cotacao.observacoes}\n`;
    }
    
    texto += `\nPor favor, envie sua melhor cotação com preços e prazos de entrega.\n`;
    texto += `\nObrigado!`;

    try {
      await navigator.clipboard.writeText(texto);
      alert('Cotação copiada para a área de transferência!');
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = texto;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Cotação copiada para a área de transferência!');
    }
  };

  const validateForm = () => {
    // Verificar se todos os itens têm preço
    for (const resposta of itensResposta) {
      const preco = parseFloat(resposta.precoUnitario);
      if (!resposta.precoUnitario || isNaN(preco) || preco <= 0) {
        return "Todos os itens devem ter um preço unitário válido";
      }
      
      // Verificar se itens que precisam de cadastro têm código Sankhya
      const item = cotacao?.itens?.find(i => i._id === resposta.itemId);
      if (item?.precisaCadastro && !resposta.codigoSankhya?.trim()) {
        return `O item "${item.codigoPeca} - ${item.descricao}" precisa de cadastro. Informe o código Sankhya correspondente.`;
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
        codigoSankhya: resposta.codigoSankhya || undefined,
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
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Carregando Cotação
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando dados da cotação...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!cotacao) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto w-full bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Responder Cotação #{cotacao.numeroSequencial}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
                     {/* Informações da Cotação */}
           <div className="p-4 bg-blue-800/30 border border-blue-700 rounded-lg">
             <h3 className="text-lg font-semibold text-white mb-4">Informações da Cotação</h3>
             <div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {cotacao.numeroOS && (
                   <div>
                     <Label className="text-sm font-medium text-blue-300">Número da OS</Label>
                     <p className="mt-1 font-mono text-white font-semibold">{cotacao.numeroOS}</p>
                   </div>
                 )}
                 {cotacao.numeroOrcamento && (
                   <div>
                     <Label className="text-sm font-medium text-blue-300">Número do Orçamento</Label>
                     <p className="mt-1 font-mono text-white font-semibold">{cotacao.numeroOrcamento}</p>
                   </div>
                 )}
                 {cotacao.cliente && (
                   <div>
                     <Label className="text-sm font-medium text-blue-300">Cliente</Label>
                     <p className="mt-1 text-white font-semibold">{cotacao.cliente}</p>
                   </div>
                 )}
               </div>
               <div className="mt-4">
                 <Label className="text-sm font-medium text-blue-300">Solicitante</Label>
                 <p className="mt-1 text-white font-semibold">{cotacao.solicitante?.name}</p>
               </div>
            </div>
          </div>

          {/* Itens para Cotação */}
          <div className="p-4 bg-blue-800/30 border border-blue-700 rounded-lg">
            <div className="flex flex-row items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-white">Itens para Cotação</h3>
               <div className="flex items-center gap-2 bg-green-600 px-3 py-2 rounded-lg">
                 <Calculator className="h-4 w-4 text-white" />
                 <span className="text-lg font-bold text-white">
                   Total: {getGrandTotal()}
                 </span>
               </div>
             </div>
            
            {/* Verificar se algum item precisa de cadastro */}
            {cotacao.itens?.some(item => item.precisaCadastro) && (
              <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  <strong>⚠️ Atenção:</strong> Alguns itens marcados como "Cadastro" requerem o código Sankhya obrigatório. 
                  Estes códigos devem ser informados para que a cotação possa ser respondida.
                </p>
              </div>
            )}
            
            <div>
              <div className="overflow-x-auto">
                <Table>
                                     <TableHeader>
                     <TableRow className="hover:!bg-transparent border-blue-700">
                       <TableHead className="min-w-[120px] text-blue-300 font-semibold">Código</TableHead>
                       <TableHead className="min-w-[200px] text-blue-300 font-semibold">Descrição</TableHead>
                       <TableHead className="w-20 text-blue-300 font-semibold">Qtd</TableHead>
                       <TableHead className="w-32 text-blue-300 font-semibold">Preço Unit. *</TableHead>
                       <TableHead className="w-32 text-blue-300 font-semibold">Total</TableHead>
                       <TableHead className="min-w-[120px] text-blue-300 font-semibold">Prazo</TableHead>
                       <TableHead className="min-w-[150px] text-blue-300 font-semibold">Fornecedor</TableHead>
                       <TableHead className="min-w-[120px] text-blue-300 font-semibold">Cód. Sankhya</TableHead>
                       <TableHead className="min-w-[150px] text-blue-300 font-semibold">Observações</TableHead>
                     </TableRow>
                   </TableHeader>
                  <TableBody>
                    {cotacao.itens?.map((item, index) => {
                      const resposta = itensResposta.find(r => r.itemId === item._id);
                                             return (
                         <TableRow key={item._id} className="border-blue-700/50 hover:bg-blue-800/30">
                           <TableCell className="font-mono font-semibold text-white">
                             {item.codigoPeca}
                           </TableCell>
                           <TableCell className="text-blue-100">
                             {item.descricao}
                             {item.precisaCadastro && (
                               <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-900/30 text-orange-300 border border-orange-700/50">
                                 Cadastro
                               </span>
                             )}
                           </TableCell>
                           <TableCell className="text-center font-semibold text-white">
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
                               className="w-full bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                               required
                             />
                           </TableCell>
                           <TableCell className="font-semibold text-green-400 bg-blue-900/30">
                             {calculateTotal(item.quantidade, resposta?.precoUnitario || "0")}
                           </TableCell>
                                                     <TableCell>
                             <Input
                               placeholder="Ex: 15 dias"
                               value={resposta?.prazoEntrega || ""}
                               onChange={(e) => updateItemResponse(item._id, "prazoEntrega", e.target.value)}
                               className="w-full bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                             />
                           </TableCell>
                           <TableCell>
                             <Input
                               placeholder="Nome do fornecedor"
                               value={resposta?.fornecedor || ""}
                               onChange={(e) => updateItemResponse(item._id, "fornecedor", e.target.value)}
                               className="w-full bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                             />
                           </TableCell>
                           <TableCell>
                             {item.precisaCadastro ? (
                               <Input
                                 placeholder="Código Sankhya *"
                                 value={resposta?.codigoSankhya || ""}
                                 onChange={(e) => updateItemResponse(item._id, "codigoSankhya", e.target.value)}
                                 className="w-full bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                                 required
                               />
                             ) : (
                               <span className="text-blue-400 text-sm">-</span>
                             )}
                           </TableCell>
                           <TableCell>
                             <Input
                               placeholder="Observações"
                               value={resposta?.observacoes || ""}
                               onChange={(e) => updateItemResponse(item._id, "observacoes", e.target.value)}
                               className="w-full bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
                             />
                           </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

                     {/* Observações Gerais */}
           <div className="p-4 bg-blue-800/30 border border-blue-700 rounded-lg">
             <h3 className="text-lg font-semibold text-white mb-4">Observações Gerais</h3>
             <div>
               <Textarea
                 placeholder="Observações gerais sobre a cotação respondida..."
                 value={observacoesGerais}
                 onChange={(e) => setObservacoesGerais(e.target.value)}
                 rows={4}
                 className="bg-blue-800 border-blue-600 text-white placeholder:text-blue-400"
               />
             </div>
           </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={copyToClipboard}
              disabled={isSubmitting}
              className="border-green-600 text-green-400 hover:bg-green-900/20"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Cotação
            </Button>
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
               className="bg-green-600 hover:bg-green-700 text-white font-semibold"
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