import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AnalyticsData {
  id?: number
  engenheiro: string
  ano: number
  mes: number
  registros: number
  servicos: number
  pecas: number
  valor_total: number
  valor_pecas: number
  valor_servicos: number
  valor_orcamentos: number
  projetos: number
  quantidade: number
  created_at?: string
  updated_at?: string
}

export interface AnalyticsUpload {
  id?: number
  file_name: string
  uploaded_by?: string
  upload_date?: string
  total_records: number
  status: string
}

// Função para salvar dados da planilha
export async function saveAnalyticsData(data: AnalyticsData[], fileName: string, uploadedBy?: string) {
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
      .single()

    if (uploadError) throw uploadError

    // Limpa dados existentes (opcional - você pode querer manter histórico)
    await supabase.from("analytics_data").delete().neq("id", 0)

    // Insere novos dados
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
      })),
    )

    if (dataError) throw dataError

    // Atualiza status do upload
    await supabase.from("analytics_uploads").update({ status: "completed" }).eq("id", uploadRecord.id)

    return { success: true, uploadId: uploadRecord.id }
  } catch (error) {
    console.error("Erro ao salvar dados:", error)
    return { success: false, error }
  }
}

// Função para carregar dados salvos
export async function loadAnalyticsData(): Promise<AnalyticsData[]> {
  try {
    const { data, error } = await supabase.from("analytics_data").select("*").order("engenheiro", { ascending: true })

    if (error) throw error

    return data.map((item) => ({
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
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))
  } catch (error) {
    console.error("Erro ao carregar dados:", error)
    return []
  }
}

// Função para obter histórico de uploads
export async function getUploadHistory(): Promise<AnalyticsUpload[]> {
  try {
    const { data, error } = await supabase
      .from("analytics_uploads")
      .select("*")
      .order("upload_date", { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Erro ao carregar histórico:", error)
    return []
  }
}

// Função para limpar todos os dados
export async function clearAllAnalyticsData() {
  try {
    await supabase.from("analytics_data").delete().neq("id", 0)
    await supabase.from("analytics_uploads").delete().neq("id", 0)
    return { success: true }
  } catch (error) {
    console.error("Erro ao limpar dados:", error)
    return { success: false, error }
  }
}
