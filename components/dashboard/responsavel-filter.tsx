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
import { User, X } from "lucide-react";
import {
  getUniqueResponsaveis,
  getDashboardItemsByResponsavel,
} from "@/lib/dashboard-supabase-client";

interface ResponsavelFilterProps {
  onFilterChange: (responsavel: string | null) => void;
  processedItems: any[];
}

export function ResponsavelFilter({
  onFilterChange,
  processedItems,
}: ResponsavelFilterProps) {
  const [responsaveis, setResponsaveis] = useState<string[]>([]);
  const [selectedResponsavel, setSelectedResponsavel] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadResponsaveis();
  }, [processedItems]);

  const loadResponsaveis = async () => {
    try {
      setIsLoading(true);

      const responsaveisFromDB = await getUniqueResponsaveis();

      if (responsaveisFromDB.length > 0) {
        setResponsaveis(responsaveisFromDB);
      } else {
        // Fallback para itens locais se não houver dados no banco
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
        );
        setResponsaveis(localResponsaveis);
      }
    } catch (error) {
      console.error("Erro ao carregar responsáveis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterByResponsavel = async (responsavel: string) => {
    try {
      setIsLoading(true);
      setSelectedResponsavel(responsavel);

      // Tentar carregar dados do banco primeiro
      const itemsFromDB = await getDashboardItemsByResponsavel(responsavel);

      if (itemsFromDB.length > 0) {
        const formattedItems = itemsFromDB.map((item) => ({
          id: item.os,
          os: item.os,
          titulo: item.titulo || `Item ${item.os}`,
          cliente: item.cliente || "Cliente não informado",
          responsavel: item.responsavel,
          status: item.status,
          data: item.data_registro || new Date().toLocaleDateString("pt-BR"),
          rawData: item.raw_data,
        }));
        onFilterChange(responsavel);
      } else {
        // Fallback para filtrar itens locais
        const filteredItems = processedItems.filter((item) => {
          return item.responsavel && item.responsavel.trim() === responsavel;
        });
        onFilterChange(responsavel);
      }
    } catch (error) {
      console.error("Erro ao filtrar por responsável:", error);
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
        <SelectTrigger className="w-48 h-8 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/70 hover:bg-white/20 transition-colors">
          <User className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filtrar por responsável" />
        </SelectTrigger>
        <SelectContent>
          {responsaveis.map((responsavel) => (
            <SelectItem key={responsavel} value={responsavel}>
              {responsavel}
            </SelectItem>
          ))}
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
