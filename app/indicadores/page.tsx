"use client";

import { ResponsiveLayout } from "@/components/responsive-layout";
import { AdminProtection } from "@/components/admin-protection";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileSpreadsheet,
  Filter,
  Download,
  Trash2,
  Loader2,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SetorCharts } from "@/components/dashboard/setor-charts";
import { EfficiencyCharts } from "@/components/dashboard/efficiency-charts";
import { ApontamentosCharts } from "@/components/dashboard/apontamentos-charts";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

// Interfaces duplicadas removidas
interface UploadData {
  desmontagens: File | null;
  montagens: File | null;
  testesAprovados: File | null;
  testesReprovados: File | null;
}

interface FilterData {
  executante: string;
  setor: string;
  orcamento: string;
}

interface ProcessedData {
  montagens: any[];
  desmontagens: any[];
  testes: any[];
  apontamentos: any[];
}

interface PersistedData {
  processedData: ProcessedData;
  filters: FilterData;
  uploadedAt: string;
  filesInfo: {
    [key in keyof UploadData]: {
      name: string;
      size: number;
      lastModified: number;
    } | null;
  };
}

export function ProductionDashboard() {
  // Hooks do Convex
  const indicadoresSession = useQuery(api.indicadores.getIndicadoresSession);
  const indicadoresData = useQuery(
    api.indicadores.getIndicadoresData,
    indicadoresSession?.sessionId
      ? { sessionId: indicadoresSession.sessionId }
      : "skip"
  );
  const saveIndicadores = useMutation(api.indicadores.saveIndicadores);
  const clearIndicadores = useMutation(api.indicadores.clearIndicadores);

  // Hook para obter usuário atual
  const { user } = useCurrentUser();
  const [uploadData, setUploadData] = useState<UploadData>({
    desmontagens: null,
    montagens: null,
    testesAprovados: null,
    testesReprovados: null,
  });

  const [filters, setFilters] = useState<FilterData>({
    executante: "",
    setor: "",
    orcamento: "",
  });

  const [dataLoaded, setDataLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData>({
    montagens: [],
    desmontagens: [],
    testes: [],
    apontamentos: [],
  });

  // Dados dos setores (memoizado para performance)
  const setores = useMemo(
    () => [
      {
        id: "setor1",
        nome: "Setor 1 - Bombas e Motores de Grande Porte",
        executantes: [
          "Alexandre",
          "Alexsandro",
          "Kaua",
          "Marcelino",
          "Roberto P",
        ],
      },
      {
        id: "setor2",
        nome: "Setor 2 - Bombas e Motores de Pequeno Porte",
        executantes: ["Eduardo", "Guilherme", "Gustavobel", "Yuri"],
      },
      {
        id: "setor3",
        nome: "Setor 3 - Bombas e Motores de Engrenagens",
        executantes: ["Fabio F", "Vagner", "Nivaldo"],
      },
      {
        id: "setor4",
        nome: "Setor 4 - Comandos e Valvulas de Pequeno Porte",
        executantes: [
          "Nicolas C",
          "Alziro",
          "Henrique",
          "G Simao",
          "Ronald",
          "Vinicius",
          "Daniel G",
        ],
      },
      {
        id: "setor5",
        nome: "Setor 5 - Comando e Valvulas de Grande Porte",
        executantes: ["L Miguel", "Leandro", "Rodrigo N", "Luismiguel"],
      },
    ],
    []
  );

  // Carrega dados salvos do Convex ao inicializar
  useEffect(() => {
    if (
      indicadoresSession &&
      indicadoresData &&
      typeof indicadoresData === "object" &&
      "montagens" in indicadoresData
    ) {
      setProcessedData(indicadoresData as ProcessedData);
      setFilters(indicadoresSession.filters);
      setDataLoaded(true);
    }
  }, [indicadoresSession, indicadoresData]);

  const handleFileUpload = useCallback(
    (type: keyof UploadData, file: File | null) => {
      setUploadData((prev) => ({ ...prev, [type]: file }));
    },
    []
  );

  const handleFilterChange = useCallback(
    (type: keyof FilterData, value: string) => {
      setFilters((prev) => {
        // Se mudou o setor, limpar o executante
        if (type === "setor") {
          return { ...prev, [type]: value, executante: "" };
        }
        return { ...prev, [type]: value };
      });
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      executante: "",
      setor: "",
      orcamento: "",
    });
  }, []);

  const processExcelFile = useCallback(
    async (file: File, type: string): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
            }) as any[][];

            const processedRows = processSheetData(jsonData, type);
            resolve(processedRows);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      });
    },
    []
  );

  const processSheetData = useCallback((data: any[], type: string) => {
    if (data.length < 2) return [];

    const rows = data.slice(1);

    const processedRows = rows
      .map((row, index) => {
        const rowData: any = {};

        rowData.id = row[0] || `ID_${index}`;
        rowData.numeroOS = row[1] || "";
        rowData.numeroREQ = row[2] || "";
        rowData.cliente = row[3] || "";
        rowData.executante = row[4] || "";
        rowData.data = row[5] || "";
        rowData.inicio = row[6] || "";
        rowData.termino = row[7] || "";
        rowData.statusTeste = row[8] || "";
        rowData.observacao = row[9] || "";
        rowData.servico = row[10] || "";
        rowData.tipo = type;

        if (rowData.inicio && rowData.termino) {
          const inicio = new Date(`2000-01-01 ${rowData.inicio}`);
          const termino = new Date(`2000-01-01 ${rowData.termino}`);
          rowData.duracao =
            (termino.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        }

        return rowData;
      })
      .filter((row) => row.executante && row.servico);

    return processedRows;
  }, []);

  const handleProcessData = async () => {
    setIsProcessing(true);
    try {
      const newProcessedData: ProcessedData = {
        montagens: [],
        desmontagens: [],
        testes: [],
        apontamentos: [],
      };

      let totalProcessed = 0;

      if (uploadData.montagens) {
        const montagensData = await processExcelFile(
          uploadData.montagens,
          "montagem"
        );
        newProcessedData.montagens = montagensData;
        totalProcessed += montagensData.length;
      }

      if (uploadData.desmontagens) {
        const desmontagensData = await processExcelFile(
          uploadData.desmontagens,
          "desmontagem"
        );
        newProcessedData.desmontagens = desmontagensData;
        totalProcessed += desmontagensData.length;
      }

      if (uploadData.testesAprovados) {
        const testesAprovadosData = await processExcelFile(
          uploadData.testesAprovados,
          "teste_aprovado"
        );
        newProcessedData.testes = [
          ...newProcessedData.testes,
          ...testesAprovadosData,
        ];
        totalProcessed += testesAprovadosData.length;
      }

      if (uploadData.testesReprovados) {
        const testesReprovadosData = await processExcelFile(
          uploadData.testesReprovados,
          "teste_reprovado"
        );
        newProcessedData.testes = [
          ...newProcessedData.testes,
          ...testesReprovadosData,
        ];
        totalProcessed += testesReprovadosData.length;
      }

      newProcessedData.apontamentos = [
        ...newProcessedData.montagens,
        ...newProcessedData.desmontagens,
        ...newProcessedData.testes,
      ];

      setProcessedData(newProcessedData);
      setDataLoaded(true);

      // Salvar no Convex
      if (user) {
        await saveIndicadores({
          processedData: newProcessedData,
          filters,
          filesInfo: {
            desmontagens: uploadData.desmontagens
              ? {
                  name: uploadData.desmontagens.name,
                  size: uploadData.desmontagens.size,
                  lastModified: uploadData.desmontagens.lastModified,
                }
              : undefined,
            montagens: uploadData.montagens
              ? {
                  name: uploadData.montagens.name,
                  size: uploadData.montagens.size,
                  lastModified: uploadData.montagens.lastModified,
                }
              : undefined,
            testesAprovados: uploadData.testesAprovados
              ? {
                  name: uploadData.testesAprovados.name,
                  size: uploadData.testesAprovados.size,
                  lastModified: uploadData.testesAprovados.lastModified,
                }
              : undefined,
            testesReprovados: uploadData.testesReprovados
              ? {
                  name: uploadData.testesReprovados.name,
                  size: uploadData.testesReprovados.size,
                  lastModified: uploadData.testesReprovados.lastModified,
                }
              : undefined,
          },
          uploadedBy: user.name || user.email,
        });
      }

      toast.success("Dados processados com sucesso!", {
        description: `${totalProcessed} registros processados de ${uploadedFilesCount} arquivo(s)`,
      });
    } catch (error) {
      console.error("Erro ao processar dados:", error);
      toast.error("Erro ao processar dados", {
        description: "Verifique se os arquivos são planilhas válidas.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para exportar dados para Excel
  const handleExportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Aba de Montagens
      if (processedData.montagens.length > 0) {
        const montagensWS = XLSX.utils.json_to_sheet(processedData.montagens);
        XLSX.utils.book_append_sheet(workbook, montagensWS, "Montagens");
      }

      // Aba de Desmontagens
      if (processedData.desmontagens.length > 0) {
        const desmontagensWS = XLSX.utils.json_to_sheet(
          processedData.desmontagens
        );
        XLSX.utils.book_append_sheet(workbook, desmontagensWS, "Desmontagens");
      }

      // Aba de Testes (Aprovados e Reprovados juntos)
      if (processedData.testes.length > 0) {
        const testesWS = XLSX.utils.json_to_sheet(processedData.testes);
        XLSX.utils.book_append_sheet(
          workbook,
          testesWS,
          "Testes Aprovados e Reprovados"
        );
      }

      // Aba de Resumo
      const testesAprovados = processedData.testes.filter(
        (t) => t.tipo === "teste_aprovado"
      ).length;
      const testesReprovados = processedData.testes.filter(
        (t) => t.tipo === "teste_reprovado"
      ).length;

      const resumoData = [
        { Categoria: "Montagens", Quantidade: processedData.montagens.length },
        {
          Categoria: "Desmontagens",
          Quantidade: processedData.desmontagens.length,
        },
        { Categoria: "Testes Aprovados", Quantidade: testesAprovados },
        { Categoria: "Testes Reprovados", Quantidade: testesReprovados },
        {
          Categoria: "Total de Testes",
          Quantidade: processedData.testes.length,
        },
        {
          Categoria: "Total de Apontamentos",
          Quantidade: processedData.apontamentos.length,
        },
      ];
      const resumoWS = XLSX.utils.json_to_sheet(resumoData);
      XLSX.utils.book_append_sheet(workbook, resumoWS, "Resumo");

      const fileName = `indicadores_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success("Exportação concluída!", {
        description: `Arquivo ${fileName} baixado com sucesso`,
      });
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast.error("Erro na exportação", {
        description: "Não foi possível exportar os dados para Excel",
      });
    }
  };

  // Função para limpar todos os dados
  const handleClearData = async () => {
    try {
      await clearIndicadores();
      setProcessedData({
        montagens: [],
        desmontagens: [],
        testes: [],
        apontamentos: [],
      });
      setFilters({
        executante: "",
        setor: "",
        orcamento: "",
      });
      setUploadData({
        desmontagens: null,
        montagens: null,
        testesAprovados: null,
        testesReprovados: null,
      });
      setDataLoaded(false);

      toast.success("Dados limpos", {
        description: "Todos os dados foram removidos com sucesso",
      });
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      toast.error("Erro ao limpar dados", {
        description: "Não foi possível limpar todos os dados",
      });
    }
  };

  const executantesFiltrados = useMemo(() => {
    if (!filters.setor || filters.setor === "todos") {
      return [];
    }
    return setores.find((s) => s.id === filters.setor)?.executantes || [];
  }, [filters.setor, setores]);

  const hasUploadedFiles = useMemo(
    () => Object.values(uploadData).some((file) => file),
    [uploadData]
  );

  const uploadedFilesCount = useMemo(
    () => Object.values(uploadData).filter((file) => file).length,
    [uploadData]
  );

  return (
    <div className="space-y-6">
      {/* Grid para Upload e Filtros lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "desmontagens", label: "Desmontagens" },
                { key: "montagens", label: "Montagens" },
                { key: "testesAprovados", label: "Testes Aprovados" },
                { key: "testesReprovados", label: "Testes Reprovados" },
              ].map(({ key, label }) => (
                <div key={key} className="text-center">
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) =>
                      handleFileUpload(
                        key as keyof UploadData,
                        e.target.files?.[0] || null
                      )
                    }
                    className="hidden"
                    id={key}
                  />
                  <label
                    htmlFor={key}
                    className={`block w-full py-2 px-3 text-xs font-medium rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                      uploadData[key as keyof UploadData]
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>

            {hasUploadedFiles && (
              <div className="text-xs text-gray-500 text-center">
                {uploadedFilesCount} arquivo(s) selecionado(s)
              </div>
            )}

            <Button
              onClick={handleProcessData}
              disabled={!hasUploadedFiles || isProcessing}
              size="sm"
              variant="outline"
              className="w-full mt-4 text-blue-700 border-blue-400 hover:bg-blue-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                "Processar"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Botão Limpar Filtros */}
                {(filters.setor || filters.executante || filters.orcamento) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
                {dataLoaded && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportToExcel}>
                        <Download className="h-3 w-3 mr-2" />
                        Exportar Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleClearData}
                        className="text-red-600"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Limpar Dados
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Informação do último upload */}
            {indicadoresSession && (
              <div className="text-xs text-gray-500 mb-3 p-2 bg-blue-50 rounded">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Último upload:</span>
                  <span>{indicadoresSession.uploadedBy}</span>
                </div>
                <div className="text-gray-400">
                  {new Date(indicadoresSession.uploadedAt).toLocaleString(
                    "pt-BR"
                  )}
                </div>
                <div className="text-gray-400">
                  {indicadoresSession.totalRecords} registros
                </div>
              </div>
            )}

            <Select
              value={filters.setor}
              onValueChange={(value) => handleFilterChange("setor", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione um setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Setores</SelectItem>
                {setores.map((setor) => (
                  <SelectItem key={setor.id} value={setor.id}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.executante}
              onValueChange={(value) => handleFilterChange("executante", value)}
              disabled={!filters.setor || filters.setor === "todos"}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione um executante" />
              </SelectTrigger>
              <SelectContent>
                {executantesFiltrados.map((executante) => (
                  <SelectItem key={executante} value={executante}>
                    {executante}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Indicadores - Design melhorado */}
      {dataLoaded && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Tabs defaultValue="producao" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-50 rounded-none">
              <TabsTrigger
                value="producao"
                className="h-12 text-sm font-medium data-[state=inactive]:text-blue-600"
              >
                Produção
              </TabsTrigger>
              <TabsTrigger
                value="eficiencia"
                className="h-12 text-sm font-medium data-[state=inactive]:text-blue-600"
              >
                Eficiência
              </TabsTrigger>
              <TabsTrigger
                value="apontamentos"
                className="h-12 text-sm font-medium data-[state=inactive]:text-blue-600"
              >
                Apontamentos
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="producao" className="mt-0">
                <SetorCharts filters={filters} processedData={processedData} />
              </TabsContent>

              <TabsContent value="eficiencia" className="mt-0">
                <EfficiencyCharts
                  filters={filters}
                  processedData={processedData}
                />
              </TabsContent>

              <TabsContent value="apontamentos" className="mt-0">
                <ApontamentosCharts
                  filters={filters}
                  processedData={processedData}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}

      {/* Estado vazio melhorado */}
      {!dataLoaded && !isProcessing && (
        <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileSpreadsheet className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhum dado carregado
              </h3>
              <p className="text-gray-600 mb-4">
                Faça upload das planilhas de produção para visualizar os
                indicadores
              </p>
              <p className="text-sm text-gray-500">
                Formatos suportados: .xlsx, .xls, .csv
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function IndicadoresPage() {
  return (
    <AdminProtection
      allowedRoles={["qualidade_pcp", "gerente", "diretor", "admin"]}
    >
      <ResponsiveLayout
        title="Indicadores"
        subtitle="Dashboard de Produção"
        fullWidth={true}
      >
        <ProductionDashboard />
      </ResponsiveLayout>
    </AdminProtection>
  );
}
