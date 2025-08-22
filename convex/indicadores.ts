import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Função para dividir array em chunks menores
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Salvar dados de indicadores
export const saveIndicadores = mutation({
  args: {
    processedData: v.object({
      montagens: v.array(v.any()),
      desmontagens: v.array(v.any()),
      testes: v.array(v.any()),
      apontamentos: v.array(v.any()),
    }),
    filters: v.object({
      executante: v.string(),
      setor: v.string(),
      orcamento: v.string(),
    }),
    filesInfo: v.object({
      desmontagens: v.optional(
        v.object({
          name: v.string(),
          size: v.number(),
          lastModified: v.number(),
        })
      ),
      montagens: v.optional(
        v.object({
          name: v.string(),
          size: v.number(),
          lastModified: v.number(),
        })
      ),
      testesAprovados: v.optional(
        v.object({
          name: v.string(),
          size: v.number(),
          lastModified: v.number(),
        })
      ),
      testesReprovados: v.optional(
        v.object({
          name: v.string(),
          size: v.number(),
          lastModified: v.number(),
        })
      ),
    }),
    uploadedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sessionId = `session_${now}`;

    // Remove dados antigos
    const existingSessions = await ctx.db.query("indicadoresSession").collect();
    const existingData = await ctx.db.query("indicadoresData").collect();

    for (const session of existingSessions) {
      await ctx.db.delete(session._id);
    }
    for (const data of existingData) {
      await ctx.db.delete(data._id);
    }

    // Cria nova sessão
    const totalRecords =
      args.processedData.montagens.length +
      args.processedData.desmontagens.length +
      args.processedData.testes.length;

    await ctx.db.insert("indicadoresSession", {
      sessionId,
      filters: args.filters,
      filesInfo: args.filesInfo,
      uploadedBy: args.uploadedBy,
      uploadedAt: new Date().toISOString(),
      totalRecords,
      createdAt: now,
      updatedAt: now,
    });

    // Salvar dados em chunks menores (máx 100 registros por chunk)
    const chunkSize = 100;

    const dataTypes = [
      { type: "montagens", data: args.processedData.montagens },
      { type: "desmontagens", data: args.processedData.desmontagens },
      { type: "testes", data: args.processedData.testes },
    ];

    for (const { type, data } of dataTypes) {
      if (data.length > 0) {
        const chunks = chunkArray(data, chunkSize);
        for (let i = 0; i < chunks.length; i++) {
          await ctx.db.insert("indicadoresData", {
            sessionId,
            dataType: type,
            data: chunks[i],
            chunkIndex: i,
            createdAt: now,
          });
        }
      }
    }

    return { sessionId, success: true };
  },
});

// Carregar informações da sessão de indicadores
export const getIndicadoresSession = query({
  args: {},
  handler: async (ctx) => {
    const session = await ctx.db
      .query("indicadoresSession")
      .order("desc")
      .first();
    return session;
  },
});

// Carregar dados de indicadores por tipo
export const getIndicadoresData = query({
  args: {
    sessionId: v.string(),
    dataType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("indicadoresData")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId));

    if (args.dataType) {
      const chunks = await query
        .filter((q) => q.eq(q.field("dataType"), args.dataType))
        .order("asc")
        .collect();

      // Reagrupa os chunks em ordem
      return chunks
        .sort((a, b) => a.chunkIndex - b.chunkIndex)
        .flatMap((chunk) => chunk.data);
    } else {
      // Retorna todos os dados agrupados por tipo
      const allChunks = await query.order("asc").collect();

      const result = {
        montagens: [] as any[],
        desmontagens: [] as any[],
        testes: [] as any[],
        apontamentos: [] as any[],
      };

      // Agrupa por tipo e ordena por chunkIndex
      const groupedChunks = allChunks.reduce(
        (acc, chunk) => {
          if (!acc[chunk.dataType]) acc[chunk.dataType] = [];
          acc[chunk.dataType].push(chunk);
          return acc;
        },
        {} as Record<string, typeof allChunks>
      );

      for (const [type, chunks] of Object.entries(groupedChunks)) {
        const sortedChunks = chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
        const data = sortedChunks.flatMap((chunk) => chunk.data);
        if (type in result) {
          (result as any)[type] = data;
        }
      }

      // Gera apontamentos (todos os dados juntos)
      result.apontamentos = [
        ...result.montagens,
        ...result.desmontagens,
        ...result.testes,
      ];

      return result;
    }
  },
});

// Limpar dados de indicadores
export const clearIndicadores = mutation({
  args: {},
  handler: async (ctx) => {
    const existingSessions = await ctx.db.query("indicadoresSession").collect();
    const existingData = await ctx.db.query("indicadoresData").collect();

    for (const session of existingSessions) {
      await ctx.db.delete(session._id);
    }
    for (const data of existingData) {
      await ctx.db.delete(data._id);
    }

    return { success: true };
  },
});
