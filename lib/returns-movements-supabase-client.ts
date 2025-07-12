import { supabase } from "./supabase-client";

// ===== INTERFACES DEVOLUÇÕES =====

export interface DevolucaoData {
  id?: number;
  total: number;
  pendentes: number;
  concluidas: number;
  created_at?: string;
  updated_at?: string;
}

export interface DevolucaoItem {
  id?: number;
  os: string;
  cliente?: string;
  produto?: string;
  motivo?: string;
  status: string;
  data_devolucao?: string;
  data_resolucao?: string;
  responsavel?: string;
  valor?: number;
  observacoes?: string;
  raw_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DevolucaoUpload {
  id?: number;
  file_name: string;
  uploaded_by?: string;
  upload_date?: string;
  total_records: number;
  status: string;
}

// ===== INTERFACES MOVIMENTAÇÕES =====

export interface MovimentacaoData {
  id?: number;
  total: number;
  entrada: number;
  saida: number;
  created_at?: string;
  updated_at?: string;
}

export interface MovimentacaoItem {
  id?: number;
  os: string;
  tipo: string; // 'entrada' ou 'saida'
  produto?: string;
  quantidade?: number;
  valor_unitario?: number;
  valor_total?: number;
  data_movimentacao?: string;
  origem?: string;
  destino?: string;
  responsavel?: string;
  observacoes?: string;
  raw_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface MovimentacaoUpload {
  id?: number;
  file_name: string;
  uploaded_by?: string;
  upload_date?: string;
  total_records: number;
  status: string;
}

// ===== FUNÇÕES DEVOLUÇÕES =====

export async function saveDevolucaoData(
  devolucaoData: DevolucaoData,
  items: DevolucaoItem[],
  fileName: string,
  uploadedBy?: string
) {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    // Registra o upload
    const { data: uploadRecord, error: uploadError } = await supabase
      .from("devolucoes_uploads")
      .insert({
        file_name: fileName,
        uploaded_by: uploadedBy || "Usuário Anônimo",
        total_records: items.length,
        status: "processing",
      })
      .select()
      .single();

    if (uploadError) throw uploadError;

    // Limpa dados existentes
    await supabase.from("devolucoes_data").delete().neq("id", 0);
    await supabase.from("devolucoes_itens").delete().neq("id", 0);

    // Insere dados resumidos
    const { error: devolucaoError } = await supabase
      .from("devolucoes_data")
      .insert({
        total: devolucaoData.total,
        pendentes: devolucaoData.pendentes,
        concluidas: devolucaoData.concluidas,
      });

    if (devolucaoError) throw devolucaoError;

    // Insere itens individuais
    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("devolucoes_itens")
        .insert(
          items.map((item) => ({
            os: item.os,
            cliente: item.cliente,
            produto: item.produto,
            motivo: item.motivo,
            status: item.status,
            data_devolucao: item.data_devolucao,
            data_resolucao: item.data_resolucao,
            responsavel: item.responsavel,
            valor: item.valor,
            observacoes: item.observacoes,
            raw_data: item.raw_data,
          }))
        );

      if (itemsError) throw itemsError;
    }

    // Atualiza status do upload
    await supabase
      .from("devolucoes_uploads")
      .update({ status: "completed" })
      .eq("id", uploadRecord.id);

    return { success: true, uploadId: uploadRecord.id };
  } catch (error: any) {
    if (error?.code === "42P01" || error?.code === "PGRST116") {
      alert(
        "As tabelas de devoluções ainda não existem no banco.\n" +
          "Execute o script 'scripts/create-returns-movements-tables.sql' no Supabase " +
          "e tente salvar novamente."
      );
    } else {
      alert(
        "Erro ao salvar dados de devoluções. Verifique o console para mais detalhes."
      );
    }

    return { success: false, error };
  }
}

export async function loadDevolucaoData(): Promise<{
  devolucaoData: DevolucaoData | null;
  items: DevolucaoItem[];
}> {
  if (!supabase) {
    return { devolucaoData: null, items: [] };
  }

  try {
    // Dados principais
    const { data: devolucaoData, error: devolucaoError } = await supabase
      .from("devolucoes_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (
      devolucaoError &&
      devolucaoError.code !== "PGRST116" &&
      devolucaoError.code !== "42P01"
    ) {
      throw devolucaoError;
    }

    // Itens individuais
    const { data: items, error: itemsError } = await supabase
      .from("devolucoes_itens")
      .select("*")
      .order("created_at", { ascending: false });

    if (itemsError && itemsError.code !== "42P01") {
      throw itemsError;
    }

    return {
      devolucaoData: devolucaoData || null,
      items: items || [],
    };
  } catch (error) {
    return { devolucaoData: null, items: [] };
  }
}

export async function getDevolucaoUploadHistory(): Promise<DevolucaoUpload[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("devolucoes_uploads")
      .select("*")
      .order("upload_date", { ascending: false })
      .limit(10);

    if (error && error.code !== "42P01" && error.code !== "PGRST116") {
      throw error;
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

// ===== FUNÇÕES MOVIMENTAÇÕES =====

export async function saveMovimentacaoData(
  movimentacaoData: MovimentacaoData,
  items: MovimentacaoItem[],
  fileName: string,
  uploadedBy?: string
) {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    // Registra o upload
    const { data: uploadRecord, error: uploadError } = await supabase
      .from("movimentacoes_uploads")
      .insert({
        file_name: fileName,
        uploaded_by: uploadedBy || "Usuário Anônimo",
        total_records: items.length,
        status: "processing",
      })
      .select()
      .single();

    if (uploadError) throw uploadError;

    // Limpa dados existentes
    await supabase.from("movimentacoes_data").delete().neq("id", 0);
    await supabase.from("movimentacoes_itens").delete().neq("id", 0);

    // Insere dados resumidos
    const { error: movimentacaoError } = await supabase
      .from("movimentacoes_data")
      .insert({
        total: movimentacaoData.total,
        entrada: movimentacaoData.entrada,
        saida: movimentacaoData.saida,
      });

    if (movimentacaoError) throw movimentacaoError;

    // Insere itens individuais
    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("movimentacoes_itens")
        .insert(
          items.map((item) => ({
            os: item.os,
            tipo: item.tipo,
            produto: item.produto,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
            valor_total: item.valor_total,
            data_movimentacao: item.data_movimentacao,
            origem: item.origem,
            destino: item.destino,
            responsavel: item.responsavel,
            observacoes: item.observacoes,
            raw_data: item.raw_data,
          }))
        );

      if (itemsError) throw itemsError;
    }

    // Atualiza status do upload
    await supabase
      .from("movimentacoes_uploads")
      .update({ status: "completed" })
      .eq("id", uploadRecord.id);

    return { success: true, uploadId: uploadRecord.id };
  } catch (error: any) {
    if (error?.code === "42P01" || error?.code === "PGRST116") {
      alert(
        "As tabelas de movimentações ainda não existem no banco.\n" +
          "Execute o script 'scripts/create-returns-movements-tables.sql' no Supabase " +
          "e tente salvar novamente."
      );
    } else {
      alert(
        "Erro ao salvar dados de movimentações. Verifique o console para mais detalhes."
      );
    }

    return { success: false, error };
  }
}

export async function loadMovimentacaoData(): Promise<{
  movimentacaoData: MovimentacaoData | null;
  items: MovimentacaoItem[];
}> {
  if (!supabase) {
    return { movimentacaoData: null, items: [] };
  }

  try {
    // Dados principais
    const { data: movimentacaoData, error: movimentacaoError } = await supabase
      .from("movimentacoes_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (
      movimentacaoError &&
      movimentacaoError.code !== "PGRST116" &&
      movimentacaoError.code !== "42P01"
    ) {
      throw movimentacaoError;
    }

    // Itens individuais
    const { data: items, error: itemsError } = await supabase
      .from("movimentacoes_itens")
      .select("*")
      .order("created_at", { ascending: false });

    if (itemsError && itemsError.code !== "42P01") {
      throw itemsError;
    }

    return {
      movimentacaoData: movimentacaoData || null,
      items: items || [],
    };
  } catch (error) {
    return { movimentacaoData: null, items: [] };
  }
}

export async function getMovimentacaoUploadHistory(): Promise<
  MovimentacaoUpload[]
> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("movimentacoes_uploads")
      .select("*")
      .order("upload_date", { ascending: false })
      .limit(10);

    if (error && error.code !== "42P01" && error.code !== "PGRST116") {
      throw error;
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

// ===== FUNÇÕES AUXILIARES =====

export async function clearAllDevolucaoData() {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    await supabase.from("devolucoes_data").delete().neq("id", 0);
    await supabase.from("devolucoes_itens").delete().neq("id", 0);
    await supabase.from("devolucoes_uploads").delete().neq("id", 0);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function clearAllMovimentacaoData() {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    await supabase.from("movimentacoes_data").delete().neq("id", 0);
    await supabase.from("movimentacoes_itens").delete().neq("id", 0);
    await supabase.from("movimentacoes_uploads").delete().neq("id", 0);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
