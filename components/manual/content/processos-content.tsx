import React from "react";

interface ProcessosContentProps {
  onStepByStepClick: (modalType: string) => void;
}

export function ProcessosContent({ onStepByStepClick }: ProcessosContentProps) {
  return (
    <div className="space-y-8">
      {/* Orçamento */}
      <div id="orcamento">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          3.1. Orçamento
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            Após recebimento da Ficha de Orçamento preenchida pelo mecânico
            responsável:
          </p>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Procedimentos:</h4>
            <ol className="text-gray-700 space-y-2 ml-4">
              <li>1. Verificar necessidade de laudo técnico</li>
              <li>2. Registrar orçamento no sistema Sankhya</li>
              <li>3. Preencher prazo de entrega e garantia</li>
              <li>4. Adicionar todas as peças a serem substituídas</li>
              <li>5. Solicitar cotação para peças em falta</li>
              <li>6. Enviar orçamento ao cliente</li>
              <li>7. Finalizar Sub-OS como "Aguardando aprovação"</li>
            </ol>
          </div>
          <div className="border-l-4 border-gray-400 pl-4 py-2">
            <h4 className="font-semibold text-gray-800 mb-2">
              Componente sem conserto:
            </h4>
            <p className="text-gray-600 text-sm">
              Verificar disponibilidade de reman ou nova, solicitar cotações e
              consultar engenharia para adaptações.
            </p>
          </div>
          <p className="text-gray-700">
            Registrar o orçamento no sistema Sankhya, na página Central de
            Vendas
            <button
              onClick={() => onStepByStepClick("orcamento-registro")}
              className="text-blue-600 hover:text-blue-800 underline ml-1"
            >
              (Passo-a-Passo 1 – Anexos)
            </button>
          </p>
        </div>
      </div>

      {/* Follow-up */}
      <div id="followup">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          3.2. Follow-up
        </h3>
        <p className="text-gray-700">
          Para orçamentos que excederam o prazo sem aprovação, apresentar opções
          de devolução do item ou sucateamento, registrando a decisão do
          cliente.
        </p>
      </div>

      {/* Negociação */}
      <div id="negociacao">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          3.3. Negociação
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            Verificações necessárias durante negociações:
          </p>
          <ul className="text-gray-700 space-y-2 ml-4">
            <li>• Cadastro atualizado do cliente</li>
            <li>• Crédito liberado para compras</li>
            <li>• Três notas fiscais de compras a prazo recentes</li>
            <li>• Ficha cadastral preenchida</li>
            <li>• Encaminhamento ao financeiro para análise</li>
          </ul>
        </div>
      </div>

      {/* Aprovação */}
      <div id="aprovacao">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          3.4. Aprovação
        </h3>
        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">
            Quando orçamento é aprovado:
          </h4>
          <ol className="text-gray-700 space-y-2 ml-4">
            <li>
              1. Registrar data de aprovação e entrega na Ficha de Orçamento
            </li>
            <li>2. Registrar aprovação no sistema Sankhya</li>
            <li>3. Solicitar peças via Portal de Vendas (TOP 115)</li>
            <li>4. Atualizar Sub-OS para "Em execução"</li>
            <li>
              5. Entregar Ficha ao PEP e cópias ao almoxarifado e mecânico
            </li>
          </ol>
        </div>
        <p className="text-gray-700">
          Em seguida, a aprovação deve ser registrada no sistema Sankhya
          <button
            onClick={() => onStepByStepClick("aprovacao-registro")}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            (Passo-a-Passo 2 – Anexos)
          </button>
        </p>
      </div>

      {/* Devolução */}
      <div id="devolucao">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          3.5. Devolução de Componente
        </h3>
        <p className="text-gray-700">
          Na Sub-OS, é necessário alterar o status de "Aguardando aprovação"
          para "Faturamento"
          <button
            onClick={() => onStepByStepClick("devolucao-processo")}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            (Passo-a-Passo 3 – Anexos)
          </button>
        </p>
      </div>

      {/* Faturamento */}
      <div id="faturamento">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          3.8. Faturamento
        </h3>
        <p className="text-gray-700">
          (O processo detalhado está descrito no
          <button
            onClick={() => onStepByStepClick("faturamento-processo")}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            Passo-a-Passo 3 – Anexos
          </button>
          .)
        </p>

        <p className="text-gray-700">
          • Devolver todas as peças que não foram usadas
          <button
            onClick={() => onStepByStepClick("devolucao-pecas")}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            (Passo-a-Passo 4 – Anexos)
          </button>
        </p>

        <p className="text-gray-700">
          • Baixa as peças que foram usadas e não serão faturadas na TOP 99
          <button
            onClick={() => onStepByStepClick("baixa-pecas")}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            (Passo-a-Passo 5 – Anexos)
          </button>
        </p>
      </div>

      {/* Programação */}
      <div id="programacao">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          3.6. Programação
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            Toda sexta-feira, o consultor deve realizar a programação de montagem e orçamento por meio do aplicativo, em conjunto com o setor de PCP.
          </p>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Procedimentos:</h4>
            <ul className="text-gray-700 space-y-2 ml-4">
              <li>• Apresentar programação ao gerente</li>
              <li>• Elaborar plano de ação para itens em atraso</li>
              <li>• Detalhar medidas para regularizar situações</li>
              <li>• Evitar novos atrasos no processo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Acompanhamento */}
      <div id="acompanhamento">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          3.7. Acompanhamento
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            O consultor é responsável por monitorar a execução de todos os componentes, garantindo que o processo ocorra conforme o planejado.
          </p>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Verificações necessárias:</h4>
            <ul className="text-gray-700 space-y-2 ml-4">
              <li>• Verificar se componentes foram devidamente separados</li>
              <li>• Confirmar chegada de peças do estoque ou fornecedor</li>
              <li>• Identificar eventuais atrasos na usinagem</li>
              <li>• Avaliar necessidade de realocação de mecânico</li>
              <li>• Ajustar programação de montagem e testes</li>
            </ul>
          </div>
          <p className="text-gray-700">
            Acompanhamento por meio dos Relatórios de Execução (Relatório 2 – Anexos) e Relatório de Usinagem, fornecido pelo PCP, gerados toda sexta-feira.
          </p>
        </div>
      </div>

      {/* Auditoria */}
      <div id="auditoria">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          3.9. Auditoria
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            Quando há sobras de peças de kits, conjuntos ou componentes novos utilizados apenas para retirada de peças específicas.
          </p>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Processo de auditoria:</h4>
            <ol className="text-gray-700 space-y-2 ml-4">
              <li>1. Identificar a peça e verificar cadastro no sistema</li>
              <li>2. Se não cadastrada, enviar informações ao setor de compras</li>
              <li>3. Realizar lançamento na Central de Compras (TOP 22)</li>
              <li>4. Imprimir duas cópias do processo</li>
              <li>5. Levar à expedição junto com as peças</li>
              <li>6. Deixar ficha de auditoria visível</li>
            </ol>
          </div>
          <p className="text-gray-700">
            Processo conforme descrito no
            <button
              onClick={() => onStepByStepClick("auditoria-processo")}
              className="text-blue-600 hover:text-blue-800 underline ml-1"
            >
              (Passo-a-Passo – Anexos)
            </button>
          </p>
        </div>
      </div>

      {/* Análise de Garantia */}
      <div id="garantia">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          3.10. Análise de Garantia
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            Quando um cliente relata problemas com componente entregue, inicia-se o processo de análise de garantia.
          </p>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Política de Garantia:</h4>
            <ul className="text-gray-700 space-y-2 ml-4">
              <li>• Garantia de 3 meses válida exclusivamente em bancada</li>
              <li>• Solicitar reenvio do componente para análise</li>
              <li>• Formulário de garantia deve ser preenchido</li>
              <li>• Processo tem prioridade na oficina com acompanhamento do PCP</li>
            </ul>
          </div>
          
          <div className="border-l-4 border-blue-300 pl-4">
            <h4 className="font-semibold text-gray-800 mb-2">Análise Técnica e Laudo:</h4>
            <p className="text-gray-700 text-sm mb-2">
              O componente é encaminhado ao mecânico para desmontagem e registro fotográfico das peças.
            </p>
            <ul className="text-gray-700 text-sm space-y-1 ml-4">
              <li>• Imagens enviadas ao setor de qualidade para laudo técnico</li>
              <li>• Se peças em boas condições: teste em bancada filmado</li>
              <li>• Se sem falhas: laudo informa que garantia não procede</li>
              <li>• Se identificada necessidade de substituição: processo segue como orçamento comum</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pós-vendas */}
      <div id="posvendas">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          3.11. Pós-vendas
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            Assim que o componente for finalizado e estiver pronto para envio, o consultor deve encaminhar a pesquisa de satisfação ao cliente.
          </p>
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Procedimentos:</h4>
            <ul className="text-gray-700 space-y-2 ml-4">
              <li>• Encaminhar pesquisa de satisfação (Link 2 – Anexos)</li>
              <li>• Reclamações de clientes estratégicos: encaminhar ao setor Pós-venda</li>
              <li>• Falhas recorrentes: encaminhar ao setor de Engenharia</li>
              <li>• Investigar causas técnicas e operacionais com encarregado da produção</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
