"use client";

import React, { useState } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Package, Search, Filter, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCotacoesPendentes } from "@/hooks/use-cotacoes";
import { Badge } from "@/components/ui/badge";
import { CotacoesTable } from "@/components/cotacoes/cotacoes-table";
import { CotacaoForm } from "@/components/cotacoes/cotacao-form";
import { CadastroPecaForm } from "@/components/cotacoes/cadastro-peca-form";

export default function CotacoesPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showCadastroForm, setShowCadastroForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState<{
    busca: string;
    status: string;
    incluirHistorico: boolean;
    responsavel: string;
    dataInicio?: number;
    dataFim?: number;
  }>({
    busca: "",
    status: "all",
    incluirHistorico: false,
    responsavel: "all",
    dataInicio: undefined,
    dataFim: undefined,
  });

  // Buscar cotações pendentes para o usuário atual
  const { totalPendentes } = useCotacoesPendentes(user?.userId);

  // Verificar se o usuário pode criar cotações (vendedores)
  const podecriarCotacao = ["consultor", "vendedor", "admin", "gerente"].includes(
    user?.role || ""
  );

  // Verificar se é da equipe de compras
  const isCompras = ["admin", "compras", "gerente"].includes(user?.role || "");

  // Restringir acesso apenas para administradores
  if (!user || user.role !== "admin") {
    return (
      <ResponsiveLayout
        title="Acesso Restrito"
        subtitle=""
        fullWidth={true}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Acesso Negado
            </h2>
            <p className="text-gray-600 mb-6">
              Esta página está disponível apenas para administradores.
            </p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout
      title="Cotação de Peças"
      subtitle=""
      fullWidth={true}
    >
      <div className="space-y-6">
        {/* Header personalizado com actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Badge de pendências */}
            {totalPendentes > 0 && (
              <Badge className="bg-blue-100 text-blue-900 text-sm font-semibold">
                {totalPendentes} pendente{totalPendentes > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Botão para cadastrar peça */}
            <Button
              onClick={() => setShowCadastroForm(true)}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 font-semibold"
            >
              <Package className="h-4 w-4 mr-2" />
              Cadastro
            </Button>
            
            {/* Botão para criar nova cotação */}
            {podecriarCotacao && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Cotação
              </Button>
            )}
          </div>
        </div>

        {/* Informações sobre o fluxo e busca */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-blue-900">Fluxo de Negócio:</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-blue-600 text-white px-2 py-1 rounded font-medium">1. Novo</span>
                <span className="text-blue-600">→</span>
                <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded font-medium">2. Em Cotação</span>
                <span className="text-blue-600">→</span>
                <span className="bg-blue-600 text-white px-2 py-1 rounded font-medium">3. Respondida</span>
                <span className="text-blue-600">→</span>
                <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded font-medium">4. Aprovada</span>
                <span className="text-blue-600">→</span>
                <span className="bg-blue-600 text-white px-2 py-1 rounded font-medium">5. Comprada</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cotações..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                  className="pl-10 bg-white border-blue-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-blue-600 text-blue-900 hover:bg-blue-50 whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              
              {(filtros.status !== "all" || filtros.incluirHistorico || (filtros.responsavel && filtros.responsavel !== "all") || filtros.dataInicio || filtros.dataFim) && (
                <Button
                  variant="ghost"
                  onClick={() => setFiltros(prev => ({
                    ...prev,
                    status: "all",
                    incluirHistorico: false,
                    responsavel: "all",
                    dataInicio: undefined,
                    dataFim: undefined,
                  }))}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros Expandidos */}
        {showFilters && (
          <div className="bg-blue-800/30 rounded-lg p-4 border border-blue-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-blue-300 text-sm font-medium">Status</label>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-blue-900/50 border-blue-600 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Todos os status</option>
                  <option value="novo">Novo</option>
                  <option value="em_cotacao">Em Cotação</option>
                  <option value="respondida">Respondida</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="comprada">Comprada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* Responsável - apenas para equipe de compras */}
              {isCompras && (
                <div className="space-y-2">
                  <label className="text-blue-300 text-sm font-medium">Responsável</label>
                  <select
                    value={filtros.responsavel}
                    onChange={(e) => setFiltros(prev => ({ ...prev, responsavel: e.target.value }))}
                    className="w-full bg-blue-900/50 border-blue-600 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="solicitante">Minhas solicitações</option>
                    <option value="comprador">Minhas compras</option>
                  </select>
                </div>
              )}

              {/* Data início */}
              <div className="space-y-2">
                <label className="text-blue-300 text-sm font-medium">Data início</label>
                <input
                  type="date"
                  value={filtros.dataInicio ? new Date(filtros.dataInicio).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
                    setFiltros(prev => ({ ...prev, dataInicio: date }));
                  }}
                  className="w-full bg-blue-900/50 border-blue-600 text-white rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Data fim */}
              <div className="space-y-2">
                <label className="text-blue-300 text-sm font-medium">Data fim</label>
                <input
                  type="date"
                  value={filtros.dataFim ? new Date(filtros.dataFim).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
                    setFiltros(prev => ({ ...prev, dataFim: date }));
                  }}
                  className="w-full bg-blue-900/50 border-blue-600 text-white rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Switch para incluir histórico */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="incluir-historico"
                checked={filtros.incluirHistorico}
                onChange={(e) => setFiltros(prev => ({ ...prev, incluirHistorico: e.target.checked }))}
                className="rounded border-blue-600 bg-blue-900/50 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="incluir-historico" className="text-blue-300 text-sm">
                Incluir cotações finalizadas (Compradas/Canceladas)
              </label>
            </div>
          </div>
        )}

        {/* Tabela de Cotações */}
        <CotacoesTable
          filtros={filtros}
          userRole={user?.role || ""}
          userId={user?.userId}
        />

        {/* Modal de Nova Cotação */}
        {showForm && (
          <CotacaoForm
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            solicitanteId={user?.userId}
          />
        )}

        {/* Modal de Cadastro de Peça */}
        {showCadastroForm && (
          <CadastroPecaForm
            isOpen={showCadastroForm}
            onClose={() => setShowCadastroForm(false)}
          />
        )}
      </div>
    </ResponsiveLayout>
  );
} 