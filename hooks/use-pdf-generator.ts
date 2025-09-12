import { useCallback } from 'react';
import jsPDF from 'jspdf';

interface ActivityItem {
  titulo?: string;
  os?: string;
  cliente: string;
  data?: string;
  prazo?: string;
  status: string;
}

interface ProgramacaoData {
  consultant: string;
  mechanics: {
    name: string;
    items: ActivityItem[];
  }[];
  statusFilter: string;
  dateFilter: string | null;
  department: string | null;
}

export function usePdfGenerator() {
  // Funções utilitárias (copiadas de programacao-utils para evitar problemas de importação)
  const getDueDate = (item: any): Date | null => {
    if (item.data) return new Date(item.data);
    if (item.prazo) return new Date(item.prazo);
    return null;
  };

  const startOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const isAnaliseStatus = (status: string): boolean => {
    return status.toLowerCase().includes('análise') || status.toLowerCase().includes('analise');
  };

  const isExecucaoStatus = (status: string): boolean => {
    return status.toLowerCase().includes('execução') || status.toLowerCase().includes('execucao');
  };

  const generateProgramacaoPdf = useCallback((data: ProgramacaoData) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Configurações de cores
    const colors = {
      primary: [59, 130, 246] as [number, number, number], // blue-600
      secondary: [107, 114, 128] as [number, number, number], // gray-500
      success: [34, 197, 94] as [number, number, number], // emerald-500
      warning: [234, 179, 8] as [number, number, number], // yellow-500
      danger: [239, 68, 68] as [number, number, number], // red-500
      background: [249, 250, 251] as [number, number, number], // gray-50
      white: [255, 255, 255] as [number, number, number],
      text: [31, 41, 55] as [number, number, number], // gray-800
      textSecondary: [107, 114, 128] as [number, number, number] // gray-500
    };

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const headerHeight = 25;

    // Cabeçalho
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    doc.setTextColor(...colors.white);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Programação', margin, 15);

    // Informações do consultor e filtros
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let infoY = 20;
    doc.text(`Consultor: ${data.consultant}`, margin, infoY);
    
    if (data.department) {
      doc.text(`Departamento: ${data.department}`, margin + 80, infoY);
    }
    
    const statusText = data.statusFilter === 'execucao' ? 'Em execução' : 'Atrasados';
    doc.text(`Status: ${statusText}`, pageWidth - 60, infoY);

    if (data.dateFilter) {
      const dateText = data.dateFilter === 'today' ? 'Hoje' : 'Esta Semana';
      doc.text(`Filtro: ${dateText}`, pageWidth - 60, infoY - 5);
    }

    // Data de geração
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(8);
    doc.text(`Gerado em: ${dateStr}`, pageWidth - margin - 40, 8);

    // Função auxiliar para criar cabeçalho da coluna
    const createColumnHeader = (startX: number, startY: number, mechanic: any, columnWidth: number) => {
      doc.setFillColor(...colors.background);
      doc.rect(startX, startY, columnWidth, 12, 'F');
      
      doc.setDrawColor(...colors.secondary);
      doc.rect(startX, startY, columnWidth, 12);
      
      doc.setTextColor(...colors.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      // Nome do mecânico (truncado se necessário)
      const mechanicName = mechanic.name.length > 20 ? 
        mechanic.name.substring(0, 17) + '...' : mechanic.name;
      doc.text(mechanicName, startX + 2, startY + 7);
      
      // Contador de atividades
      doc.setFillColor(...colors.secondary);
      const countWidth = 15;
      doc.rect(startX + columnWidth - countWidth - 2, startY + 2, countWidth, 8, 'F');
      doc.setTextColor(...colors.white);
      doc.setFontSize(8);
      doc.text(mechanic.items.length.toString(), startX + columnWidth - countWidth + 5, startY + 7);
    };

    // Função auxiliar para criar cabeçalho da página
    const createPageHeader = (isFirstPage: boolean = true) => {
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      doc.setTextColor(...colors.white);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(isFirstPage ? 'Programação' : 'Programação (continuação)', margin, 15);
      
      if (isFirstPage) {
        // Informações do consultor e filtros apenas na primeira página
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let infoY = 20;
        doc.text(`Consultor: ${data.consultant}`, margin, infoY);
        
        if (data.department) {
          doc.text(`Departamento: ${data.department}`, margin + 80, infoY);
        }
        
        const statusText = data.statusFilter === 'execucao' ? 'Em execução' : 'Atrasados';
        doc.text(`Status: ${statusText}`, pageWidth - 60, infoY);

        if (data.dateFilter) {
          const dateText = data.dateFilter === 'today' ? 'Hoje' : 'Esta Semana';
          doc.text(`Filtro: ${dateText}`, pageWidth - 60, infoY - 5);
        }
      }
      
      // Data de geração
      doc.setFontSize(8);
      doc.text(`Gerado em: ${dateStr}`, pageWidth - margin - 40, 8);
    };

    // Conteúdo das colunas
    const startY = headerHeight + 10;
    const columnWidth = (pageWidth - (margin * 2) - ((data.mechanics.length - 1) * 5)) / data.mechanics.length;
    
    // Ordenar itens por data em cada coluna (usando a mesma lógica da interface)
    const sortedMechanics = data.mechanics.map(mechanic => ({
      ...mechanic,
      items: [...mechanic.items].sort((a, b) => {
        const da = getDueDate(a);
        const db = getDueDate(b);
        const ta = da ? startOfDay(da).getTime() : Infinity;
        const tb = db ? startOfDay(db).getTime() : Infinity;
        if (ta !== tb) return ta - tb;
        
        // Critério secundário: status (análise > execução > outros)
        const sa = a.status || "";
        const sb = b.status || "";
        const saScore = isAnaliseStatus(sa) ? 0 : isExecucaoStatus(sa) ? 1 : 2;
        const sbScore = isAnaliseStatus(sb) ? 0 : isExecucaoStatus(sb) ? 1 : 2;
        return saScore - sbScore;
      })
    }));

    // Criar cabeçalhos das colunas na primeira página
    sortedMechanics.forEach((mechanic, colIndex) => {
      const startX = margin + (colIndex * (columnWidth + 5));
      createColumnHeader(startX, startY, mechanic, columnWidth);
    });

    // Renderizar atividades - lógica global para múltiplas páginas
    const maxY = pageHeight - margin - 20;
    let globalY = startY + 15;
    
    // Encontrar o máximo de itens entre todas as colunas (usando dados ordenados)
    const itemCounts = sortedMechanics.map(m => m.items.length);
    const maxItems = itemCounts.length > 0 ? Math.max(...itemCounts) : 0;
    
    // Renderizar item por item de todas as colunas simultaneamente
    for (let itemIndex = 0; itemIndex < maxItems; itemIndex++) {
      // Verificar se precisa de nova página antes de renderizar a linha
      if (globalY + 20 > maxY) {
        doc.addPage();
        createPageHeader(false);
        
        // Recriar todas as colunas na nova página
        sortedMechanics.forEach((mech, idx) => {
          const colStartX = margin + (idx * (columnWidth + 5));
          createColumnHeader(colStartX, headerHeight + 10, mech, columnWidth);
        });
        
        globalY = headerHeight + 25;
      }
      
      // Renderizar um item de cada coluna (se existir)
      sortedMechanics.forEach((mechanic, colIndex) => {
        const startX = margin + (colIndex * (columnWidth + 5));
        const item = mechanic.items[itemIndex];
        
        if (!item) return; // Se essa coluna não tem mais itens, pula

        // Verificar se está atrasado (usando a mesma lógica da interface)
        const dueDate = getDueDate(item);
        const today = startOfDay(new Date());
        const isOverdue = dueDate ? startOfDay(dueDate).getTime() < today.getTime() : false;

        // Cor do card baseada no status e se está atrasado
        let cardColor: [number, number, number] = colors.background;
        if (isOverdue) {
          cardColor = [254, 226, 226]; // red-100
        } else if (item.status.toLowerCase().includes('análise') || 
            item.status.toLowerCase().includes('analise')) {
          cardColor = [254, 249, 195]; // yellow-100
        } else if (item.status.toLowerCase().includes('execução') || 
                   item.status.toLowerCase().includes('execucao')) {
          cardColor = [209, 250, 229]; // emerald-100
        }

        // Card da atividade
        const cardHeight = 18;
        doc.setFillColor(...cardColor);
        doc.rect(startX + 1, globalY, columnWidth - 2, cardHeight, 'F');
        
        doc.setDrawColor(200, 200, 200);
        doc.rect(startX + 1, globalY, columnWidth - 2, cardHeight);

        // Título da atividade
        if (isOverdue) {
          doc.setTextColor(...colors.danger);
        } else {
          doc.setTextColor(...colors.text);
        }
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        const title = item.titulo || item.os || '';
        const truncatedTitle = title.length > 25 ? title.substring(0, 22) + '...' : title;
        doc.text(truncatedTitle, startX + 3, globalY + 5);

        // Cliente
        doc.setFont('helvetica', 'normal');
        if (isOverdue) {
          doc.setTextColor(...colors.danger);
        } else {
          doc.setTextColor(...colors.textSecondary);
        }
        doc.setFontSize(6);
        const client = item.cliente || '';
        const truncatedClient = client.length > 30 ? client.substring(0, 27) + '...' : client;
        doc.text(truncatedClient, startX + 3, globalY + 9);

        // Data
        if (dueDate) {
          const dateStr = dueDate.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit'
          });
          doc.text(dateStr, startX + 3, globalY + 13);
        }

        // Status (pequeno círculo colorido)
        let statusColor: [number, number, number] = colors.secondary;
        if (isOverdue) {
          statusColor = colors.danger;
        } else if (item.status.toLowerCase().includes('análise') || 
            item.status.toLowerCase().includes('analise')) {
          statusColor = colors.warning;
        } else if (item.status.toLowerCase().includes('execução') || 
                   item.status.toLowerCase().includes('execucao')) {
          statusColor = colors.success;
        }

        doc.setFillColor(...statusColor);
        doc.circle(startX + columnWidth - 8, globalY + 8, 1.5, 'F');
      });
      
      // Avançar para a próxima linha após renderizar todos os itens desta linha
      globalY += 20;
    }

    // Renderizar mensagem "Sem atividades" para colunas vazias
    sortedMechanics.forEach((mechanic, colIndex) => {
      const startX = margin + (colIndex * (columnWidth + 5));
      if (mechanic.items.length === 0) {
        doc.setTextColor(...colors.textSecondary);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text('Sem atividades', startX + columnWidth/2 - 15, startY + 30);
      }
    });

    // Rodapé em todas as páginas
    const totalPages = doc.internal.pages.length - 1; // -1 porque o array inclui uma página em branco
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(...colors.secondary);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setTextColor(...colors.textSecondary);
      doc.setFontSize(7);
      doc.text('Novak & Gouveia Consultoria', margin, pageHeight - 8);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 30, pageHeight - 8);
    }

    // Salvar o PDF
    const consultantSlug = data.consultant.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const fileName = `programacao-${consultantSlug}-${now.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }, []);

  return { generateProgramacaoPdf };
} 