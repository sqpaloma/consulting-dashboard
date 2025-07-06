import React from "react";

export function OrganizacaoContent() {
  return (
    <div className="space-y-6">
      <div id="estrutura">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          1.1. Estrutura Hierárquica
        </h3>
        <p className="text-gray-700 mb-4">
          O Departamento de Consultoria de Serviços – Engenharia é composto por
          uma equipe especializada e organizada de forma a garantir eficiência e
          clareza nos processos. A estrutura hierárquica é a seguinte:
        </p>
        <div className="space-y-4">
          <div className="border-l-4 border-gray-300 pl-4">
            <h4 className="font-semibold text-gray-800">Gerente de Serviços</h4>
            <p className="text-gray-600 text-sm">
              Responsável pela supervisão geral do departamento, apoio técnico e
              tomada de decisões estratégicas.
            </p>
          </div>
          <div className="border-l-4 border-gray-300 pl-4">
            <h4 className="font-semibold text-gray-800">
              Consultores Técnicos
            </h4>
            <p className="text-gray-600 text-sm mb-2">
              Atuam de forma segmentada conforme o tipo de componente:
            </p>
            <ul className="text-gray-600 text-sm space-y-1 ml-4">
              <li>• Consultor(a) – Bombas e Motores de Pistão</li>
              <li>• Consultor(a) – Bombas e Motores de Engrenagem</li>
              <li>
                • Consultor(a) – Bombas, Motores e Comandos de Escavadeira
              </li>
              <li>
                • Consultor(a) – Blocos, Válvulas, Orbitrol e Pedal de Freio
              </li>
            </ul>
          </div>
          <div className="border-l-4 border-gray-300 pl-4">
            <h4 className="font-semibold text-gray-800">
              Assistentes Técnicos
            </h4>
            <p className="text-gray-600 text-sm">
              Auxiliam os consultores no acompanhamento dos processos, controle
              de prazos e na organização dos serviços.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
