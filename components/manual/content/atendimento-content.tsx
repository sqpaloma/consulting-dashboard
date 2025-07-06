import React from "react";

export function AtendimentoContent() {
  return (
    <div className="space-y-6">
      <p className="text-gray-700">
        O atendimento ao cliente pode ocorrer de forma presencial ou remota,
        dependendo da situação.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">
            Atendimento Presencial
          </h4>
          <p className="text-gray-600 text-sm">
            Apresentação institucional na primeira visita, estabelecimento de
            canal de comunicação direto e entrega de cartão de contato.
          </p>
        </div>
        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">
            Atendimento Online
          </h4>
          <p className="text-gray-600 text-sm">
            Processo remoto quando componente é enviado por transportadora,
            mantendo qualidade no acompanhamento.
          </p>
        </div>
      </div>

      <div id="contato">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          2.1. Contato
        </h3>
        <div className="space-y-4">
          <p className="text-gray-700">
            O fluxo de atendimento inicia-se com o primeiro contato, que pode
            ocorrer por mensagem ou ligação. Nesse momento, é fundamental:
          </p>
          <ul className="text-gray-700 space-y-2 ml-4">
            <li>• Enviar apresentação institucional da empresa</li>
            <li>• Solicitar ficha cadastral atualizada</li>
            <li>• Encaminhar dados ao departamento financeiro</li>
            <li>• Informar prazo para elaboração do orçamento</li>
            <li>• Solicitar informações sobre aplicação do componente</li>
            <li>• Registrar todas as informações na SUB-OS</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
