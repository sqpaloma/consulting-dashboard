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
} from "lucide-react";
import { useBuscaCotacoes, useCotacoes } from "@/hooks/use-cotacoes";
import { getStatusInfo, podeExecutarAcao } from "@/hooks/use-cotacoes";
// import { CotacaoDetailModal } from "./cotacao-detail-modal";
import { CotacaoResponseModal } from "./cotacao-response-modal";
import { Id } from "@/convex/_generated/dataModel";

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

  const { excluirCotacao, excluirPendencia } = useCotacoes();

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
      case "cotar": return <MessageSquare className="h-4 w-4" />;
      case "responder": return <MessageSquare className="h-4 w-4" />;
      case "aprovar": return <CheckCircle className="h-4 w-4" />;
      case "comprar": return <ShoppingCart className="h-4 w-4" />;
      case "cancelar": return <XCircle className="h-4 w-4" />;
      case "editar": return <Edit className="h-4 w-4" />;
      case "excluir": return <Trash2 className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "cotar": return "Cotar";
      case "responder": return "Responder";
      case "aprovar": return "Aprovar";
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
      // Administradores sempre podem excluir
      // Solicitante pode excluir suas próprias solicitações
      // Equipe de compras pode excluir qualquer solicitação
      if (userRole === "admin" || isSolicitante || ["compras", "gerente"].includes(userRole)) {
        actions.push("excluir");
      }
      return actions;
    }

    // Para cotações, lógica original
    if (podeExecutarAcao(cotacao.status, "assumir", userRole, isSolicitante, isComprador)) {
      actions.push("cotar");
    }
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
    // Se é cadastro, verificar status de cadastro
    if (cotacao.tipo === "cadastro") {
      const statusPendentesCadastro = ["pendente", "em_andamento"];
      return statusPendentesCadastro.includes(cotacao.status) && 
             ["admin", "compras", "gerente"].includes(userRole);
    }
    
    // Se é cotação, usar lógica original
    const statusPendentesCompras = ["novo", "em_cotacao", "aprovada_para_compra"];
    const statusPendentesVendedor = ["respondida"];
    
    if (statusPendentesCompras.includes(cotacao.status) && 
        ["admin", "compras", "gerente"].includes(userRole)) {
      return true;
    }
    
    if (statusPendentesVendedor.includes(cotacao.status) && 
        cotacao.solicitanteId === userId) {
      return true;
    }
    
    return false;
  };

  const CotacaoRow = ({ cotacao }: { cotacao: any }) => {
    const statusInfo = getStatusInfo(cotacao.status);
    const actions = getAvailableActions(cotacao);
    const pendente = isPendente(cotacao);

    return (
      <TableRow className={`${pendente ? "bg-blue-600/20 border-blue-400/50" : ""} hover:!bg-blue-600/30 transition-colors text-white hover:text-white`}>
        <TableCell>
          <Badge className={cotacao.tipo === "cadastro" ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"}>
            {cotacao.tipo === "cadastro" ? "Cadastro" : "Cotação"}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {pendente && <Clock className="h-4 w-4 text-blue-300" />}
            <span className="font-mono font-semibold">
              #{cotacao.numeroSequencial}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            {cotacao.tipo === "cadastro" ? (
              <>
                <div className="text-sm font-medium">{cotacao.descricao}</div>
                {cotacao.marca && (
                  <div className="text-sm text-blue-300">Marca: {cotacao.marca}</div>
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
        <TableCell>
          <Badge className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
        </TableCell>
        <TableCell>
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
        <TableCell>
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
                    } else if (action === "cotar") {
                      setRespondingCotacao(cotacao._id);
                    } else if (action === "responder") {
                      setRespondingCotacao(cotacao._id);
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
          <Card className="bg-blue-800/30 border-blue-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-blue-300" />
                Pendentes ({cotacoesPendentes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="hover:!bg-transparent">
                      <TableHead className="text-blue-300 w-20">Tipo</TableHead>
                      <TableHead className="text-blue-300 w-24">Número</TableHead>
                      <TableHead className="text-blue-300 min-w-[200px]">Identificação</TableHead>
                      <TableHead className="text-blue-300 w-32">Status</TableHead>
                      <TableHead className="text-blue-300 min-w-[180px]">Responsáveis</TableHead>
                      <TableHead className="text-blue-300 text-center w-20">Itens</TableHead>
                      <TableHead className="text-blue-300 text-right w-32">Valor</TableHead>
                      <TableHead className="text-blue-300 w-28">Data</TableHead>
                      <TableHead className="text-blue-300 w-20">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cotacoesPendentes.map((cotacao) => (
                      <CotacaoRow key={cotacao._id} cotacao={cotacao} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico */}
        {(filtros.incluirHistorico && cotacoesHistorico.length > 0) && (
          <Card className="bg-blue-800/30 border-blue-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                Histórico ({cotacoesHistorico.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="hover:!bg-transparent">
                      <TableHead className="text-blue-300 w-20">Tipo</TableHead>
                      <TableHead className="text-blue-300 w-24">Número</TableHead>
                      <TableHead className="text-blue-300 min-w-[200px]">Identificação</TableHead>
                      <TableHead className="text-blue-300 w-32">Status</TableHead>
                      <TableHead className="text-blue-300 min-w-[180px]">Responsáveis</TableHead>
                      <TableHead className="text-blue-300 text-center w-20">Itens</TableHead>
                      <TableHead className="text-blue-300 text-right w-32">Valor</TableHead>
                      <TableHead className="text-blue-300 w-28">Data</TableHead>
                      <TableHead className="text-blue-300 w-20">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cotacoesHistorico.map((cotacao) => (
                      <CotacaoRow key={cotacao._id} cotacao={cotacao} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
        {/* {selectedCotacao && (
          <CotacaoDetailModal
            cotacaoId={selectedCotacao}
            isOpen={!!selectedCotacao}
            onClose={() => setSelectedCotacao(null)}
            userRole={userRole}
            userId={userId}
          />
        )} */}

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
    </>
  );
} 