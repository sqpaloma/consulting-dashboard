import { ResponsiveLayout } from "@/components/responsive-layout";
import { AdminProtection } from "@/components/admin-protection";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Upload, FileSpreadsheet, Filter, Search } from "lucide-react";
import { SetorCharts } from "@/components/dashboard/setor-charts";
import { EfficiencyCharts } from "@/components/dashboard/efficiency-charts";
import { ApontamentosCharts } from "@/components/dashboard/apontamentos-charts";

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

export function ProductionDashboard() {
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
  const [processedData, setProcessedData] = useState<ProcessedData>({
    montagens: [],
    desmontagens: [],
    testes: [],
    apontamentos: [],
  });

  const setores = [
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
  ];

  const handleFileUpload = (type: keyof UploadData, file: File | null) => {
    setUploadData((prev) => ({ ...prev, [type]: file }));
  };

  const handleFilterChange = (type: keyof FilterData, value: string) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const processExcelFile = async (file: File, type: string): Promise<any[]> => {
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

          // Processar dados baseado na estrutura da planilha
          const processedRows = processSheetData(jsonData, type);
          resolve(processedRows);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const processSheetData = (data: any[], type: string) => {
    if (data.length < 2) return [];

    const headers = data[0];
    const rows = data.slice(1);

    console.log(`Processando planilha de ${type}:`, {
      headers,
      rowsCount: rows.length,
    });

    const processedRows = rows
      .map((row, index) => {
        const rowData: any = {};

        // Mapear colunas baseado na estrutura da planilha
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

        // Calcular duração se houver horários
        if (rowData.inicio && rowData.termino) {
          const inicio = new Date(`2000-01-01 ${rowData.inicio}`);
          const termino = new Date(`2000-01-01 ${rowData.termino}`);
          rowData.duracao =
            (termino.getTime() - inicio.getTime()) / (1000 * 60 * 60); // em horas
        }

        return rowData;
      })
      .filter((row) => row.executante && row.servico); // Filtrar linhas válidas

    console.log(`Linhas processadas para ${type}:`, processedRows);
    return processedRows;
  };

  const handleProcessData = async () => {
    try {
      const processedData: ProcessedData = {
        montagens: [],
        desmontagens: [],
        testes: [],
        apontamentos: [],
      };

      // Processar cada arquivo carregado
      if (uploadData.montagens) {
        const montagensData = await processExcelFile(
          uploadData.montagens,
          "montagem"
        );
        processedData.montagens = montagensData;
      }

      if (uploadData.desmontagens) {
        const desmontagensData = await processExcelFile(
          uploadData.desmontagens,
          "desmontagem"
        );
        processedData.desmontagens = desmontagensData;
      }

      if (uploadData.testesAprovados) {
        const testesAprovadosData = await processExcelFile(
          uploadData.testesAprovados,
          "teste_aprovado"
        );
        processedData.testes = [
          ...processedData.testes,
          ...testesAprovadosData,
        ];
      }

      if (uploadData.testesReprovados) {
        const testesReprovadosData = await processExcelFile(
          uploadData.testesReprovados,
          "teste_reprovado"
        );
        processedData.testes = [
          ...processedData.testes,
          ...testesReprovadosData,
        ];
      }

      // Combinar todos os dados para apontamentos
      processedData.apontamentos = [
        ...processedData.montagens,
        ...processedData.desmontagens,
        ...processedData.testes,
      ];

      setProcessedData(processedData);
      setDataLoaded(true);

      console.log("Dados processados:", processedData);
    } catch (error) {
      console.error("Erro ao processar dados:", error);
      alert(
        "Erro ao processar os arquivos. Verifique se são planilhas válidas."
      );
    }
  };

  const executantesFiltrados = filters.setor
    ? setores.find((s) => s.id === filters.setor)?.executantes || []
    : [];

  return (
    <div className="space-y-6">
      {/* Seção de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Planilhas
          </CardTitle>
          <CardDescription>
            Faça upload das planilhas de produção para análise dos indicadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                key: "desmontagens",
                label: "Desmontagens",
                icon: FileSpreadsheet,
              },
              { key: "montagens", label: "Montagens", icon: FileSpreadsheet },
              {
                key: "testesAprovados",
                label: "Testes Aprovados",
                icon: FileSpreadsheet,
              },
              {
                key: "testesReprovados",
                label: "Testes Reprovados",
                icon: FileSpreadsheet,
              },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium">
                  {label}
                </Label>
                <div className="relative">
                  <Input
                    id={key}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) =>
                      handleFileUpload(
                        key as keyof UploadData,
                        e.target.files?.[0] || null
                      )
                    }
                    className="hidden"
                  />
                  <label
                    htmlFor={key}
                    className={`flex items-center justify-center w-16 h-16 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      uploadData[key as keyof UploadData]
                        ? "border-green-500 bg-green-50"
                        : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                    title={
                      uploadData[key as keyof UploadData]
                        ? `${label} - Arquivo selecionado`
                        : label
                    }
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        uploadData[key as keyof UploadData]
                          ? "text-green-600"
                          : "text-blue-500"
                      }`}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Button
              onClick={handleProcessData}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={Object.values(uploadData).every((file) => !file)}
            >
              Processar Dados
              {Object.values(uploadData).filter((file) => file).length > 0 && (
                <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                  {Object.values(uploadData).filter((file) => file).length}{" "}
                  arquivo(s)
                </span>
              )}
            </Button>

            {/* Resumo visual dos arquivos */}
            {Object.values(uploadData).some((file) => file) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Arquivos selecionados:</span>
                <div className="flex gap-1">
                  {Object.entries(uploadData).map(
                    ([key, file]) =>
                      file && (
                        <div
                          key={key}
                          className="w-2 h-2 bg-green-500 rounded-full"
                          title={`${key}: ${file.name}`}
                        />
                      )
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seção de Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setor" className="text-sm font-medium">
                Setor
              </Label>
              <Select
                value={filters.setor}
                onValueChange={(value) => handleFilterChange("setor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((setor) => (
                    <SelectItem key={setor.id} value={setor.id}>
                      {setor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="executante" className="text-sm font-medium">
                Executante
              </Label>
              <Select
                value={filters.executante}
                onValueChange={(value) =>
                  handleFilterChange("executante", value)
                }
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="orcamento" className="text-sm font-medium">
                Buscar por Orçamento
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="orcamento"
                  placeholder="Digite o número do orçamento"
                  value={filters.orcamento}
                  onChange={(e) =>
                    handleFilterChange("orcamento", e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas de Indicadores */}
      {dataLoaded && (
        <Tabs defaultValue="producao" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="producao">Indicadores de Produção</TabsTrigger>
            <TabsTrigger value="eficiencia">
              Indicadores de Eficiência
            </TabsTrigger>
            <TabsTrigger value="apontamentos">Apontamentos</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="producao" className="mt-6">
            <SetorCharts filters={filters} processedData={processedData} />
          </TabsContent>

          <TabsContent value="eficiencia" className="mt-6">
            <EfficiencyCharts filters={filters} processedData={processedData} />
          </TabsContent>

          <TabsContent value="apontamentos" className="mt-6">
            <ApontamentosCharts
              filters={filters}
              processedData={processedData}
            />
          </TabsContent>

          <TabsContent value="debug" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados Processados - Debug</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Montagens ({processedData.montagens.length})
                    </h4>
                    <div className="bg-gray-100 p-4 rounded max-h-40 overflow-y-auto">
                      <pre className="text-xs">
                        {JSON.stringify(processedData.montagens, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Desmontagens ({processedData.desmontagens.length})
                    </h4>
                    <div className="bg-gray-100 p-4 rounded max-h-40 overflow-y-auto">
                      <pre className="text-xs">
                        {JSON.stringify(processedData.desmontagens, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Testes ({processedData.testes.length})
                    </h4>
                    <div className="bg-gray-100 p-4 rounded max-h-40 overflow-y-auto">
                      <pre className="text-xs">
                        {JSON.stringify(processedData.testes, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
export default function IndicadoresPage() {
  return (
    <AdminProtection
      allowedRoles={["qualidade_pcp", "gerente", "diretor", "admin"]}
    >
      <ResponsiveLayout title="Indicadores" subtitle="Dashboard de Produção">
        <ProductionDashboard />
      </ResponsiveLayout>
    </AdminProtection>
  );
}
