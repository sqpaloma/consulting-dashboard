"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="p-4">Carregando detalhes da cotação...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!cotacao) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div className="p-4">Cotação não encontrada.</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Cotação #{cotacao.numeroSequencial}</DialogTitle>
        </DialogHeader>
        
                 <div className="space-y-4">
           <div className="bg-blue-50 p-4 rounded-lg">
             <h3 className="font-semibold text-blue-900">Informações Gerais</h3>
             <div className="grid grid-cols-2 gap-4 mt-2">
               {cotacao.numeroOS && (
                 <div>
                   <span className="text-sm text-blue-700 font-medium">OS:</span>
                   <p className="text-blue-900 font-semibold">{cotacao.numeroOS}</p>
                 </div>
               )}
               {cotacao.cliente && (
                 <div>
                   <span className="text-sm text-blue-700 font-medium">Cliente:</span>
                   <p className="text-blue-900 font-semibold">{cotacao.cliente}</p>
                 </div>
               )}
             </div>
           </div>

                     <div className="bg-white border-2 border-blue-200 p-4 rounded-lg">
             <h3 className="font-semibold text-blue-900">Itens ({cotacao.itens?.length || 0})</h3>
             <div className="mt-2 space-y-2">
               {cotacao.itens?.map((item) => (
                 <div key={item._id} className="border-2 border-blue-100 p-3 rounded bg-blue-25">
                   <div className="grid grid-cols-3 gap-2">
                     <div>
                       <span className="text-sm text-blue-700 font-medium">Código:</span>
                       <p className="font-mono text-blue-900 font-semibold">{item.codigoPeca}</p>
                     </div>
                     <div>
                       <span className="text-sm text-blue-700 font-medium">Descrição:</span>
                       <p className="text-blue-800">{item.descricao}</p>
                     </div>
                     <div>
                       <span className="text-sm text-blue-700 font-medium">Quantidade:</span>
                       <p className="text-blue-900 font-semibold">{item.quantidade}</p>
                     </div>
                   </div>
                                     {item.precoUnitario && (
                     <div className="mt-2 grid grid-cols-3 gap-2 bg-blue-50 p-2 rounded">
                       <div>
                         <span className="text-sm text-blue-700 font-medium">Preço Unit.:</span>
                         <p className={`font-semibold ${
                           ["respondida", "aprovada_para_compra", "comprada"].includes(cotacao.status) 
                             ? "text-white" 
                             : "text-blue-900"
                         }`}>
                           {item.precoUnitario.toLocaleString('pt-BR', {
                             style: 'currency',
                             currency: 'BRL'
                           })}
                         </p>
                       </div>
                       {item.prazoEntrega && (
                         <div>
                           <span className="text-sm text-blue-700 font-medium">Prazo:</span>
                           <p className="text-blue-800 font-medium">{item.prazoEntrega}</p>
                         </div>
                       )}
                       {item.fornecedor && (
                         <div>
                           <span className="text-sm text-blue-700 font-medium">Fornecedor:</span>
                           <p className="text-blue-800 font-medium">{item.fornecedor}</p>
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