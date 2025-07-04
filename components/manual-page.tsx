"use client"

import React from "react"

import { useState } from "react"
import {
  Calendar,
  Settings,
  BarChart3,
  Grid3X3,
  ArrowLeft,
  MessageSquare,
  BookOpen,
  ChevronRight,
  Users,
  FileText,
  Target,
  Workflow,
  Shield,
  TrendingUp,
  Upload,
  FileSpreadsheet,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ManualPage() {
  const [activeSection, setActiveSection] = useState<string>("objetivo")
  const [stepByStepModal, setStepByStepModal] = useState<string | null>(null)
  const [stepImages, setStepImages] = useState<{ [key: string]: File[] }>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const sections = [
    {
      id: "objetivo",
      title: "Objetivo do Manual",
      icon: Target,
      subsections: [],
    },
    {
      id: "organizacao",
      title: "1. Organização do Departamento",
      icon: Users,
      subsections: [
        { id: "estrutura", title: "1.1. Estrutura Hierárquica" },
        { id: "fluxograma", title: "1.2. Fluxograma" },
      ],
    },
    {
      id: "atendimento",
      title: "2. Procedimentos de Atendimento ao Cliente",
      icon: MessageSquare,
      subsections: [{ id: "contato", title: "2.1. Contato" }],
    },
    {
      id: "processos",
      title: "3. Processos Operacionais",
      icon: Workflow,
      subsections: [
        { id: "orcamento", title: "3.1. Orçamento" },
        { id: "followup", title: "3.2. Follow-up" },
        { id: "negociacao", title: "3.3. Negociação" },
        { id: "aprovacao", title: "3.4. Aprovação" },
        { id: "devolucao", title: "3.5. Devolução de Componente" },
        { id: "programacao", title: "3.6. Programação" },
        { id: "acompanhamento", title: "3.7. Acompanhamento" },
        { id: "faturamento", title: "3.8. Faturamento" },
        { id: "auditoria", title: "3.9. Auditoria" },
        { id: "garantia", title: "3.10. Análise de Garantia" },
        { id: "posvendas", title: "3.11. Pós-vendas" },
      ],
    },
    {
      id: "terceiros",
      title: "4. Processos Operacionais de Terceiros",
      icon: Users,
      subsections: [
        { id: "expedicao", title: "4.1. Expedição" },
        { id: "producao", title: "4.2. Produção" },
        { id: "qualidade", title: "4.3. Qualidade" },
        { id: "compras", title: "4.4. Compras" },
        { id: "pcp", title: "4.5. PCP" },
        { id: "financeiro", title: "4.6. Financeiro" },
      ],
    },
    {
      id: "sistema",
      title: "5. Sistema",
      icon: Settings,
      subsections: [],
    },
    {
      id: "normas",
      title: "6. Normas e Padrões Técnicos",
      icon: Shield,
      subsections: [],
    },
    {
      id: "melhorias",
      title: "7. Melhorias",
      icon: TrendingUp,
      subsections: [
        { id: "indicadores", title: "7.1. Indicadores de Desempenho" },
        { id: "capacitacoes", title: "7.2. Capacitações Internas" },
      ],
    },
    {
      id: "anexos",
      title: "8. Anexos",
      icon: FileText,
      subsections: [],
    },
  ]

  const toggleSection = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  const handleImageUpload = (stepId: string, files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files)
    setStepImages((prev) => ({
      ...prev,
      [stepId]: [...(prev[stepId] || []), ...newFiles],
    }))
  }

  const removeImage = (stepId: string, index: number) => {
    setStepImages((prev) => ({
      ...prev,
      [stepId]: prev[stepId]?.filter((_, i) => i !== index) || [],
    }))
  }

  const openImagePreview = (file: File) => {
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "objetivo":
        return (
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Este manual tem como objetivo padronizar os procedimentos do departamento de serviços, garantir a
              eficiência operacional. Ele serve como uma referência prática para orientar a equipe em suas funções
              diárias e um guia para novos colaboradores.
            </p>
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Finalidades Principais:</h4>
              <ul className="text-gray-700 space-y-2 ml-4">
                <li>• Padronizar processos e procedimentos operacionais</li>
                <li>• Garantir qualidade e consistência no atendimento</li>
                <li>• Facilitar o treinamento de novos colaboradores</li>
                <li>• Estabelecer diretrizes claras para tomada de decisões</li>
                <li>• Promover melhoria contínua dos processos</li>
              </ul>
            </div>
          </div>
        )

      case "organizacao":
        return (
          <div className="space-y-6">
            <div id="estrutura">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">1.1. Estrutura Hierárquica</h3>
              <p className="text-gray-700 mb-4">
                O Departamento de Consultoria de Serviços – Engenharia é composto por uma equipe especializada e
                organizada de forma a garantir eficiência e clareza nos processos. A estrutura hierárquica é a seguinte:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-gray-300 pl-4">
                  <h4 className="font-semibold text-gray-800">Gerente de Serviços</h4>
                  <p className="text-gray-600 text-sm">
                    Responsável pela supervisão geral do departamento, apoio técnico e tomada de decisões estratégicas.
                  </p>
                </div>
                <div className="border-l-4 border-gray-300 pl-4">
                  <h4 className="font-semibold text-gray-800">Consultores Técnicos</h4>
                  <p className="text-gray-600 text-sm mb-2">Atuam de forma segmentada conforme o tipo de componente:</p>
                  <ul className="text-gray-600 text-sm space-y-1 ml-4">
                    <li>• Consultor(a) – Bombas e Motores de Pistão</li>
                    <li>• Consultor(a) – Bombas e Motores de Engrenagem</li>
                    <li>• Consultor(a) – Bombas, Motores e Comandos de Escavadeira</li>
                    <li>• Consultor(a) – Blocos, Válvulas, Orbitrol e Pedal de Freio</li>
                  </ul>
                </div>
                <div className="border-l-4 border-gray-300 pl-4">
                  <h4 className="font-semibold text-gray-800">Assistentes Técnicos</h4>
                  <p className="text-gray-600 text-sm">
                    Auxiliam os consultores no acompanhamento dos processos, controle de prazos e na organização dos
                    serviços.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "atendimento":
        return (
          <div className="space-y-6">
            <p className="text-gray-700">
              O atendimento ao cliente pode ocorrer de forma presencial ou remota, dependendo da situação.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Atendimento Presencial</h4>
                <p className="text-gray-600 text-sm">
                  Apresentação institucional na primeira visita, estabelecimento de canal de comunicação direto e
                  entrega de cartão de contato.
                </p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Atendimento Online</h4>
                <p className="text-gray-600 text-sm">
                  Processo remoto quando componente é enviado por transportadora, mantendo qualidade no acompanhamento.
                </p>
              </div>
            </div>

            <div id="contato">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1. Contato</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  O fluxo de atendimento inicia-se com o primeiro contato, que pode ocorrer por mensagem ou ligação.
                  Nesse momento, é fundamental:
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
        )

      case "processos":
        return (
          <div className="space-y-8">
            {/* Orçamento */}
            <div id="orcamento">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">3.1. Orçamento</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Após recebimento da Ficha de Orçamento preenchida pelo mecânico responsável:
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
                  <h4 className="font-semibold text-gray-800 mb-2">Componente sem conserto:</h4>
                  <p className="text-gray-600 text-sm">
                    Verificar disponibilidade de reman ou nova, solicitar cotações e consultar engenharia para
                    adaptações.
                  </p>
                </div>
                <p className="text-gray-700">
                  Registrar o orçamento no sistema Sankhya, na página Central de Vendas
                  <button
                    onClick={() => setStepByStepModal("orcamento-registro")}
                    className="text-blue-600 hover:text-blue-800 underline ml-1"
                  >
                    (Passo-a-Passo 1 – Anexos)
                  </button>
                </p>
              </div>
            </div>

            {/* Follow-up */}
            <div id="followup">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">3.2. Follow-up</h3>
              <p className="text-gray-700">
                Para orçamentos que excederam o prazo sem aprovação, apresentar opções de devolução do item ou
                sucateamento, registrando a decisão do cliente.
              </p>
            </div>

            {/* Negociação */}
            <div id="negociacao">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">3.3. Negociação</h3>
              <div className="space-y-4">
                <p className="text-gray-700">Verificações necessárias durante negociações:</p>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-3">3.4. Aprovação</h3>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Quando orçamento é aprovado:</h4>
                <ol className="text-gray-700 space-y-2 ml-4">
                  <li>1. Registrar data de aprovação e entrega na Ficha de Orçamento</li>
                  <li>2. Registrar aprovação no sistema Sankhya</li>
                  <li>3. Solicitar peças via Portal de Vendas (TOP 115)</li>
                  <li>4. Atualizar Sub-OS para "Em execução"</li>
                  <li>5. Entregar Ficha ao PEP e cópias ao almoxarifado e mecânico</li>
                </ol>
              </div>
              <p className="text-gray-700">
                Em seguida, a aprovação deve ser registrada no sistema Sankhya
                <button
                  onClick={() => setStepByStepModal("aprovacao-registro")}
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  (Passo-a-Passo 2 – Anexos)
                </button>
              </p>
            </div>

            {/* Devolução */}
            <div id="devolucao">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">3.5. Devolução de Componente</h3>
              <p className="text-gray-700">
                Na Sub-OS, é necessário alterar o status de "Aguardando aprovação" para "Faturamento"
                <button
                  onClick={() => setStepByStepModal("devolucao-processo")}
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  (Passo-a-Passo 3 – Anexos)
                </button>
              </p>
            </div>

            {/* Faturamento */}
            <div id="faturamento">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">3.8. Faturamento</h3>
              <p className="text-gray-700">
                (O processo detalhado está descrito no
                <button
                  onClick={() => setStepByStepModal("faturamento-processo")}
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  Passo-a-Passo 3 – Anexos
                </button>
                .)
              </p>

              <p className="text-gray-700">
                • Devolver todas as peças que não foram usadas
                <button
                  onClick={() => setStepByStepModal("devolucao-pecas")}
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  (Passo-a-Passo 4 – Anexos)
                </button>
              </p>

              <p className="text-gray-700">
                • Baixa as peças que foram usadas e não serão faturadas na TOP 99
                <button
                  onClick={() => setStepByStepModal("baixa-pecas")}
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  (Passo-a-Passo 5 – Anexos)
                </button>
              </p>
            </div>

            {/* Auditoria */}
            <div id="auditoria">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">3.9. Auditoria</h3>
              <p className="text-gray-700">
                Nesses casos, o consultor deve seguir o processo de auditoria conforme descrito no
                <button
                  onClick={() => setStepByStepModal("auditoria-processo")}
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  (Passo-a-Passo – Anexos)
                </button>
              </p>
            </div>
          </div>
        )

      case "normas":
        return (
          <div className="space-y-6">
            <p className="text-gray-700">
              Todos os processos devem seguir o Manual dos Consultores, assegurando qualidade do atendimento,
              padronização das entregas e segurança das equipes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Certificações Aplicáveis</h4>
                <p className="text-gray-600 text-sm">
                  ISO 9001 – Sistema de Gestão da Qualidade, garantindo processos rigorosos voltados à melhoria
                  contínua.
                </p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Normas de Segurança</h4>
                <p className="text-gray-600 text-sm">
                  Uso obrigatório de EPIs durante atividades que envolvam riscos operacionais em qualquer ambiente.
                </p>
              </div>
            </div>
          </div>
        )

      case "melhorias":
        return (
          <div className="space-y-6">
            <div id="indicadores">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">7.1. Indicadores de Desempenho</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-200 p-3 rounded-lg text-center">
                  <div className="text-gray-800 font-semibold">Taxa de Aprovação</div>
                  <div className="text-gray-600 text-sm">de Orçamentos</div>
                </div>
                <div className="border border-gray-200 p-3 rounded-lg text-center">
                  <div className="text-gray-800 font-semibold">Tempo de Resposta</div>
                  <div className="text-gray-600 text-sm">ao Cliente</div>
                </div>
                <div className="border border-gray-200 p-3 rounded-lg text-center">
                  <div className="text-gray-800 font-semibold">Cumprimento</div>
                  <div className="text-gray-600 text-sm">de Prazos</div>
                </div>
                <div className="border border-gray-200 p-3 rounded-lg text-center">
                  <div className="text-gray-800 font-semibold">Eficiência</div>
                  <div className="text-gray-600 text-sm">no Follow-up</div>
                </div>
                <div className="border border-gray-200 p-3 rounded-lg text-center">
                  <div className="text-gray-800 font-semibold">Volume de</div>
                  <div className="text-gray-600 text-sm">Retrabalho</div>
                </div>
              </div>
            </div>

            <div id="capacitacoes">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">7.2. Capacitações Internas</h3>
              <ul className="text-gray-700 space-y-2 ml-4">
                <li>• Treinamentos periódicos sobre novos processos operacionais</li>
                <li>• Padronização e eficiência dos processos</li>
                <li>• Acompanhamento de inovações do setor</li>
                <li>• Alinhamento com novas tecnologias e ferramentas</li>
              </ul>
            </div>
          </div>
        )

      case "anexos":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Documentos Disponíveis:</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Textos padronizados</li>
                  <li>• Modelos de formulários</li>
                  <li>• Checklists operacionais</li>
                  <li>• Fluxogramas de processos</li>
                </ul>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Texto 1 - Apresentação da Empresa</h4>
                <p className="text-gray-600 text-sm">
                  Especializada no recondicionamento de componentes hidráulicos, oferecendo serviços técnicos de alta
                  qualidade.
                </p>
              </div>
            </div>

            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Serviços Prestados:</h4>
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
                Caso o orçamento não seja aprovado, o componente será devolvido desmontado. Para remontagem, será
                cobrado valor adicional com prazo de até 7 dias úteis.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80">
              <ArrowLeft className="h-5 w-5 text-white" />
              <div className="w-12 h-12 bg-blue-700 rounded-full border-2 border-green-400 flex items-center justify-center relative">
                <span className="text-white font-bold text-lg">ng</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold text-white">novak</span>
                <span className="text-2xl font-light text-green-400">gouveia</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
                <Grid3X3 className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
                <Calendar className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
                <BarChart3 className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700 bg-blue-700">
              <BookOpen className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Manual de Trabalho</h1>
          <p className="text-gray-300">Departamento Consultores de Serviços – Engenharia</p>
        </div>

        {/* Manual Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Table of Contents */}
          <div className="lg:col-span-1">
            <Card className="bg-white sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Sumário
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors ${
                          activeSection === section.id ? "bg-gray-100 border-r-2 border-blue-500" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <section.icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">{section.title}</span>
                        </div>
                        {section.subsections.length > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                      </button>
                      {activeSection === section.id && section.subsections.length > 0 && (
                        <div className="pl-6 pb-2">
                          {section.subsections.map((subsection) => (
                            <a
                              key={subsection.id}
                              href={`#${subsection.id}`}
                              className="block py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              {subsection.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Dynamic Content based on selected section */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center">
                  {sections.find((s) => s.id === activeSection)?.icon && (
                    <span className="mr-2">
                      {React.createElement(sections.find((s) => s.id === activeSection)!.icon, {
                        className: "h-5 w-5 text-gray-600",
                      })}
                    </span>
                  )}
                  {sections.find((s) => s.id === activeSection)?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>{renderSectionContent(activeSection)}</CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Step by Step Modal */}
      {stepByStepModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {stepByStepModal === "orcamento-registro" && "Passo-a-Passo 1: Registrar Orçamento no Sankhya"}
                  {stepByStepModal === "aprovacao-registro" && "Passo-a-Passo 2: Registrar Aprovação no Sankhya"}
                  {stepByStepModal === "devolucao-processo" && "Passo-a-Passo 3: Processo de Devolução"}
                  {stepByStepModal === "faturamento-processo" && "Passo-a-Passo 3: Processo de Faturamento"}
                  {stepByStepModal === "devolucao-pecas" && "Passo-a-Passo 4: Devolução de Peças"}
                  {stepByStepModal === "baixa-pecas" && "Passo-a-Passo 5: Baixa de Peças"}
                  {stepByStepModal === "auditoria-processo" && "Passo-a-Passo: Processo de Auditoria"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setStepByStepModal(null)
                    if (imagePreview) {
                      URL.revokeObjectURL(imagePreview)
                      setImagePreview(null)
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Instructions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Instruções</h3>

                  {stepByStepModal === "orcamento-registro" && (
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 1: Acessar Central de Vendas</h4>
                        <p className="text-gray-600 text-sm">
                          Navegue até a página Central de Vendas no sistema Sankhya
                        </p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 2: Preencher Dados</h4>
                        <p className="text-gray-600 text-sm">
                          Preencha prazo de entrega, garantia e informações do cabeçalho
                        </p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 3: Adicionar Peças</h4>
                        <p className="text-gray-600 text-sm">
                          Adicione todas as peças a serem substituídas ao orçamento
                        </p>
                      </div>
                    </div>
                  )}

                  {stepByStepModal === "aprovacao-registro" && (
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 1: Localizar Orçamento</h4>
                        <p className="text-gray-600 text-sm">Encontre o orçamento aprovado no sistema</p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 2: Portal de Vendas</h4>
                        <p className="text-gray-600 text-sm">Acesse o Portal de Vendas e utilize a TOP 115</p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 3: Solicitar Peças</h4>
                        <p className="text-gray-600 text-sm">Solicite as peças necessárias através do sistema</p>
                      </div>
                    </div>
                  )}

                  {stepByStepModal === "devolucao-processo" && (
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 1: Alterar Status</h4>
                        <p className="text-gray-600 text-sm">
                          Alterar status de "Aguardando aprovação" para "Faturamento"
                        </p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 2: Nota Fiscal</h4>
                        <p className="text-gray-600 text-sm">Solicitar Nota Fiscal de Retorno com peso e volume</p>
                      </div>
                    </div>
                  )}

                  {stepByStepModal === "faturamento-processo" && (
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 1: Gerar TOPs</h4>
                        <p className="text-gray-600 text-sm">Peças: TOP 45 | Serviços: TOP 36</p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 2: Enviar ao Faturamento</h4>
                        <p className="text-gray-600 text-sm">Enviar informações via Sub-OS com anexos</p>
                      </div>
                    </div>
                  )}

                  {stepByStepModal === "devolucao-pecas" && (
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Processo de Devolução</h4>
                        <p className="text-gray-600 text-sm">Devolver todas as peças não utilizadas no processo</p>
                      </div>
                    </div>
                  )}

                  {stepByStepModal === "baixa-pecas" && (
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 1: TOP 99</h4>
                        <p className="text-gray-600 text-sm">
                          Utilizar TOP 99 na página "Portal de Movimentação Interna"
                        </p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 2: Alterar Cliente</h4>
                        <p className="text-gray-600 text-sm">Alterar cliente para Novak e descrever motivo da baixa</p>
                      </div>
                    </div>
                  )}

                  {stepByStepModal === "auditoria-processo" && (
                    <div className="space-y-3">
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 1: Identificar Peça</h4>
                        <p className="text-gray-600 text-sm">Verificar se a peça possui cadastro no sistema</p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 2: Central de Compras</h4>
                        <p className="text-gray-600 text-sm">Realizar lançamento utilizando a TOP 22</p>
                      </div>
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Etapa 3: Expedição</h4>
                        <p className="text-gray-600 text-sm">
                          Imprimir cópias e levar à expedição com ficha de auditoria
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Images Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Capturas de Tela do Sistema</h3>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(stepByStepModal, e.target.files)}
                        className="hidden"
                      />
                      <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                        <Upload className="h-4 w-4" />
                        <span>Adicionar Fotos</span>
                      </Button>
                    </label>
                  </div>

                  {/* Image Grid */}
                  <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {stepImages[stepByStepModal]?.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt={`Passo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openImagePreview(file)}
                        />
                        <button
                          onClick={() => removeImage(stepByStepModal, index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          Etapa {index + 1}
                        </div>
                      </div>
                    ))}

                    {(!stepImages[stepByStepModal] || stepImages[stepByStepModal].length === 0) && (
                      <div className="col-span-2 flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-center">
                          Nenhuma imagem adicionada ainda.
                          <br />
                          Clique em "Adicionar Fotos" para incluir capturas de tela do sistema Sankhya.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {stepImages[stepByStepModal]?.length || 0} imagem(ns) adicionada(s)
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setStepByStepModal(null)}>
                    Fechar
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Salvar Alterações</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => {
                URL.revokeObjectURL(imagePreview)
                setImagePreview(null)
              }}
              className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
