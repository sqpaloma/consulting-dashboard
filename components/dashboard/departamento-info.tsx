"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User, Users, TrendingUp } from "lucide-react";
import {
  DEPARTAMENTOS,
  RESPONSAVEIS,
  getDepartamentoByResponsavel,
  getResponsavelInfo,
} from "./types";

interface DepartamentoInfoProps {
  processedItems: any[];
  filteredByResponsavel?: string | null;
  className?: string;
}

export function DepartamentoInfo({
  processedItems,
  filteredByResponsavel,
  className,
}: DepartamentoInfoProps) {
  const getDepartamentoStats = () => {
    if (filteredByResponsavel) {
      const responsavelInfo = getResponsavelInfo(filteredByResponsavel);
      const departamento = getDepartamentoByResponsavel(filteredByResponsavel);

      if (!responsavelInfo) return null as any;

      const itensDoResponsavel = processedItems.filter(
        (item) =>
          item.responsavel?.toLowerCase() ===
          filteredByResponsavel.toLowerCase()
      );

      return {
        responsavel: responsavelInfo,
        departamento,
        totalItens: itensDoResponsavel.length,
        itensCompletos: itensDoResponsavel.filter((item) => {
          const status = item.status?.toLowerCase() || "";
          return (
            status.includes("pronto") ||
            status.includes("concluído") ||
            status.includes("concluido") ||
            status.includes("finalizado") ||
            status.includes("entregue") ||
            status.includes("completo")
          );
        }).length,
      } as any;
    }

    // Estatísticas gerais por departamento
    const statsPorDepartamento = DEPARTAMENTOS.map((dep) => {
      const itensDoDepto = processedItems.filter((item) => {
        const itemResponsavel = item.responsavel?.toLowerCase() || "";
        return itemResponsavel === dep.responsavel.toLowerCase();
      });

      const itensCompletos = itensDoDepto.filter((item) => {
        const status = item.status?.toLowerCase() || "";
        return (
          status.includes("pronto") ||
          status.includes("concluído") ||
          status.includes("concluido") ||
          status.includes("finalizado") ||
          status.includes("entregue") ||
          status.includes("completo")
        );
      });

      return {
        ...dep,
        totalItens: itensDoDepto.length,
        itensCompletos: itensCompletos.length,
      };
    });

    return { statsPorDepartamento } as any;
  };

  const stats: any = getDepartamentoStats();

  if (!stats) return null;

  if ("responsavel" in stats) {
    // Visão individual do responsável
    const {
      responsavel,
      departamento,
      totalItens = 0,
      itensCompletos = 0,
    } = stats as {
      responsavel: any;
      departamento: any;
      totalItens?: number;
      itensCompletos?: number;
    };

    return (
      <Card
        className={`bg-white border-gray-200 text-gray-900 flex flex-col h-full ${className || ""}`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {responsavel.isGerente ? (
              <Building className="h-5 w-5 text-amber-400" />
            ) : (
              <User className="h-5 w-5 text-blue-400" />
            )}
            {responsavel.nome}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {responsavel.isGerente ? "Posição" : "Departamento"}:
            </p>
            <p className="font-medium text-gray-900">
              {responsavel.isGerente
                ? "Gerente Geral"
                : departamento?.nome || responsavel.departamento}
            </p>
          </div>

          {departamento && !responsavel.isGerente && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Descrição:</p>
              <p className="text-sm text-gray-700">{departamento.descricao}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 pt-2 border-t border-gray-200">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{totalItens}</p>
              <p className="text-xs text-gray-600">Total de Itens</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Visão geral dos departamentos
  return (
    <Card
      className={`bg-white border-gray-200 text-gray-900 flex flex-col h-full ${className || ""}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5 text-amber-400" />
          Departamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          {stats.statsPorDepartamento
            .filter((dep: any) => dep.totalItens > 0)
            .sort((a: any, b: any) => b.totalItens - a.totalItens)
            .map((dep: any, index: number) => (
              <div
                key={dep.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {dep.responsavel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{dep.nome}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900">
                        {dep.totalItens}
                      </p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
