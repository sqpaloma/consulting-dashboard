import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ===== QUERIES =====

// Listar todas as cotações com filtros (incluindo pendências de cadastro)
export const listCotacoes = query({
  args: {
    status: v.optional(v.string()),
    solicitanteId: v.optional(v.id("users")),
    compradorId: v.optional(v.id("users")),
    busca: v.optional(v.string()),
    incluirHistorico: v.optional(v.boolean()),
    dataInicio: v.optional(v.number()),
    dataFim: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Buscar todas as cotações
    let cotacoes = await ctx.db.query("cotacoes").collect();
    
    // Buscar todas as pendências de cadastro
    let pendenciasCadastro = await ctx.db.query("pendenciasCadastro").collect();

    // Aplicar filtros às cotações
    if (args.status && args.status !== "all") {
      cotacoes = cotacoes.filter(c => c.status === args.status);
    }
    
    if (args.solicitanteId) {
      cotacoes = cotacoes.filter(c => c.solicitanteId === args.solicitanteId);
    }
    
    if (args.compradorId) {
      cotacoes = cotacoes.filter(c => c.compradorId === args.compradorId);
    }

    // Aplicar filtros às pendências de cadastro
    if (args.status && args.status !== "all") {
      // Mapear status de cotação para pendência
      const statusMapping: Record<string, string> = {
        "novo": "pendente",
        "em_cotacao": "em_andamento",
        "respondida": "concluida",
        "comprada": "concluida",
        "cancelada": "rejeitada"
      };
      const pendenciaStatus = statusMapping[args.status];
      if (pendenciaStatus) {
        pendenciasCadastro = pendenciasCadastro.filter(p => p.status === pendenciaStatus);
      } else {
        pendenciasCadastro = [];
      }
    }
    
    if (args.solicitanteId) {
      pendenciasCadastro = pendenciasCadastro.filter(p => p.solicitanteId === args.solicitanteId);
    }

    // Filtro por data
    if (args.dataInicio || args.dataFim) {
      cotacoes = cotacoes.filter(cotacao => {
        if (args.dataInicio && cotacao.createdAt < args.dataInicio) return false;
        if (args.dataFim && cotacao.createdAt > args.dataFim) return false;
        return true;
      });
      
      pendenciasCadastro = pendenciasCadastro.filter(pendencia => {
        if (args.dataInicio && pendencia.createdAt < args.dataInicio) return false;
        if (args.dataFim && pendencia.createdAt > args.dataFim) return false;
        return true;
      });
    }

    // Filtro por histórico
    if (!args.incluirHistorico) {
      cotacoes = cotacoes.filter(cotacao => 
        !["comprada", "cancelada"].includes(cotacao.status)
      );
      pendenciasCadastro = pendenciasCadastro.filter(pendencia => 
        !["concluida", "rejeitada"].includes(pendencia.status)
      );
    }

    // Busca textual
    if (args.busca) {
      const busca = args.busca.toLowerCase();
      cotacoes = cotacoes.filter(cotacao => {
        return (
          cotacao.numeroOS?.toLowerCase().includes(busca) ||
          cotacao.numeroOrcamento?.toLowerCase().includes(busca) ||
          cotacao.cliente?.toLowerCase().includes(busca) ||
          cotacao.numeroSequencial.toString().includes(busca)
        );
      });
      
      pendenciasCadastro = pendenciasCadastro.filter(pendencia => {
        return (
          pendencia.codigo.toLowerCase().includes(busca) ||
          pendencia.descricao.toLowerCase().includes(busca) ||
          pendencia.marca?.toLowerCase().includes(busca)
        );
      });
    }

    // Buscar dados dos usuários e itens para cada cotação
    const cotacoesComDados = await Promise.all(
      cotacoes.map(async (cotacao) => {
        const solicitante = await ctx.db.get(cotacao.solicitanteId);
        const comprador = cotacao.compradorId ? await ctx.db.get(cotacao.compradorId) : null;
        
        const itens = await ctx.db
          .query("cotacaoItens")
          .withIndex("by_cotacao", (q) => q.eq("cotacaoId", cotacao._id))
          .collect();

        return {
          ...cotacao,
          tipo: "cotacao" as const,
          solicitante,
          comprador,
          itens,
          totalItens: itens.length,
          valorTotal: itens.reduce((sum, item) => sum + (item.precoTotal || 0), 0),
          numeroSequencial: cotacao.numeroSequencial,
        };
      })
    );

    // Buscar dados das pendências de cadastro
    const pendenciasComDados = await Promise.all(
      pendenciasCadastro.map(async (pendencia) => {
        const solicitante = await ctx.db.get(pendencia.solicitanteId);
        const responsavel = pendencia.responsavelId ? await ctx.db.get(pendencia.responsavelId) : null;

        return {
          ...pendencia,
          tipo: "cadastro" as const,
          solicitante,
          comprador: responsavel, // Usar responsável como comprador para consistência
          itens: [], // Pendências de cadastro não têm itens
          totalItens: 1, // Representar como 1 item (a própria peça)
          valorTotal: 0, // Sem valor para cadastros
          numeroSequencial: pendencia.numeroSequencial, // Usar o número sequencial real
          // Mapear campos para consistência
          numeroOS: undefined,
          numeroOrcamento: undefined,
          cliente: undefined,
        };
      })
    );

    // Combinar ambas as listas
    const itemsCombinados = [...cotacoesComDados, ...pendenciasComDados];

    // Ordenar por número sequencial (mais recente primeiro)
    return itemsCombinados.sort((a, b) => {
      if (a.tipo === "cotacao" && b.tipo === "cotacao") {
        return b.numeroSequencial - a.numeroSequencial;
      }
      if (a.tipo === "cadastro" && b.tipo === "cadastro") {
        return b.createdAt - a.createdAt;
      }
      // Cotações primeiro, depois cadastros
      if (a.tipo === "cotacao" && b.tipo === "cadastro") return -1;
      if (a.tipo === "cadastro" && b.tipo === "cotacao") return 1;
      return 0;
    });
  },
});

// Buscar cotações pendentes para um usuário específico
export const getCotacoesPendentes = query({
  args: {
    usuarioId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const usuario = await ctx.db.get(args.usuarioId);
    if (!usuario) throw new Error("Usuário não encontrado");

    // Determinar quais status são pendentes para este usuário
    let statusPendentes: string[] = [];
    
    // Se é vendedor (solicitante), pendente quando status = "respondida"
    if (["consultor", "vendedor"].includes(usuario.role || "")) {
      statusPendentes = ["respondida"];
    }
    
    // Se é da compra, pendente quando status = "novo", "em_cotacao", "aprovada_para_compra"
    if (["admin", "compras", "gerente"].includes(usuario.role || "")) {
      statusPendentes = ["novo", "em_cotacao", "aprovada_para_compra"];
    }

    const cotacoes = await ctx.db.query("cotacoes").collect();
    
    const cotacoesPendentes = cotacoes.filter(cotacao => {
      if (statusPendentes.includes(cotacao.status)) {
        // Se é vendedor, só suas próprias cotações
        if (["consultor", "vendedor"].includes(usuario.role || "")) {
          return cotacao.solicitanteId === args.usuarioId;
        }
        // Se é da compra, todas as cotações pendentes
        return true;
      }
      return false;
    });

    // Buscar dados completos
    const cotacoesComDados = await Promise.all(
      cotacoesPendentes.map(async (cotacao) => {
        const solicitante = await ctx.db.get(cotacao.solicitanteId);
        const comprador = cotacao.compradorId ? await ctx.db.get(cotacao.compradorId) : null;
        
        const itens = await ctx.db
          .query("cotacaoItens")
          .withIndex("by_cotacao", (q) => q.eq("cotacaoId", cotacao._id))
          .collect();

        return {
          ...cotacao,
          solicitante,
          comprador,
          itens,
          totalItens: itens.length,
          valorTotal: itens.reduce((sum, item) => sum + (item.precoTotal || 0), 0),
        };
      })
    );

    return cotacoesComDados.sort((a, b) => b.numeroSequencial - a.numeroSequencial);
  },
});

// Buscar uma cotação específica com todos os dados
export const getCotacao = query({
  args: {
    cotacaoId: v.id("cotacoes"),
  },
  handler: async (ctx, args) => {
    const cotacao = await ctx.db.get(args.cotacaoId);
    if (!cotacao) throw new Error("Cotação não encontrada");

    const solicitante = await ctx.db.get(cotacao.solicitanteId);
    const comprador = cotacao.compradorId ? await ctx.db.get(cotacao.compradorId) : null;
    
    const itens = await ctx.db
      .query("cotacaoItens")
      .withIndex("by_cotacao", (q) => q.eq("cotacaoId", cotacao._id))
      .collect();

    const historico = await ctx.db
      .query("cotacaoHistorico")
      .withIndex("by_cotacao", (q) => q.eq("cotacaoId", cotacao._id))
      .collect();

    const historicoComUsuarios = await Promise.all(
      historico.map(async (item) => {
        const usuario = await ctx.db.get(item.usuarioId);
        return { ...item, usuario };
      })
    );

    return {
      ...cotacao,
      solicitante,
      comprador,
      itens,
      historico: historicoComUsuarios.sort((a, b) => b.createdAt - a.createdAt),
      totalItens: itens.length,
      valorTotal: itens.reduce((sum, item) => sum + (item.precoTotal || 0), 0),
    };
  },
});

// Buscar próximo número sequencial (unificado para cotações e cadastros)
export const getProximoNumero = query({
  handler: async (ctx) => {
    const ultimaCotacao = await ctx.db
      .query("cotacoes")
      .withIndex("by_numero")
      .order("desc")
      .first();

    const ultimaSolicitacao = await ctx.db
      .query("pendenciasCadastro")
      .withIndex("by_numero")
      .order("desc")
      .first();
    
    const maiorNumeroCotacao = ultimaCotacao?.numeroSequencial || 0;
    const maiorNumeroSolicitacao = ultimaSolicitacao?.numeroSequencial || 0;
    
    return Math.max(maiorNumeroCotacao, maiorNumeroSolicitacao) + 1;
  },
});

// Listar pendências de cadastro
export const listPendenciasCadastro = query({
  args: {
    status: v.optional(v.string()),
    solicitanteId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let pendencias = await ctx.db.query("pendenciasCadastro").collect();

    // Filtrar por status se especificado
    if (args.status && args.status !== "all") {
      pendencias = pendencias.filter(p => p.status === args.status);
    }

    // Filtrar por solicitante se especificado
    if (args.solicitanteId) {
      pendencias = pendencias.filter(p => p.solicitanteId === args.solicitanteId);
    }

    // Buscar dados dos usuários
    const pendenciasComDados = await Promise.all(
      pendencias.map(async (pendencia) => {
        const solicitante = await ctx.db.get(pendencia.solicitanteId);
        const responsavel = pendencia.responsavelId ? await ctx.db.get(pendencia.responsavelId) : null;

        return {
          ...pendencia,
          solicitante,
          responsavel,
        };
      })
    );

    // Ordenar por data de criação (mais recente primeiro)
    return pendenciasComDados.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Contar pendências por status
export const contarPendenciasCadastro = query({
  handler: async (ctx) => {
    const pendencias = await ctx.db.query("pendenciasCadastro").collect();

    return {
      total: pendencias.length,
      pendente: pendencias.filter(p => p.status === "pendente").length,
      em_andamento: pendencias.filter(p => p.status === "em_andamento").length,
      concluida: pendencias.filter(p => p.status === "concluida").length,
      rejeitada: pendencias.filter(p => p.status === "rejeitada").length,
    };
  },
});

// ===== MUTATIONS =====

// Criar nova cotação
export const criarCotacao = mutation({
  args: {
    numeroOS: v.optional(v.string()),
    numeroOrcamento: v.optional(v.string()),
    cliente: v.optional(v.string()),
    solicitanteId: v.id("users"),
    observacoes: v.optional(v.string()),
    itens: v.array(v.object({
      codigoPeca: v.string(),
      descricao: v.string(),
      quantidade: v.number(),
      observacoes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Verificar se o usuário existe
    const solicitante = await ctx.db.get(args.solicitanteId);
    if (!solicitante) throw new Error("Usuário solicitante não encontrado");

    // Obter próximo número sequencial
    const ultimaCotacao = await ctx.db
      .query("cotacoes")
      .withIndex("by_numero")
      .order("desc")
      .first();
    
    const numeroSequencial = (ultimaCotacao?.numeroSequencial || 0) + 1;

    // Criar cotação
    const cotacaoId = await ctx.db.insert("cotacoes", {
      numeroSequencial,
      numeroOS: args.numeroOS,
      numeroOrcamento: args.numeroOrcamento,
      cliente: args.cliente,
      solicitanteId: args.solicitanteId,
      status: "novo",
      observacoes: args.observacoes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Criar itens
    for (const item of args.itens) {
      await ctx.db.insert("cotacaoItens", {
        cotacaoId,
        codigoPeca: item.codigoPeca,
        descricao: item.descricao,
        quantidade: item.quantidade,
        observacoes: item.observacoes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Criar histórico
    await ctx.db.insert("cotacaoHistorico", {
      cotacaoId,
      usuarioId: args.solicitanteId,
      acao: "criada",
      statusNovo: "novo",
      observacoes: "Cotação criada",
      createdAt: Date.now(),
    });

    return { cotacaoId, numeroSequencial };
  },
});

// Assumir cotação (comprador)
export const assumirCotacao = mutation({
  args: {
    cotacaoId: v.id("cotacoes"),
    compradorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const cotacao = await ctx.db.get(args.cotacaoId);
    if (!cotacao) throw new Error("Cotação não encontrada");

    const comprador = await ctx.db.get(args.compradorId);
    if (!comprador) throw new Error("Usuário comprador não encontrado");

    // Verificar se o usuário pode assumir (role de compras)
    if (!["admin", "compras", "gerente"].includes(comprador.role || "")) {
      throw new Error("Usuário não tem permissão para assumir cotações");
    }

    // Verificar status
    if (!["novo", "em_cotacao"].includes(cotacao.status)) {
      throw new Error("Cotação não pode ser assumida no status atual");
    }

    const statusAnterior = cotacao.status;
    
    // Atualizar cotação
    await ctx.db.patch(args.cotacaoId, {
      compradorId: args.compradorId,
      status: "em_cotacao",
      updatedAt: Date.now(),
    });

    // Criar histórico
    await ctx.db.insert("cotacaoHistorico", {
      cotacaoId: args.cotacaoId,
      usuarioId: args.compradorId,
      acao: "assumida",
      statusAnterior,
      statusNovo: "em_cotacao",
      observacoes: `Cotação assumida por ${comprador.name}`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Responder cotação (adicionar preços)
export const responderCotacao = mutation({
  args: {
    cotacaoId: v.id("cotacoes"),
    compradorId: v.id("users"),
    itensResposta: v.array(v.object({
      itemId: v.id("cotacaoItens"),
      precoUnitario: v.number(),
      prazoEntrega: v.optional(v.string()),
      fornecedor: v.optional(v.string()),
      observacoes: v.optional(v.string()),
    })),
    observacoes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cotacao = await ctx.db.get(args.cotacaoId);
    if (!cotacao) throw new Error("Cotação não encontrada");

    const comprador = await ctx.db.get(args.compradorId);
    if (!comprador) throw new Error("Usuário comprador não encontrado");

    // Verificar permissões
    if (!["admin", "compras", "gerente"].includes(comprador.role || "")) {
      throw new Error("Usuário não tem permissão para responder cotações");
    }

    // Verificar status
    if (cotacao.status !== "em_cotacao") {
      throw new Error("Cotação não está em cotação");
    }

    // Atualizar itens com preços
    for (const itemResposta of args.itensResposta) {
      const item = await ctx.db.get(itemResposta.itemId);
      if (!item || item.cotacaoId !== args.cotacaoId) {
        throw new Error("Item não encontrado ou não pertence a esta cotação");
      }

      await ctx.db.patch(itemResposta.itemId, {
        precoUnitario: itemResposta.precoUnitario,
        precoTotal: itemResposta.precoUnitario * item.quantidade,
        prazoEntrega: itemResposta.prazoEntrega,
        fornecedor: itemResposta.fornecedor,
        observacoes: itemResposta.observacoes,
        updatedAt: Date.now(),
      });
    }

    // Atualizar cotação
    await ctx.db.patch(args.cotacaoId, {
      status: "respondida",
      dataResposta: Date.now(),
      observacoes: args.observacoes,
      updatedAt: Date.now(),
    });

    // Criar histórico
    await ctx.db.insert("cotacaoHistorico", {
      cotacaoId: args.cotacaoId,
      usuarioId: args.compradorId,
      acao: "respondida",
      statusAnterior: "em_cotacao",
      statusNovo: "respondida",
      observacoes: args.observacoes || `Cotação respondida por ${comprador.name}`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Aprovar cotação para compra (vendedor)
export const aprovarCotacao = mutation({
  args: {
    cotacaoId: v.id("cotacoes"),
    solicitanteId: v.id("users"),
    observacoes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cotacao = await ctx.db.get(args.cotacaoId);
    if (!cotacao) throw new Error("Cotação não encontrada");

    const solicitante = await ctx.db.get(args.solicitanteId);
    if (!solicitante) throw new Error("Usuário solicitante não encontrado");

    // Verificar se é o solicitante original
    if (cotacao.solicitanteId !== args.solicitanteId) {
      throw new Error("Apenas o solicitante original pode aprovar a cotação");
    }

    // Verificar status
    if (cotacao.status !== "respondida") {
      throw new Error("Cotação não está respondida para aprovação");
    }

    // Atualizar cotação
    await ctx.db.patch(args.cotacaoId, {
      status: "aprovada_para_compra",
      dataAprovacao: Date.now(),
      observacoes: args.observacoes,
      updatedAt: Date.now(),
    });

    // Criar histórico
    await ctx.db.insert("cotacaoHistorico", {
      cotacaoId: args.cotacaoId,
      usuarioId: args.solicitanteId,
      acao: "aprovada",
      statusAnterior: "respondida",
      statusNovo: "aprovada_para_compra",
      observacoes: args.observacoes || `Cotação aprovada para compra por ${solicitante.name}`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Finalizar compra (comprador)
export const finalizarCompra = mutation({
  args: {
    cotacaoId: v.id("cotacoes"),
    compradorId: v.id("users"),
    observacoes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cotacao = await ctx.db.get(args.cotacaoId);
    if (!cotacao) throw new Error("Cotação não encontrada");

    const comprador = await ctx.db.get(args.compradorId);
    if (!comprador) throw new Error("Usuário comprador não encontrado");

    // Verificar permissões
    if (!["admin", "compras", "gerente"].includes(comprador.role || "")) {
      throw new Error("Usuário não tem permissão para finalizar compras");
    }

    // Verificar status
    if (cotacao.status !== "aprovada_para_compra") {
      throw new Error("Cotação não está aprovada para compra");
    }

    // Atualizar cotação
    await ctx.db.patch(args.cotacaoId, {
      status: "comprada",
      dataCompra: Date.now(),
      observacoes: args.observacoes,
      updatedAt: Date.now(),
    });

    // Criar histórico
    await ctx.db.insert("cotacaoHistorico", {
      cotacaoId: args.cotacaoId,
      usuarioId: args.compradorId,
      acao: "comprada",
      statusAnterior: "aprovada_para_compra",
      statusNovo: "comprada",
      observacoes: args.observacoes || `Compra finalizada por ${comprador.name}`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Cancelar cotação
export const cancelarCotacao = mutation({
  args: {
    cotacaoId: v.id("cotacoes"),
    usuarioId: v.id("users"),
    motivo: v.string(),
  },
  handler: async (ctx, args) => {
    const cotacao = await ctx.db.get(args.cotacaoId);
    if (!cotacao) throw new Error("Cotação não encontrada");

    const usuario = await ctx.db.get(args.usuarioId);
    if (!usuario) throw new Error("Usuário não encontrado");

    // Verificar se pode cancelar
    const podeCancel = 
      cotacao.solicitanteId === args.usuarioId || // Solicitante original
      ["admin", "compras", "gerente"].includes(usuario.role || ""); // Equipe de compras

    if (!podeCancel) {
      throw new Error("Usuário não tem permissão para cancelar esta cotação");
    }

    // Verificar se não está finalizada
    if (["comprada", "cancelada"].includes(cotacao.status)) {
      throw new Error("Cotação já foi finalizada e não pode ser cancelada");
    }

    const statusAnterior = cotacao.status;

    // Atualizar cotação
    await ctx.db.patch(args.cotacaoId, {
      status: "cancelada",
      motivoCancelamento: args.motivo,
      dataCancelamento: Date.now(),
      updatedAt: Date.now(),
    });

    // Criar histórico
    await ctx.db.insert("cotacaoHistorico", {
      cotacaoId: args.cotacaoId,
      usuarioId: args.usuarioId,
      acao: "cancelada",
      statusAnterior,
      statusNovo: "cancelada",
      observacoes: `Cotação cancelada por ${usuario.name}. Motivo: ${args.motivo}`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Editar itens de uma cotação (apenas se status permitir)
export const editarItensCotacao = mutation({
  args: {
    cotacaoId: v.id("cotacoes"),
    usuarioId: v.id("users"),
    itens: v.array(v.object({
      itemId: v.optional(v.id("cotacaoItens")), // Se não tiver, é novo item
      codigoPeca: v.string(),
      descricao: v.string(),
      quantidade: v.number(),
      observacoes: v.optional(v.string()),
    })),
    itensParaRemover: v.optional(v.array(v.id("cotacaoItens"))),
  },
  handler: async (ctx, args) => {
    const cotacao = await ctx.db.get(args.cotacaoId);
    if (!cotacao) throw new Error("Cotação não encontrada");

    const usuario = await ctx.db.get(args.usuarioId);
    if (!usuario) throw new Error("Usuário não encontrado");

    // Verificar se pode editar
    const podeEditar = 
      (cotacao.solicitanteId === args.usuarioId && ["novo", "em_cotacao"].includes(cotacao.status)) || // Solicitante em status inicial
      (["admin", "compras", "gerente"].includes(usuario.role || "") && cotacao.status === "em_cotacao"); // Compras quando em cotação

    if (!podeEditar) {
      throw new Error("Não é possível editar os itens no status atual ou usuário sem permissão");
    }

    // Remover itens marcados para remoção
    if (args.itensParaRemover) {
      for (const itemId of args.itensParaRemover) {
        const item = await ctx.db.get(itemId);
        if (item && item.cotacaoId === args.cotacaoId) {
          await ctx.db.delete(itemId);
        }
      }
    }

    // Atualizar/criar itens
    for (const itemData of args.itens) {
      if (itemData.itemId) {
        // Atualizar item existente
        const item = await ctx.db.get(itemData.itemId);
        if (item && item.cotacaoId === args.cotacaoId) {
          await ctx.db.patch(itemData.itemId, {
            codigoPeca: itemData.codigoPeca,
            descricao: itemData.descricao,
            quantidade: itemData.quantidade,
            observacoes: itemData.observacoes,
            // Recalcular preço total se já tem preço unitário
            precoTotal: item.precoUnitario ? item.precoUnitario * itemData.quantidade : item.precoTotal,
            updatedAt: Date.now(),
          });
        }
      } else {
        // Criar novo item
        await ctx.db.insert("cotacaoItens", {
          cotacaoId: args.cotacaoId,
          codigoPeca: itemData.codigoPeca,
          descricao: itemData.descricao,
          quantidade: itemData.quantidade,
          observacoes: itemData.observacoes,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    // Atualizar timestamp da cotação
    await ctx.db.patch(args.cotacaoId, {
      updatedAt: Date.now(),
    });

    // Criar histórico
    await ctx.db.insert("cotacaoHistorico", {
      cotacaoId: args.cotacaoId,
      usuarioId: args.usuarioId,
      acao: "editada",
      statusAnterior: cotacao.status,
      statusNovo: cotacao.status,
      observacoes: `Itens editados por ${usuario.name}`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Cadastrar nova peça
export const cadastrarPeca = mutation({
  args: {
    codigo: v.string(),
    descricao: v.string(),
    marca: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verificar se já existe uma peça com o mesmo código
    const pecaExistente = await ctx.db
      .query("pecas")
      .withIndex("by_codigo", (q) => q.eq("codigo", args.codigo))
      .first();

    if (pecaExistente) {
      throw new Error("Já existe uma peça cadastrada com este código");
    }

    // Criar nova peça
    const pecaId = await ctx.db.insert("pecas", {
      codigo: args.codigo.trim(),
      descricao: args.descricao.trim(),
      marca: args.marca?.trim(),
      ativo: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { pecaId };
  },
});

// Criar pendência de cadastro de peça
export const criarPendenciaCadastro = mutation({
  args: {
    codigo: v.string(),
    descricao: v.string(),
    marca: v.optional(v.string()),
    observacoes: v.optional(v.string()),
    solicitanteId: v.id("users"),
    anexoStorageId: v.optional(v.id("_storage")),
    anexoNome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verificar se o usuário existe
    const solicitante = await ctx.db.get(args.solicitanteId);
    if (!solicitante) throw new Error("Usuário solicitante não encontrado");

    // Verificar se já existe uma pendência com o mesmo código em aberto
    const pendenciaExistente = await ctx.db
      .query("pendenciasCadastro")
      .withIndex("by_status", (q) => q.eq("status", "pendente"))
      .filter((q) => q.eq(q.field("codigo"), args.codigo))
      .first();

    if (pendenciaExistente) {
      throw new Error("Já existe uma solicitação pendente para este código de peça");
    }

    // Verificar se a peça já existe
    const pecaExistente = await ctx.db
      .query("pecas")
      .withIndex("by_codigo", (q) => q.eq("codigo", args.codigo))
      .first();

    if (pecaExistente) {
      throw new Error("Esta peça já está cadastrada no sistema");
    }

    // Obter próximo número sequencial
    const ultimaSolicitacao = await ctx.db
      .query("pendenciasCadastro")
      .withIndex("by_numero")
      .order("desc")
      .first();
    
    const numeroSequencial = (ultimaSolicitacao?.numeroSequencial || 0) + 1;

    // Criar pendência
    const pendenciaId = await ctx.db.insert("pendenciasCadastro", {
      numeroSequencial,
      codigo: args.codigo.trim(),
      descricao: args.descricao.trim(),
      marca: args.marca?.trim(),
      observacoes: args.observacoes?.trim(),
      solicitanteId: args.solicitanteId,
      status: "pendente",
      anexoStorageId: args.anexoStorageId,
      anexoNome: args.anexoNome,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { pendenciaId, numeroSequencial };
  },
}); 