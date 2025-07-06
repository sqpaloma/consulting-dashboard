import React from "react";

export function AnexosContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">
            Documentos Disponíveis:
          </h4>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>• Textos padronizados</li>
            <li>• Modelos de formulários</li>
            <li>• Checklists operacionais</li>
            <li>• Fluxogramas de processos</li>
          </ul>
        </div>
        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">
            Texto 1 - Apresentação da Empresa
          </h4>
          <p className="text-gray-600 text-sm">
            Especializada no recondicionamento de componentes hidráulicos,
            oferecendo serviços técnicos de alta qualidade.
          </p>
        </div>
      </div>

      <div className="border border-gray-200 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">
          Serviços Prestados:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600 text-sm">
          <ul className="space-y-1">
            <li>• Diagnóstico e análise técnica</li>
            <li>• Recondicionamento de componentes</li>
            <li>• Emissão de laudos técnicos</li>
          </ul>
          <ul className="space-y-1">
            <li>• Testes em bancada</li>
            <li>• Suporte técnico especializado</li>
            <li>• Orçamento sem custo</li>
          </ul>
        </div>
      </div>

      <div className="border-l-4 border-gray-400 pl-4 py-2">
        <h4 className="font-semibold text-gray-800 mb-2">Importante:</h4>
        <p className="text-gray-600 text-sm">
          Caso o orçamento não seja aprovado, o componente será devolvido
          desmontado. Para remontagem, será cobrado valor adicional com prazo de
          até 7 dias úteis.
        </p>
      </div>
    </div>
  );
}
