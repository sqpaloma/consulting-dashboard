import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the client if environment variables are available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export interface DashboardData {
  id?: number;
  total_itens: number;
  aguardando_aprovacao: number;
  analises: number;
  orcamentos: number;
  em_execucao: number;
  devolucoes: number;
  movimentacoes: number;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardItem {
  id?: number;
  os: string;
  titulo?: string;
  cliente?: string;
  responsavel?: string;
  status: string;
  data_registro?: string;
  raw_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardUpload {
  id?: number;
  file_name: string;
  uploaded_by?: string;
  upload_date?: string;
  total_records: number;
  status: string;
}

// Função para salvar dados do dashboard
export async function saveDashboardData(
  dashboardData: DashboardData,
  items: DashboardItem[],
  fileName: string,
  uploadedBy?: string
) {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    // Primeiro, registra o upload
    const { data: uploadRecord, error: uploadError } = await supabase
      .from("dashboard_uploads")
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
    await supabase.from("dashboard_data").delete().neq("id", 0);
    await supabase.from("dashboard_itens").delete().neq("id", 0);

    // Insere dados do dashboard
    const { error: dashboardError } = await supabase
      .from("dashboard_data")
      .insert({
        total_itens: dashboardData.total_itens,
        aguardando_aprovacao: dashboardData.aguardando_aprovacao,
        analises: dashboardData.analises,
        orcamentos: dashboardData.orcamentos,
        em_execucao: dashboardData.em_execucao,
        devolucoes: dashboardData.devolucoes,
        movimentacoes: dashboardData.movimentacoes,
      });

    if (dashboardError) throw dashboardError;

    // Insere itens individuais
    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("dashboard_itens")
        .insert(
          items.map((item) => ({
            os: item.os,
            titulo: item.titulo,
            cliente: item.cliente,
            responsavel: item.responsavel,
            status: item.status,
            data_registro: item.data_registro,
            raw_data: item.raw_data,
          }))
        );

      if (itemsError) throw itemsError;
    }

    // Atualiza status do upload
    await supabase
      .from("dashboard_uploads")
      .update({ status: "completed" })
      .eq("id", uploadRecord.id);

    return { success: true, uploadId: uploadRecord.id };
  } catch (error: any) {
    const friendly = {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    };

    if (error?.code === "42P01" || error?.code === "PGRST116") {
      alert(
        "As tabelas do dashboard ainda não existem no banco.\n" +
          "Execute uma única vez o script 'scripts/create-dashboard-tables.sql' no Supabase " +
          "e tente salvar novamente."
      );
    } else {
      alert(
        "Erro ao salvar dados do dashboard. Verifique o console para mais detalhes."
      );
    }

    return { success: false, error: friendly };
  }
}

// Função para carregar dados do dashboard
export async function loadDashboardData(): Promise<{
  dashboardData: DashboardData | null;
  items: DashboardItem[];
}> {
  if (!supabase) {
    return { dashboardData: null, items: [] };
  }

  try {
    // ----- dados principais -----
    const { data: dashboardData, error: dashboardError } = await supabase
      .from("dashboard_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // se a tabela ainda não existir, ignoramos o erro
    if (
      dashboardError &&
      dashboardError.code !== "PGRST116" &&
      dashboardError.code !== "42P01"
    ) {
      throw dashboardError;
    }

    // ----- itens individuais -----
    const { data: items, error: itemsError } = await supabase
      .from("dashboard_itens")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100000); // Limite muito alto para garantir todos os itens

    if (itemsError && itemsError.code !== "42P01") {
      throw itemsError;
    }

    return {
      dashboardData: dashboardData || null,
      items: items || [],
    };
  } catch (error) {
    return { dashboardData: null, items: [] };
  }
}

// Função para obter histórico de uploads do dashboard
export async function getDashboardUploadHistory(): Promise<DashboardUpload[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("dashboard_uploads")
      .select("*")
      .order("upload_date", { ascending: false })
      .limit(10);

    // Se a tabela ainda não existir (código 42P01 no Postgres ou PGRST116 no Supabase),
    // simplesmente devolvemos lista vazia para evitar quebra da aplicação.
    if (error && error.code !== "42P01" && error.code !== "PGRST116") {
      throw error;
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

// Função para limpar todos os dados do dashboard
export async function clearAllDashboardData() {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    await supabase.from("dashboard_data").delete().neq("id", 0);
    await supabase.from("dashboard_itens").delete().neq("id", 0);
    await supabase.from("dashboard_uploads").delete().neq("id", 0);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

// Função para obter itens por categoria
export async function getDashboardItemsByCategory(
  category: string
): Promise<DashboardItem[]> {
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase.from("dashboard_itens").select("*");

    switch (category) {
      case "total":
        // Retorna todos os itens sem filtro
        break;
      case "aprovacao":
        query = query.or(
          "status.ilike.%aguardando%,status.ilike.%pendente%,status.ilike.%aprovação%,status.ilike.%aprovacao%"
        );
        break;
      case "analises":
        query = query.or(
          "status.ilike.%análise%,status.ilike.%analise%,status.ilike.%revisão%,status.ilike.%revisao%"
        );
        break;
      case "orcamentos":
        query = query.or(
          "status.ilike.%orçamento%,status.ilike.%orcamento%,status.ilike.%cotação%,status.ilike.%cotacao%"
        );
        break;
      case "execucao":
        query = query.or(
          "status.ilike.%execução%,status.ilike.%execucao%,status.ilike.%andamento%,status.ilike.%progresso%"
        );
        break;
      default:
        // Retorna todos os itens
        break;
    }

    const { data, error } = await query
      .order("created_at", {
        ascending: false,
      })
      .limit(100000); // Limite muito alto para garantir todos os itens

    if (error && error.code !== "42P01") throw error;

    return data || [];
  } catch (error) {
    return [];
  }
}

// Função para obter responsáveis únicos
export async function getUniqueResponsaveis(): Promise<string[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data: allItems, error: itemsError } = await supabase
      .from("dashboard_itens")
      .select("responsavel")
      .limit(50000);

    if (itemsError) {
      if (itemsError.code === "42P01" || itemsError.code === "PGRST116") {
        return [];
      }
      throw itemsError;
    }

    if (!allItems || allItems.length === 0) {
      return [];
    }

    const uniqueResponsaveis = Array.from(
      new Set(
        allItems
          .map((item) => item.responsavel)
          .filter(
            (responsavel): responsavel is string =>
              responsavel !== null &&
              responsavel !== undefined &&
              responsavel.trim() !== "" &&
              responsavel !== "Não informado"
          )
      )
    ).sort();

    return uniqueResponsaveis;
  } catch (error) {
    return [];
  }
}

// Função para obter itens por responsável
export async function getDashboardItemsByResponsavel(
  responsavel: string
): Promise<DashboardItem[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("dashboard_itens")
      .select("*")
      .eq("responsavel", responsavel)
      .order("created_at", { ascending: false })
      .limit(100000); // Limite muito alto para garantir todos os itens

    if (error && error.code !== "42P01") throw error;
    return data || [];
  } catch (error) {
    return [];
  }
}
