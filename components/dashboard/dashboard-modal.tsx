"use client";

import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList, ListChildComponentProps } from "react-window";

interface DashboardModalProps {
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  modalData: any[];
  calendarModalData?: any[];
  selectedDate?: string | null;
}

export function DashboardModal({
  activeModal,
  setActiveModal,
  modalData,
  calendarModalData = [],
  selectedDate,
}: DashboardModalProps) {
  if (!activeModal) return null;

  // Função para fazer parse de diferentes formatos de data
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Remove espaços extras
    const cleanDate = dateString.toString().trim();

    // Tenta diferentes formatos
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // dd/mm/yyyy
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // dd-mm-yyyy
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // yyyy-mm-dd
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // dd/mm/yy
    ];

    for (const format of formats) {
      const match = cleanDate.match(format);
      if (match) {
        if (format.source.includes("yyyy")) {
          // Formato com ano completo
          const [, day, month, year] = match as any;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Formato com ano abreviado
          const [, day, month, year] = match as any;
          const fullYear =
            parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
          return new Date(fullYear, parseInt(month) - 1, parseInt(day));
        }
      }
    }

    // Se for uma data ISO (YYYY-MM-DD), usa diretamente
    if (cleanDate.includes("-") && cleanDate.length === 10) {
      const date = new Date(cleanDate);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Se for um número (data do Excel)
    if (!isNaN(Number(cleanDate)) && cleanDate.length > 4) {
      const excelDate = Number(cleanDate);
      return new Date((excelDate - 25569) * 86400 * 1000);
    }

    return null;
  };

  // Função para verificar se um item está atrasado
  const isItemOverdue = (item: any): boolean => {
    let deadlineDate = null;

    // Tenta usar data_registro primeiro
    if (item.data_registro) {
      deadlineDate = new Date(item.data_registro);
    } else if (item.prazo) {
      deadlineDate = parseDate(item.prazo);
    } else if (item.data) {
      deadlineDate = parseDate(item.data);
    }

    if (!deadlineDate || isNaN(deadlineDate.getTime())) {
      return false; // Se não tem data válida, considera no prazo
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    return deadlineDate < today;
  };

  // Função para obter a data de referência para ordenação
  const getItemDate = (item: any): Date => {
    let date: Date | null = null;

    // Prioriza data_registro, depois prazo, depois data
    if (item.data_registro) {
      date = new Date(item.data_registro);
    } else if (item.prazo) {
      date = parseDate(item.prazo);
    } else if (item.data) {
      date = parseDate(item.data);
    }

    // Se não conseguiu extrair data válida, usa data atual
    if (!date || isNaN(date.getTime())) {
      date = new Date();
    }

    return date;
  };

  // Função para formatar a data para exibição
  const formatDisplayDate = (item: any): string => {
    // Prioriza data_registro, depois prazo, depois data
    if (item.data_registro) {
      const date = new Date(item.data_registro);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("pt-BR");
      }
    }

    if (item.prazo) {
      const date = parseDate(item.prazo);
      if (date) {
        return date.toLocaleDateString("pt-BR");
      }
    }

    if (item.data) {
      const date = parseDate(item.data);
      if (date) {
        return date.toLocaleDateString("pt-BR");
      }
    }

    return "Data não informada";
  };

  // Ordena os dados em ordem decrescente (mais atrasada primeiro)
  const sortedData = useMemo(() => {
    const dataToSort =
      activeModal === "calendar" ? calendarModalData : modalData;

    return [...dataToSort].sort((a, b) => {
      const dateA = getItemDate(a);
      const dateB = getItemDate(b);

      // Ordem decrescente: mais antiga primeiro (mais atrasada)
      return dateA.getTime() - dateB.getTime();
    });
  }, [activeModal, calendarModalData, modalData]);

  // Função para obter a cor de fundo baseada no status de prazo
  const getBackgroundColor = (item: any): string => {
    if (isItemOverdue(item)) {
      return "bg-red-50 border-red-200 hover:bg-red-100"; // Vermelho para atrasadas
    } else {
      return "bg-green-50 border-green-200 hover:bg-green-100"; // Verde para no prazo
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case "total":
        return "Todos os Itens";
      case "aprovacao":
        return "Itens Aguardando Aprovação";
      case "analises":
        return "Análises";
      case "orcamentos":
        return "Orçamentos";
      case "execucao":
        return "Itens em Execução";
      case "calendar":
        return `Agendamentos - ${
          selectedDate ? new Date(selectedDate).toLocaleDateString("pt-BR") : ""
        }`;
      case "followup-no-prazo":
        return "Follow-up: Itens no Prazo";
      case "followup-vencendo-breve":
        return "Follow-up: Itens Vencendo em Breve";
      case "followup-total":
        return "Follow-up: Todos os Itens";
      case "followup-atrasados":
        return "Follow-up: Itens Atrasados";
      case "overdue-items":
        return "Itens em Atraso";
      case "item-details":
        return "Detalhes do Item";
      default:
        return "Detalhes";
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("concluído") ||
      statusLower.includes("concluido")
    ) {
      return "bg-green-100 text-green-800";
    } else if (
      statusLower.includes("andamento") ||
      statusLower.includes("execução") ||
      statusLower.includes("execucao")
    ) {
      return "bg-blue-100 text-blue-800";
    } else if (
      statusLower.includes("pendente") ||
      statusLower.includes("aguardando")
    ) {
      return "bg-yellow-100 text-yellow-800";
    } else if (
      statusLower.includes("revisão") ||
      statusLower.includes("revisao") ||
      statusLower.includes("análise") ||
      statusLower.includes("analise")
    ) {
      return "bg-orange-100 text-orange-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  // Exibe apenas 12 caracteres do cliente com reticências
  const formatClientDisplay = (client?: string): string => {
    const name = (client || "").toString().trim();
    return name.length > 12 ? name.slice(0, 12) + "..." : name;
  };

  const [isExporting, setIsExporting] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const generatePDF = () => {
    setIsExporting(true);
    const doc = new jsPDF();

    // Configurar fonte para suportar caracteres especiais
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text(getModalTitle(), 10, 10);
    doc.setFontSize(12);
    doc.text(`Total: ${sortedData.length} itens`, 10, 20);

    let y = 30;
    sortedData.forEach((item, index) => {
      // Verificar se precisa de nova página
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.text(`Item ${index + 1}: ${item.titulo}`, 10, y);
      doc.setFontSize(10);
      doc.text(`OS: ${item.os || item.id}`, 15, y + 5);
      doc.text(`Cliente: ${item.cliente}`, 15, y + 10);
      if (activeModal !== "calendar") {
        doc.text(`Data: ${formatDisplayDate(item)}`, 15, y + 15);
      }
      doc.text(`Responsável: ${item.responsavel || "N/A"}`, 15, y + 20);
      doc.text(`Status: ${item.status}`, 15, y + 25);
      y += 35;
    });

    const fileName = `${getModalTitle().replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    setIsExporting(false);
    setShowExportConfirm(false);
  };

  const handleExportClick = () => {
    setShowExportConfirm(true);
  };

  // Renderer do item para react-window
  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = sortedData[index];
    return (
      <div style={style} className="px-0">
        <div
          className={`rounded-lg px-2 py-0.5 mb-0 border transition-colors ${getBackgroundColor(
            item
          )}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-0">
                {item.titulo}
              </h3>
              <div className="grid grid-cols-12 gap-0 text-sm text-gray-600 items-center">
                <div className="col-span-2">
                  <span className="font-medium">OS:</span>
                  <div className="font-mono text-blue-600">
                    {item.os || item.id}
                  </div>
                </div>
                <div
                  className={
                    activeModal !== "calendar" ? "col-span-4" : "col-span-4"
                  }
                >
                  <span className="font-medium">Cliente:</span>
                  <div className="whitespace-nowrap" title={item.cliente}>
                    {formatClientDisplay(item.cliente)}
                  </div>
                </div>
                {activeModal !== "calendar" && (
                  <div className="col-span-2">
                    <span className="font-medium">Data:</span>
                    <div>{formatDisplayDate(item)}</div>
                  </div>
                )}
                <div
                  className={
                    activeModal !== "calendar" ? "col-span-2" : "col-span-3"
                  }
                >
                  <span className="font-medium">Responsável:</span>
                  <div className="whitespace-nowrap">
                    {item.responsavel || "N/A"}
                  </div>
                </div>
                <div
                  className={
                    activeModal !== "calendar" ? "col-span-2" : "col-span-3"
                  }
                >
                  <span className="font-medium">Status:</span>
                  <div>
                    <span
                      className={`px-1 py-0 rounded-full text-xs ${getStatusColor(item.status)} whitespace-nowrap`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-1 self-start">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-transparent px-1.5 py-0 h-auto text-sm"
                onClick={() =>
                  window.open(
                    `https://app.novakgouveia.com.br/ordem-servico/order/${item.id}`,
                    "_blank"
                  )
                }
              >
                Ver mais
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente para exibir detalhes completos de um item específico
  const ItemDetailsView = ({ item }: { item: any }) => {
    const fields = Object.keys(item).filter(key => key !== 'id' && item[key] !== null && item[key] !== undefined && item[key] !== '');
    
    return (
      <div className="space-y-6">
        <div className={`rounded-lg p-4 border ${getBackgroundColor(item)}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field} className="space-y-1">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {field.replace(/_/g, ' ')}
                </label>
                <div className="text-sm text-gray-900">
                  {field === 'status' ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item[field])}`}
                    >
                      {item[field]}
                    </span>
                  ) : field.includes('data') || field.includes('prazo') ? (
                    formatDisplayDate({ [field]: item[field] })
                  ) : (
                    item[field]?.toString() || 'N/A'
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={() =>
              window.open(
                `https://app.novakgouveia.com.br/ordem-servico/order/${item.id}`,
                "_blank"
              )
            }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Ver no Sistema Completo
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {getModalTitle()}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveModal(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>

        <div className="p-6">
          {sortedData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">Nenhum item encontrado</p>
            </div>
          ) : activeModal === "item-details" ? (
            <div className="max-h-[60vh] overflow-y-auto">
              <ItemDetailsView item={sortedData[0]} />
            </div>
          ) : (
            <div style={{ height: "60vh" }} className="overflow-hidden">
              <AutoSizer>
                {({ height, width }) => {
                  // Altura estimada do card + espaçamento
                  const baseItemSize = width < 640 ? 92 : 82; // mobile x desktop
                  const itemSize = baseItemSize;
                  return (
                    <FixedSizeList
                      height={height}
                      width={width}
                      itemCount={sortedData.length}
                      itemSize={itemSize}
                      overscanCount={6}
                    >
                      {Row}
                    </FixedSizeList>
                  );
                }}
              </AutoSizer>
            </div>
          )}
        </div>
      </div>

      {/* Popup de confirmação de exportação */}
      {showExportConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Exportar Lista
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Deseja exportar a lista "{getModalTitle()}" com{" "}
                {sortedData.length} itens para PDF?
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExportConfirm(false)}
                disabled={isExporting}
              >
                Cancelar
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={generatePDF}
                disabled={isExporting}
              >
                {isExporting ? "Exportando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
