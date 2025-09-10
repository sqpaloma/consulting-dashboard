"use client";

import React, { useState } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { CotacoesFilters } from "@/components/cotacoes/cotacoes-filters";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Package } from "lucide-react";
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

        {/* Informações sobre o fluxo */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
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

        {/* Filtros */}
        <CotacoesFilters
          filtros={filtros}
          onFiltrosChange={setFiltros}
          isCompras={isCompras}
        />

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