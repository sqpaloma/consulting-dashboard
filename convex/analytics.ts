import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export interface AnalyticsData {
  _id?: Id<"analyticsData">;
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
  createdAt?: number;
  updatedAt?: number;
}

export interface RawDataRow {
  responsavel: string;
  cliente: string;
  ano: number;
  mes: number;
  valor: number;
  descricao: string;
  orcamentoId: string | undefined;
  isOrcamento: boolean;
  isVendaNormal: boolean;
  isVendaServicos: boolean;
}

export interface AnalyticsUpload {
  _id: Id<"analyticsUploads">;
  fileName: string;
  uploadedBy: string;
  uploadDate: string;
  totalRecords: number;
  status: string;
  createdAt: number;
  updatedAt: number;
}

// Função para inicializar um upload (sem dados)
export const initializeAnalyticsUpload = mutation({
  args: {
    fileName: v.string(),
    uploadedBy: v.optional(v.string()),
    totalRecords: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // Registra o upload
      const uploadRecord = await ctx.db.insert("analyticsUploads", {
        fileName: args.fileName,
        uploadedBy: args.uploadedBy || "Usuário Anônimo",
        uploadDate: new Date().toISOString(),
        totalRecords: args.totalRecords,
        status: "processing",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Nota: Não limpar dados existentes aqui para evitar limite de reads
      // A limpeza deve ser feita através da função clearAllAnalyticsData separadamente

      return { success: true, uploadId: uploadRecord };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Função para salvar dados agregados em lotes
export const saveAnalyticsDataBatch = mutation({
  args: {
    data: v.array(
      v.object({
        engenheiro: v.string(),
        ano: v.number(),
        mes: v.number(),
        registros: v.number(),
        servicos: v.number(),
        pecas: v.number(),
        valorTotal: v.number(),
        valorPecas: v.number(),
        valorServicos: v.number(),
        valorOrcamentos: v.number(),
        projetos: v.number(),
        quantidade: v.number(),
        cliente: v.optional(v.string()),
      })
    ),
    uploadId: v.id("analyticsUploads"),
  },
  handler: async (ctx, args) => {
    try {
      // Insere novos dados agregados
      for (const item of args.data) {
        await ctx.db.insert("analyticsData", {
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
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Função para salvar dados brutos em lotes
export const saveAnalyticsRawDataBatch = mutation({
  args: {
    rawData: v.array(
      v.object({
        responsavel: v.string(),
        cliente: v.string(),
        ano: v.number(),
        mes: v.number(),
        valor: v.number(),
        descricao: v.string(),
        orcamentoId: v.optional(v.string()),
        isOrcamento: v.boolean(),
        isVendaNormal: v.boolean(),
        isVendaServicos: v.boolean(),
      })
    ),
    uploadId: v.id("analyticsUploads"),
  },
  handler: async (ctx, args) => {
    try {
      // Insere dados brutos
      for (const item of args.rawData) {
        await ctx.db.insert("analyticsRawData", {
          responsavel: item.responsavel,
          cliente: item.cliente,
          ano: item.ano,
          mes: item.mes,
          valor: item.valor,
          descricao: item.descricao,
          orcamentoId: item.orcamentoId || undefined,
          isOrcamento: item.isOrcamento,
          isVendaNormal: item.isVendaNormal,
          isVendaServicos: item.isVendaServicos,
          uploadId: args.uploadId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Função para finalizar um upload
export const finalizeAnalyticsUpload = mutation({
  args: {
    uploadId: v.id("analyticsUploads"),
  },
  handler: async (ctx, args) => {
    try {
      // Atualiza status do upload
      await ctx.db.patch(args.uploadId, {
        status: "completed",
        updatedAt: Date.now(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Função para salvar dados da planilha (legacy - pequenos volumes)
export const saveAnalyticsData = mutation({
  args: {
    data: v.array(
      v.object({
        engenheiro: v.string(),
        ano: v.number(),
        mes: v.number(),
        registros: v.number(),
        servicos: v.number(),
        pecas: v.number(),
        valorTotal: v.number(),
        valorPecas: v.number(),
        valorServicos: v.number(),
        valorOrcamentos: v.number(),
        projetos: v.number(),
        quantidade: v.number(),
        cliente: v.optional(v.string()),
      })
    ),
    rawData: v.array(
      v.object({
        responsavel: v.string(),
        cliente: v.string(),
        ano: v.number(),
        mes: v.number(),
        valor: v.number(),
        descricao: v.string(),
        orcamentoId: v.optional(v.string()),
        isOrcamento: v.boolean(),
        isVendaNormal: v.boolean(),
        isVendaServicos: v.boolean(),
      })
    ),
    fileName: v.string(),
    uploadedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Primeiro, registra o upload
      const uploadRecord = await ctx.db.insert("analyticsUploads", {
        fileName: args.fileName,
        uploadedBy: args.uploadedBy || "Usuário Anônimo",
        uploadDate: new Date().toISOString(),
        totalRecords: args.data.length,
        status: "processing",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Limpa dados existentes de forma paginada para evitar limite de documentos
      let hasMoreData = true;
      while (hasMoreData) {
        const existingDataBatch = await ctx.db
          .query("analyticsData")
          .take(1000);
        if (existingDataBatch.length === 0) {
          hasMoreData = false;
        } else {
          for (const data of existingDataBatch) {
            await ctx.db.delete(data._id);
          }
        }
      }

      let hasMoreRawData = true;
      while (hasMoreRawData) {
        const existingRawDataBatch = await ctx.db
          .query("analyticsRawData")
          .take(1000);
        if (existingRawDataBatch.length === 0) {
          hasMoreRawData = false;
        } else {
          for (const rawData of existingRawDataBatch) {
            await ctx.db.delete(rawData._id);
          }
        }
      }

      // Insere novos dados agregados
      for (const item of args.data) {
        await ctx.db.insert("analyticsData", {
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
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      // Insere dados brutos se disponíveis
      if (args.rawData && args.rawData.length > 0) {
        for (const item of args.rawData) {
          await ctx.db.insert("analyticsRawData", {
            responsavel: item.responsavel,
            cliente: item.cliente,
            ano: item.ano,
            mes: item.mes,
            valor: item.valor,
            descricao: item.descricao,
            orcamentoId: item.orcamentoId || undefined,
            isOrcamento: item.isOrcamento,
            isVendaNormal: item.isVendaNormal,
            isVendaServicos: item.isVendaServicos,
            uploadId: uploadRecord,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }

      // Atualiza status do upload
      await ctx.db.patch(uploadRecord, {
        status: "completed",
        updatedAt: Date.now(),
      });

      return { success: true, uploadId: uploadRecord };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Função para carregar dados salvos
export const loadAnalyticsData = query({
  handler: async (ctx) => {
    try {
      // Carrega dados agregados
      const analyticsData = await ctx.db
        .query("analyticsData")
        .withIndex("by_engenheiro")
        .collect();

      const convertedData: AnalyticsData[] = (analyticsData || []).map(
        (item) => ({
          _id: item._id,
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
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })
      );

      // Não retornar dados brutos aqui para evitar respostas muito grandes.
      // Futuro: expor endpoint paginado para dados brutos quando necessário.
      return { data: convertedData, rawData: [] };
    } catch (error) {
      return { data: [], rawData: [] };
    }
  },
});

// Função para limpar todos os dados
export const clearAllAnalyticsData = mutation({
  handler: async (ctx) => {
    try {
      // Limpa dados agregados de forma paginada
      let hasMoreData = true;
      while (hasMoreData) {
        const analyticsDataBatch = await ctx.db
          .query("analyticsData")
          .take(1000);
        if (analyticsDataBatch.length === 0) {
          hasMoreData = false;
        } else {
          for (const data of analyticsDataBatch) {
            await ctx.db.delete(data._id);
          }
        }
      }

      // Limpa uploads de forma paginada
      let hasMoreUploads = true;
      while (hasMoreUploads) {
        const uploadsDataBatch = await ctx.db
          .query("analyticsUploads")
          .take(1000);
        if (uploadsDataBatch.length === 0) {
          hasMoreUploads = false;
        } else {
          for (const upload of uploadsDataBatch) {
            await ctx.db.delete(upload._id);
          }
        }
      }

      // Limpa dados brutos de forma paginada
      let hasMoreRawData = true;
      while (hasMoreRawData) {
        const analyticsRawDataBatch = await ctx.db
          .query("analyticsRawData")
          .take(1000);
        if (analyticsRawDataBatch.length === 0) {
          hasMoreRawData = false;
        } else {
          for (const rawData of analyticsRawDataBatch) {
            await ctx.db.delete(rawData._id);
          }
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Resumo por cliente (agregado no servidor)
export const getClientSummary = query({
  args: {
    year: v.optional(v.number()),
    month: v.optional(v.number()),
    engineer: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Carrega dados brutos com filtros e paginação para evitar limite de 32k leituras
    const MAX_DOCS = 30000; // abaixo do limite de 32k
    let rows: any[] = [];

    const baseQuery =
      args.year && args.month
        ? ctx.db
            .query("analyticsRawData")
            .withIndex("by_ano_mes", (q) =>
              q.eq("ano", args.year!).eq("mes", args.month!)
            )
        : ctx.db.query("analyticsRawData");

    // Única leitura capada (uma consulta, sem paginação)
    rows = await baseQuery.take(MAX_DOCS);

    const normalize = (s: string) =>
      s?.toLowerCase().replace(/\s+/g, "").trim();
    const engineerFilter = args.engineer ? normalize(args.engineer) : undefined;

    const map = new Map<
      string,
      {
        cliente: string;
        orcamentos: number;
        valorOrcamentos: number;
        faturamentos: number;
        valorFaturamentos: number;
      }
    >();
    const uniqueConvByClient = new Map<string, Set<string>>();
    const uniqueOrcByClient = new Map<string, Set<string>>();

    for (const r of rows) {
      if (args.year && r.ano !== args.year) continue;
      if (args.month && r.mes !== args.month) continue;
      if (engineerFilter && normalize(r.responsavel) !== engineerFilter)
        continue;

      const cliente = r.cliente || "Cliente não informado";
      if (!map.has(cliente)) {
        map.set(cliente, {
          cliente,
          orcamentos: 0,
          valorOrcamentos: 0,
          faturamentos: 0,
          valorFaturamentos: 0,
        });
        uniqueConvByClient.set(cliente, new Set());
        uniqueOrcByClient.set(cliente, new Set());
      }

      const agg = map.get(cliente)!;
      if (r.isOrcamento) {
        agg.valorOrcamentos += r.valor || 0;
        if (r.orcamentoId) uniqueOrcByClient.get(cliente)!.add(r.orcamentoId);
        else agg.orcamentos += 1;
      } else if (r.isVendaNormal || r.isVendaServicos) {
        agg.valorFaturamentos += r.valor || 0;
        if (r.orcamentoId) uniqueConvByClient.get(cliente)!.add(r.orcamentoId);
        else agg.faturamentos += 1;
      }
    }

    // Aplicar contagens únicas
    for (const [cliente, agg] of map.entries()) {
      const uo = uniqueOrcByClient.get(cliente)!;
      const uc = uniqueConvByClient.get(cliente)!;
      if (uo.size > 0) agg.orcamentos = uo.size;
      if (uc.size > 0) agg.faturamentos = uc.size;
    }

    // Ordenar e limitar
    const result = Array.from(map.values())
      .sort((a, b) => b.valorFaturamentos - a.valorFaturamentos)
      .slice(0, Math.max(1, Math.min(args.limit ?? 1000, 5000)));

    return result;
  },
});

// Função para obter histórico de uploads
export const getUploadHistory = query({
  handler: async (ctx) => {
    try {
      const data = await ctx.db
        .query("analyticsUploads")
        .order("desc")
        .take(10);

      return data || [];
    } catch (error) {
      return [];
    }
  },
});
