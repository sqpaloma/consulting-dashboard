import React from "react";

export function ObjetivoContent() {
  return (
    <div className="space-y-6">
      <p className="text-gray-700 leading-relaxed">
        Este manual tem como objetivo padronizar os procedimentos do
        departamento de serviços, garantir a eficiência operacional. Ele serve
        como uma referência prática para orientar a equipe em suas funções
        diárias e um guia para novos colaboradores.
      </p>
      <div className="border border-gray-200 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">
          Finalidades Principais:
        </h4>
        <ul className="text-gray-700 space-y-2 ml-4">
          <li>• Padronizar processos e procedimentos operacionais</li>
          <li>• Garantir qualidade e consistência no atendimento</li>
          <li>• Facilitar o treinamento de novos colaboradores</li>
          <li>• Estabelecer diretrizes claras para tomada de decisões</li>
          <li>• Promover melhoria contínua dos processos</li>
        </ul>
      </div>
    </div>
  );
}
