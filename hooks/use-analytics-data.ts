import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  useSaveAnalyticsData,
  useAnalyticsData as useLoadAnalyticsData,
  useUploadHistory,
  useClearAnalyticsData,
  useInitializeAnalyticsUpload,
  useSaveAnalyticsDataBatch,
  useSaveAnalyticsRawDataBatch,
  useFinalizeAnalyticsUpload,
  type AnalyticsData,
  type AnalyticsUpload,
  type RawDataRow,
} from "@/lib/convex-analytics-client";
import { mapEngineerResponsible } from "@/lib/engineer-mapping";

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
  cliente?: string;
}

export function useAnalyticsData() {
  // Convex hooks
  const savedData = useLoadAnalyticsData();
  const uploadHistoryData = useUploadHistory();
  const saveAnalyticsMutation = useSaveAnalyticsData();
  const clearDataMutation = useClearAnalyticsData();

  // Batch processing hooks
  const initializeUpload = useInitializeAnalyticsUpload();
  const saveDataBatch = useSaveAnalyticsDataBatch();
  const saveRawDataBatch = useSaveAnalyticsRawDataBatch();
  const finalizeUpload = useFinalizeAnalyticsUpload();

  const [uploadedData, setUploadedData] = useState<DataRow[]>([]);
  const [rawData, setRawData] = useState<RawDataRow[]>([]);
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

  // Auto-sync when Convex query returns/changes
  useEffect(() => {
    if (!savedData) {
      setUploadedData([]);
      setRawData([]);
      return;
    }
    const { data: loadedData, rawData: savedRawData } = savedData;
    if (loadedData && loadedData.length > 0) {
      const convertedData: DataRow[] = loadedData.map((item) => ({
        engenheiro: item.engenheiro,
        ano: item.ano,
        mes: item.mes,
        registros: item.registros,
        servicos: item.servicos,
        pecas: item.pecas,
        valorTotal: item.valorTotal,
        valorPecas: item.valorPecas,
        valorServicos: item.valorServicos,
        valorOrcamentos: item.valorOrcamentos,
        projetos: item.projetos,
        quantidade: item.quantidade,
        cliente: item.cliente,
      }));
      setUploadedData(convertedData);
      setRawData(savedRawData || []);
    } else {
      setUploadedData([]);
      setRawData([]);
    }
  }, [savedData]);

  useEffect(() => {
    if (uploadHistoryData) {
      setUploadHistory(uploadHistoryData);
    }
  }, [uploadHistoryData]);

  // Função para carregar dados salvos
  const loadSavedData = async () => {
    setIsLoading(true);
    try {
      console.log("Loading saved data...", savedData);
      if (savedData) {
        const { data: loadedData, rawData: savedRawData } = savedData;
        console.log(
          `Loaded ${loadedData?.length || 0} analytics items and ${savedRawData?.length || 0} raw data items`
        );
        if (loadedData && loadedData.length > 0) {
          const convertedData: DataRow[] = loadedData.map((item) => ({
            engenheiro: item.engenheiro,
            ano: item.ano,
            mes: item.mes,
            registros: item.registros,
            servicos: item.servicos,
            pecas: item.pecas,
            valorTotal: item.valorTotal,
            valorPecas: item.valorPecas,
            valorServicos: item.valorServicos,
            valorOrcamentos: item.valorOrcamentos,
            projetos: item.projetos,
            quantidade: item.quantidade,
            cliente: item.cliente,
          }));
          console.log("Setting uploaded data:", convertedData.length, "items");
          setUploadedData(convertedData);
          // Now we load raw data from the database too
          console.log("Setting raw data:", savedRawData?.length || 0, "items");
          setRawData(savedRawData || []);
        } else {
          console.log("No data loaded from database");
          setUploadedData([]);
          setRawData([]);
        }
      } else {
        console.log("No saved data found");
        setUploadedData([]);
        setRawData([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setUploadedData([]);
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUploadHistory = async () => {
    try {
      if (uploadHistoryData) {
        setUploadHistory(uploadHistoryData);
      }
    } catch (error) {}
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
          (header) =>
            header &&
            (header.toLowerCase().includes("nro orçamento") ||
              header.toLowerCase().includes("nro orcamento") ||
              header.toLowerCase().includes("número orçamento") ||
              header.toLowerCase().includes("numero orcamento") ||
              header.toLowerCase().includes("orçamento") ||
              header.toLowerCase().includes("orcamento") ||
              header.toLowerCase().includes("budget"))
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

        // Mapa para rastrear orçamentos únicos convertidos por engenheiro
        const uniqueConversions: { [key: string]: Set<string> } = {};

        // Processa cada linha de dados (pula as 3 primeiras linhas: linha 1, 2 e cabeçalho na linha 3)
        for (let i = 3; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          const responsavelOriginal =
            responsavelIndex !== -1
              ? row[responsavelIndex]?.toString() || "Vendedor não informado"
              : "Vendedor não informado";

          // Aplica o mapeamento do responsável
          const responsavel = mapEngineerResponsible(responsavelOriginal);
          const valorStr =
            valorIndex !== -1 ? row[valorIndex]?.toString() || "0" : "0";
          const descricao =
            descricaoIndex !== -1
              ? row[descricaoIndex]?.toString() || "Não informado"
              : "Não informado";

          // Extrai o cliente se disponível
          const cliente =
            parceiroIndex !== -1 && row[parceiroIndex]
              ? row[parceiroIndex]?.toString().trim()
              : "Cliente não informado";

          // Extrai o ID do orçamento se disponível
          const orcamentoId =
            orcamentoIndex !== -1 && row[orcamentoIndex]
              ? row[orcamentoIndex]?.toString().trim()
              : undefined;

          // Processa a data de negociação
          let ano = 2025;
          let mes = 6; // Padrão junho ao invés de janeiro

          if (dtNegIndex !== -1 && row[dtNegIndex]) {
            const dtNegStr = row[dtNegIndex].toString().trim();

            // Tenta diferentes formatos de data
            let dataProcessada: Date | null = null;

            // Se for um número (data do Excel)
            if (!isNaN(Number(dtNegStr)) && dtNegStr.length > 4) {
              // Excel armazena datas como números (dias desde 1900-01-01)
              const excelDate = Number(dtNegStr);
              dataProcessada = new Date((excelDate - 25569) * 86400 * 1000);
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
                  }
                }
              }
            }

            if (dataProcessada && !isNaN(dataProcessada.getTime())) {
              ano = dataProcessada.getFullYear();
              mes = dataProcessada.getMonth() + 1;
            }
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
              cliente: undefined, // Não agrupa por cliente - isso será feito na análise
            };
            // Inicializa o set de conversões únicas para este engenheiro
            uniqueConversions[chaveUnica] = new Set();
          }

          const stats = engineerStats[chaveUnica];
          stats.registros += 1;

          // Soma os valores baseado no tipo de operação
          if (isVendaNormal) {
            stats.pecas += 1;
            stats.valorPecas += valor;
            stats.valorTotal += valor;

            // Adiciona ao set de conversões únicas se tiver ID do orçamento
            if (orcamentoId) {
              uniqueConversions[chaveUnica].add(orcamentoId);
            } else {
              // Se não tiver ID do orçamento, incrementa diretamente (fallback)
              stats.quantidade += 1;
            }
          } else if (isVendaServicos) {
            stats.servicos += 1;
            stats.valorServicos += valor;
            stats.valorTotal += valor;

            // Adiciona ao set de conversões únicas se tiver ID do orçamento
            if (orcamentoId) {
              uniqueConversions[chaveUnica].add(orcamentoId);
            } else {
              // Se não tiver ID do orçamento, incrementa diretamente (fallback)
              stats.quantidade += 1;
            }
          } else if (isOrcamento) {
            stats.valorOrcamentos += valor;
            stats.projetos += 1;
          }
        }

        // Após processar todas as linhas, atualiza as quantidades com base nos orçamentos únicos
        Object.keys(engineerStats).forEach((chaveUnica) => {
          const stats = engineerStats[chaveUnica];
          const conversionsSet = uniqueConversions[chaveUnica];

          // Se temos IDs de orçamento, usa o tamanho do set (orçamentos únicos)
          if (conversionsSet && conversionsSet.size > 0) {
            stats.quantidade = conversionsSet.size;
          }
        });

        // Converte o objeto em array
        const finalData = Object.values(engineerStats);

        // Atualiza o estado
        setUploadedData(finalData);

        // Armazena dados brutos para análise do cliente
        const rawRows: RawDataRow[] = [];
        for (let i = 3; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          const responsavelOriginal =
            responsavelIndex !== -1
              ? row[responsavelIndex]?.toString() || "Vendedor não informado"
              : "Vendedor não informado";

          // Aplica o mapeamento do responsável
          const responsavel = mapEngineerResponsible(responsavelOriginal);
          const valorStr =
            valorIndex !== -1 ? row[valorIndex]?.toString() || "0" : "0";
          const descricao =
            descricaoIndex !== -1
              ? row[descricaoIndex]?.toString() || "Não informado"
              : "Não informado";
          const cliente =
            parceiroIndex !== -1 && row[parceiroIndex]
              ? row[parceiroIndex]?.toString().trim()
              : "Cliente não informado";
          const orcamentoId =
            orcamentoIndex !== -1 && row[orcamentoIndex]
              ? row[orcamentoIndex]?.toString().trim()
              : null;

          // Processa a data para esta linha específica
          let ano = 2025;
          let mes = 6;
          if (dtNegIndex !== -1 && row[dtNegIndex]) {
            const dtNegStr = row[dtNegIndex].toString().trim();
            let dataProcessada: Date | null = null;

            if (!isNaN(Number(dtNegStr)) && dtNegStr.length > 4) {
              const excelDate = Number(dtNegStr);
              dataProcessada = new Date((excelDate - 25569) * 86400 * 1000);
            } else {
              const formatosBrasil = [
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
                /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
                /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
                /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
              ];

              for (const formato of formatosBrasil) {
                const match = dtNegStr.match(formato);
                if (match) {
                  if (
                    formato.source.includes("(\\d{4})-(\\d{1,2})-(\\d{1,2})")
                  ) {
                    dataProcessada = new Date(
                      Number.parseInt(match[1]),
                      Number.parseInt(match[2]) - 1,
                      Number.parseInt(match[3])
                    );
                  } else {
                    let anoCompleto = Number.parseInt(match[3]);
                    if (anoCompleto < 100) {
                      anoCompleto += 2000;
                    }
                    dataProcessada = new Date(
                      anoCompleto,
                      Number.parseInt(match[2]) - 1,
                      Number.parseInt(match[1])
                    );
                  }
                  break;
                }
              }

              if (!dataProcessada || isNaN(dataProcessada.getTime())) {
                if (dtNegStr.includes("/")) {
                  const partes = dtNegStr.split("/");
                  if (partes.length === 3) {
                    const dataAmericana = `${partes[1]}/${partes[0]}/${partes[2]}`;
                    dataProcessada = new Date(dataAmericana);
                  }
                }
              }
            }

            if (dataProcessada && !isNaN(dataProcessada.getTime())) {
              ano = dataProcessada.getFullYear();
              mes = dataProcessada.getMonth() + 1;
            }
          }

          const valor =
            Number.parseFloat(
              valorStr
                .toString()
                .replace(/[^\d,.-]/g, "")
                .replace(",", ".")
            ) || 0;

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

          rawRows.push({
            responsavel,
            cliente,
            ano,
            mes,
            valor,
            descricao,
            orcamentoId,
            isOrcamento,
            isVendaNormal,
            isVendaServicos,
          });
        }
        setRawData(rawRows);

        // Contadores por tipo para o relatório
        let totalOrcamentos = 0;
        let totalVendaNormal = 0;
        let totalVendaServicos = 0;
        let totalOutros = 0;
        let totalIgnorados = 0;

        // Conta os tipos de registros
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
          }
        }

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

        // Verificar se a correção foi aplicada e mostrar resultado
        const correcaoAplicada = orcamentoIndex !== -1;
        const totalConversoes = finalData.reduce(
          (sum, eng) => sum + eng.quantidade,
          0
        );
        const totalLinhasVenda = finalData.reduce(
          (sum, eng) => sum + eng.servicos + eng.pecas,
          0
        );

        let alertMessage =
          `Planilha carregada com sucesso!\n\n` +
          `📊 RESUMO DOS REGISTROS:\n` +
          `• Orçamentos de Venda: ${totalOrcamentos}\n` +
          `• Venda Normal/Peças: ${totalVendaNormal}\n` +
          `• Venda de Serviços: ${totalVendaServicos}\n` +
          `• Outros tipos: ${totalOutros}\n` +
          `• Linhas ignoradas: ${totalIgnorados}\n\n` +
          `👥 ${finalData.length} engenheiros processados\n` +
          `📋 ${jsonData.length - 3} registros totais\n\n`;

        if (correcaoAplicada) {
          alertMessage +=
            `✅ CORREÇÃO DA TAXA DE CONVERSÃO APLICADA!\n` +
            `• Orçamentos únicos convertidos: ${totalConversoes}\n` +
            `• Linhas de venda na planilha: ${totalLinhasVenda}\n` +
            `• Taxa de conversão agora é baseada em orçamentos únicos\n\n`;
        } else {
          alertMessage +=
            `⚠️ TAXA DE CONVERSÃO BASEADA EM LINHAS DE VENDA\n` +
            `• Para melhor precisão, inclua uma coluna com ID do orçamento\n\n`;
        }

        alert(alertMessage);
      } catch (error) {
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
      const analyticsData = uploadedData.map((item) => ({
        engenheiro: item.engenheiro,
        ano: item.ano,
        mes: item.mes,
        registros: item.registros,
        servicos: item.servicos,
        pecas: item.pecas,
        valorTotal: item.valorTotal,
        valorPecas: item.valorPecas,
        valorServicos: item.valorServicos,
        valorOrcamentos: item.valorOrcamentos,
        projetos: item.projetos,
        quantidade: item.quantidade,
        cliente: item.cliente,
      }));

      // Check if we need batch processing (Convex limit is around 8000 items)
      const BATCH_SIZE = 5000; // Conservative batch size
      const needsBatchProcessing =
        rawData.length > BATCH_SIZE || analyticsData.length > BATCH_SIZE;

      let result;

      console.log(
        `Processing ${rawData.length} raw data items and ${analyticsData.length} analytics items`
      );
      console.log(`Needs batch processing: ${needsBatchProcessing}`);

      if (needsBatchProcessing) {
        // Use batch processing for large datasets
        console.log("Starting batch processing...");
        const initResult = await initializeUpload({
          fileName,
          uploadedBy: "Paloma",
          totalRecords: rawData.length,
        });

        console.log("Initialize upload result:", initResult);
        if (!initResult.success) {
          throw new Error("Falha ao inicializar upload");
        }

        // Process analytics data in batches
        console.log(
          `Processing ${analyticsData.length} analytics items in batches of ${BATCH_SIZE}`
        );
        for (let i = 0; i < analyticsData.length; i += BATCH_SIZE) {
          const batch = analyticsData.slice(i, i + BATCH_SIZE);
          console.log(
            `Saving analytics batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batch.length} items`
          );
          const batchResult = await saveDataBatch({
            data: batch,
            uploadId: initResult.uploadId!,
          });

          console.log(`Analytics batch result:`, batchResult);
          if (!batchResult.success) {
            throw new Error(
              `Falha ao salvar lote ${Math.floor(i / BATCH_SIZE) + 1}`
            );
          }
        }

        // Process raw data in batches
        console.log(
          `Processing ${rawData.length} raw data items in batches of ${BATCH_SIZE}`
        );
        for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
          const batch = rawData.slice(i, i + BATCH_SIZE);

          // Sanitize batch data: convert null to undefined for Convex compatibility
          const sanitizedBatch = batch.map((item) => ({
            ...item,
            orcamentoId:
              item.orcamentoId === null ? undefined : item.orcamentoId,
          }));

          console.log(
            `Saving raw data batch ${Math.floor(i / BATCH_SIZE) + 1} with ${sanitizedBatch.length} items`
          );
          const batchResult = await saveRawDataBatch({
            rawData: sanitizedBatch,
            uploadId: initResult.uploadId!,
          });

          console.log(`Raw data batch result:`, batchResult);
          if (!batchResult.success) {
            throw new Error(
              `Falha ao salvar dados brutos lote ${Math.floor(i / BATCH_SIZE) + 1}`
            );
          }
        }

        // Finalize upload
        console.log("Finalizing upload...");
        result = await finalizeUpload({
          uploadId: initResult.uploadId!,
        });
        console.log("Finalize result:", result);
      } else {
        // Use single mutation for small datasets
        console.log("Using single mutation for small dataset...");
        // Sanitize rawData: convert null to undefined for Convex compatibility
        const sanitizedRawData = rawData.map((item) => ({
          ...item,
          orcamentoId: item.orcamentoId === null ? undefined : item.orcamentoId,
        }));

        console.log(
          `Saving ${analyticsData.length} analytics items and ${sanitizedRawData.length} raw data items`
        );
        result = await saveAnalyticsMutation({
          data: analyticsData,
          rawData: sanitizedRawData,
          fileName,
          uploadedBy: "Paloma",
        });
        console.log("Single mutation result:", result);
      }

      console.log("Final result:", result);
      if (result.success) {
        console.log("Data saved successfully!");
        setSaveStatus("saved");
        await loadUploadHistory();
        setTimeout(() => setSaveStatus("idle"), 3000);
        alert(
          "Dados salvos com sucesso! Agora outras pessoas podem visualizar estes dados."
        );
      } else {
        console.error("Failed to save data:", result.error);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);

        // Verifica se é erro de migração
        if (result.error === "migration_needed") {
          alert(
            "Para salvar com dados de cliente, execute primeiro o script de migração no Supabase:\n\n" +
              "1. Acesse o painel do Supabase\n" +
              "2. Vá para SQL Editor\n" +
              "3. Execute: scripts/migrate-analytics-add-cliente.sql\n\n" +
              "Depois tente salvar novamente."
          );
        } else {
          alert("Erro ao salvar dados. Tente novamente.");
        }
      }
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
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
        await clearDataMutation();
        setUploadedData([]);
        setRawData([]);
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
    loadSavedData,
    loadUploadHistory,
    handleFileUpload,
    handleSaveData,
    handleClearData,
    generateDetailedReport,
    rawData,
    setRawData,
  };
}
