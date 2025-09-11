"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Loader2 } from "lucide-react";
import { useCotacao } from "@/hooks/use-cotacoes";
import { Id } from "@/convex/_generated/dataModel";

interface CotacaoDetailModalProps {
  cotacaoId: Id<"cotacoes">;
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  userId?: Id<"users">;
}

export function CotacaoDetailModal({
  cotacaoId,
  isOpen,
  onClose,
  userRole,
  userId,
}: CotacaoDetailModalProps) {
  const { cotacao, isLoading } = useCotacao(cotacaoId);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Carregando Cotação
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando detalhes da cotação...</span>
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
              <FileText className="h-6 w-6" />
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
            <FileText className="h-6 w-6" />
            Detalhes da Cotação #{cotacao.numeroSequencial}
          </DialogTitle>
        </DialogHeader>
        
                 <div className="space-y-4">
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

                     <div className="p-4 bg-blue-800/30 border border-blue-700 rounded-lg">
             <h3 className="font-semibold text-white mb-3">Itens ({cotacao.itens?.length || 0})</h3>
             <div className="space-y-3">
               {cotacao.itens?.map((item) => (
                 <div key={item._id} className="border border-blue-600 p-4 rounded-lg bg-blue-800/20">
                   <div className="grid grid-cols-3 gap-4">
                     <div>
                       <span className="text-sm text-blue-300 font-medium">Código:</span>
                       <p className="font-mono text-white font-semibold">{item.codigoPeca}</p>
                     </div>
                     <div>
                       <span className="text-sm text-blue-300 font-medium">Descrição:</span>
                       <p className="text-blue-100">{item.descricao}</p>
                       {item.precisaCadastro && (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-900/30 text-orange-300 border border-orange-700/50 mt-1">
                           Cadastro
                         </span>
                       )}
                     </div>
                     <div>
                       <span className="text-sm text-blue-300 font-medium">Quantidade:</span>
                       <p className="text-white font-semibold">{item.quantidade}</p>
                     </div>
                   </div>
                                     {item.precoUnitario && (
                     <div className="mt-3 grid grid-cols-3 gap-4 bg-blue-900/30 p-3 rounded">
                       <div>
                         <span className="text-sm text-blue-300 font-medium">Preço Unit.:</span>
                         <p className={`font-semibold ${
                           ["respondida", "aprovada_para_compra", "comprada"].includes(cotacao.status) 
                             ? "text-green-400" 
                             : "text-white"
                         }`}>
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
                       {item.codigoSankhya && (
                         <div>
                           <span className="text-sm text-blue-300 font-medium">Código Sankhya:</span>
                           <p className="text-green-400 font-medium font-mono">{item.codigoSankhya}</p>
                         </div>
                       )}
                     </div>
                   )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 