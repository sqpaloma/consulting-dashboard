"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, X, Building } from "lucide-react";
import {
  useUniqueResponsaveis,
  useDashboardData,
} from "@/lib/convex-dashboard-client";
import { RESPONSAVEIS, getDepartamentoByResponsavel } from "./types";

interface ResponsavelFilterProps {
  onFilterChange: (responsavel: string | null) => void;
  processedItems: any[];
}

export function ResponsavelFilter({
  onFilterChange,
  processedItems,
}: ResponsavelFilterProps) {
  const uniqueResponsaveisData = useUniqueResponsaveis();
  const dashboardData = useDashboardData();
  
  const [responsaveis, setResponsaveis] = useState<string[]>([]);
  const [selectedResponsavel, setSelectedResponsavel] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadResponsaveis();
  }, [processedItems, uniqueResponsaveisData]);

  const loadResponsaveis = async () => {
    try {
      setIsLoading(true);

      const responsaveisFromDB = uniqueResponsaveisData || [];

      if (responsaveisFromDB.length > 0) {
        // Combinar dados do banco com dados dos tipos para ter informações completas
        const responsaveisCompletos = responsaveisFromDB
          .filter(nome => nome && nome.trim() !== "" && nome !== "Não informado")
          .map(nome => {
            const info = RESPONSAVEIS.find(r => r.nome.toLowerCase() === nome.toLowerCase());
            return info ? nome : nome;
          })
          .sort((a, b) => {
            // Colocar o gerente (Giovanni) primeiro
            if (a.toLowerCase() === 'giovanni') return -1;
            if (b.toLowerCase() === 'giovanni') return 1;
            return a.localeCompare(b);
          });
        setResponsaveis(responsaveisCompletos);
        return;
      }

      const localResponsaveis = Array.from(
        new Set(
          processedItems
            .map((item) => item.responsavel)
            .filter(
              (responsavel) =>
                responsavel &&
                responsavel.trim() !== "" &&
                responsavel !== "Não informado"
            )
        )
      ).sort((a, b) => {
        // Colocar o gerente (Giovanni) primeiro
        if (a.toLowerCase() === 'giovanni') return -1;
        if (b.toLowerCase() === 'giovanni') return 1;
        return a.localeCompare(b);
      });
      setResponsaveis(localResponsaveis);
    } catch (error) {
      const localResponsaveis = Array.from(
        new Set(
          processedItems
            .map((item) => item.responsavel)
            .filter(
              (responsavel) =>
                responsavel &&
                responsavel.trim() !== "" &&
                responsavel !== "Não informado"
            )
        )
      ).sort((a, b) => {
        // Colocar o gerente (Giovanni) primeiro
        if (a.toLowerCase() === 'giovanni') return -1;
        if (b.toLowerCase() === 'giovanni') return 1;
        return a.localeCompare(b);
      });
      setResponsaveis(localResponsaveis);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByResponsavel = async (responsavel: string) => {
    try {
      setIsLoading(true);
      setSelectedResponsavel(responsavel);
      onFilterChange(responsavel);
    } catch (error) {
      // Silently handle error
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilter = () => {
    setSelectedResponsavel(null);
    onFilterChange(null);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedResponsavel || ""}
        onValueChange={handleFilterByResponsavel}
        disabled={isLoading}
      >
        <SelectTrigger className="w-64 h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/70 hover:bg-white/20 transition-colors">
          <User className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filtrar por..." />
        </SelectTrigger>
        <SelectContent className="max-h-48 overflow-y-auto">
          {responsaveis.map((responsavel) => {
            const responsavelInfo = RESPONSAVEIS.find(r => r.nome.toLowerCase() === responsavel.toLowerCase());
            const departamento = getDepartamentoByResponsavel(responsavel);
            
            return (
              <SelectItem key={responsavel} value={responsavel}>
                <div className="flex items-center space-x-2">
                  {responsavelInfo?.isGerente ? (
                    <Building className="h-4 w-4 text-amber-600" />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{responsavel}</span>
                    {responsavelInfo && (
                      <span className="text-xs text-gray-500">
                        {responsavelInfo.isGerente ? 'Gerente' : departamento?.nome || responsavelInfo.departamento}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selectedResponsavel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilter}
          className="h-8 px-2 text-white/70 hover:text-white hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
