export interface CalendarItem {
  id: string;
  os: string;
  titulo: string;
  cliente: string;
  responsavel?: string;
  status: string;
  prazo: string;
  data: string;
  rawData: any[];
}

export interface Departamento {
  id: string;
  nome: string;
  responsavel: string;
  descricao: string;
}

export interface ResponsavelInfo {
  nome: string;
  departamento: string;
  isGerente: boolean;
}

export const DEPARTAMENTOS: Departamento[] = [
  {
    id: "bomba-motores-hidraulicos",
    nome: "Bomba e Motores Hidráulicos",
    responsavel: "Paloma",
    descricao: "Departamento responsável por bombas e motores hidráulicos",
  },
  {
    id: "bombas-motores-comandos-grande-porte",
    nome: "Bombas, Motores e Comandos de Grande Porte",
    responsavel: "Lucas",
    descricao: "Departamento responsável por equipamentos de grande porte",
  },
  {
    id: "comandos-valvulas",
    nome: "Comandos e Válvulas",
    responsavel: "Marcelo",
    descricao: "Departamento responsável por comandos e válvulas",
  },
  {
    id: "bombas-injetoras",
    nome: "Bombas Injetoras",
    responsavel: "Carlinhos",
    descricao: "Departamento responsável por bombas injetoras",
  },
  {
    id: "avulsos-geral",
    nome: "Avulsos e Serviços Gerais",
    responsavel: "Avulsos",
    descricao:
      "Departamento para pessoas avulsas e serviços gerais sem departamento específico",
  },
];

export const RESPONSAVEIS: ResponsavelInfo[] = [
  {
    nome: "Giovanni",
    departamento: "Gerencia",
    isGerente: true,
  },
  {
    nome: "Paloma",
    departamento: "Bomba e Motores Hidráulicos",
    isGerente: false,
  },
  {
    nome: "Lucas",
    departamento: "Bombas, Motores e Comandos de Grande Porte",
    isGerente: false,
  },
  {
    nome: "Marcelo",
    departamento: "Comandos e Válvulas",
    isGerente: false,
  },
  {
    nome: "Carlinhos",
    departamento: "Bombas Injetoras",
    isGerente: false,
  },
  {
    nome: "Avulsos",
    departamento: "Avulsos e Serviços Gerais",
    isGerente: false,
  },
];

export const getDepartamentoByResponsavel = (
  responsavel: string
): Departamento | null => {
  return (
    DEPARTAMENTOS.find(
      (dep) => dep.responsavel.toLowerCase() === responsavel.toLowerCase()
    ) || null
  );
};

export const getResponsavelInfo = (nome: string): ResponsavelInfo | null => {
  return (
    RESPONSAVEIS.find(
      (resp) => resp.nome.toLowerCase() === nome.toLowerCase()
    ) || null
  );
};
