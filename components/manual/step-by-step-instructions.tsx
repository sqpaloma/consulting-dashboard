import React from "react";

interface StepByStepInstructionsProps {
  modalType: string;
}

export function StepByStepInstructions({
  modalType,
}: StepByStepInstructionsProps) {
  switch (modalType) {
    case "orcamento-registro":
      return (
        <div className="space-y-3">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 1: Acessar Central de Vendas
            </h4>
            <p className="text-gray-600 text-sm">
              Navegue até a página Central de Vendas no sistema Sankhya
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 2: Preencher Dados
            </h4>
            <p className="text-gray-600 text-sm">
              Preencha prazo de entrega, garantia e informações do cabeçalho
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 3: Adicionar Peças
            </h4>
            <p className="text-gray-600 text-sm">
              Adicione todas as peças a serem substituídas ao orçamento
            </p>
          </div>
        </div>
      );

    case "aprovacao-registro":
      return (
        <div className="space-y-3">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 1: Localizar Orçamento
            </h4>
            <p className="text-gray-600 text-sm">
              Encontre o orçamento aprovado no sistema
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 2: Portal de Vendas
            </h4>
            <p className="text-gray-600 text-sm">
              Acesse o Portal de Vendas e utilize a TOP 115
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 3: Solicitar Peças
            </h4>
            <p className="text-gray-600 text-sm">
              Solicite as peças necessárias através do sistema
            </p>
          </div>
        </div>
      );

    case "devolucao-processo":
      return (
        <div className="space-y-3">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 1: Alterar Status
            </h4>
            <p className="text-gray-600 text-sm">
              Alterar status de "Aguardando aprovação" para "Faturamento"
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 2: Nota Fiscal
            </h4>
            <p className="text-gray-600 text-sm">
              Solicitar Nota Fiscal de Retorno com peso e volume
            </p>
          </div>
        </div>
      );

    case "faturamento-processo":
      return (
        <div className="space-y-3">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 1: Gerar TOPs
            </h4>
            <p className="text-gray-600 text-sm">
              Peças: TOP 45 | Serviços: TOP 36
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 2: Enviar ao Faturamento
            </h4>
            <p className="text-gray-600 text-sm">
              Enviar informações via Sub-OS com anexos
            </p>
          </div>
        </div>
      );

    case "devolucao-pecas":
      return (
        <div className="space-y-3">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Processo de Devolução
            </h4>
            <p className="text-gray-600 text-sm">
              Devolver todas as peças não utilizadas no processo
            </p>
          </div>
        </div>
      );

    case "baixa-pecas":
      return (
        <div className="space-y-3">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 1: TOP 99
            </h4>
            <p className="text-gray-600 text-sm">
              Utilizar TOP 99 na página "Portal de Movimentação Interna"
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 2: Alterar Cliente
            </h4>
            <p className="text-gray-600 text-sm">
              Alterar cliente para Novak e descrever motivo da baixa
            </p>
          </div>
        </div>
      );

    case "auditoria-processo":
      return (
        <div className="space-y-3">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 1: Identificar Peça
            </h4>
            <p className="text-gray-600 text-sm">
              Verificar se a peça possui cadastro no sistema
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 2: Central de Compras
            </h4>
            <p className="text-gray-600 text-sm">
              Realizar lançamento utilizando a TOP 22
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Etapa 3: Expedição
            </h4>
            <p className="text-gray-600 text-sm">
              Imprimir cópias e levar à expedição com ficha de auditoria
            </p>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-gray-600">
          Instruções não disponíveis para este processo.
        </div>
      );
  }
}
