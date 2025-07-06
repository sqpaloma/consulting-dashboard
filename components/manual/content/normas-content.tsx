import React from "react";

export function NormasContent() {
  return (
    <div className="space-y-6">
      <p className="text-gray-700">
        Todos os processos devem seguir o Manual dos Consultores, assegurando
        qualidade do atendimento, padronização das entregas e segurança das
        equipes.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">
            Certificações Aplicáveis
          </h4>
          <p className="text-gray-600 text-sm">
            ISO 9001 – Sistema de Gestão da Qualidade, garantindo processos
            rigorosos voltados à melhoria contínua.
          </p>
        </div>
        <div className="border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">
            Normas de Segurança
          </h4>
          <p className="text-gray-600 text-sm">
            Uso obrigatório de EPIs durante atividades que envolvam riscos
            operacionais em qualquer ambiente.
          </p>
        </div>
      </div>
    </div>
  );
}
