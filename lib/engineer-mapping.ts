// Função para mapear nomes para engenheiros responsáveis
export function mapEngineerResponsible(nome: string): string {
  const nomeUpper = nome.toUpperCase().trim();

  // Mapeamento para PALOMA
  const palomaTeam = [
    "GUSTAVO",
    "GUILHERME",
    "EDUARDO",
    "YURI",
    "VAGNER",
    "FABIO F",
    "NIVALDO",
  ];

  // Mapeamento para LUCAS
  const lucasTeam = [
    "ALEXANDRE",
    "ALEXSANDRO",
    "ROBERTO P",
    "KAUAN",
    "MARCELINO",
  ];

  if (palomaTeam.includes(nomeUpper)) {
    return "PALOMA";
  }

  if (lucasTeam.includes(nomeUpper)) {
    return "LUCAS";
  }

  // Retorna o nome original se não há mapeamento
  return nome;
}

// Função para verificar se um nome está no mapeamento
export function isEngineerMapped(nome: string): boolean {
  const nomeUpper = nome.toUpperCase().trim();
  const palomaTeam = [
    "GUSTAVO",
    "GUILHERME",
    "EDUARDO",
    "YURI",
    "VAGNER",
    "FABIO F",
    "NIVALDO",
  ];
  const lucasTeam = [
    "ALEXANDRE",
    "ALEXSANDRO",
    "ROBERTO P",
    "KAUAN",
    "MARCELINO",
  ];

  return palomaTeam.includes(nomeUpper) || lucasTeam.includes(nomeUpper);
}

// Função para obter todos os nomes que são mapeados
export function getAllMappedNames(): string[] {
  return [
    // Equipe PALOMA
    "GUSTAVO",
    "GUILHERME",
    "EDUARDO",
    "YURI",
    "VAGNER",
    "FABIO F",
    "NIVALDO",
    // Equipe LUCAS
    "ALEXANDRE",
    "ALEXSANDRO",
    "ROBERTO P",
    "KAUAN",
    "MARCELINO",
  ];
}
