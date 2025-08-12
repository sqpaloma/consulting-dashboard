import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Dashboard Data interface
export interface DashboardData {
  _id?: Id<"dashboardData">;
  totalItens: number;
  aguardandoAprovacao: number;
  analises: number;
  orcamentos: number;
  emExecucao: number;
  pronto: number;
  devolucoes: number;
  movimentacoes: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface DashboardItem {
  _id?: Id<"dashboardItens">;
  os: string;
  titulo?: string;
  cliente?: string;
  responsavel?: string;
  status: string;
  dataRegistro?: string;
  rawData?: any;
  createdAt?: number;
  updatedAt?: number;
}

export interface DashboardUpload {
  _id?: Id<"dashboardUploads">;
  fileName: string;
  uploadedBy?: string;
  uploadDate?: string;
  totalRecords: number;
  status: string;
  createdAt?: number;
  updatedAt?: number;
}

// Função para salvar dados do dashboard
export const saveDashboardData = mutation({
  args: {
    dashboardData: v.object({
      totalItens: v.number(),
      aguardandoAprovacao: v.number(),
      analises: v.number(),
      orcamentos: v.number(),
      emExecucao: v.number(),
      pronto: v.number(),
      devolucoes: v.number(),
      movimentacoes: v.number(),
    }),
    items: v.array(v.object({
      os: v.string(),
      titulo: v.optional(v.string()),
      cliente: v.optional(v.string()),
      responsavel: v.optional(v.string()),
      status: v.string(),
      dataRegistro: v.optional(v.string()),
      rawData: v.optional(v.any()),
    })),
    fileName: v.string(),
    uploadedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Primeiro, registra o upload
      const uploadRecord = await ctx.db.insert("dashboardUploads", {
        fileName: args.fileName,
        uploadedBy: args.uploadedBy || "Usuário Anônimo",
        uploadDate: new Date().toISOString(),
        totalRecords: args.items.length,
        status: "processing",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Limpa dados existentes
      const existingData = await ctx.db.query("dashboardData").collect();
      for (const data of existingData) {
        await ctx.db.delete(data._id);
      }

      const existingItems = await ctx.db.query("dashboardItens").collect();
      for (const item of existingItems) {
        await ctx.db.delete(item._id);
      }

      // Insere dados do dashboard
      await ctx.db.insert("dashboardData", {
        totalItens: args.dashboardData.totalItens,
        aguardandoAprovacao: args.dashboardData.aguardandoAprovacao,
        analises: args.dashboardData.analises,
        orcamentos: args.dashboardData.orcamentos,
        emExecucao: args.dashboardData.emExecucao,
        pronto: args.dashboardData.pronto,
        devolucoes: args.dashboardData.devolucoes,
        movimentacoes: args.dashboardData.movimentacoes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Insere itens individuais
      if (args.items.length > 0) {
        for (const item of args.items) {
          await ctx.db.insert("dashboardItens", {
            os: item.os,
            titulo: item.titulo,
            cliente: item.cliente,
            responsavel: item.responsavel,
            status: item.status,
            dataRegistro: item.dataRegistro,
            rawData: item.rawData,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }

      // Atualiza status do upload
      await ctx.db.patch(uploadRecord, { status: "completed", updatedAt: Date.now() });

      return { success: true, uploadId: uploadRecord };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Função para carregar dados do dashboard
export const loadDashboardData = query({
  handler: async (ctx) => {
    try {
      // ----- dados principais -----
      const dashboardDataList = await ctx.db
        .query("dashboardData")
        .order("desc")
        .take(1);
      
      const dashboardData = dashboardDataList[0] || null;

      // ----- itens individuais -----
      const items = await ctx.db
        .query("dashboardItens")
        .order("desc")
        .collect();

      return {
        dashboardData,
        items: items || [],
      };
    } catch (error) {
      return { dashboardData: null, items: [] };
    }
  },
});

// Função para obter histórico de uploads do dashboard
export const getDashboardUploadHistory = query({
  handler: async (ctx) => {
    try {
      const data = await ctx.db
        .query("dashboardUploads")
        .order("desc")
        .take(10);

      return data || [];
    } catch (error) {
      return [];
    }
  },
});

// Função para limpar todos os dados do dashboard
export const clearAllDashboardData = mutation({
  handler: async (ctx) => {
    try {
      // Limpa dados do dashboard
      const dashboardData = await ctx.db.query("dashboardData").collect();
      for (const data of dashboardData) {
        await ctx.db.delete(data._id);
      }

      // Limpa itens do dashboard
      const dashboardItens = await ctx.db.query("dashboardItens").collect();
      for (const item of dashboardItens) {
        await ctx.db.delete(item._id);
      }

      // Limpa uploads do dashboard
      const dashboardUploads = await ctx.db.query("dashboardUploads").collect();
      for (const upload of dashboardUploads) {
        await ctx.db.delete(upload._id);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

// Função para obter itens por categoria
export const getDashboardItemsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    try {
      let items = await ctx.db.query("dashboardItens").collect();

      switch (args.category) {
        case "total":
          break;
        case "aprovacao":
          items = items.filter(item => 
            item.status.toLowerCase().includes("aguardando") ||
            item.status.toLowerCase().includes("pendente") ||
            item.status.toLowerCase().includes("aprovação") ||
            item.status.toLowerCase().includes("aprovacao")
          );
          break;
        case "analises":
          items = items.filter(item => 
            item.status.toLowerCase().includes("análise") ||
            item.status.toLowerCase().includes("analise") ||
            item.status.toLowerCase().includes("revisão") ||
            item.status.toLowerCase().includes("revisao")
          );
          break;
        case "orcamentos":
          items = items.filter(item => 
            item.status.toLowerCase().includes("orçamento") ||
            item.status.toLowerCase().includes("orcamento") ||
            item.status.toLowerCase().includes("cotação") ||
            item.status.toLowerCase().includes("cotacao")
          );
          break;
        case "execucao":
          items = items.filter(item => 
            item.status.toLowerCase().includes("execução") ||
            item.status.toLowerCase().includes("execucao") ||
            item.status.toLowerCase().includes("andamento") ||
            item.status.toLowerCase().includes("progresso")
          );
          break;
        case "pronto":
          items = items.filter(item => 
            item.status.toLowerCase().includes("pronto") ||
            item.status.toLowerCase().includes("concluído") ||
            item.status.toLowerCase().includes("concluido") ||
            item.status.toLowerCase().includes("finalizado") ||
            item.status.toLowerCase().includes("entregue")
          );
          break;
        default:
          break;
      }

      return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      return [];
    }
  },
});

// Função para obter responsáveis únicos
export const getUniqueResponsaveis = query({
  handler: async (ctx) => {
    try {
      const allItems = await ctx.db.query("dashboardItens").collect();

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
  },
});

// Função para obter itens por responsável
export const getDashboardItemsByResponsavel = query({
  args: { responsavel: v.string() },
  handler: async (ctx, args) => {
    try {
      const items = await ctx.db
        .query("dashboardItens")
        .withIndex("by_responsavel", (q) => q.eq("responsavel", args.responsavel))
        .collect();

      return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      return [];
    }
  },
});