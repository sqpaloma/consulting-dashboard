"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MoreVertical,
  UserCheck,
  MessageSquare,
  CheckCircle,
  ShoppingCart,
  XCircle,
  Edit,
  Clock,
  Trash2,
  Download,
} from "lucide-react";
import { useBuscaCotacoes, useCotacoes } from "@/hooks/use-cotacoes";
import { getStatusInfo, podeExecutarAcao } from "@/hooks/use-cotacoes";
import { CotacaoDetailModal } from "./cotacao-detail-modal";
import { CotacaoResponseModal } from "./cotacao-response-modal";
import { SankhyaResponseModal } from "./sankhya-response-modal";
import { CotacaoApprovalModal } from "./cotacao-approval-modal";
import { CotacaoEditModal } from "./cotacao-edit-modal";
import { Id } from "@/convex/_generated/dataModel";

// Função utilitária para formatar data
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('pt-BR');
};

interface FiltrosState {
  busca: string;
  status: string;
  incluirHistorico: boolean;
  responsavel: string;
  dataInicio?: number;
  dataFim?: number;
}

interface CotacoesTableProps {
  filtros: FiltrosState;
  userRole: string;
  userId?: Id<"users">;
}

export function CotacoesTable({ filtros, userRole, userId }: CotacoesTableProps) {
  const [selectedCotacao, setSelectedCotacao] = useState<Id<"cotacoes"> | null>(null);
  const [respondingCotacao, setRespondingCotacao] = useState<Id<"cotacoes"> | null>(null);
  const [respondingPendencia, setRespondingPendencia] = useState<Id<"pendenciasCadastro"> | null>(null);
  const [approvingCotacao, setApprovingCotacao] = useState<Id<"cotacoes"> | null>(null);
  const [editingCotacao, setEditingCotacao] = useState<Id<"cotacoes"> | null>(null);

  const { excluirCotacao, excluirPendencia, concluirPendencia, finalizarCompra } = useCotacoes();

  // Função para lidar com ações dos cards mobile
  const handleCardAction = (cotacao: any, action: string) => {
    if (action === "view") {
      setSelectedCotacao(cotacao._id);
    } else if (action === "responder") {
      if (cotacao.tipo === "cadastro") {
        setRespondingPendencia(cotacao._id);
      } else {
        setRespondingCotacao(cotacao._id);
      }
    } else if (action === "aprovar") {
      setApprovingCotacao(cotacao._id);
    } else if (action === "comprar") {
      handleComprar(cotacao);
    } else if (action === "concluir") {
      handleConcluir(cotacao);
    } else if (action === "editar") {
      setEditingCotacao(cotacao._id);
    } else if (action === "excluir") {
      handleExcluir(cotacao);
    } else {
      // Default para visualizar
      setSelectedCotacao(cotacao._id);
    }
  };

  // Função para confirmar e excluir
  const handleExcluir = async (cotacao: any) => {
    
    if (!userId) {
      return;
    }
    
    const tipo = cotacao.tipo === "cadastro" ? "solicitação" : "cotação";
    const numero = `#${cotacao.numeroSequencial}`;
    
    
    if (!window.confirm(`Tem certeza que deseja excluir esta ${tipo} ${numero}?`)) {
      return;
    }

    try {
      if (cotacao.tipo === "cadastro") {
        await excluirPendencia(cotacao._id, userId);
      } else {
        await excluirCotacao(cotacao._id, userId);
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Função para concluir cadastro
  const handleConcluir = async (cotacao: any) => {
    if (!userId) {
      return;
    }
    
    const numero = `#${cotacao.numeroSequencial}`;
    
    if (!window.confirm(`Confirma a conclusão da solicitação ${numero}?`)) {
      return;
    }

    try {
      await concluirPendencia(cotacao._id, userId);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Função para finalizar compra
  const handleComprar = async (cotacao: any) => {
    if (!userId) {
      return;
    }
    
    const numero = `#${cotacao.numeroSequencial}`;
    
    if (!window.confirm(`Confirma a finalização da compra da cotação ${numero}?`)) {
      return;
    }

    try {
      await finalizarCompra(cotacao._id, userId);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Função para exportar histórico
  const handleExportarHistorico = () => {
    // TODO: Implementar exportação para Excel
    console.log("Exportar histórico para Excel", cotacoesHistorico);
    alert("Funcionalidade de exportação será implementada em breve");
  };

  // Construir filtros para a query
  const queryFiltros = {
    busca: filtros.busca || undefined,
    status: (filtros.status && filtros.status !== "all") ? filtros.status : undefined,
    incluirHistorico: filtros.incluirHistorico,
    dataInicio: filtros.dataInicio,
    dataFim: filtros.dataFim,
    // Filtrar por responsável baseado na seleção
    solicitanteId: filtros.responsavel === "solicitante" ? userId : undefined,
    compradorId: filtros.responsavel === "comprador" ? userId : undefined,
  };

  const { cotacoes, isLoading } = useBuscaCotacoes(queryFiltros);

  // Separar cotações pendentes e histórico
  const cotacoesPendentes = cotacoes?.filter(c => 
    !["comprada", "cancelada"].includes(c.status)
  ) || [];
  
  const cotacoesHistorico = cotacoes?.filter(c => 
    ["comprada", "cancelada"].includes(c.status)
  ) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "responder": return <MessageSquare className="h-4 w-4" />;
      case "aprovar": return <CheckCircle className="h-4 w-4" />;
      case "concluir": return <CheckCircle className="h-4 w-4" />;
      case "comprar": return <ShoppingCart className="h-4 w-4" />;
      case "cancelar": return <XCircle className="h-4 w-4" />;
      case "editar": return <Edit className="h-4 w-4" />;
      case "excluir": return <Trash2 className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "responder": return "Responder";
      case "aprovar": return "Aprovar";
      case "concluir": return "Concluir";
      case "comprar": return "Comprar";
      case "cancelar": return "Cancelar";
      case "editar": return "Editar";
      case "excluir": return "Excluir";
      default: return "Visualizar";
    }
  };

  const getAvailableActions = (cotacao: any) => {
    const actions = ["view"]; // Sempre pode visualizar
    
    const isSolicitante = cotacao.solicitanteId === userId;
    const isComprador = cotacao.compradorId === userId;


    // Para cadastros, lógica diferente
    if (cotacao.tipo === "cadastro") {
      // Equipe de compras pode responder pendências pendentes ou em andamento
      if (["admin", "compras", "gerente"].includes(userRole) && 
          ["pendente", "em_andamento"].includes(cotacao.status)) {
        actions.push("responder");
      }
      
      // Solicitante pode concluir cadastros respondidos
      if (cotacao.status === "respondida_cadastro" && isSolicitante) {
        actions.push("concluir");
      }
      
      // Administradores sempre podem excluir
      // Solicitante pode excluir suas próprias solicitações
      // Equipe de compras pode excluir qualquer solicitação
      if (userRole === "admin" || isSolicitante || ["compras", "gerente"].includes(userRole)) {
        actions.push("excluir");
      }
      return actions;
    }

    // Para cotações, lógica original
    if (podeExecutarAcao(cotacao.status, "responder", userRole, isSolicitante, isComprador)) {
      actions.push("responder");
    }
    if (podeExecutarAcao(cotacao.status, "aprovar", userRole, isSolicitante, isComprador)) {
      actions.push("aprovar");
    }
    if (podeExecutarAcao(cotacao.status, "comprar", userRole, isSolicitante, isComprador)) {
      actions.push("comprar");
    }
    if (podeExecutarAcao(cotacao.status, "editar", userRole, isSolicitante, isComprador)) {
      actions.push("editar");
    }
    if (podeExecutarAcao(cotacao.status, "cancelar", userRole, isSolicitante, isComprador)) {
      actions.push("cancelar");
    }
    
    // Administradores podem excluir cotações
    if (userRole === "admin" || isSolicitante) {
      actions.push("excluir");
    }
    
    return actions;
  };

  const isPendente = (cotacao: any) => {
    // Administrador vê TODAS as pendências
    if (userRole === "admin") {
      if (cotacao.tipo === "cadastro") {
        return ["pendente", "em_andamento", "respondida_cadastro"].includes(cotacao.status);
      } else {
        return ["novo", "em_cotacao", "aprovada_para_compra", "respondida"].includes(cotacao.status);
      }
    }
    
    // Se é cadastro, verificar status de cadastro
    if (cotacao.tipo === "cadastro") {
      const statusPendentesCadastro = ["pendente", "em_andamento", "respondida_cadastro"];
      return statusPendentesCadastro.includes(cotacao.status) && 
             ["compras", "gerente"].includes(userRole);
    }
    
    // Se é cotação, usar lógica original
    const statusPendentesCompras = ["novo", "em_cotacao", "aprovada_para_compra"];
    const statusPendentesVendedor = ["respondida"];
    
    if (statusPendentesCompras.includes(cotacao.status) && 
        ["compras", "gerente"].includes(userRole)) {
      return true;
    }
    
    if (statusPendentesVendedor.includes(cotacao.status) && 
        cotacao.solicitanteId === userId) {
      return true;
    }
    
    return false;
  };

  // Componente Card para dispositivos móveis
  const CotacaoCard = ({ cotacao }: { cotacao: any }) => {
    const statusInfo = getStatusInfo(cotacao.status);
    const actions = getAvailableActions(cotacao);
    const pendente = isPendente(cotacao);
    
    return (
      <Card className={`border-blue-700 mb-4 ${pendente ? "bg-blue-600/20 border-blue-400/50" : "bg-blue-800/30"}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header do card */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-xs ${cotacao.tipo === "cadastro" ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"}`}>
                    {cotacao.tipo === "cadastro" ? "Cadastro" : "Cotação"}
                  </Badge>
                  {cotacao.tipo === "cotacao" && cotacao.temItensPrecisaCadastro && (
                    <Badge className="bg-orange-900/30 text-orange-300 border-orange-700/50 text-xs">
                      Cadastro
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    {pendente && <Clock className="h-3 w-3 text-blue-300" />}
                    <span className="font-mono font-bold text-white">#{cotacao.numeroSequencial}</span>
                  </div>
                </div>
                
                <Badge className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
              
              {/* Menu de ações */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-blue-800 border-blue-600">
                  {actions.map((action) => (
                    <DropdownMenuItem
                      key={action}
                      onClick={() => handleCardAction(cotacao, action)}
                      className={`text-blue-100 hover:bg-blue-700 ${["cancelar", "excluir"].includes(action) ? "text-red-400 hover:text-red-300" : ""}`}
                    >
                      {getActionIcon(action)}
                      <span className="ml-2">{getActionLabel(action)}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Conteúdo principal */}
            <div className="space-y-2 text-sm">
              {cotacao.tipo === "cadastro" ? (
                <>
                  <div className="text-white font-medium">{cotacao.descricao}</div>
                  {cotacao.marca && (
                    <div className="text-blue-200">
                      <span className="text-blue-300 font-medium">Marca:</span> {cotacao.marca}
                    </div>
                  )}
                  {cotacao.codigoSankhya && (
                    <div className="text-green-300 font-mono text-xs">
                      <span className="text-green-400 font-medium">Sankhya:</span> {cotacao.codigoSankhya}
                    </div>
                  )}
                  {cotacao.anexoNome && (
                    <div className="text-green-300 text-xs">📎 {cotacao.anexoNome}</div>
                  )}
                </>
              ) : (
                <>
                  {cotacao.numeroOS && (
                    <div className="text-blue-200">
                      <span className="text-blue-300 font-medium">OS:</span> {cotacao.numeroOS}
                    </div>
                  )}
                  {cotacao.numeroOrcamento && (
                    <div className="text-blue-200">
                      <span className="text-blue-300 font-medium">Orçamento:</span> {cotacao.numeroOrcamento}
                    </div>
                  )}
                  {cotacao.cliente && (
                    <div className="text-blue-200">
                      <span className="text-blue-300 font-medium">Cliente:</span> {cotacao.cliente}
                    </div>
                  )}
                  {cotacao.totalItens > 0 && (
                    <div className="text-blue-200">
                      <span className="text-blue-300 font-medium">Itens:</span> {cotacao.totalItens}
                    </div>
                  )}
                  {cotacao.valorTotal > 0 && (
                    <div className="text-white font-semibold">
                      <span className="text-blue-300 font-medium">Valor:</span> {formatCurrency(cotacao.valorTotal)}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer com responsáveis e data */}
            <div className="pt-2 border-t border-blue-700/50 space-y-1 text-xs">
              <div className="text-blue-200">
                <span className="text-blue-300 font-medium">Solicitante:</span> {cotacao.solicitante?.name}
              </div>
              {cotacao.comprador && (
                <div className="text-blue-200">
                  <span className="text-blue-300 font-medium">Comprador:</span> {cotacao.comprador.name}
                </div>
              )}
              <div className="text-blue-200">
                <span className="text-blue-300 font-medium">Data:</span> {formatDate(cotacao.createdAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CotacaoRow = ({ cotacao }: { cotacao: any }) => {
    const statusInfo = getStatusInfo(cotacao.status);
    const actions = getAvailableActions(cotacao);
    const pendente = isPendente(cotacao);

    return (
      <TableRow className={`${pendente ? "bg-blue-600/20 border-blue-400/50" : ""} hover:!bg-blue-600/30 transition-colors text-white hover:text-white border-0`}>
        <TableCell className="px-2 sm:px-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge className={`text-xs ${cotacao.tipo === "cadastro" ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"}`}>
              {cotacao.tipo === "cadastro" ? "Cadastro" : "Cotação"}
            </Badge>
            {cotacao.tipo === "cotacao" && cotacao.temItensPrecisaCadastro && (
              <Badge className="bg-orange-900/30 text-orange-300 border-orange-700/50 text-xs">
                Cadastro
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="px-2 sm:px-4">
          <div className="flex items-center gap-2">
            {pendente && <Clock className="h-4 w-4 text-blue-300" />}
            <span className="font-mono font-semibold">
              #{cotacao.numeroSequencial}
            </span>
          </div>
        </TableCell>
        <TableCell className="px-2 sm:px-4">
          <div className="space-y-1">
            {cotacao.tipo === "cadastro" ? (
              <>
                <div className="text-sm font-medium">{cotacao.descricao}</div>
                {cotacao.marca && (
                  <div className="text-sm text-blue-300">Marca: {cotacao.marca}</div>
                )}
                {cotacao.codigoSankhya && (
                  <div className="text-sm text-green-300 font-mono">Sankhya: {cotacao.codigoSankhya}</div>
                )}
                {cotacao.anexoNome && (
                  <div className="text-xs text-green-300">📎 {cotacao.anexoNome}</div>
                )}
              </>
            ) : (
              <>
                {cotacao.numeroOS && (
                  <div className="text-sm">OS: {cotacao.numeroOS}</div>
                )}
                {cotacao.numeroOrcamento && (
                  <div className="text-sm text-gray-400">Orç: {cotacao.numeroOrcamento}</div>
                )}
                {cotacao.cliente && (
                  <div className="text-sm text-blue-300">{cotacao.cliente}</div>
                )}
              </>
            )}
          </div>
        </TableCell>
        <TableCell className="px-2 sm:px-4">
          <Badge className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
        </TableCell>
        <TableCell className="px-2 sm:px-4">
          <div className="space-y-1">
            <div className="text-sm">{cotacao.solicitante?.name}</div>
            {cotacao.comprador && (
              <div className="text-xs text-gray-400">Comprador: {cotacao.comprador.name}</div>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center">
          {cotacao.totalItens}
        </TableCell>
        <TableCell className="text-right">
          {cotacao.valorTotal > 0 ? (
            <span className={`font-semibold ${
              ["respondida", "aprovada_para_compra", "comprada"].includes(cotacao.status) 
                ? "text-white" 
                : "text-blue-600"
            }`}>
              {formatCurrency(cotacao.valorTotal)}
            </span>
          ) : "-"}
        </TableCell>
        <TableCell className="text-sm text-gray-400">
          {formatDate(cotacao.createdAt)}
        </TableCell>
        <TableCell className="px-2 sm:px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action) => (
                <DropdownMenuItem
                  key={action}
                  onClick={() => {
                    if (action === "view") {
                      setSelectedCotacao(cotacao._id);
                    } else if (action === "responder") {
                      if (cotacao.tipo === "cadastro") {
                        setRespondingPendencia(cotacao._id);
                      } else {
                        setRespondingCotacao(cotacao._id);
                      }
                    } else if (action === "aprovar") {
                      setApprovingCotacao(cotacao._id);
                    } else if (action === "comprar") {
                      handleComprar(cotacao);
                    } else if (action === "concluir") {
                      handleConcluir(cotacao);
                    } else if (action === "editar") {
                      setEditingCotacao(cotacao._id);
                    } else if (action === "excluir") {
                      handleExcluir(cotacao);
                    } else {
                      // TODO: Implementar outras ações
                      setSelectedCotacao(cotacao._id);
                    }
                  }}
                  className={["cancelar", "excluir"].includes(action) ? "text-red-400" : ""}
                >
                  {getActionIcon(action)}
                  <span className="ml-2">{getActionLabel(action)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-blue-800/30 border-blue-700">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-gray-300">Carregando cotações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Cotações Pendentes */}
        {cotacoesPendentes.length > 0 && (
          <div className="bg-blue-800/30 border border-blue-700 rounded-lg">
            <div className="p-4 border-b border-blue-700">
              <h3 className="flex items-center gap-2 text-white font-semibold">
                <Clock className="h-5 w-5 text-blue-300" />
                Pendentes ({cotacoesPendentes.length})
              </h3>
            </div>
            
            {/* Layout Desktop - Tabela */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <Table className="w-full min-w-[800px]">
                  <TableHeader>
                    <TableRow className="hover:!bg-transparent">
                      <TableHead className="text-blue-300 w-20 px-2 sm:px-4">Tipo</TableHead>
                      <TableHead className="text-blue-300 w-24 px-2 sm:px-4">Número</TableHead>
                      <TableHead className="text-blue-300 min-w-[200px] px-2 sm:px-4">Identificação</TableHead>
                      <TableHead className="text-blue-300 w-32 px-2 sm:px-4">Status</TableHead>
                      <TableHead className="text-blue-300 min-w-[180px] px-2 sm:px-4">Responsáveis</TableHead>
                      <TableHead className="text-blue-300 text-center w-20 px-2 sm:px-4">Itens</TableHead>
                      <TableHead className="text-blue-300 text-right w-32 px-2 sm:px-4">Valor</TableHead>
                      <TableHead className="text-blue-300 w-28 px-2 sm:px-4">Data</TableHead>
                      <TableHead className="text-blue-300 w-20 px-2 sm:px-4">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cotacoesPendentes.map((cotacao) => (
                      <CotacaoRow key={cotacao._id} cotacao={cotacao} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Layout Mobile - Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {cotacoesPendentes.map((cotacao) => (
                <CotacaoCard key={cotacao._id} cotacao={cotacao} />
              ))}
            </div>
          </div>
        )}

        {/* Histórico */}
        {(filtros.incluirHistorico && cotacoesHistorico.length > 0) && (
          <div className="bg-blue-800/30 border border-blue-700 rounded-lg">
            <div className="p-4 border-b border-blue-700">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-white font-semibold">
                  Histórico ({cotacoesHistorico.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportarHistorico}
                  className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                  title="Exportar histórico para Excel"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Layout Desktop - Tabela */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <Table className="w-full min-w-[800px]">
                  <TableHeader>
                    <TableRow className="hover:!bg-transparent">
                      <TableHead className="text-blue-300 w-20 px-2 sm:px-4">Tipo</TableHead>
                      <TableHead className="text-blue-300 w-24 px-2 sm:px-4">Número</TableHead>
                      <TableHead className="text-blue-300 min-w-[200px] px-2 sm:px-4">Identificação</TableHead>
                      <TableHead className="text-blue-300 w-32 px-2 sm:px-4">Status</TableHead>
                      <TableHead className="text-blue-300 min-w-[180px] px-2 sm:px-4">Responsáveis</TableHead>
                      <TableHead className="text-blue-300 text-center w-20 px-2 sm:px-4">Itens</TableHead>
                      <TableHead className="text-blue-300 text-right w-32 px-2 sm:px-4">Valor</TableHead>
                      <TableHead className="text-blue-300 w-28 px-2 sm:px-4">Data</TableHead>
                      <TableHead className="text-blue-300 w-20 px-2 sm:px-4">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cotacoesHistorico.map((cotacao) => (
                      <CotacaoRow key={cotacao._id} cotacao={cotacao} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Layout Mobile - Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {cotacoesHistorico.map((cotacao) => (
                <CotacaoCard key={cotacao._id} cotacao={cotacao} />
              ))}
            </div>
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {cotacoesPendentes.length === 0 && cotacoesHistorico.length === 0 && (
          <Card className="bg-blue-800/30 border-blue-700">
            <CardContent className="p-8 text-center">
              <p className="text-gray-300">
                {filtros.busca || (filtros.status && filtros.status !== "all") || (filtros.responsavel && filtros.responsavel !== "all")
                  ? "Nenhuma cotação encontrada com os filtros aplicados."
                  : "Nenhuma cotação encontrada."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

              {/* Modal de detalhes */}
        {selectedCotacao && (
          <CotacaoDetailModal
            cotacaoId={selectedCotacao}
            isOpen={!!selectedCotacao}
            onClose={() => setSelectedCotacao(null)}
            userRole={userRole}
            userId={userId}
          />
        )}

      {/* Modal de resposta */}
      {respondingCotacao && (
        <CotacaoResponseModal
          cotacaoId={respondingCotacao}
          isOpen={!!respondingCotacao}
          onClose={() => setRespondingCotacao(null)}
          userRole={userRole}
          userId={userId}
        />
      )}

      {/* Modal de resposta Sankhya para pendências de cadastro */}
      {respondingPendencia && (
        <SankhyaResponseModal
          pendenciaId={respondingPendencia}
          isOpen={!!respondingPendencia}
          onClose={() => setRespondingPendencia(null)}
          userId={userId}
          pendenciaData={(() => {
            const pendencia = cotacoes?.find(c => c._id === respondingPendencia && c.tipo === "cadastro");
            if (!pendencia || pendencia.tipo !== "cadastro") return undefined;
            return {
              numeroSequencial: pendencia.numeroSequencial,
              codigo: pendencia.codigo,
              descricao: pendencia.descricao,
              marca: pendencia.marca,
              solicitante: pendencia.solicitante ? { name: pendencia.solicitante.name } : undefined
            };
          })()}
        />
      )}

      {/* Modal de aprovação para cotações respondidas */}
      {approvingCotacao && (
        <CotacaoApprovalModal
          cotacaoId={approvingCotacao}
          isOpen={!!approvingCotacao}
          onClose={() => setApprovingCotacao(null)}
          userRole={userRole}
          userId={userId}
        />
      )}

      {/* Modal de edição para cotações */}
      {editingCotacao && (
        <CotacaoEditModal
          cotacaoId={editingCotacao}
          isOpen={!!editingCotacao}
          onClose={() => setEditingCotacao(null)}
          userRole={userRole}
          userId={userId}
          onSave={() => {
            // Aguarda um pouco para o Convex invalidar as queries
            setTimeout(() => {
              setEditingCotacao(null);
            }, 500);
          }}
        />
      )}
    </>
  );
} 