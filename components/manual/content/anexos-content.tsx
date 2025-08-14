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

      <div className="border border-gray-200 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">
          Cartela de Produtos:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-gray-600 text-sm">
          <ul className="space-y-1">
            <li>• Bombas hidráulicas</li>
            <li>• Motores hidráulicos</li>
            <li>• Comandos direcionais</li>
            <li>• Válvulas proporcionais</li>
          </ul>
          <ul className="space-y-1">
            <li>• Blocos de Válvulas</li>
            <li>• Orbitrols</li>
            <li>• Pedais hidráulicos</li>
            <li>• Redutores</li>
          </ul>
          <ul className="space-y-1">
            <li>• Servostatos</li>
            <li>• Cilindros hidráulicos</li>
            <li>• Unidades hidráulicas</li>
          </ul>
        </div>
      </div>

      <div className="border-l-4 border-blue-300 pl-4 py-2">
        <h4 className="font-semibold text-gray-800 mb-2">Texto 1 - Apresentação Completa:</h4>
        <div className="space-y-2 text-gray-700 text-sm">
          <p>
            Nossa empresa é especializada no recondicionamento de componentes hidráulicos, oferecendo serviços técnicos de alta qualidade para diversos setores da indústria. Contamos com uma equipe qualificada e infraestrutura moderna para garantir soluções eficientes e seguras para nossos clientes.
          </p>
          <p>
            <strong>O orçamento é realizado sem custo para o cliente.</strong>
          </p>
          <p>
            Caso o orçamento não seja aprovado, o componente será devolvido desmontado.
          </p>
          <p>
            Caso o cliente solicite a remontagem do componente, será cobrado um valor adicional, definido conforme análise, com um prazo de execução de até 7 dias úteis.
          </p>
          <p>
            Além do orçamento, oferecemos o serviço de laudo técnico, que possui um custo específico e pode ser enviado junto com o orçamento.
          </p>
          <p>
            Nosso compromisso é oferecer um serviço confiável e transparente, garantindo a melhor solução para a manutenção dos sistemas hidráulicos de nossos clientes.
          </p>
          <p>
            Para mais detalhes sobre nossos produtos e serviços, acesse: 
            <a href="https://www.novakgouveia.com.br/home/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline ml-1">
              www.novakgouveia.com.br
            </a>
          </p>
        </div>
      </div>

      <div className="border-l-4 border-yellow-400 pl-4 py-2">
        <h4 className="font-semibold text-gray-800 mb-2">Documentos de Referência:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-sm">
          <div>
            <p className="font-medium">Textos:</p>
            <ul className="ml-4 space-y-1">
              <li>• Texto 1 - Apresentação da Empresa e Serviços</li>
              <li>• Texto 2 - Questionamentos de Negociação</li>
              <li>• Texto 3 - Informações para Faturamento</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Formulários e Processos:</p>
            <ul className="ml-4 space-y-1">
              <li>• Ficha 1 - Ficha de Orçamento</li>
              <li>• Exemplo 1 - Modelo SUB-OS</li>
              <li>• Exemplo 2 - Solicitação de Cotação</li>
              <li>• Exemplo 3 - Envio de Orçamento</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Relatórios:</p>
            <ul className="ml-4 space-y-1">
              <li>• Relatório 2 - Relatório de Execução</li>
              <li>• Relatório de Usinagem (fornecido pelo PCP)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Links e Grupos:</p>
            <ul className="ml-4 space-y-1">
              <li>• Link 1 - Formulário de Garantia</li>
              <li>• Link 2 - Pesquisa de Satisfação</li>
              <li>• Grupo 1 - WhatsApp da Expedição</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
