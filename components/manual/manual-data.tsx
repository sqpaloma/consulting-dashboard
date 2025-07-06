import {
  Target,
  Users,
  MessageSquare,
  Workflow,
  Settings,
  Shield,
  TrendingUp,
  FileText,
} from "lucide-react";

export interface Subsection {
  id: string;
  title: string;
}

export interface Section {
  id: string;
  title: string;
  icon: any;
  subsections: Subsection[];
}

export const manualSections: Section[] = [
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
];
