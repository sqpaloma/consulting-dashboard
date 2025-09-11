"use client";

import React, { useState } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Package, Search, Filter, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCotacoes } from "@/hooks/use-cotacoes";
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

  const { migrarPendencias } = useCotacoes();

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
      <div className="space-y-4 sm:space-y-6">
        {/* Header personalizado com actions */}
        <div className="flex flex-col gap-4">
          {/* Botões de ação */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {/* Botão para cadastrar peça */}
            <Button
              onClick={() => setShowCadastroForm(true)}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 font-semibold w-full sm:w-auto"
            >
              <Package className="h-4 w-4 mr-2" />
              Cadastro de Peça
            </Button>
            
            {/* Botão para criar nova cotação */}
            {podecriarCotacao && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 font-semibold w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Cotação
              </Button>
            )}
          </div>
        </div>

        {/* Busca e filtros simplificados */}
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
          <div className="space-y-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cotações..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="pl-10 bg-white border-blue-300 text-gray-900 placeholder-gray-500"
              />
            </div>
            
            {/* Botões de filtro */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-blue-600 text-blue-900 hover:bg-blue-50 w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
              </Button>
              
              {(filtros.status !== "all" || filtros.incluirHistorico || (filtros.responsavel && filtros.responsavel !== "all") || filtros.dataInicio || filtros.dataFim) && (
                <Button
                  variant="outline"
                  onClick={() => setFiltros(prev => ({
                    ...prev,
                    status: "all",
                    incluirHistorico: false,
                    responsavel: "all",
                    dataInicio: undefined,
                    dataFim: undefined,
                  }))}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros Expandidos - Layout Mobile-First */}
        {showFilters && (
          <div className="bg-blue-800/30 rounded-lg p-3 sm:p-4 border border-blue-700">
            <div className="space-y-4">
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
                  <option value="aprovada_para_compra">Aprovada para Compra</option>
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

              {/* Datas em grid mobile-friendly */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="flex items-start space-x-3 bg-blue-900/30 p-3 rounded-md">
                <input
                  type="checkbox"
                  id="incluir-historico"
                  checked={filtros.incluirHistorico}
                  onChange={(e) => setFiltros(prev => ({ ...prev, incluirHistorico: e.target.checked }))}
                  className="rounded border-blue-600 bg-blue-900/50 text-blue-600 focus:ring-blue-500 mt-1"
                />
                <label htmlFor="incluir-historico" className="text-blue-200 text-sm leading-relaxed">
                  Incluir cotações finalizadas (Compradas/Canceladas)
                </label>
              </div>
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