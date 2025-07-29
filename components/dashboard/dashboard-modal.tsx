"use client";

import { Button } from "@/components/ui/button";
import { useMemo } from "react";

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
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Formato com ano abreviado
          const [, day, month, year] = match;
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
    let date = null;

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

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {sortedData.map((item, index) => (
              <div
                key={`modal-item-${item.id || item.os}-${index}`}
                className={`rounded-lg p-4 border transition-colors ${getBackgroundColor(item)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {item.titulo}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">OS:</span>
                        <div className="font-mono text-blue-600">
                          {item.os || item.id}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Cliente:</span>
                        <div>{item.cliente}</div>
                      </div>
                      <div>
                        <span className="font-medium">Data:</span>
                        <div>{formatDisplayDate(item)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Responsável:</span>
                        <div>{item.responsavel || "N/A"}</div>
                      </div>
                      {activeModal === "calendar" &&
                        (item.prazo || item.data_registro) && (
                          <div>
                            <span className="font-medium">Prazo:</span>
                            <div
                              className={`font-semibold ${isItemOverdue(item) ? "text-red-600" : "text-green-600"}`}
                            >
                              {formatDisplayDate(item)}
                            </div>
                          </div>
                        )}
                      <div>
                        <span className="font-medium">Status:</span>
                        <div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://app.novakgouveia.com.br/ordem-servico/order/${item.id}`,
                          "_blank"
                        )
                      }
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedData.length === 0 && (
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
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total: {sortedData.length} itens
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setActiveModal(null)}>
                Fechar
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Exportar Lista
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
