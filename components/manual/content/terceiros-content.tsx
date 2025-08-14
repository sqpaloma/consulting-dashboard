import React from "react";

export function TerceirosContent() {
  return (
    <div className="space-y-8">
      {/* Expedição */}
      <div id="expedicao">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          4.1. Expedição
        </h3>
        <div className="space-y-4">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Recebimento de Componentes</h4>
            <p className="text-gray-700 text-sm">
              A expedição é responsável por receber os componentes enviados pelos clientes. Sempre que um componente chega com uma OS antiga registrada, ou quando é necessária alguma informação técnica inicial, a expedição informa o consultor.
            </p>
          </div>
          
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Peças Não Utilizadas</h4>
            <p className="text-gray-700 text-sm">
              Sempre que os mecânicos deixam peças que não foram utilizadas, a expedição entra em contato com o consultor, repassando as informações da OS e do cliente.
            </p>
          </div>

          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Transporte e Expedição</h4>
            <p className="text-gray-700 text-sm">
              Quando um componente está pronto e será transportado por transportadora, a expedição entra em contato com o consultor, repassando todas as informações pertinentes.
            </p>
          </div>

          <div className="border-l-4 border-yellow-400 pl-4 py-2">
            <h4 className="font-semibold text-gray-800 mb-2">
              Frete Pago pela Novak & Gouveia
            </h4>
            <p className="text-gray-600 text-sm">
              É possível que sejam aceitos componentes pela transportadora com fretes para serem pagos pela empresa. É obrigação da expedição informar ao consultor responsável no ato de abertura da OS para que seja repassado para o cliente no início das negociações.
            </p>
          </div>
        </div>
      </div>

      {/* Produção */}
      <div id="producao">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          4.2. Produção
        </h3>
        <div className="space-y-4">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Desmontagem</h4>
            <ul className="text-gray-700 text-sm space-y-2 ml-4">
              <li>• Durante a desmontagem, caso haja dúvidas técnicas ou necessidade de desenho técnico, a produção deve acionar o consultor</li>
              <li>• Informar ao consultor quando houver ausência de alguma peça no componente</li>
            </ul>
          </div>

          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Aprovação de Peças</h4>
            <ul className="text-gray-700 text-sm space-y-2 ml-4">
              <li>• Durante o processo de montagem, caso alguma peça separada esteja incorreta ou falte, a produção deve comunicar o consultor imediatamente</li>
              <li>• A expedição deveria avisar o mecânico assim que chegassem as peças para verificar se está tudo correto</li>
            </ul>
          </div>

          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Finalização da Montagem</h4>
            <p className="text-gray-700 text-sm">
              Ao finalizar a montagem do componente, a produção deve informar o consultor para que ele possa organizar a fila de testes do dia, garantindo o andamento adequado da programação e a entrega dentro dos prazos.
            </p>
          </div>
        </div>
      </div>

      {/* Qualidade */}
      <div id="qualidade">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          4.3. Qualidade
        </h3>
        <div className="space-y-4">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Análise de Garantia</h4>
            <p className="text-gray-700 text-sm mb-2">
              O setor de qualidade é responsável por emitir o laudo técnico detalhado, no qual são analisadas e discutidas as possíveis causas da falha identificada no componente.
            </p>
            <ul className="text-gray-700 text-sm space-y-1 ml-4">
              <li>• Quando a garantia procede: laudo é encaminhado ao cliente, reparo é realizado e teste final é filmado</li>
              <li>• Quando a garantia não procede: laudo e orçamento para reparo são enviados ao cliente</li>
            </ul>
          </div>

          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Laudo de Serviço</h4>
            <p className="text-gray-700 text-sm">
              O setor de Qualidade é responsável pela elaboração do laudo técnico, que pode ser enviado ao cliente junto com o orçamento. Deve conter identificação de todos os problemas encontrados nas peças internas do componente, com registros em imagens detalhadas e descrição das possíveis causas das falhas.
            </p>
          </div>
        </div>
      </div>

      {/* Compras */}
      <div id="compras">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          4.4. Compras
        </h3>
        <div className="space-y-4">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Cotações</h4>
            <p className="text-gray-700 text-sm">
              Sempre que uma cotação for enviada ao setor de Compras, é obrigatório o retorno com a devolutiva contendo valores e prazos de entrega. O consultor deve identificar se o valor informado se refere ao custo de compras (com ou sem imposto) ou se já corresponde ao preço final de venda ao cliente.
            </p>
          </div>

          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Previsão de Chegada de Peças</h4>
            <ul className="text-gray-700 text-sm space-y-2 ml-4">
              <li>• Para peças de orçamentos em aprovação: informar prazo estimado de chegada</li>
              <li>• Peças importadas: informar tempo estimado de liberação</li>
              <li>• Peças nacionais: informar prazo padrão</li>
              <li>• Furo no estoque: comunicar quando será possível reabastecê-lo</li>
            </ul>
          </div>

          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Devoluções e Auditoria</h4>
            <p className="text-gray-700 text-sm">
              Toda divergência identificada durante processos de devolução ou auditoria deve ser formalizada rapidamente ao consultor responsável, garantindo que o problema seja tratado com agilidade.
            </p>
          </div>

          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Giro de Peças</h4>
            <p className="text-gray-700 text-sm">
              Quando necessário, o setor de Compras pode solicitar aos consultores informações sobre peças com alta demanda ou itens que não estão disponíveis em estoque, mas cuja procura tem aumentado. Os consultores também devem informar sempre que identificarem necessidade recorrente de peças fora do estoque.
            </p>
          </div>
        </div>
      </div>

      {/* PCP */}
      <div id="pcp">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          4.5. PCP
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Atualização do aplicativo</h4>
              <p className="text-gray-700 text-sm">
                Manter o sistema atualizado com o status de cada serviço, permitindo acompanhamento em tempo real.
              </p>
            </div>

            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Auxílio na programação</h4>
              <p className="text-gray-700 text-sm">
                Colaborar na alocação de demandas conforme disponibilidade e especialidade de cada mecânico.
              </p>
            </div>

            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Filmagem de testes</h4>
              <p className="text-gray-700 text-sm">
                Acompanhar e registrar, por meio de filmagem, os testes de bancada dos componentes sob análise de garantia.
              </p>
            </div>

            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Acompanhamento dos prazos</h4>
              <p className="text-gray-700 text-sm">
                Monitorar as datas acordadas com os clientes e alertar sobre possíveis desvios.
              </p>
            </div>

            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Programação da usinagem</h4>
              <p className="text-gray-700 text-sm">
                Verificar o andamento das peças em processo de usinagem, garantindo que não haja atrasos.
              </p>
            </div>

            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Suporte aos consultores</h4>
              <p className="text-gray-700 text-sm">
                Fornecer dados e atualizações sempre que necessário, auxiliando na tomada de decisões.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financeiro */}
      <div id="financeiro">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          4.6. Financeiro
        </h3>
        <div className="space-y-4">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Devolutiva de cadastro e análise de crédito</h4>
            <p className="text-gray-700 text-sm">
              Retornar sub-OS com informações incorretas, falta de informações ou cadastro bloqueado por qualquer razão. O financeiro deveria enviar o pedido de compras para atualização do cadastro, sem ter que voltar para o consultor.
            </p>
          </div>

          <div className="border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Envio de NFEs e boletos</h4>
            <p className="text-gray-700 text-sm">
              Quando solicitado pelo cliente, devemos ou não enviar o contato do financeiro (quando o cliente solicita).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}