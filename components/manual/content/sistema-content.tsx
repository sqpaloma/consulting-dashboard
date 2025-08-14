import React from "react";

export function SistemaContent() {
  return (
    <div className="space-y-6">
      <p className="text-gray-700">
        O sistema Sankhya é a ferramenta principal utilizada para gerenciamento dos processos operacionais do departamento.
      </p>

      <div className="space-y-4">
        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">5.1. Consulta de OS e Ordem de Serviço</h4>
          <p className="text-gray-700 text-sm">
            Módulo para consulta e acompanhamento das ordens de serviço em andamento e histórico de atendimentos.
          </p>
        </div>

        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">5.2. Portal de Vendas</h4>
          <div className="space-y-2">
            <p className="text-gray-700 text-sm mb-2">Principais TOPs utilizadas:</p>
            <ul className="text-gray-700 text-sm space-y-1 ml-4">
              <li>• <strong>TOP 30:</strong> Consulta de produtos e preços</li>
              <li>• <strong>TOP 36:</strong> Lançamento de serviços</li>
              <li>• <strong>TOP 115:</strong> Solicitação de peças para orçamentos aprovados</li>
            </ul>
          </div>
        </div>

        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">5.3. Portal de Movimentação Interna</h4>
          <div className="space-y-2">
            <p className="text-gray-700 text-sm mb-2">TOPs para movimentação de peças:</p>
            <ul className="text-gray-700 text-sm space-y-1 ml-4">
              <li>• <strong>TOP 45:</strong> Movimentação de peças para faturamento</li>
              <li>• <strong>TOP 99:</strong> Baixa de peças utilizadas não faturadas</li>
              <li>• <strong>TOP 155:</strong> Transferência entre almoxarifados</li>
              <li>• <strong>TOP 185:</strong> Ajustes de estoque</li>
            </ul>
          </div>
        </div>

        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">5.4. Portal de Compras</h4>
          <div className="space-y-2">
            <p className="text-gray-700 text-sm mb-2">Módulo para gestão de compras:</p>
            <ul className="text-gray-700 text-sm space-y-1 ml-4">
              <li>• <strong>TOP 22:</strong> Lançamento de processos de auditoria</li>
            </ul>
          </div>
        </div>

        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">5.5. Consulta de Produtos</h4>
          <p className="text-gray-700 text-sm">
            Módulo para consulta de disponibilidade, preços e informações técnicas dos produtos em estoque.
          </p>
        </div>
      </div>

      <div className="border-l-4 border-blue-300 pl-4 py-2">
        <h4 className="font-semibold text-gray-800 mb-2">Observações Importantes:</h4>
        <ul className="text-gray-700 text-sm space-y-1 ml-4">
          <li>• Todos os processos devem ser devidamente registrados no sistema</li>
          <li>• As TOPs devem ser utilizadas conforme os procedimentos estabelecidos</li>
          <li>• Manter sempre o sistema atualizado com o status real dos processos</li>
          <li>• Consultar os manuais específicos de cada TOP para procedimentos detalhados</li>
        </ul>
      </div>
    </div>
  );
}