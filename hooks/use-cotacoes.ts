"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export interface CotacaoItem {
  _id?: Id<"cotacaoItens">;
  codigoPeca: string;
  descricao: string;
  quantidade: number;
  precoUnitario?: number;
  precoTotal?: number;
  prazoEntrega?: string;
  fornecedor?: string;
  observacoes?: string;
}

export interface CotacaoFormData {
  numeroOS?: string;
  numeroOrcamento?: string;
  cliente?: string;
  observacoes?: string;
  itens: CotacaoItem[];
}

export function useCotacoes() {
  // Queries
  const listCotacoes = useQuery(api.cotacoes.listCotacoes, {});
  const getProximoNumero = useQuery(api.cotacoes.getProximoNumero);

  // Mutations
  const criarCotacao = useMutation(api.cotacoes.criarCotacao);
  const assumirCotacao = useMutation(api.cotacoes.assumirCotacao);
  const responderCotacao = useMutation(api.cotacoes.responderCotacao);
  const aprovarCotacao = useMutation(api.cotacoes.aprovarCotacao);
  const finalizarCompra = useMutation(api.cotacoes.finalizarCompra);
  const cancelarCotacao = useMutation(api.cotacoes.cancelarCotacao);
  const editarItensCotacao = useMutation(api.cotacoes.editarItensCotacao);

  // Função para criar nova cotação
  const handleCriarCotacao = async (
    data: CotacaoFormData,
    solicitanteId: Id<"users">
  ) => {
    try {
      const result = await criarCotacao({
        numeroOS: data.numeroOS,
        numeroOrcamento: data.numeroOrcamento,
        cliente: data.cliente,
        solicitanteId,
        observacoes: data.observacoes,
        itens: data.itens.map(item => ({
          codigoPeca: item.codigoPeca,
          descricao: item.descricao,
          quantidade: item.quantidade,
          observacoes: item.observacoes,
        })),
      });

      toast.success(`Cotação #${result.numeroSequencial} criada com sucesso!`);
      return result;
    } catch (error) {
      toast.error(`Erro ao criar cotação: ${error}`);
      throw error;
    }
  };

  // Função para assumir cotação
  const handleAssumirCotacao = async (
    cotacaoId: Id<"cotacoes">,
    compradorId: Id<"users">
  ) => {
    try {
      await assumirCotacao({ cotacaoId, compradorId });
      toast.success("Cotação assumida com sucesso!");
    } catch (error) {
      toast.error(`Erro ao assumir cotação: ${error}`);
      throw error;
    }
  };

  // Função para responder cotação
  const handleResponderCotacao = async (
    cotacaoId: Id<"cotacoes">,
    compradorId: Id<"users">,
    itensResposta: Array<{
      itemId: Id<"cotacaoItens">;
      precoUnitario: number;
      prazoEntrega?: string;
      fornecedor?: string;
      observacoes?: string;
    }>,
    observacoes?: string
  ) => {
    try {
      await responderCotacao({
        cotacaoId,
        compradorId,
        itensResposta,
        observacoes,
      });
      toast.success("Cotação respondida com sucesso!");
    } catch (error) {
      toast.error(`Erro ao responder cotação: ${error}`);
      throw error;
    }
  };

  // Função para aprovar cotação
  const handleAprovarCotacao = async (
    cotacaoId: Id<"cotacoes">,
    solicitanteId: Id<"users">,
    observacoes?: string
  ) => {
    try {
      await aprovarCotacao({ cotacaoId, solicitanteId, observacoes });
      toast.success("Cotação aprovada para compra!");
    } catch (error) {
      toast.error(`Erro ao aprovar cotação: ${error}`);
      throw error;
    }
  };

  // Função para finalizar compra
  const handleFinalizarCompra = async (
    cotacaoId: Id<"cotacoes">,
    compradorId: Id<"users">,
    observacoes?: string
  ) => {
    try {
      await finalizarCompra({ cotacaoId, compradorId, observacoes });
      toast.success("Compra finalizada com sucesso!");
    } catch (error) {
      toast.error(`Erro ao finalizar compra: ${error}`);
      throw error;
    }
  };

  // Função para cancelar cotação
  const handleCancelarCotacao = async (
    cotacaoId: Id<"cotacoes">,
    usuarioId: Id<"users">,
    motivo: string
  ) => {
    try {
      await cancelarCotacao({ cotacaoId, usuarioId, motivo });
      toast.success("Cotação cancelada!");
    } catch (error) {
      toast.error(`Erro ao cancelar cotação: ${error}`);
      throw error;
    }
  };

  // Função para editar itens
  const handleEditarItens = async (
    cotacaoId: Id<"cotacoes">,
    usuarioId: Id<"users">,
    itens: Array<{
      itemId?: Id<"cotacaoItens">;
      codigoPeca: string;
      descricao: string;
      quantidade: number;
      observacoes?: string;
    }>,
    itensParaRemover?: Id<"cotacaoItens">[]
  ) => {
    try {
      await editarItensCotacao({
        cotacaoId,
        usuarioId,
        itens,
        itensParaRemover,
      });
      toast.success("Itens atualizados com sucesso!");
    } catch (error) {
      toast.error(`Erro ao editar itens: ${error}`);
      throw error;
    }
  };

  return {
    // Data
    cotacoes: listCotacoes,
    proximoNumero: getProximoNumero,
    
    // Actions
    criarCotacao: handleCriarCotacao,
    assumirCotacao: handleAssumirCotacao,
    responderCotacao: handleResponderCotacao,
    aprovarCotacao: handleAprovarCotacao,
    finalizarCompra: handleFinalizarCompra,
    cancelarCotacao: handleCancelarCotacao,
    editarItens: handleEditarItens,
    
    // Loading states
    isLoading: listCotacoes === undefined,
  };
}

// Hook para cotações pendentes
export function useCotacoesPendentes(usuarioId?: Id<"users">) {
  const cotacoesPendentes = useQuery(
    api.cotacoes.getCotacoesPendentes,
    usuarioId ? { usuarioId } : "skip"
  );

  return {
    cotacoesPendentes,
    isLoading: cotacoesPendentes === undefined,
    totalPendentes: cotacoesPendentes?.length || 0,
  };
}

// Hook para cotação específica
export function useCotacao(cotacaoId?: Id<"cotacoes">) {
  const cotacao = useQuery(
    api.cotacoes.getCotacao,
    cotacaoId ? { cotacaoId } : "skip"
  );

  return {
    cotacao,
    isLoading: cotacao === undefined,
  };
}

// Hook para busca de cotações
export function useBuscaCotacoes(filtros: {
  status?: string;
  solicitanteId?: Id<"users">;
  compradorId?: Id<"users">;
  busca?: string;
  incluirHistorico?: boolean;
  dataInicio?: number;
  dataFim?: number;
}) {
  const cotacoes = useQuery(api.cotacoes.listCotacoes, filtros);

  return {
    cotacoes,
    isLoading: cotacoes === undefined,
    total: cotacoes?.length || 0,
  };
}

// Utilitários para status
export const statusCotacao = {
  novo: { label: "Novo", color: "bg-white text-blue-900", textColor: "text-blue-900" },
  em_cotacao: { label: "Em Cotação", color: "bg-blue-600 text-white", textColor: "text-blue-600" },
  respondida: { label: "Respondida", color: "bg-white text-blue-900", textColor: "text-blue-900" },
  aprovada_para_compra: { label: "Aprovada para Compra", color: "bg-blue-600 text-white", textColor: "text-blue-600" },
  comprada: { label: "Comprada", color: "bg-blue-800 text-white", textColor: "text-blue-800" },
  cancelada: { label: "Cancelada", color: "bg-blue-400 text-white", textColor: "text-blue-400" },
};

export const getStatusInfo = (status: string) => {
  return statusCotacao[status as keyof typeof statusCotacao] || {
    label: status,
    color: "bg-gray-500",
    textColor: "text-gray-700",
  };
};

/**
 * Verifica se um usuário pode executar uma ação específica em uma cotação
 * 
 * PERMISSÕES DO ADMINISTRADOR (role === "admin"):
 * ✅ Criar cotações (como vendedor)
 * ✅ Ver todas as cotações (sem restrições)
 * ✅ Assumir cotações (como compras)
 * ✅ Responder cotações (como compras) 
 * ✅ Aprovar cotações (pode aprovar qualquer cotação, não só as próprias)
 * ✅ Finalizar compras (como compras)
 * ✅ Cancelar cotações (em qualquer status)
 * ✅ Editar cotações (em qualquer status, exceto finalizadas)
 * ✅ Ver filtro de responsável (como equipe de compras)
 * ✅ Ver todas as cotações pendentes da equipe de compras
 * 
 * O administrador tem acesso total a todas as funcionalidades do sistema.
 */
export const podeExecutarAcao = (
  status: string,
  acao: string,
  userRole: string,
  isSolicitante: boolean,
  isComprador: boolean
) => {
  // Administradores têm acesso total a todas as ações (exceto algumas restrições específicas)
  const isAdmin = userRole === "admin";
  
  switch (acao) {
    case "assumir":
      return ["novo", "em_cotacao"].includes(status) && 
             (isAdmin || ["compras", "gerente"].includes(userRole));
    
    case "responder":
      return status === "em_cotacao" && 
             (isAdmin || ["compras", "gerente"].includes(userRole));
    
    case "aprovar":
      // Administradores podem aprovar qualquer cotação respondida
      return status === "respondida" && (isAdmin || isSolicitante);
    
    case "comprar":
      return status === "aprovada_para_compra" && 
             (isAdmin || ["compras", "gerente"].includes(userRole));
    
    case "cancelar":
      return !["comprada", "cancelada"].includes(status) && 
             (isAdmin || isSolicitante || ["compras", "gerente"].includes(userRole));
    
    case "editar":
      // Administradores podem editar cotações em qualquer status (exceto finalizadas)
      return !["comprada", "cancelada"].includes(status) && 
             (isAdmin || 
              (["novo", "em_cotacao"].includes(status) && isSolicitante) ||
              (status === "em_cotacao" && ["compras", "gerente"].includes(userRole)));
    
    default:
      return false;
  }
}; 