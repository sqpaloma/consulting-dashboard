import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ===== INTERFACES DEVOLUÇÕES =====

export interface DevolucaoData {
  _id?: Id<"devolucoesData">;
  total: number;
  pendentes: number;
  concluidas: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface DevolucaoItem {
  _id?: Id<"devolucoesItens">;
  os: string;
  cliente?: string;
  produto?: string;
  motivo?: string;
  status: string;
  dataDevolucao?: string;
  dataResolucao?: string;
  responsavel?: string;
  valor?: number;
  observacoes?: string;
  rawData?: any;
  createdAt?: number;
  updatedAt?: number;
}

export interface DevolucaoUpload {
  _id?: Id<"devolucoesUploads">;
  fileName: string;
  uploadedBy?: string;
  uploadDate?: string;
  totalRecords: number;
  status: string;
  createdAt?: number;
  updatedAt?: number;
}

// ===== INTERFACES MOVIMENTAÇÕES =====

export interface MovimentacaoData {
  _id?: Id<"movimentacoesData">;
  total: number;
  entrada: number;
  saida: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface MovimentacaoItem {
  _id?: Id<"movimentacoesItens">;
  os: string;
  tipo: string; // 'entrada' ou 'saida'
  produto?: string;
  quantidade?: number;
  valorUnitario?: number;
  valorTotal?: number;
  dataMovimentacao?: string;
  origem?: string;
  destino?: string;
  responsavel?: string;
  observacoes?: string;
  rawData?: any;
  createdAt?: number;
  updatedAt?: number;
}

export interface MovimentacaoUpload {
  _id?: Id<"movimentacoesUploads">;
  fileName: string;
  uploadedBy?: string;
  uploadDate?: string;
  totalRecords: number;
  status: string;
  createdAt?: number;
  updatedAt?: number;
}

// ===== FUNÇÕES DEVOLUÇÕES =====

export const saveDevolucaoData = mutation({
  args: {
    devolucaoData: v.object({
      total: v.number(),
      pendentes: v.number(),
      concluidas: v.number(),
    }),
    items: v.array(v.object({
      os: v.string(),
      cliente: v.optional(v.string()),
      produto: v.optional(v.string()),
      motivo: v.optional(v.string()),
      status: v.string(),
      dataDevolucao: v.optional(v.string()),
      dataResolucao: v.optional(v.string()),
      responsavel: v.optional(v.string()),
      valor: v.optional(v.number()),
      observacoes: v.optional(v.string()),
      rawData: v.optional(v.any()),
    })),
    fileName: v.string(),
    uploadedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Registra o upload
      const uploadRecord = await ctx.db.insert("devolucoesUploads", {
        fileName: args.fileName,
        uploadedBy: args.uploadedBy || "Usuário Anônimo",
        uploadDate: new Date().toISOString(),
        totalRecords: args.items.length,
        status: "processing",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Limpa dados existentes
      const existingData = await ctx.db.query("devolucoesData").collect();
      for (const data of existingData) {
        await ctx.db.delete(data._id);
      }

      const existingItems = await ctx.db.query("devolucoesItens").collect();
      for (const item of existingItems) {
        await ctx.db.delete(item._id);
      }

      // Insere dados resumidos
      await ctx.db.insert("devolucoesData", {
        total: args.devolucaoData.total,
        pendentes: args.devolucaoData.pendentes,
        concluidas: args.devolucaoData.concluidas,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Insere itens individuais
      if (args.items.length > 0) {
        for (const item of args.items) {
          await ctx.db.insert("devolucoesItens", {
            os: item.os,
            cliente: item.cliente,
            produto: item.produto,
            motivo: item.motivo,
            status: item.status,
            dataDevolucao: item.dataDevolucao,
            dataResolucao: item.dataResolucao,
            responsavel: item.responsavel,
            valor: item.valor,
            observacoes: item.observacoes,
            rawData: item.rawData,
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

export const loadDevolucaoData = query({
  handler: async (ctx) => {
    try {
      // Dados principais
      const devolucaoDataList = await ctx.db
        .query("devolucoesData")
        .order("desc")
        .take(1);

      const devolucaoData = devolucaoDataList[0] || null;

      // Itens individuais
      const items = await ctx.db
        .query("devolucoesItens")
        .order("desc")
        .collect();

      return {
        devolucaoData,
        items: items || [],
      };
    } catch (error) {
      return { devolucaoData: null, items: [] };
    }
  },
});

export const getDevolucaoUploadHistory = query({
  handler: async (ctx) => {
    try {
      const data = await ctx.db
        .query("devolucoesUploads")
        .order("desc")
        .take(10);

      return data || [];
    } catch (error) {
      return [];
    }
  },
});

// ===== FUNÇÕES MOVIMENTAÇÕES =====

export const saveMovimentacaoData = mutation({
  args: {
    movimentacaoData: v.object({
      total: v.number(),
      entrada: v.number(),
      saida: v.number(),
    }),
    items: v.array(v.object({
      os: v.string(),
      tipo: v.string(),
      produto: v.optional(v.string()),
      quantidade: v.optional(v.number()),
      valorUnitario: v.optional(v.number()),
      valorTotal: v.optional(v.number()),
      dataMovimentacao: v.optional(v.string()),
      origem: v.optional(v.string()),
      destino: v.optional(v.string()),
      responsavel: v.optional(v.string()),
      observacoes: v.optional(v.string()),
      rawData: v.optional(v.any()),
    })),
    fileName: v.string(),
    uploadedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Registra o upload
      const uploadRecord = await ctx.db.insert("movimentacoesUploads", {
        fileName: args.fileName,
        uploadedBy: args.uploadedBy || "Usuário Anônimo",
        uploadDate: new Date().toISOString(),
        totalRecords: args.items.length,
        status: "processing",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Limpa dados existentes
      const existingData = await ctx.db.query("movimentacoesData").collect();
      for (const data of existingData) {
        await ctx.db.delete(data._id);
      }

      const existingItems = await ctx.db.query("movimentacoesItens").collect();
      for (const item of existingItems) {
        await ctx.db.delete(item._id);
      }

      // Insere dados resumidos
      await ctx.db.insert("movimentacoesData", {
        total: args.movimentacaoData.total,
        entrada: args.movimentacaoData.entrada,
        saida: args.movimentacaoData.saida,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Insere itens individuais
      if (args.items.length > 0) {
        for (const item of args.items) {
          await ctx.db.insert("movimentacoesItens", {
            os: item.os,
            tipo: item.tipo,
            produto: item.produto,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.valorTotal,
            dataMovimentacao: item.dataMovimentacao,
            origem: item.origem,
            destino: item.destino,
            responsavel: item.responsavel,
            observacoes: item.observacoes,
            rawData: item.rawData,
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

export const loadMovimentacaoData = query({
  handler: async (ctx) => {
    try {
      // Dados principais
      const movimentacaoDataList = await ctx.db
        .query("movimentacoesData")
        .order("desc")
        .take(1);

      const movimentacaoData = movimentacaoDataList[0] || null;

      // Itens individuais
      const items = await ctx.db
        .query("movimentacoesItens")
        .order("desc")
        .collect();

      return {
        movimentacaoData,
        items: items || [],
      };
    } catch (error) {
      return { movimentacaoData: null, items: [] };
    }
  },
});

export const getMovimentacaoUploadHistory = query({
  handler: async (ctx) => {
    try {
      const data = await ctx.db
        .query("movimentacoesUploads")
        .order("desc")
        .take(10);

      return data || [];
    } catch (error) {
      return [];
    }
  },
});

// ===== FUNÇÕES AUXILIARES =====

export const clearAllDevolucaoData = mutation({
  handler: async (ctx) => {
    try {
      // Limpa dados de devoluções
      const devolucoesData = await ctx.db.query("devolucoesData").collect();
      for (const data of devolucoesData) {
        await ctx.db.delete(data._id);
      }

      const devolucoesItens = await ctx.db.query("devolucoesItens").collect();
      for (const item of devolucoesItens) {
        await ctx.db.delete(item._id);
      }

      const devolucoesUploads = await ctx.db.query("devolucoesUploads").collect();
      for (const upload of devolucoesUploads) {
        await ctx.db.delete(upload._id);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

export const clearAllMovimentacaoData = mutation({
  handler: async (ctx) => {
    try {
      // Limpa dados de movimentações
      const movimentacoesData = await ctx.db.query("movimentacoesData").collect();
      for (const data of movimentacoesData) {
        await ctx.db.delete(data._id);
      }

      const movimentacoesItens = await ctx.db.query("movimentacoesItens").collect();
      for (const item of movimentacoesItens) {
        await ctx.db.delete(item._id);
      }

      const movimentacoesUploads = await ctx.db.query("movimentacoesUploads").collect();
      for (const upload of movimentacoesUploads) {
        await ctx.db.delete(upload._id);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});