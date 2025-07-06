import React from "react";

export function MelhoriasContent() {
  return (
    <div className="space-y-6">
      <div id="indicadores">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          7.1. Indicadores de Desempenho
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 p-3 rounded-lg text-center">
            <div className="text-gray-800 font-semibold">Taxa de Aprovação</div>
            <div className="text-gray-600 text-sm">de Orçamentos</div>
          </div>
          <div className="border border-gray-200 p-3 rounded-lg text-center">
            <div className="text-gray-800 font-semibold">Tempo de Resposta</div>
            <div className="text-gray-600 text-sm">ao Cliente</div>
          </div>
          <div className="border border-gray-200 p-3 rounded-lg text-center">
            <div className="text-gray-800 font-semibold">Cumprimento</div>
            <div className="text-gray-600 text-sm">de Prazos</div>
          </div>
          <div className="border border-gray-200 p-3 rounded-lg text-center">
            <div className="text-gray-800 font-semibold">Eficiência</div>
            <div className="text-gray-600 text-sm">no Follow-up</div>
          </div>
          <div className="border border-gray-200 p-3 rounded-lg text-center">
            <div className="text-gray-800 font-semibold">Volume de</div>
            <div className="text-gray-600 text-sm">Retrabalho</div>
          </div>
        </div>
      </div>

      <div id="capacitacoes">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          7.2. Capacitações Internas
        </h3>
        <ul className="text-gray-700 space-y-2 ml-4">
          <li>• Treinamentos periódicos sobre novos processos operacionais</li>
          <li>• Padronização e eficiência dos processos</li>
          <li>• Acompanhamento de inovações do setor</li>
          <li>• Alinhamento com novas tecnologias e ferramentas</li>
        </ul>
      </div>
    </div>
  );
}
