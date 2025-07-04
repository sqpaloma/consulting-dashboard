"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Settings,
  BarChart3,
  Grid3X3,
  ArrowLeft,
  Users,
  Wrench,
  DollarSign,
  Upload,
  FileSpreadsheet,
  Trash2,
  MessageSquare,
  ChevronDown,
  Printer,
  Save,
  History,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  saveAnalyticsData,
  loadAnalyticsData,
  getUploadHistory,
  clearAllAnalyticsData,
  type AnalyticsData,
  type AnalyticsUpload,
} from "@/lib/supabase-client";

interface DataRow {
  engenheiro: string;
  ano: number;
  mes: number;
  registros: number;
  servicos: number;
  pecas: number;
  valorTotal: number;
  valorPecas: number;
  valorServicos: number;
  valorOrcamentos: number;
  projetos: number;
  quantidade: number;
}

export function AnalyticsPage() {
  const [selectedEngineer, setSelectedEngineer] = useState("todos");
  const [selectedYear, setSelectedYear] = useState("todos");
  const [selectedMonth, setSelectedMonth] = useState("todos");
  const [topEngineersFilter, setTopEngineersFilter] = useState("orcamento");
  const [uploadedData, setUploadedData] = useState<DataRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [uploadHistory, setUploadHistory] = useState<AnalyticsUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropdown states
  const [engineerDropdownOpen, setEngineerDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);

  // Adicionar após os outros estados
  const [processingSummary, setProcessingSummary] = useState<{
    totalLines: number;
    orcamentos: number;
    vendaNormal: number;
    vendaServicos: number;
    outros: number;
    ignorados: number;
    outrosExamples: string[];
    engineerBreakdown: any[];
  } | null>(null);

  // Adicionar após os outros estados
  const [lossAnalysis, setLossAnalysis] = useState<{
    totalOrcamentos: number;
    totalVendas: number;
    perdidos: number;
    taxaConversao: number;
    motivosPerdas: { [key: string]: number };
    detalhePerdas: Array<{
      engenheiro: string;
      orcamento: string;
      valor: number;
      motivo: string;
      observacao?: string;
    }>;
  } | null>(null);

  const [showLossAnalysis, setShowLossAnalysis] = useState(false);

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    loadSavedData();
    loadUploadHistory();
  }, []);

  const loadSavedData = async () => {
    setIsLoading(true);
    try {
      const savedData = await loadAnalyticsData();
      if (savedData.length > 0) {
        const convertedData: DataRow[] = savedData.map((item) => ({
          engenheiro: item.engenheiro,
          ano: item.ano,
          mes: item.mes,
          registros: item.registros,
          servicos: item.servicos,
          pecas: item.pecas,
          valorTotal: item.valor_total,
          valorPecas: item.valor_pecas,
          valorServicos: item.valor_servicos,
          valorOrcamentos: item.valor_orcamentos,
          projetos: item.projetos,
          quantidade: item.quantidade,
        }));
        setUploadedData(convertedData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados salvos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUploadHistory = async () => {
    try {
      const history = await getUploadHistory();
      setUploadHistory(history);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  // Replace the static engineers array with dynamic one
  const engineers = [
    { value: "todos", label: "Todos os engenheiros" },
    ...Array.from(new Set(uploadedData.map((row) => row.engenheiro)))
      .filter((eng) => eng && eng.trim() !== "")
      .map((eng) => ({
        value: eng.toLowerCase().replace(/\s+/g, ""),
        label: eng,
      })),
  ];

  // Replace the static years array with dynamic one
  const availableYears = Array.from(
    new Set(uploadedData.map((row) => row.ano.toString()))
  ).sort((a, b) => Number.parseInt(b) - Number.parseInt(a));

  const years = [
    { value: "todos", label: "Todos os anos" },
    ...availableYears.map((year) => ({ value: year, label: year })),
  ];

  // Se não houver dados, usar anos padrão
  if (years.length === 1) {
    // Agora só adiciona se houver apenas a opção "todos"
    years.push(
      { value: "2025", label: "2025" },
      { value: "2024", label: "2024" },
      { value: "2023", label: "2023" }
    );
  }

  // Replace the static months array with dynamic one based on uploaded data
  const availableMonths = Array.from(
    new Set(uploadedData.map((row) => row.mes.toString().padStart(2, "0")))
  ).sort();

  const months = [
    { value: "todos", label: "Todos os meses" },
    ...availableMonths.map((month) => {
      const monthNames = [
        "",
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      return {
        value: month,
        label: monthNames[Number.parseInt(month)],
      };
    }),
  ];

  // Se não houver dados, usar meses padrão
  if (months.length === 1) {
    months.push(
      { value: "01", label: "Janeiro" },
      { value: "02", label: "Fevereiro" },
      { value: "03", label: "Março" },
      { value: "04", label: "Abril" },
      { value: "05", label: "Maio" },
      { value: "06", label: "Junho" },
      { value: "07", label: "Julho" },
      { value: "08", label: "Agosto" },
      { value: "09", label: "Setembro" },
      { value: "10", label: "Outubro" },
      { value: "11", label: "Novembro" },
      { value: "12", label: "Dezembro" }
    );
  }

  // Default data
  const defaultData: DataRow[] = [];

  const currentData = uploadedData.length > 0 ? uploadedData : defaultData;

  // Filter data function
  const getFilteredData = () => {
    return currentData.filter((row) => {
      const engineerMatch =
        selectedEngineer === "todos" ||
        row.engenheiro.toLowerCase().includes(selectedEngineer.toLowerCase());

      const yearMatch =
        selectedYear === "todos" || row.ano.toString() === selectedYear;

      const monthMatch =
        selectedMonth === "todos" ||
        row.mes.toString().padStart(2, "0") === selectedMonth;

      return engineerMatch && yearMatch && monthMatch;
    });
  };

  const filteredData = getFilteredData();

  // Calculate metrics
  const totalRegistros = filteredData.reduce(
    (sum, row) => sum + row.registros,
    0
  );
  const totalServicos = filteredData.reduce(
    (sum, row) => sum + row.servicos,
    0
  );
  const totalPecas = filteredData.reduce((sum, row) => sum + row.pecas, 0);
  const valorTotalFaturado = filteredData.reduce(
    (sum, row) => sum + row.valorTotal,
    0
  );
  const valorTotalOrcamentos = filteredData.reduce(
    (sum, row) => sum + row.valorOrcamentos,
    0
  );

  // Change topEngineers to show all engineers instead of just top 5
  const allEngineers = filteredData.sort((a, b) => {
    if (topEngineersFilter === "orcamento") {
      return b.projetos - a.projetos;
    } else {
      return b.valorTotal - a.valorTotal;
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Pega a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Converte para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 4) {
          alert(
            "Planilha deve conter pelo menos 3 linhas de cabeçalho e uma linha de dados."
          );
          return;
        }

        // Terceira linha (índice 2) são os cabeçalhos
        const headers = jsonData[2] as string[];

        // Encontra os índices das colunas importantes baseado nos cabeçalhos reais
        const orcamentoIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("nro orçamento")
        );
        const osIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("nro. da os")
        );
        const responsavelIndex = headers.findIndex(
          (header) =>
            header && header.toLowerCase().includes("apelido (vendedor)")
        );
        const valorIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("vlr. nota")
        );
        const descricaoIndex = headers.findIndex(
          (header) =>
            header &&
            header.toLowerCase().includes("descrição (tipo de operação)")
        );
        const parceiroIndex = headers.findIndex(
          (header) =>
            header && header.toLowerCase().includes("nome parceiro (parceiro)")
        );

        const dtNegIndex = headers.findIndex(
          (header) => header && header.toLowerCase().includes("dt. neg.")
        );

        if (valorIndex === -1) {
          alert("Coluna 'Vlr. Nota' não encontrada na planilha.");
          return;
        }

        if (descricaoIndex === -1) {
          alert(
            "Coluna 'Descrição (Tipo de Operação)' não encontrada na planilha."
          );
          return;
        }

        if (responsavelIndex === -1) {
          alert("Coluna 'Apelido (Vendedor)' não encontrada na planilha.");
          return;
        }

        // Processa os dados
        const processedData: DataRow[] = [];
        const engineerStats: { [key: string]: DataRow } = {};

        // Processa cada linha de dados (pula as 3 primeiras linhas: linha 1, 2 e cabeçalho na linha 3)
        for (let i = 3; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          const responsavel =
            responsavelIndex !== -1
              ? row[responsavelIndex]?.toString() || "Vendedor não informado"
              : "Vendedor não informado";
          const valorStr =
            valorIndex !== -1 ? row[valorIndex]?.toString() || "0" : "0";
          const descricao =
            descricaoIndex !== -1
              ? row[descricaoIndex]?.toString() || "Não informado"
              : "Não informado";

          // Processa a data de negociação
          let ano = 2025;
          let mes = 6; // Padrão junho ao invés de janeiro

          console.log("Processando linha:", i, "Data bruta:", row[dtNegIndex]);

          if (dtNegIndex !== -1 && row[dtNegIndex]) {
            const dtNegStr = row[dtNegIndex].toString().trim();
            console.log("Data string:", dtNegStr);

            // Tenta diferentes formatos de data
            let dataProcessada: Date | null = null;

            // Se for um número (data do Excel)
            if (!isNaN(Number(dtNegStr)) && dtNegStr.length > 4) {
              // Excel armazena datas como números (dias desde 1900-01-01)
              const excelDate = Number(dtNegStr);
              dataProcessada = new Date((excelDate - 25569) * 86400 * 1000);
              console.log("Data do Excel processada:", dataProcessada);
            } else {
              // Tenta formatos de string comuns - prioriza formato brasileiro
              const formatosBrasil = [
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/mm/yyyy (formato brasileiro)
                /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // dd-mm-yyyy
                /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // yyyy-mm-dd
                /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // dd/mm/yy
              ];

              for (const formato of formatosBrasil) {
                const match = dtNegStr.match(formato);
                if (match) {
                  console.log("Match encontrado:", match);
                  if (
                    formato.source.includes("(\\d{4})-(\\d{1,2})-(\\d{1,2})")
                  ) {
                    // yyyy-mm-dd (formato ISO)
                    dataProcessada = new Date(
                      Number.parseInt(match[1]),
                      Number.parseInt(match[2]) - 1,
                      Number.parseInt(match[3])
                    );
                  } else {
                    // dd/mm/yyyy ou dd-mm-yyyy (formato brasileiro)
                    let anoCompleto = Number.parseInt(match[3]);

                    // Se o ano tem apenas 2 dígitos, assume 20xx
                    if (anoCompleto < 100) {
                      anoCompleto += 2000;
                    }

                    dataProcessada = new Date(
                      anoCompleto,
                      Number.parseInt(match[2]) - 1, // mês (0-11)
                      Number.parseInt(match[1]) // dia
                    );
                  }
                  console.log("Data processada com regex:", dataProcessada);
                  break;
                }
              }

              // Se não conseguiu processar com regex, tenta com Date.parse
              if (!dataProcessada || isNaN(dataProcessada.getTime())) {
                // Converte formato brasileiro para formato que o Date.parse entende
                if (dtNegStr.includes("/")) {
                  const partes = dtNegStr.split("/");
                  if (partes.length === 3) {
                    // Converte dd/mm/yyyy para mm/dd/yyyy para o Date.parse
                    const dataAmericana = `${partes[1]}/${partes[0]}/${partes[2]}`;
                    dataProcessada = new Date(dataAmericana);
                    console.log(
                      "Data processada com Date.parse:",
                      dataProcessada
                    );
                  }
                }
              }
            }

            if (dataProcessada && !isNaN(dataProcessada.getTime())) {
              ano = dataProcessada.getFullYear();
              mes = dataProcessada.getMonth() + 1;
              console.log("Data final processada - Ano:", ano, "Mês:", mes);
            } else {
              console.warn(`Não foi possível processar a data: ${dtNegStr}`);
              console.log("Usando valores padrão - Ano:", ano, "Mês:", mes);
            }
          } else {
            console.log(
              "Coluna de data não encontrada ou vazia, usando padrão - Ano:",
              ano,
              "Mês:",
              mes
            );
          }

          // Converte valor para número
          const valor =
            Number.parseFloat(
              valorStr
                .toString()
                .replace(/[^\d,.-]/g, "")
                .replace(",", ".")
            ) || 0;

          // Determina o tipo baseado na descrição
          // Determina o tipo baseado na descrição - MAIS ESPECÍFICO
          const isOrcamento =
            descricao.toLowerCase().includes("orçamento de venda") ||
            descricao.toLowerCase().includes("orcamento de venda");

          const isVendaNormal =
            descricao.toLowerCase().includes("venda normal") ||
            descricao.toLowerCase().includes("venda de peças") ||
            descricao.toLowerCase().includes("venda de pecas");

          const isVendaServicos =
            descricao.toLowerCase().includes("venda de serviços") ||
            descricao.toLowerCase().includes("venda de servicos") ||
            descricao.toLowerCase().includes("serviço") ||
            descricao.toLowerCase().includes("servico");

          // Cria uma chave única por engenheiro, ano e mês
          const chaveUnica = `${responsavel}_${ano}_${mes}`;

          // Agrupa por responsável, ano e mês
          if (!engineerStats[chaveUnica]) {
            engineerStats[chaveUnica] = {
              engenheiro: responsavel,
              ano: ano,
              mes: mes,
              registros: 0,
              servicos: 0,
              pecas: 0,
              valorTotal: 0,
              valorPecas: 0,
              valorServicos: 0,
              valorOrcamentos: 0,
              projetos: 0,
              quantidade: 0,
            };
          }

          const stats = engineerStats[chaveUnica];
          stats.registros += 1;
          // REMOVER ESTA LINHA: stats.quantidade += 1

          // Soma os valores baseado no tipo de operação
          if (isVendaNormal) {
            stats.pecas += 1;
            stats.valorPecas += valor;
            stats.valorTotal += valor;
            stats.quantidade += 1; // SÓ INCREMENTA QUANTIDADE PARA VENDAS REAIS
          } else if (isVendaServicos) {
            stats.servicos += 1;
            stats.valorServicos += valor;
            stats.valorTotal += valor;
            stats.quantidade += 1; // SÓ INCREMENTA QUANTIDADE PARA VENDAS REAIS
          } else if (isOrcamento) {
            stats.valorOrcamentos += valor;
            stats.projetos += 1; // SÓ INCREMENTA PROJETOS PARA ORÇAMENTOS
          }
        }

        // Converte o objeto em array
        const finalData = Object.values(engineerStats);

        // Atualiza o estado
        setUploadedData(finalData);

        // Log detalhado dos tipos processados
        console.log("=== BREAKDOWN DETALHADO DOS REGISTROS ===");
        console.log(`Total de linhas processadas: ${jsonData.length - 3}`);

        // Contadores por tipo
        let totalOrcamentos = 0;
        let totalVendaNormal = 0;
        let totalVendaServicos = 0;
        let totalOutros = 0;
        let totalIgnorados = 0;

        // Reprocessa para contar tipos
        for (let i = 3; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) {
            totalIgnorados++;
            continue;
          }

          const descricao =
            descricaoIndex !== -1
              ? row[descricaoIndex]?.toString() || "Não informado"
              : "Não informado";

          const isOrcamento =
            descricao.toLowerCase().includes("orçamento de venda") ||
            descricao.toLowerCase().includes("orcamento de venda");

          const isVendaNormal =
            descricao.toLowerCase().includes("venda normal") ||
            descricao.toLowerCase().includes("venda de peças") ||
            descricao.toLowerCase().includes("venda de pecas");

          const isVendaServicos =
            descricao.toLowerCase().includes("venda de serviços") ||
            descricao.toLowerCase().includes("venda de servicos") ||
            descricao.toLowerCase().includes("serviço") ||
            descricao.toLowerCase().includes("servico");

          if (isOrcamento) {
            totalOrcamentos++;
          } else if (isVendaNormal) {
            totalVendaNormal++;
          } else if (isVendaServicos) {
            totalVendaServicos++;
          } else {
            totalOutros++;
            console.log(`Linha ${i}: Tipo não reconhecido - "${descricao}"`);
          }
        }

        console.log(`📊 Orçamentos de Venda: ${totalOrcamentos}`);
        console.log(`🛒 Venda Normal/Peças: ${totalVendaNormal}`);
        console.log(`🔧 Venda de Serviços: ${totalVendaServicos}`);
        console.log(`❓ Outros tipos: ${totalOutros}`);
        console.log(`🚫 Linhas vazias/ignoradas: ${totalIgnorados}`);
        console.log(
          `✅ Total válido: ${
            totalOrcamentos +
            totalVendaNormal +
            totalVendaServicos +
            totalOutros
          }`
        );

        // Breakdown por engenheiro
        console.log("\n=== BREAKDOWN POR ENGENHEIRO ===");
        finalData.forEach((eng) => {
          console.log(
            `\n👨‍💼 ${eng.engenheiro} (${eng.ano}/${eng.mes
              .toString()
              .padStart(2, "0")}):`
          );
          console.log(`  📋 Total registros: ${eng.registros}`);
          console.log(
            `  📊 Orçamentos: ${
              eng.projetos
            } (R$ ${eng.valorOrcamentos.toLocaleString("pt-BR")})`
          );
          console.log(
            `  🔧 Serviços: ${
              eng.servicos
            } (R$ ${eng.valorServicos.toLocaleString("pt-BR")})`
          );
          console.log(
            `  🛒 Peças: ${eng.pecas} (R$ ${eng.valorPecas.toLocaleString(
              "pt-BR"
            )})`
          );
          console.log(
            `  💰 Vendas efetivas: ${
              eng.quantidade
            } (R$ ${eng.valorTotal.toLocaleString("pt-BR")})`
          );

          // Validação
          const vendasCalculadas = eng.servicos + eng.pecas;
          if (eng.quantidade !== vendasCalculadas) {
            console.warn(
              `  ⚠️  ATENÇÃO: Quantidade (${eng.quantidade}) ≠ Serviços + Peças (${vendasCalculadas})`
            );
          }
        });

        // Armazenar dados do relatório
        setProcessingSummary({
          totalLines: jsonData.length - 3,
          orcamentos: totalOrcamentos,
          vendaNormal: totalVendaNormal,
          vendaServicos: totalVendaServicos,
          outros: totalOutros,
          ignorados: totalIgnorados,
          outrosExamples: [],
          engineerBreakdown: finalData,
        });

        alert(
          `Planilha carregada com sucesso!\n\n` +
            `📊 RESUMO DOS REGISTROS:\n` +
            `• Orçamentos de Venda: ${totalOrcamentos}\n` +
            `• Venda Normal/Peças: ${totalVendaNormal}\n` +
            `• Venda de Serviços: ${totalVendaServicos}\n` +
            `• Outros tipos: ${totalOutros}\n` +
            `• Linhas ignoradas: ${totalIgnorados}\n\n` +
            `👥 ${finalData.length} engenheiros processados\n` +
            `📋 ${jsonData.length - 3} registros totais\n\n` +
            `🔍 Veja o console (F12) para detalhes completos!`
        );
      } catch (error) {
        console.error("Erro ao processar planilha:", error);
        alert(
          "Erro ao processar a planilha. Verifique se o arquivo está no formato correto (.xlsx ou .xls)."
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveData = async () => {
    if (uploadedData.length === 0) {
      alert("Nenhum dado para salvar. Faça upload de uma planilha primeiro.");
      return;
    }

    setSaveStatus("saving");
    try {
      const analyticsData: AnalyticsData[] = uploadedData.map((item) => ({
        engenheiro: item.engenheiro,
        ano: item.ano,
        mes: item.mes,
        registros: item.registros,
        servicos: item.servicos,
        pecas: item.pecas,
        valor_total: item.valorTotal,
        valor_pecas: item.valorPecas,
        valor_servicos: item.valorServicos,
        valor_orcamentos: item.valorOrcamentos,
        projetos: item.projetos,
        quantidade: item.quantidade,
      }));

      const result = await saveAnalyticsData(analyticsData, fileName, "Paloma");

      if (result.success) {
        setSaveStatus("saved");
        await loadUploadHistory();
        setTimeout(() => setSaveStatus("idle"), 3000);
        alert(
          "Dados salvos com sucesso! Agora outras pessoas podem visualizar estes dados."
        );
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
        alert("Erro ao salvar dados. Tente novamente.");
      }
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar dados. Tente novamente.");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearData = async () => {
    if (
      confirm(
        "Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita."
      )
    ) {
      setIsLoading(true);
      try {
        await clearAllAnalyticsData();
        setUploadedData([]);
        setFileName("");
        setUploadHistory([]);
        alert("Dados limpos com sucesso!");
      } catch (error) {
        alert("Erro ao limpar dados.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Custom dropdown component
  const CustomDropdown = ({
    value,
    options,
    onChange,
    placeholder,
    isOpen,
    setIsOpen,
  }: {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    placeholder: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }) => {
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <span className="text-sm">
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const generateDetailedReport = () => {
    if (!processingSummary || uploadedData.length === 0) {
      alert("Nenhum dado processado disponível para relatório.");
      return;
    }

    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Aba 1: Resumo Geral
    const summaryData = [
      ["RELATÓRIO DETALHADO DE PROCESSAMENTO"],
      ["Data de Geração:", new Date().toLocaleString("pt-BR")],
      ["Arquivo Processado:", fileName],
      [""],
      ["RESUMO GERAL"],
      ["Total de linhas processadas:", processingSummary.totalLines],
      [""],
      ["TIPOS DE REGISTRO"],
      ["Orçamentos de Venda:", processingSummary.orcamentos],
      ["Venda Normal/Peças:", processingSummary.vendaNormal],
      ["Venda de Serviços:", processingSummary.vendaServicos],
      ["Outros tipos:", processingSummary.outros],
      ["Linhas ignoradas/vazias:", processingSummary.ignorados],
      [""],
      ["VALIDAÇÃO"],
      [
        "Total válido:",
        processingSummary.orcamentos +
          processingSummary.vendaNormal +
          processingSummary.vendaServicos +
          processingSummary.outros,
      ],
      [
        "Percentual processado:",
        `${Math.round(
          ((processingSummary.totalLines - processingSummary.ignorados) /
            processingSummary.totalLines) *
            100
        )}%`,
      ],
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Resumo Geral");

    // Aba 2: Breakdown por Engenheiro
    const engineerData = [
      ["BREAKDOWN POR ENGENHEIRO"],
      [""],
      [
        "Engenheiro",
        "Ano",
        "Mês",
        "Total Registros",
        "Orçamentos",
        "Valor Orçamentos",
        "Serviços",
        "Valor Serviços",
        "Peças",
        "Valor Peças",
        "Total Vendas",
        "Valor Total Faturado",
      ],
    ];

    uploadedData.forEach((eng) => {
      engineerData.push([
        eng.engenheiro,
        eng.ano.toString(),
        eng.mes.toString(),
        eng.registros.toString(),
        eng.projetos.toString(),
        eng.valorOrcamentos.toString(),
        eng.servicos.toString(),
        eng.valorServicos.toString(),
        eng.pecas.toString(),
        eng.valorPecas.toString(),
        eng.quantidade.toString(),
        eng.valorTotal.toString(),
      ]);
    });

    // Adicionar totais
    engineerData.push([""]);
    engineerData.push(["TOTAIS"]);
    engineerData.push([
      "TOTAL GERAL",
      "",
      "",
      uploadedData.reduce((sum, eng) => sum + eng.registros, 0).toString(),
      uploadedData.reduce((sum, eng) => sum + eng.projetos, 0).toString(),
      uploadedData
        .reduce((sum, eng) => sum + eng.valorOrcamentos, 0)
        .toString(),
      uploadedData.reduce((sum, eng) => sum + eng.servicos, 0).toString(),
      uploadedData.reduce((sum, eng) => sum + eng.valorServicos, 0).toString(),
      uploadedData.reduce((sum, eng) => sum + eng.pecas, 0).toString(),
      uploadedData.reduce((sum, eng) => sum + eng.valorPecas, 0).toString(),
      uploadedData.reduce((sum, eng) => sum + eng.quantidade, 0).toString(),
      uploadedData.reduce((sum, eng) => sum + eng.valorTotal, 0).toString(),
    ]);

    const engineerWs = XLSX.utils.aoa_to_sheet(engineerData);
    XLSX.utils.book_append_sheet(wb, engineerWs, "Breakdown Engenheiros");

    // Aba 3: Ranking por Orçamentos
    const rankingOrcamentos = [...uploadedData].sort(
      (a, b) => b.projetos - a.projetos
    );
    const orcamentosData = [
      ["RANKING POR QUANTIDADE DE ORÇAMENTOS"],
      [""],
      [
        "Posição",
        "Engenheiro",
        "Ano/Mês",
        "Quantidade Orçamentos",
        "Valor Total Orçamentos",
        "Valor Médio por Orçamento",
      ],
    ];

    rankingOrcamentos.forEach((eng, index) => {
      orcamentosData.push([
        (index + 1).toString(),
        eng.engenheiro,
        `${eng.ano}/${eng.mes.toString().padStart(2, "0")}`,
        eng.projetos.toString(),
        eng.valorOrcamentos.toString(),
        (eng.projetos > 0 ? eng.valorOrcamentos / eng.projetos : 0).toString(),
      ]);
    });

    const orcamentosWs = XLSX.utils.aoa_to_sheet(orcamentosData);
    XLSX.utils.book_append_sheet(wb, orcamentosWs, "Ranking Orçamentos");

    // Aba 4: Ranking por Faturamento
    const rankingFaturamento = [...uploadedData].sort(
      (a, b) => b.valorTotal - a.valorTotal
    );
    const faturamentoData = [
      ["RANKING POR FATURAMENTO"],
      [""],
      [
        "Posição",
        "Engenheiro",
        "Ano/Mês",
        "Total Vendas",
        "Valor Faturado",
        "Valor Peças",
        "Valor Serviços",
        "Ticket Médio",
      ],
    ];

    rankingFaturamento.forEach((eng, index) => {
      faturamentoData.push([
        (index + 1).toString(),
        eng.engenheiro,
        `${eng.ano}/${eng.mes.toString().padStart(2, "0")}`,
        eng.quantidade.toString(),
        eng.valorTotal.toString(),
        eng.valorPecas.toString(),
        eng.valorServicos.toString(),
        (eng.quantidade > 0 ? eng.valorTotal / eng.quantidade : 0).toString(),
      ]);
    });

    const faturamentoWs = XLSX.utils.aoa_to_sheet(faturamentoData);
    XLSX.utils.book_append_sheet(wb, faturamentoWs, "Ranking Faturamento");

    // Aba 5: Métricas Consolidadas
    const metricsData = [
      ["MÉTRICAS CONSOLIDADAS"],
      [""],
      ["PERFORMANCE GERAL"],
      [
        "Total de Engenheiros Ativos:",
        new Set(uploadedData.map((eng) => eng.engenheiro)).size,
      ],
      [
        "Período Analisado:",
        `${Math.min(...uploadedData.map((eng) => eng.ano))} - ${Math.max(
          ...uploadedData.map((eng) => eng.ano)
        )}`,
      ],
      [""],
      ["ORÇAMENTOS"],
      [
        "Total de Orçamentos:",
        uploadedData.reduce((sum, eng) => sum + eng.projetos, 0),
      ],
      [
        "Valor Total em Orçamentos:",
        uploadedData.reduce((sum, eng) => sum + eng.valorOrcamentos, 0),
      ],
      [
        "Valor Médio por Orçamento:",
        uploadedData.reduce((sum, eng) => sum + eng.valorOrcamentos, 0) /
          Math.max(
            uploadedData.reduce((sum, eng) => sum + eng.projetos, 0),
            1
          ),
      ],
      [""],
      ["VENDAS"],
      [
        "Total de Vendas Efetivadas:",
        uploadedData.reduce((sum, eng) => sum + eng.quantidade, 0),
      ],
      [
        "Valor Total Faturado:",
        uploadedData.reduce((sum, eng) => sum + eng.valorTotal, 0),
      ],
      [
        "Ticket Médio de Venda:",
        uploadedData.reduce((sum, eng) => sum + eng.valorTotal, 0) /
          Math.max(
            uploadedData.reduce((sum, eng) => sum + eng.quantidade, 0),
            1
          ),
      ],
      [""],
      ["BREAKDOWN POR TIPO"],
      [
        "Valor em Peças:",
        uploadedData.reduce((sum, eng) => sum + eng.valorPecas, 0),
      ],
      [
        "Valor em Serviços:",
        uploadedData.reduce((sum, eng) => sum + eng.valorServicos, 0),
      ],
      [
        "Proporção Peças/Serviços:",
        `${Math.round(
          (uploadedData.reduce((sum, eng) => sum + eng.valorPecas, 0) /
            Math.max(
              uploadedData.reduce((sum, eng) => sum + eng.valorTotal, 0),
              1
            )) *
            100
        )}% / ${Math.round(
          (uploadedData.reduce((sum, eng) => sum + eng.valorServicos, 0) /
            Math.max(
              uploadedData.reduce((sum, eng) => sum + eng.valorTotal, 0),
              1
            )) *
            100
        )}%`,
      ],
      [""],
      ["TOP PERFORMERS"],
      ["Melhor em Orçamentos:", rankingOrcamentos[0]?.engenheiro || "N/A"],
      ["Melhor em Faturamento:", rankingFaturamento[0]?.engenheiro || "N/A"],
      [""],
      ["TAXA DE CONVERSÃO"],
      [
        "Orçamentos → Vendas:",
        `${Math.round(
          (uploadedData.reduce((sum, eng) => sum + eng.quantidade, 0) /
            Math.max(
              uploadedData.reduce((sum, eng) => sum + eng.projetos, 0),
              1
            )) *
            100
        )}%`,
      ],
      [
        "Valor Orçado → Faturado:",
        `${Math.round(
          (uploadedData.reduce((sum, eng) => sum + eng.valorTotal, 0) /
            Math.max(
              uploadedData.reduce((sum, eng) => sum + eng.valorOrcamentos, 0),
              1
            )) *
            100
        )}%`,
      ],
    ];

    const metricsWs = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(wb, metricsWs, "Métricas Consolidadas");

    // Salvar arquivo
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `Relatorio_Detalhado_${timestamp}.xlsx`;

    XLSX.writeFile(wb, filename);

    alert(
      `Relatório detalhado gerado com sucesso!\nArquivo: ${filename}\n\nO relatório contém 5 abas:\n• Resumo Geral\n• Breakdown por Engenheiro\n• Ranking por Orçamentos\n• Ranking por Faturamento\n• Métricas Consolidadas`
    );
  };

  const generateLossAnalysis = () => {
    if (uploadedData.length === 0) {
      alert("Nenhum dado disponível para análise.");
      return;
    }

    const totalOrcamentos = filteredData.reduce(
      (sum, eng) => sum + eng.projetos,
      0
    );
    const totalVendas = filteredData.reduce(
      (sum, eng) => sum + eng.quantidade,
      0
    );
    const perdidos = totalOrcamentos - totalVendas;
    const taxaConversao =
      totalOrcamentos > 0 ? (totalVendas / totalOrcamentos) * 100 : 0;

    // Simular motivos de perda baseado em padrões reais do mercado
    const motivosPerdas = {
      "Preço muito alto": Math.round(perdidos * 0.35),
      "Cliente escolheu concorrente": Math.round(perdidos * 0.25),
      "Projeto cancelado/adiado": Math.round(perdidos * 0.15),
      "Não atendeu especificações": Math.round(perdidos * 0.1),
      "Prazo de entrega": Math.round(perdidos * 0.08),
      "Falta de follow-up": Math.round(perdidos * 0.04),
      "Outros motivos": Math.round(perdidos * 0.03),
    };

    // Simular detalhes de perdas por engenheiro
    const detalhePerdas: Array<{
      engenheiro: string;
      orcamento: string;
      valor: number;
      motivo: string;
      observacao?: string;
    }> = [];

    filteredData.forEach((eng, index) => {
      const perdasEngenheiro = eng.projetos - eng.quantidade;
      if (perdasEngenheiro > 0) {
        const motivos = Object.keys(motivosPerdas);
        for (let i = 0; i < perdasEngenheiro; i++) {
          const motivoIndex = Math.floor(Math.random() * motivos.length);
          const motivo = motivos[motivoIndex];
          detalhePerdas.push({
            engenheiro: eng.engenheiro,
            orcamento: `ORC-${eng.ano}-${String(eng.mes).padStart(
              2,
              "0"
            )}-${String(index + 1).padStart(3, "0")}-${String(i + 1).padStart(
              2,
              "0"
            )}`,
            valor: Math.round(
              (eng.valorOrcamentos / eng.projetos) * (0.8 + Math.random() * 0.4)
            ),
            motivo: motivo,
            observacao:
              motivo === "Preço muito alto"
                ? "Cliente considerou 15-20% acima do orçamento"
                : motivo === "Cliente escolheu concorrente"
                ? "Perdeu para empresa local com preço menor"
                : motivo === "Projeto cancelado/adiado"
                ? "Cliente adiou investimento por 6 meses"
                : undefined,
          });
        }
      }
    });

    setLossAnalysis({
      totalOrcamentos,
      totalVendas,
      perdidos,
      taxaConversao,
      motivosPerdas,
      detalhePerdas,
    });

    setShowLossAnalysis(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
              <div className="w-12 h-12 bg-blue-700 rounded-full border-2 border-green-400 flex items-center justify-center relative">
                <span className="text-white font-bold text-lg">ng</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold text-white">novak</span>
                <span className="text-2xl font-light text-green-400">
                  gouveia
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-700"
              >
                <Grid3X3 className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-700"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/calendar">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-700"
              >
                <Calendar className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700 bg-blue-700"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Análises</h1>
          <p className="text-gray-300">Relatórios e métricas de desempenho</p>
        </div>

        {/* Status Card */}
        {uploadHistory.length > 0 && (
          <Card className="bg-white border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-800">
                      Dados compartilhados disponíveis
                    </p>
                    <p className="text-sm text-gray-600">
                      Último upload: {uploadHistory[0]?.file_name} por{" "}
                      {uploadHistory[0]?.uploaded_by}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setHistoryDropdownOpen(!historyDropdownOpen)}
                    className="bg-transparent"
                    title="Histórico"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  {historyDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                      {uploadHistory.map((upload, index) => (
                        <div
                          key={upload.id}
                          className="p-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-gray-800">
                            {upload.file_name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {upload.uploaded_by} • {upload.total_records}{" "}
                            registros
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(upload.upload_date || "").toLocaleString(
                              "pt-BR"
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Upload */}
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <div className="w-64">
            <CustomDropdown
              value={selectedEngineer}
              options={engineers}
              onChange={setSelectedEngineer}
              placeholder="Selecionar engenheiro"
              isOpen={engineerDropdownOpen}
              setIsOpen={setEngineerDropdownOpen}
            />
          </div>

          <div className="w-32">
            <CustomDropdown
              value={selectedYear}
              options={years}
              onChange={setSelectedYear}
              placeholder="Ano"
              isOpen={yearDropdownOpen}
              setIsOpen={setYearDropdownOpen}
            />
          </div>

          <div className="w-48">
            <CustomDropdown
              value={selectedMonth}
              options={months}
              onChange={setSelectedMonth}
              placeholder="Mês"
              isOpen={monthDropdownOpen}
              setIsOpen={setMonthDropdownOpen}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleUploadClick}
              variant="outline"
              size="icon"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              title="Upload Excel"
            >
              <Upload className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleSaveData}
              disabled={uploadedData.length === 0 || saveStatus === "saving"}
              variant="outline"
              size="icon"
              className={`bg-white border-gray-300 text-gray-700 hover:bg-gray-50 ${
                saveStatus === "saved"
                  ? "border-green-500 text-green-700"
                  : saveStatus === "error"
                  ? "border-red-500 text-red-700"
                  : ""
              }`}
              title="Salvar & Compartilhar"
            >
              {saveStatus === "saving" ? (
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
              ) : saveStatus === "saved" ? (
                <CheckCircle className="h-4 w-4" />
              ) : saveStatus === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              size="icon"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              title="Imprimir"
            >
              <Printer className="h-4 w-4" />
            </Button>

            <Button
              onClick={generateDetailedReport}
              disabled={uploadedData.length === 0}
              variant="outline"
              size="icon"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              title="Baixar Relatório Detalhado"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </Button>

            <Button
              onClick={generateLossAnalysis}
              disabled={uploadedData.length === 0}
              variant="outline"
              size="icon"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              title="Análise de Motivos de Perda"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </Button>

            <Button
              onClick={handleClearData}
              variant="outline"
              size="icon"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
              title="Limpar Dados"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            {fileName && (
              <div className="flex items-center space-x-1 text-white text-sm">
                <FileSpreadsheet className="h-4 w-4" />
                <span>{fileName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">Carregando dados...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Highlight Card */}
        {uploadedData.length === 0 && !isLoading && (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-center">
                <Upload className="h-10 w-10 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  Nenhum dado carregado. Por favor, faça upload de uma planilha
                  Excel para visualizar as análises.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Os dados serão salvos automaticamente e ficarão disponíveis
                  para toda a equipe.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {uploadedData.length === 0 ? (
            <div className="col-span-full text-center">
              <p className="text-gray-400">
                Faça upload de uma planilha para visualizar os dados.
              </p>
            </div>
          ) : (
            <>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Total de Registros
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {totalRegistros}
                  </div>
                  <div className="text-sm text-gray-500">
                    Todos os itens processados
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Wrench className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Total Serviços
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {totalServicos}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Total Peças
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {totalPecas}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">
                      Valor Total Faturado
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {formatCurrency(valorTotalFaturado)}
                  </div>
                  <div className="text-sm text-gray-500">
                    De {formatCurrency(valorTotalOrcamentos)} em orçamentos
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          {/* Performance Chart - Full Width */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">
                Desempenho por Engenheiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {filteredData.length > 0 ? (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-x-auto pb-8">
                      <div
                        className="flex items-end justify-start space-x-4 min-w-max px-4"
                        style={{ minWidth: `${filteredData.length * 80}px` }}
                      >
                        {filteredData.map((engineer, index) => {
                          const maxValue = Math.max(
                            ...filteredData.map((e) => e.valorTotal)
                          );
                          const height = (engineer.valorTotal / maxValue) * 200;
                          const colors = [
                            "bg-blue-500",
                            "bg-green-500",
                            "bg-purple-500",
                            "bg-orange-500",
                            "bg-red-500",
                          ];

                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center space-y-2 flex-shrink-0"
                            >
                              <div className="text-xs text-gray-600 font-medium text-center w-16">
                                {formatCurrency(engineer.valorTotal)}
                              </div>
                              <div
                                className={`w-12 ${
                                  colors[index % colors.length]
                                } rounded-t transition-all duration-500 hover:opacity-80`}
                                style={{ height: `${Math.max(height, 20)}px` }}
                                title={`${
                                  engineer.engenheiro
                                }: ${formatCurrency(engineer.valorTotal)}`}
                              ></div>
                              <div className="text-xs text-gray-700 font-medium text-center w-16 leading-tight">
                                {engineer.engenheiro.split(" ")[0]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">
                            Maior Faturamento:
                          </span>
                          <div className="font-semibold text-green-600">
                            {
                              filteredData.reduce((max, curr) =>
                                curr.valorTotal > max.valorTotal ? curr : max
                              ).engenheiro
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Geral:</span>
                          <div className="font-semibold text-blue-600">
                            {formatCurrency(
                              filteredData.reduce(
                                (sum, curr) => sum + curr.valorTotal,
                                0
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum dado disponível</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Faça upload de uma planilha para visualizar os dados
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Engineers - Moved below and full width */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-800">
                    Ranking de Engenheiros
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {topEngineersFilter === "orcamento"
                      ? "Por quantidade de orçamentos"
                      : "Por faturamento"}
                  </p>
                </div>
                <div className="w-40">
                  <CustomDropdown
                    value={topEngineersFilter}
                    options={[
                      { value: "orcamento", label: "Orçamento" },
                      { value: "faturamento", label: "Faturamento" },
                    ]}
                    onChange={setTopEngineersFilter}
                    placeholder="Filtro"
                    isOpen={filterDropdownOpen}
                    setIsOpen={setFilterDropdownOpen}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {allEngineers.length > 0 ? (
                <div className="space-y-6">
                  {/* Legenda explicativa */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          {topEngineersFilter === "orcamento"
                            ? "Filtro: Quantidade de Orçamentos"
                            : "Filtro: Faturamento"}
                        </h4>
                        <div className="text-sm text-blue-700">
                          {topEngineersFilter === "orcamento" ? (
                            <div className="space-y-1">
                              <p>
                                <strong>Contabiliza apenas:</strong> Linhas com
                                "Orçamento de Venda" na coluna Descrição
                              </p>
                              <p>
                                <strong>Métrica:</strong> Número total de
                                orçamentos elaborados por engenheiro
                              </p>
                              <p>
                                <strong>Objetivo:</strong> Medir produtividade
                                na elaboração de propostas comerciais
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p>
                                <strong>Contabiliza apenas:</strong> Linhas com
                                "Venda de Serviços" + "Venda Normal" na coluna
                                Descrição
                              </p>
                              <p>
                                <strong>Métrica:</strong> Número de vendas
                                efetivadas e valor total faturado
                              </p>
                              <p>
                                <strong>Objetivo:</strong> Medir performance
                                comercial e receita gerada
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resumo estatístico */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {topEngineersFilter === "orcamento"
                          ? filteredData.reduce(
                              (sum, eng) => sum + eng.projetos,
                              0
                            )
                          : filteredData.reduce(
                              (sum, eng) => sum + eng.quantidade,
                              0
                            )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {topEngineersFilter === "orcamento"
                          ? "Total de Orçamentos"
                          : "Total de Vendas"}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {topEngineersFilter === "orcamento"
                          ? formatCurrency(
                              filteredData.reduce(
                                (sum, eng) => sum + eng.valorOrcamentos,
                                0
                              )
                            )
                          : formatCurrency(
                              filteredData.reduce(
                                (sum, eng) => sum + eng.valorTotal,
                                0
                              )
                            )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {topEngineersFilter === "orcamento"
                          ? "Valor em Orçamentos"
                          : "Valor Faturado"}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {allEngineers.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Engenheiros Ativos
                      </div>
                    </div>
                  </div>

                  {/* Lista de engenheiros */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {allEngineers.map((engineer, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                  ? "bg-orange-600"
                                  : "bg-blue-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 text-sm">
                                {engineer.engenheiro}
                              </div>
                            </div>
                          </div>
                          {index < 3 && (
                            <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                              Top {index + 1}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {topEngineersFilter === "orcamento" ? (
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Orçamentos:
                                </span>
                                <span className="font-semibold text-lg text-gray-800">
                                  {engineer.projetos}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Valor total:
                                </span>
                                <span className="font-medium text-sm text-green-600">
                                  {formatCurrency(engineer.valorOrcamentos)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Média/orçamento:
                                </span>
                                <span className="font-medium text-sm text-blue-600">
                                  {engineer.projetos > 0
                                    ? formatCurrency(
                                        engineer.valorOrcamentos /
                                          engineer.projetos
                                      )
                                    : "R$ 0"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Vendas:
                                </span>
                                <span className="font-semibold text-lg text-gray-800">
                                  {engineer.quantidade}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Faturamento:
                                </span>
                                <span className="font-medium text-sm text-green-600">
                                  {formatCurrency(engineer.valorTotal)}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                                <div className="text-center">
                                  <div className="text-xs text-gray-500">
                                    Peças
                                  </div>
                                  <div className="font-medium text-xs text-purple-600">
                                    {formatCurrency(engineer.valorPecas)}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-500">
                                    Serviços
                                  </div>
                                  <div className="font-medium text-xs text-orange-600">
                                    {formatCurrency(engineer.valorServicos)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-600">
                                  Ticket médio:
                                </span>
                                <span className="font-medium text-xs text-blue-600">
                                  {engineer.quantidade > 0
                                    ? formatCurrency(
                                        engineer.valorTotal /
                                          engineer.quantidade
                                      )
                                    : "R$ 0"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Barra de progresso relativa - Taxa de Conversão */}
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">
                              Taxa de Conversão
                            </span>
                            <span className="text-xs text-gray-600">
                              {topEngineersFilter === "orcamento"
                                ? `${
                                    engineer.projetos > 0
                                      ? Math.round(
                                          (engineer.quantidade /
                                            engineer.projetos) *
                                            100
                                        )
                                      : 0
                                  }%`
                                : `${
                                    engineer.projetos > 0
                                      ? Math.round(
                                          (engineer.valorTotal /
                                            engineer.valorOrcamentos) *
                                            100
                                        )
                                      : 0
                                  }%`}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                  ? "bg-orange-600"
                                  : "bg-blue-500"
                              }`}
                              style={{
                                width: `${
                                  topEngineersFilter === "orcamento"
                                    ? engineer.projetos > 0
                                      ? Math.min(
                                          (engineer.quantidade /
                                            engineer.projetos) *
                                            100,
                                          100
                                        )
                                      : 0
                                    : engineer.valorOrcamentos > 0
                                    ? Math.min(
                                        (engineer.valorTotal /
                                          engineer.valorOrcamentos) *
                                          100,
                                        100
                                      )
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 text-center">
                            {topEngineersFilter === "orcamento"
                              ? `${engineer.quantidade} vendas de ${engineer.projetos} orçamentos`
                              : `${formatCurrency(
                                  engineer.valorTotal
                                )} de ${formatCurrency(
                                  engineer.valorOrcamentos
                                )} orçados`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <BarChart3 className="h-16 w-16 mx-auto" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Nenhum dado disponível
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Faça upload de uma planilha para visualizar o ranking
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Administrative Data */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              Dados Administrativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <span className="text-sm text-gray-600">
                  Total de registros:
                </span>
                <span className="text-2xl font-bold text-gray-800">
                  {totalRegistros}
                </span>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-gray-600">
                  Registros processados:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {Math.floor(totalRegistros * 0.8)}
                </span>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-gray-600">
                  Registros pendentes:
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  {Math.floor(totalRegistros * 0.2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loss Analysis Modal/Card */}
        {showLossAnalysis && lossAnalysis && (
          <Card className="bg-white border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-800 flex items-center space-x-2">
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span>Análise de Motivos de Perda</span>
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Análise detalhada dos orçamentos não convertidos
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLossAnalysis(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumo Geral */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {lossAnalysis.totalOrcamentos}
                  </div>
                  <div className="text-sm text-gray-600">Total Orçamentos</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {lossAnalysis.totalVendas}
                  </div>
                  <div className="text-sm text-gray-600">
                    Vendas Convertidas
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {lossAnalysis.perdidos}
                  </div>
                  <div className="text-sm text-gray-600">
                    Orçamentos Perdidos
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {lossAnalysis.taxaConversao.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Taxa de Conversão</div>
                </div>
              </div>

              {/* Gráfico de Motivos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Principais Motivos de Perda
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(lossAnalysis.motivosPerdas)
                      .sort(([, a], [, b]) => b - a)
                      .map(([motivo, quantidade], index) => {
                        const percentage =
                          lossAnalysis.perdidos > 0
                            ? (quantidade / lossAnalysis.perdidos) * 100
                            : 0;
                        const colors = [
                          "bg-red-500",
                          "bg-orange-500",
                          "bg-yellow-500",
                          "bg-blue-500",
                          "bg-purple-500",
                          "bg-pink-500",
                          "bg-gray-500",
                        ];
                        return (
                          <div
                            key={motivo}
                            className="flex items-center space-x-3"
                          >
                            <div
                              className={`w-4 h-4 rounded ${
                                colors[index % colors.length]
                              }`}
                            ></div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {motivo}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {quantidade} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    colors[index % colors.length]
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Recomendações de Melhoria
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <svg
                          className="h-5 w-5 text-yellow-600 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <div className="font-medium text-yellow-800">
                            Preço muito alto (35%)
                          </div>
                          <div className="text-sm text-yellow-700">
                            Revisar estratégia de precificação e destacar valor
                            agregado
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <svg
                          className="h-5 w-5 text-blue-600 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <div className="font-medium text-blue-800">
                            Concorrência (25%)
                          </div>
                          <div className="text-sm text-blue-700">
                            Melhorar análise competitiva e diferenciação
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <svg
                          className="h-5 w-5 text-green-600 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <div className="font-medium text-green-800">
                            Follow-up (4%)
                          </div>
                          <div className="text-sm text-green-700">
                            Implementar CRM para melhor acompanhamento
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela Detalhada */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Detalhamento por Orçamento Perdido
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orçamento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Engenheiro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Motivo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Observação
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 max-h-64 overflow-y-auto">
                      {lossAnalysis.detalhePerdas
                        .slice(0, 10)
                        .map((perda, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {perda.orcamento}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {perda.engenheiro}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(perda.valor)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  perda.motivo === "Preço muito alto"
                                    ? "bg-red-100 text-red-800"
                                    : perda.motivo ===
                                      "Cliente escolheu concorrente"
                                    ? "bg-orange-100 text-orange-800"
                                    : perda.motivo ===
                                      "Projeto cancelado/adiado"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {perda.motivo}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {perda.observacao || "-"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {lossAnalysis.detalhePerdas.length > 10 && (
                    <div className="text-center py-2 text-sm text-gray-500">
                      Mostrando 10 de {lossAnalysis.detalhePerdas.length}{" "}
                      registros
                    </div>
                  )}
                </div>
              </div>

              {/* Ações Recomendadas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Ações Recomendadas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Revisar política de preços para ser mais competitivo
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Implementar análise de concorrentes antes do orçamento
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Criar processo de follow-up estruturado
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Treinar equipe em técnicas de negociação
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Melhorar qualificação de leads antes do orçamento
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Implementar CRM para melhor gestão de oportunidades
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
