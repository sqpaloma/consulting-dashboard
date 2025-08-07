"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User, Users, TrendingUp } from "lucide-react";
import { DEPARTAMENTOS, RESPONSAVEIS, getDepartamentoByResponsavel, getResponsavelInfo } from "./types";

interface DepartamentoInfoProps {
  processedItems: any[];
  filteredByResponsavel?: string | null;
}

export function DepartamentoInfo({ processedItems, filteredByResponsavel }: DepartamentoInfoProps) {
  const getDepartamentoStats = () => {
    if (filteredByResponsavel) {
      const responsavelInfo = getResponsavelInfo(filteredByResponsavel);
      const departamento = getDepartamentoByResponsavel(filteredByResponsavel);
      
      if (!responsavelInfo) return null;

      const itensDoResponsavel = processedItems.filter(item => 
        item.responsavel?.toLowerCase() === filteredByResponsavel.toLowerCase()
      );

      return {
        responsavel: responsavelInfo,
        departamento,
        totalItens: itensDoResponsavel.length,
        itensCompletos: itensDoResponsavel.filter(item => {
          const status = item.status?.toLowerCase() || '';
          return status.includes('pronto') || status.includes('concluído') || 
                 status.includes('concluido') || status.includes('finalizado') || 
                 status.includes('entregue') || status.includes('completo');
        }).length
      };
    }

    // Estatísticas gerais por departamento
    const statsPorDepartamento = DEPARTAMENTOS.map(dep => {
      const itensDoDepto = processedItems.filter(item => {
        const itemResponsavel = item.responsavel?.toLowerCase() || '';
        return itemResponsavel === dep.responsavel.toLowerCase();
      });

      const itensCompletos = itensDoDepto.filter(item => {
        const status = item.status?.toLowerCase() || '';
        return status.includes('pronto') || status.includes('concluído') || 
               status.includes('concluido') || status.includes('finalizado') || 
               status.includes('entregue') || status.includes('completo');
      });

      return {
        ...dep,
        totalItens: itensDoDepto.length,
        itensCompletos: itensCompletos.length,
        percentualConclusao: itensDoDepto.length > 0 ? (itensCompletos.length / itensDoDepto.length) * 100 : 0
      };
    });

    return { statsPorDepartamento };
  };

  const stats = getDepartamentoStats();

  if (!stats) return null;

  if ('responsavel' in stats) {
    // Visão individual do responsável
    const { responsavel, departamento, totalItens, itensCompletos } = stats;
    const percentualConclusao = totalItens > 0 ? (itensCompletos / totalItens) * 100 : 0;

    return (
      <Card className="bg-white/10 border-white/20 text-white">
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
            <p className="text-sm text-white/70 mb-1">
              {responsavel.isGerente ? 'Posição' : 'Departamento'}:
            </p>
            <p className="font-medium text-white">
              {responsavel.isGerente ? 'Gerente Geral' : (departamento?.nome || responsavel.departamento)}
            </p>
          </div>
          
          {departamento && !responsavel.isGerente && (
            <div>
              <p className="text-sm text-white/70 mb-1">Descrição:</p>
              <p className="text-sm text-white/90">{departamento.descricao}</p>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{totalItens}</p>
              <p className="text-xs text-white/70">Total de Itens</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">{itensCompletos}</p>
              <p className="text-xs text-white/70">Completos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">{percentualConclusao.toFixed(1)}%</p>
              <p className="text-xs text-white/70">Conclusão</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Visão geral dos departamentos
  return (
    <Card className="bg-white/10 border-white/20 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5 text-amber-400" />
          Departamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.statsPorDepartamento
            .filter(dep => dep.totalItens > 0)
            .sort((a, b) => b.totalItens - a.totalItens)
            .map((dep, index) => (
              <div key={dep.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="font-medium text-white">{dep.responsavel}</span>
                  </div>
                  <p className="text-xs text-white/70">{dep.nome}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{dep.totalItens}</p>
                      <p className="text-xs text-white/60">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-green-400">{dep.itensCompletos}</p>
                      <p className="text-xs text-white/60">OK</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-blue-400">{dep.percentualConclusao.toFixed(0)}%</p>
                      <p className="text-xs text-white/60">Meta</p>
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