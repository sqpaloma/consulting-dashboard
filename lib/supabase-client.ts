import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the client if environment variables are available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export interface AnalyticsData {
  id?: number;
  engenheiro: string;
  ano: number;
  mes: number;
  registros: number;
  servicos: number;
  pecas: number;
  valor_total: number;
  valor_pecas: number;
  valor_servicos: number;
  valor_orcamentos: number;
  projetos: number;
  quantidade: number;
  cliente?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RawDataRow {
  responsavel: string;
  cliente: string;
  ano: number;
  mes: number;
  valor: number;
  descricao: string;
  orcamentoId: string | null;
  isOrcamento: boolean;
  isVendaNormal: boolean;
  isVendaServicos: boolean;
}

export interface AnalyticsUpload {
  id: number;
  file_name: string;
  uploaded_by: string;
  upload_date: string;
  total_records: number;
  status: string;
}

// Função para salvar dados da planilha
export async function saveAnalyticsData(
  data: AnalyticsData[],
  rawData: RawDataRow[],
  fileName: string,
  uploadedBy?: string
) {
  if (!supabase) {
    console.warn(
      "Supabase client not initialized - environment variables missing"
    );
    return { success: false, error: "Supabase not configured" };
  }

  try {
    // Primeiro, registra o upload
    const { data: uploadRecord, error: uploadError } = await supabase
      .from("analytics_uploads")
      .insert({
        file_name: fileName,
        uploaded_by: uploadedBy || "Usuário Anônimo",
        total_records: data.length,
        status: "processing",
      })
      .select()
      .single();

    if (uploadError) throw uploadError;

    // Limpa dados existentes (opcional - você pode querer manter histórico)
    await supabase.from("analytics_data").delete().neq("id", 0);

    // Tenta limpar dados brutos se a tabela existir
    try {
      await supabase.from("analytics_raw_data").delete().neq("id", 0);
    } catch (rawDeleteError: any) {
      // Se a tabela não existir, ignora o erro
      if (
        rawDeleteError?.code !== "42P01" &&
        rawDeleteError?.code !== "PGRST116"
      ) {
        throw rawDeleteError;
      }
    }

    // Insere novos dados agregados
    const { error: dataError } = await supabase.from("analytics_data").insert(
      data.map((item) => ({
        engenheiro: item.engenheiro,
        ano: item.ano,
        mes: item.mes,
        registros: item.registros,
        servicos: item.servicos,
        pecas: item.pecas,
        valor_total: item.valor_total,
        valor_pecas: item.valor_pecas,
        valor_servicos: item.valor_servicos,
        valor_orcamentos: item.valor_orcamentos,
        projetos: item.projetos,
        quantidade: item.quantidade,
        cliente: item.cliente,
      }))
    );

    if (dataError) throw dataError;

    // Insere dados brutos se disponíveis e se a tabela existir
    if (rawData && rawData.length > 0) {
      try {
        const rawDataToInsert = rawData.map((item) => ({
          responsavel: item.responsavel,
          cliente: item.cliente,
          ano: item.ano,
          mes: item.mes,
          valor: item.valor,
          descricao: item.descricao,
          orcamento_id: item.orcamentoId,
          is_orcamento: item.isOrcamento,
          is_venda_normal: item.isVendaNormal,
          is_venda_servicos: item.isVendaServicos,
          upload_id: uploadRecord.id,
        }));

        const { error: rawDataError } = await supabase
          .from("analytics_raw_data")
          .insert(rawDataToInsert);

        if (rawDataError) throw rawDataError;
      } catch (rawInsertError: any) {
        // Se a tabela não existir, avisa o usuário mas não falha completamente
        if (
          rawInsertError?.code === "42P01" ||
          rawInsertError?.code === "PGRST116"
        ) {
          console.warn(
            "Tabela analytics_raw_data não existe - dados brutos não foram salvos"
          );
          // Continua sem falhar
        } else {
          throw rawInsertError;
        }
      }
    }

    // Atualiza status do upload
    await supabase
      .from("analytics_uploads")
      .update({ status: "completed" })
      .eq("id", uploadRecord.id);

    return { success: true, uploadId: uploadRecord.id };
  } catch (error: any) {
    console.error("Erro ao salvar dados:", error);

    // Tratamento específico para tabelas não existentes
    if (error?.code === "42P01" || error?.code === "PGRST116") {
      const friendly = {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      };
      console.error("Erro de tabela não encontrada:", friendly);

      return {
        success: false,
        error: "migration_needed",
        details:
          "Execute o script de migração primeiro: scripts/migrate-analytics-add-cliente.sql",
      };
    }

    return { success: false, error };
  }
}

// Função para carregar dados salvos
export async function loadAnalyticsData(): Promise<{
  data: AnalyticsData[];
  rawData: RawDataRow[];
}> {
  if (!supabase) {
    console.warn(
      "Supabase client not initialized - environment variables missing"
    );
    return { data: [], rawData: [] };
  }

  try {
    // Carrega dados agregados
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("analytics_data")
      .select("*")
      .order("engenheiro", { ascending: true });

    if (analyticsError) throw analyticsError;

    // Carrega dados brutos se a tabela existir
    let rawAnalyticsData: any[] = [];
    try {
      const { data: rawData, error: rawError } = await supabase
        .from("analytics_raw_data")
        .select("*")
        .order("created_at", { ascending: false });

      if (rawError) throw rawError;
      rawAnalyticsData = rawData || [];
    } catch (rawError: any) {
      // Se a tabela não existir, ignora e continua com array vazio
      if (rawError?.code !== "42P01" && rawError?.code !== "PGRST116") {
        throw rawError;
      }
      console.warn(
        "Tabela analytics_raw_data não existe - carregando apenas dados agregados"
      );
      rawAnalyticsData = [];
    }

    const convertedData: AnalyticsData[] = (analyticsData || []).map(
      (item) => ({
        id: item.id,
        engenheiro: item.engenheiro,
        ano: item.ano,
        mes: item.mes,
        registros: item.registros,
        servicos: item.servicos,
        pecas: item.pecas,
        valor_total: item.valor_total,
        valor_pecas: item.valor_pecas,
        valor_servicos: item.valor_servicos,
        valor_orcamentos: item.valor_orcamentos,
        projetos: item.projetos,
        quantidade: item.quantidade,
        cliente: item.cliente,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })
    );

    // Converter dados brutos para o formato esperado
    const convertedRawData: RawDataRow[] = (rawAnalyticsData || []).map(
      (item) => ({
        responsavel: item.responsavel,
        cliente: item.cliente,
        ano: item.ano,
        mes: item.mes,
        valor: item.valor,
        descricao: item.descricao,
        orcamentoId: item.orcamento_id,
        isOrcamento: item.is_orcamento,
        isVendaNormal: item.is_venda_normal,
        isVendaServicos: item.is_venda_servicos,
      })
    );

    return { data: convertedData, rawData: convertedRawData };
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return { data: [], rawData: [] };
  }
}

// Função para obter histórico de uploads
export async function getUploadHistory(): Promise<AnalyticsUpload[]> {
  if (!supabase) {
    console.warn(
      "Supabase client not initialized - environment variables missing"
    );
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("analytics_uploads")
      .select("*")
      .order("upload_date", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    return [];
  }
}

// Função para limpar todos os dados
export async function clearAllAnalyticsData() {
  if (!supabase) {
    console.warn(
      "Supabase client not initialized - environment variables missing"
    );
    return { success: false, error: "Supabase not configured" };
  }

  try {
    await supabase.from("analytics_data").delete().neq("id", 0);
    await supabase.from("analytics_uploads").delete().neq("id", 0);

    // Tenta limpar dados brutos se a tabela existir
    try {
      await supabase.from("analytics_raw_data").delete().neq("id", 0);
    } catch (rawError: any) {
      // Se a tabela não existir, ignora o erro
      if (rawError?.code !== "42P01" && rawError?.code !== "PGRST116") {
        throw rawError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    return { success: false, error };
  }
}
