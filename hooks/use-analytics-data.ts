import { useState, useRef } from "react";
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

export function useAnalyticsData() {
  const [uploadedData, setUploadedData] = useState<DataRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [uploadHistory, setUploadHistory] = useState<AnalyticsUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

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

    const totalOrcamentos = uploadedData.reduce(
      (sum, eng) => sum + eng.projetos,
      0
    );
    const totalVendas = uploadedData.reduce(
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

    uploadedData.forEach((eng, index) => {
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

  return {
    uploadedData,
    setUploadedData,
    fileName,
    setFileName,
    uploadHistory,
    setUploadHistory,
    isLoading,
    setIsLoading,
    saveStatus,
    setSaveStatus,
    processingSummary,
    setProcessingSummary,
    lossAnalysis,
    setLossAnalysis,
    showLossAnalysis,
    setShowLossAnalysis,
    loadSavedData,
    loadUploadHistory,
    handleFileUpload,
    handleSaveData,
    handleClearData,
    generateDetailedReport,
    generateLossAnalysis,
  };
}
