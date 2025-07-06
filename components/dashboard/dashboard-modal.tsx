"use client";

import { Button } from "@/components/ui/button";

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
            {(activeModal === "calendar" ? calendarModalData : modalData).map(
              (item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {item.titulo}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm text-gray-600">
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
                          <div>{item.data}</div>
                        </div>
                        {activeModal === "calendar" && item.prazo && (
                          <div>
                            <span className="font-medium">Prazo:</span>
                            <div className="font-semibold text-red-600">
                              {item.prazo}
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
                        <div>
                          <span className="font-medium">Valor:</span>
                          <div className="font-semibold text-green-600">
                            {item.valor}
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
                            "https://app.novakgouveia.com.br",
                            "_blank"
                          )
                        }
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {(activeModal === "calendar" ? calendarModalData : modalData)
            .length === 0 && (
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
              Total:{" "}
              {
                (activeModal === "calendar" ? calendarModalData : modalData)
                  .length
              }{" "}
              itens
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
