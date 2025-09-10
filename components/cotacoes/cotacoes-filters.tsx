"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Calendar } from "lucide-react";
import { statusCotacao } from "@/hooks/use-cotacoes";

interface FiltrosState {
  busca: string;
  status: string;
  incluirHistorico: boolean;
  responsavel: string;
  dataInicio?: number;
  dataFim?: number;
}

interface CotacoesFiltersProps {
  filtros: FiltrosState;
  onFiltrosChange: (filtros: FiltrosState) => void;
  isCompras: boolean;
}

export function CotacoesFilters({
  filtros,
  onFiltrosChange,
  isCompras,
}: CotacoesFiltersProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const updateFiltro = (key: keyof FiltrosState, value: any) => {
    onFiltrosChange({
      ...filtros,
      [key]: value,
    });
  };

  const clearFiltros = () => {
    onFiltrosChange({
      busca: "",
      status: "all",
      incluirHistorico: false,
      responsavel: "all",
      dataInicio: undefined,
      dataFim: undefined,
    });
    setShowAdvanced(false);
  };

  const hasActiveFilters = 
    filtros.busca || 
    (filtros.status && filtros.status !== "all") || 
    filtros.incluirHistorico || 
    (filtros.responsavel && filtros.responsavel !== "all") ||
    filtros.dataInicio ||
    filtros.dataFim;

  return (
    <Card className="bg-blue-800/30 border-blue-700">
      <CardContent className="p-4">
        {/* Linha principal de filtros */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="border-blue-600 text-blue-300 hover:bg-blue-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avançados
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFiltros}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Filtros avançados */}
        {showAdvanced && (
          <div className="border-t border-blue-600 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-blue-300">Status</Label>
                <Select
                  value={filtros.status}
                  onValueChange={(value) => updateFiltro("status", value)}
                >
                  <SelectTrigger className="bg-blue-900/50 border-blue-600 text-white">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {Object.entries(statusCotacao).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Responsável - apenas para equipe de compras */}
              {isCompras && (
                <div className="space-y-2">
                  <Label className="text-blue-300">Responsável</Label>
                  <Select
                    value={filtros.responsavel}
                    onValueChange={(value) => updateFiltro("responsavel", value)}
                  >
                    <SelectTrigger className="bg-blue-900/50 border-blue-600 text-white">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="solicitante">Minhas solicitações</SelectItem>
                      <SelectItem value="comprador">Minhas compras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Data início */}
              <div className="space-y-2">
                <Label className="text-blue-300">Data início</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={filtros.dataInicio ? new Date(filtros.dataInicio).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
                      updateFiltro("dataInicio", date);
                    }}
                    className="pl-10 bg-blue-900/50 border-blue-600 text-white"
                  />
                </div>
              </div>

              {/* Data fim */}
              <div className="space-y-2">
                <Label className="text-blue-300">Data fim</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={filtros.dataFim ? new Date(filtros.dataFim).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
                      updateFiltro("dataFim", date);
                    }}
                    className="pl-10 bg-blue-900/50 border-blue-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Switch para incluir histórico */}
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="incluir-historico"
                checked={filtros.incluirHistorico}
                onCheckedChange={(checked) => updateFiltro("incluirHistorico", checked)}
              />
              <Label htmlFor="incluir-historico" className="text-blue-300">
                Incluir cotações finalizadas (Compradas/Canceladas)
              </Label>
            </div>
          </div>
        )}

        {/* Resumo dos filtros ativos */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-blue-600">
            <div className="flex flex-wrap gap-2">
              {filtros.busca && (
                <span className="bg-white text-blue-900 px-2 py-1 rounded text-sm font-medium">
                  Busca: "{filtros.busca}"
                </span>
              )}
              {filtros.status && filtros.status !== "all" && (
                <span className="bg-white text-blue-900 px-2 py-1 rounded text-sm font-medium">
                  Status: {statusCotacao[filtros.status as keyof typeof statusCotacao]?.label || filtros.status}
                </span>
              )}
              {filtros.incluirHistorico && (
                <span className="bg-white text-blue-900 px-2 py-1 rounded text-sm font-medium">
                  Incluindo histórico
                </span>
              )}
              {filtros.responsavel && filtros.responsavel !== "all" && (
                <span className="bg-white text-blue-900 px-2 py-1 rounded text-sm font-medium">
                  Responsável: {filtros.responsavel === "solicitante" ? "Minhas solicitações" : "Minhas compras"}
                </span>
              )}
              {filtros.dataInicio && (
                <span className="bg-white text-blue-900 px-2 py-1 rounded text-sm font-medium">
                  A partir de: {new Date(filtros.dataInicio).toLocaleDateString()}
                </span>
              )}
              {filtros.dataFim && (
                <span className="bg-white text-blue-900 px-2 py-1 rounded text-sm font-medium">
                  Até: {new Date(filtros.dataFim).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 